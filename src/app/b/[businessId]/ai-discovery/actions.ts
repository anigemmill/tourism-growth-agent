"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { probeAIDiscovery } from "@/lib/ai/discovery";

export async function runDiscoveryProbe(businessId: string, formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  if (!question) return;

  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
  const result = await probeAIDiscovery(question, business.name);

  if (result.status !== "CONNECTED") return;

  await prisma.signal.create({
    data: {
      businessId,
      type: "AI_DISCOVERY",
      title: `AI answer to: "${question}"`,
      summary: result.businessMentioned
        ? `${business.name} was mentioned in Claude's answer to this traveller question.`
        : `${business.name} was NOT mentioned in Claude's answer to this traveller question.`,
      claimType: "OBSERVATION",
      source: "Claude (live probe)",
      sourceTimestamp: new Date(),
      evidence: (result.rawAnswer ?? "").slice(0, 2000),
      confidence: 0.9,
      relevance: "HIGH",
      commercialPotential: result.businessMentioned ? "MEDIUM" : "HIGH",
    },
  });

  revalidatePath(`/b/${businessId}/ai-discovery`);
}
