"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import type { FormActionResult } from "@/components/ui/submit-form";

function splitLines(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  return value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export async function createProductOpportunity(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "STRATEGIST")) {
    return { error: `Requires STRATEGIST+ role; you are ${membership.role}.` };
  }

  const targetTraveller = String(formData.get("targetTraveller") ?? "").trim();
  const problem = String(formData.get("problem") ?? "").trim();
  const demandEvidence = String(formData.get("demandEvidence") ?? "").trim();
  const existingSupply = String(formData.get("existingSupply") ?? "").trim();
  const gap = String(formData.get("gap") ?? "").trim();
  const proposedProduct = String(formData.get("proposedProduct") ?? "").trim();
  const seasonality = String(formData.get("seasonality") ?? "").trim() || null;
  const potentialPartners = splitLines(formData.get("potentialPartners"));
  const risks = splitLines(formData.get("risks"));
  const dataNeeded = splitLines(formData.get("dataNeeded"));
  const confidencePct = Number(formData.get("confidence") ?? 30);

  if (!targetTraveller || !problem || !demandEvidence || !existingSupply || !gap || !proposedProduct) {
    return { error: "Target traveller, problem, demand evidence, existing supply, gap, and proposed product are all required." };
  }

  const confidence = Math.min(1, Math.max(0, confidencePct / 100));
  // Honesty guard mirroring the spec: never let a high-confidence claim
  // through while outstanding data needs remain unacknowledged.
  if (confidence >= 0.7 && dataNeeded.length === 0) {
    return {
      error:
        "A confidence of 70%+ needs at least one entry removed from 'data needed' or lowered — don't claim strong evidence with open data gaps.",
    };
  }

  const product = await prisma.productOpportunity.create({
    data: {
      businessId,
      targetTraveller,
      problem,
      demandEvidence,
      existingSupply,
      gap,
      proposedProduct,
      seasonality,
      potentialPartners,
      risks,
      dataNeeded,
      confidence,
    },
  });

  await prisma.auditLog.create({
    data: {
      businessId,
      actor: user.id,
      userId: user.id,
      action: `Proposed product opportunity "${proposedProduct}"`,
      entityType: "ProductOpportunity",
      entityId: product.id,
      requiresApproval: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/b/${businessId}/product`);
  return null;
}
