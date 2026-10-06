"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { CLAIM_TYPES, SIGNAL_TYPES, LEVELS, MOMENTUM, type ClaimType, type SignalType } from "@/lib/enums";
import type { FormActionResult } from "@/components/ui/submit-form";

export async function createSignal(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const redirectPath = String(formData.get("redirectPath") ?? "");
  const { membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "MARKETER")) {
    return { error: `Requires MARKETER+ role; you are ${membership.role}.` };
  }

  const type = String(formData.get("type") ?? "");
  const claimType = String(formData.get("claimType") ?? "");
  if (!SIGNAL_TYPES.includes(type as SignalType)) return { error: `Invalid signal type: ${type}` };
  if (!CLAIM_TYPES.includes(claimType as ClaimType)) return { error: `Invalid claim type: ${claimType}` };

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const evidence = String(formData.get("evidence") ?? "").trim();
  const confidencePct = Number(formData.get("confidence") ?? 50);
  const competitorId = String(formData.get("competitorId") ?? "") || null;

  if (!title || !summary || !source || !evidence) {
    return { error: "Title, summary, source, and evidence are required." };
  }

  const relevance = String(formData.get("relevance") ?? "") || null;
  const scale = String(formData.get("scale") ?? "") || null;
  const momentum = String(formData.get("momentum") ?? "") || null;
  const commercialPotential = String(formData.get("commercialPotential") ?? "") || null;
  const targetAudience = String(formData.get("targetAudience") ?? "").trim() || null;

  await prisma.signal.create({
    data: {
      businessId,
      type,
      title,
      summary,
      claimType,
      source,
      sourceTimestamp: new Date(),
      evidence,
      confidence: Math.min(1, Math.max(0, confidencePct / 100)),
      relevance: relevance && LEVELS.includes(relevance as (typeof LEVELS)[number]) ? relevance : null,
      scale: scale && LEVELS.includes(scale as (typeof LEVELS)[number]) ? scale : null,
      momentum: momentum && MOMENTUM.includes(momentum as (typeof MOMENTUM)[number]) ? momentum : null,
      commercialPotential:
        commercialPotential && LEVELS.includes(commercialPotential as (typeof LEVELS)[number])
          ? commercialPotential
          : null,
      targetAudience,
      competitorId: type === "COMPETITOR" ? competitorId : null,
    },
  });

  revalidatePath(redirectPath);
  return null;
}
