"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { OPPORTUNITY_TRANSITIONS } from "@/lib/workflow";
import { OPPORTUNITY_CATEGORIES, type OpportunityStatus, type OpportunityCategory } from "@/lib/enums";
import { computeTotalScore, explainScore, type OpportunityScoreInputs } from "@/lib/opportunity-engine/score";
import type { FormActionResult } from "@/components/ui/submit-form";

export async function transitionOpportunity(businessId: string, opportunityId: string, nextStatus: string) {
  const { user, membership } = await requireMembership(businessId);

  const opportunity = await prisma.opportunity.findUniqueOrThrow({ where: { id: opportunityId } });
  if (opportunity.businessId !== businessId) throw new Error("Opportunity does not belong to this business.");

  const allowed = OPPORTUNITY_TRANSITIONS[opportunity.status as OpportunityStatus].find(
    (t) => t.next === nextStatus
  );
  if (!allowed) throw new Error(`Cannot move an opportunity from ${opportunity.status} to ${nextStatus}.`);
  if (!roleAtLeast(membership.role, allowed.minRole)) {
    throw new Error(`Requires ${allowed.minRole}+ role; you are ${membership.role}.`);
  }

  await prisma.$transaction([
    prisma.opportunity.update({ where: { id: opportunityId }, data: { status: nextStatus } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: `Moved opportunity "${opportunity.title}" from ${opportunity.status} to ${nextStatus}`,
        entityType: "Opportunity",
        entityId: opportunityId,
        requiresApproval: false,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/opportunities`);
  revalidatePath(`/b/${businessId}`);
}

const RUBRIC_FIELDS: (keyof OpportunityScoreInputs)[] = [
  "impactScore",
  "evidenceScore",
  "relevanceScore",
  "urgencyScore",
  "effortScore",
  "costScore",
  "competitiveScore",
  "strategicScore",
];

export async function createOpportunity(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "STRATEGIST")) {
    return { error: `Requires STRATEGIST+ role; you are ${membership.role}.` };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const summary = String(formData.get("summary") ?? "").trim();
  const recommendedAction = String(formData.get("recommendedAction") ?? "").trim();
  if (!title || !summary || !recommendedAction) {
    return { error: "Title, summary, and recommended action are required." };
  }
  if (!OPPORTUNITY_CATEGORIES.includes(category as OpportunityCategory)) {
    return { error: `Invalid category: ${category}` };
  }

  const inputs = Object.fromEntries(
    RUBRIC_FIELDS.map((field) => [field, Math.min(100, Math.max(0, Number(formData.get(field) ?? 50)))])
  ) as unknown as OpportunityScoreInputs;

  const signalIds = formData.getAll("signalIds").map(String).filter(Boolean);
  // Evidence trail is mandatory — an opportunity with no supporting signal is
  // a hunch, not something this engine should present as scored intelligence.
  if (signalIds.length === 0) {
    return { error: "Select at least one supporting signal — an opportunity needs an evidence trail." };
  }
  const validSignals = await prisma.signal.findMany({ where: { id: { in: signalIds }, businessId }, select: { id: true } });
  if (validSignals.length !== signalIds.length) {
    return { error: "One or more selected signals do not belong to this business." };
  }

  const totalScore = computeTotalScore(inputs);
  const scoreExplanation = explainScore(inputs);

  const opportunity = await prisma.opportunity.create({
    data: {
      businessId,
      title,
      category,
      summary,
      recommendedAction,
      ...inputs,
      totalScore,
      scoreExplanation,
      status: "IDENTIFIED",
      signals: { create: signalIds.map((signalId) => ({ signalId })) },
    },
  });

  await prisma.auditLog.create({
    data: {
      businessId,
      actor: user.id,
      userId: user.id,
      action: `Created opportunity "${title}" (score ${totalScore})`,
      entityType: "Opportunity",
      entityId: opportunity.id,
      requiresApproval: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/b/${businessId}/opportunities`);
  revalidatePath(`/b/${businessId}`);
  return null;
}
