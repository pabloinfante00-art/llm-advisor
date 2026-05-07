import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

function hasKey(key: string): boolean {
  const envVal = process.env[key];
  if (envVal && !envVal.includes("your-") && envVal.length > 10) return true;
  try {
    const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    const match = envFile.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (match && !match[1].includes("your-")) return true;
  } catch {}
  return false;
}

export async function GET() {
  return Response.json({
    providers: [
      {
        id: "gemini",
        name: "Google Gemini",
        model: "Gemini 2.5 Flash",
        configured: hasKey("GEMINI_API_KEY"),
        free: true,
      },
      {
        id: "openai",
        name: "OpenAI",
        model: "GPT-4o",
        configured: hasKey("OPENAI_API_KEY"),
        free: false,
      },
      {
        id: "anthropic",
        name: "Anthropic",
        model: "Claude Sonnet 4",
        configured: hasKey("ANTHROPIC_API_KEY"),
        free: false,
      },
    ],
  });
}
