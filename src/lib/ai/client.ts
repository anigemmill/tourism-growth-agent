import Anthropic from "@anthropic-ai/sdk";
import { isAnthropicConfigured } from "@/lib/integrations/registry";

let client: Anthropic | null = null;

/** Returns null when ANTHROPIC_API_KEY is not configured — callers must
 * treat that as "not connected" and never fall back to invented data. */
export function getAnthropicClient(): Anthropic | null {
  if (!isAnthropicConfigured()) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const CLAUDE_MODEL = "claude-sonnet-5";
