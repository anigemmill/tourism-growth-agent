import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";

export interface WebsiteAnalysisResult {
  status: "CONNECTED" | "REQUIRES_API" | "FAILED";
  error?: string;
  positioning?: string;
  differentiators?: string[];
  pricingSummary?: string;
  experiences?: { name: string; description: string; priceHint?: string }[];
  seasonality?: Record<string, string>;
  faqs?: { question: string; answer: string }[];
  bookingProcess?: string;
  policies?: string[];
  currentContentSummary?: string;
  confidence?: number;
}

const PROFILE_TOOL = {
  name: "submit_business_profile",
  description: "Submit the structured business intelligence profile extracted from the website.",
  input_schema: {
    type: "object" as const,
    properties: {
      positioning: { type: "string", description: "One paragraph on how the business positions itself." },
      differentiators: { type: "array", items: { type: "string" } },
      pricingSummary: { type: "string" },
      experiences: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            priceHint: { type: "string" },
          },
          required: ["name", "description"],
        },
      },
      seasonality: {
        type: "object",
        description: "Map of month or season name to a short demand description, only if evidence exists on the site.",
      },
      faqs: {
        type: "array",
        items: {
          type: "object",
          properties: { question: { type: "string" }, answer: { type: "string" } },
          required: ["question", "answer"],
        },
      },
      bookingProcess: { type: "string" },
      policies: { type: "array", items: { type: "string" } },
      currentContentSummary: { type: "string", description: "Summary of the type/quality of content currently on the site." },
      confidence: { type: "number", description: "0-1 confidence that this extraction accurately reflects the site." },
    },
    required: ["positioning", "confidence"],
  },
};

async function fetchSiteText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "TourismGrowthIntelligence/1.0 (+website analysis)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
  const html = await res.text();
  // Strip tags/scripts/styles to plain text — good enough for LLM extraction
  // without pulling in a full HTML parser dependency.
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 20000);
}

export async function analyzeBusinessWebsite(website: string): Promise<WebsiteAnalysisResult> {
  const client = getAnthropicClient();
  if (!client) return { status: "REQUIRES_API" };

  let siteText: string;
  try {
    siteText = await fetchSiteText(website);
  } catch (err) {
    return { status: "FAILED", error: err instanceof Error ? err.message : "Unable to fetch website" };
  }

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      tools: [PROFILE_TOOL],
      tool_choice: { type: "tool", name: "submit_business_profile" },
      messages: [
        {
          role: "user",
          content:
            `You are extracting a factual business intelligence profile for a tourism business from its own website text. ` +
            `Only report what the text actually supports — leave fields out rather than guessing, and set confidence honestly ` +
            `(lower if the page is thin or generic). Website: ${website}\n\nPage text:\n${siteText}`,
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { status: "FAILED", error: "Model did not return structured output" };
    }
    const input = toolUse.input as Omit<WebsiteAnalysisResult, "status">;
    return { status: "CONNECTED", ...input };
  } catch (err) {
    return { status: "FAILED", error: err instanceof Error ? err.message : "Analysis failed" };
  }
}
