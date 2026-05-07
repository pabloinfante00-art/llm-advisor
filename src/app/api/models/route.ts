import { llmModels } from "@/data/models";

export const dynamic = "force-dynamic";

export async function GET() {
  // In production, this would fetch live pricing from each provider's API.
  // For now we serve our curated dataset with a freshness timestamp.
  const data = {
    models: llmModels,
    lastUpdated: "2026-05-07T00:00:00Z",
    note: "Pricing and specs verified May 2026. Sources: OpenAI, Anthropic, Google, xAI, DeepSeek, Meta, Mistral official pricing pages.",
  };

  return Response.json(data);
}
