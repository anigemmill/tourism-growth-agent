import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";

export interface AIDiscoveryProbeResult {
  status: "CONNECTED" | "REQUIRES_API" | "FAILED";
  error?: string;
  question?: string;
  businessMentioned?: boolean;
  description?: string;
  competitorsMentioned?: string[];
  rawAnswer?: string;
}

/**
 * Probes Claude with a traveller-style question and checks whether the given
 * business is mentioned. This is a genuine, live model call — the result
 * reflects what the model actually said, not a scripted answer. It is one
 * proxy for AI discoverability among many possible AI surfaces (see
 * ARCHITECTURE.md) — the UI must not claim this represents every AI system.
 */
export async function probeAIDiscovery(question: string, businessName: string): Promise<AIDiscoveryProbeResult> {
  const client = getAnthropicClient();
  if (!client) return { status: "REQUIRES_API", question };

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      messages: [{ role: "user", content: question }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const rawAnswer = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const businessMentioned = rawAnswer.toLowerCase().includes(businessName.toLowerCase());

    return {
      status: "CONNECTED",
      question,
      businessMentioned,
      rawAnswer,
    };
  } catch (err) {
    return { status: "FAILED", question, error: err instanceof Error ? err.message : "Probe failed" };
  }
}
