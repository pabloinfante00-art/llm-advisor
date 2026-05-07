import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";
import { CompanyProfile, IntegrationPreferences } from "@/lib/types";
import { llmModels } from "@/data/models";

function getEnvFromFile(key: string): string {
  const envVal = process.env[key];
  if (envVal && !envVal.includes("your-") && envVal.length > 10) return envVal;
  try {
    const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    const match = envFile.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (match && !match[1].includes("your-")) return match[1].trim();
  } catch {}
  return "";
}

function buildSystemPrompt(
  company: CompanyProfile,
  preferences: IntegrationPreferences
): string {
  const modelsContext = llmModels
    .map(
      (m) =>
        `${m.name} (${m.provider}): ${m.description} | Context: ${m.contextWindow} | Input: ${m.inputPrice}, Output: ${m.outputPrice} | Strengths: ${m.strengths.join(", ")} | Best for: ${m.bestFor.join(", ")} | Multimodal: ${m.multimodal} | Reasoning: ${m.reasoning}`
    )
    .join("\n");

  return `You are an expert AI integration consultant helping companies adopt LLM technology. You have deep knowledge of all major LLM providers, their APIs, pricing, and integration patterns.

## Current LLM Landscape (as of May 2025)
${modelsContext}

## Company Profile
- Name: ${company.name}
- Industry: ${company.industry}
- Size: ${company.size} (${company.employeeCount} employees)
- Current tools: ${company.currentTools.join(", ") || "None specified"}
- Budget: ${company.budget}
- Has technical team: ${company.technicalTeam}

## Integration Preferences
- Use cases: ${preferences.useCases.join(", ")}
- Priority: ${preferences.priority}
- Timeline: ${preferences.timeline}
- Data privacy: ${preferences.dataPrivacy}
- Existing stack: ${preferences.existingStack.join(", ") || "None specified"}

## Your Role
1. Recommend the best LLM(s) for their specific needs with clear reasoning
2. Provide a step-by-step integration plan tailored to their company
3. Be specific about APIs, tools, middleware, and configurations needed
4. Estimate costs based on their company size and use cases
5. Flag potential challenges and how to overcome them
6. Ask clarifying questions when needed to personalize the plan further
7. Guide them through each phase: setup, pilot, rollout, optimization

Format your responses with clear headers, bullet points, and actionable steps. Use markdown formatting. Be conversational but thorough.`;
}

async function streamAnthropic(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ReadableStream> {
  const apiKey = getEnvFromFile("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  const client = new Anthropic({ apiKey });
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

async function streamOpenAI(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ReadableStream> {
  const apiKey = getEnvFromFile("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  const client = new OpenAI({ apiKey });
  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

async function streamGemini(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ReadableStream> {
  const apiKey = getEnvFromFile("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: { parts: [{ text: systemPrompt }] },
  });

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : ("user" as const),
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContentStream({ contents });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      company,
      preferences,
      messages,
      provider = "gemini",
    }: {
      company: CompanyProfile;
      preferences: IntegrationPreferences;
      messages: { role: "user" | "assistant"; content: string }[];
      provider?: "anthropic" | "openai" | "gemini";
    } = body;

    const systemPrompt = buildSystemPrompt(company, preferences);

    let readableStream: ReadableStream;
    switch (provider) {
      case "anthropic":
        readableStream = await streamAnthropic(systemPrompt, messages);
        break;
      case "openai":
        readableStream = await streamOpenAI(systemPrompt, messages);
        break;
      case "gemini":
      default:
        readableStream = await streamGemini(systemPrompt, messages);
        break;
    }

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
