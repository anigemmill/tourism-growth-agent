"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import type { FormActionResult } from "@/components/ui/submit-form";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function looksSimilar(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export async function createExperiment(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "STRATEGIST")) {
    return { error: `Requires STRATEGIST+ role; you are ${membership.role}.` };
  }

  const hypothesis = String(formData.get("hypothesis") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const channel = String(formData.get("channel") ?? "").trim();
  const successMetric = String(formData.get("successMetric") ?? "").trim();
  const baseline = String(formData.get("baseline") ?? "").trim();
  const timeframeStart = new Date(String(formData.get("timeframeStart") ?? ""));
  const timeframeEnd = new Date(String(formData.get("timeframeEnd") ?? ""));
  const opportunityId = String(formData.get("opportunityId") ?? "") || null;
  const supersedesExperimentId = String(formData.get("supersedesExperimentId") ?? "") || null;
  const whyDifferent = String(formData.get("whyDifferent") ?? "").trim() || null;

  if (!hypothesis || !audience || !action || !channel || !successMetric || !baseline) {
    return { error: "Hypothesis, audience, action, channel, success metric, and baseline are all required." };
  }
  if (isNaN(timeframeStart.getTime()) || isNaN(timeframeEnd.getTime()) || timeframeEnd <= timeframeStart) {
    return { error: "Timeframe end must be after timeframe start." };
  }

  // Enforce the "don't silently repeat a failed experiment" rule: if an
  // explicit supersedes link is given, it must come with a stated reason;
  // if none is given, check whether this hypothesis closely resembles a
  // past completed/abandoned one and force the user to either link it (with
  // a reason) or materially change the hypothesis.
  if (supersedesExperimentId) {
    if (!whyDifferent) {
      return { error: "Explain what's different about this retry before linking it to a previous experiment." };
    }
    const prior = await prisma.experiment.findUniqueOrThrow({ where: { id: supersedesExperimentId } });
    if (prior.businessId !== businessId) return { error: "Previous experiment does not belong to this business." };
  } else {
    const priorRuns = await prisma.experiment.findMany({
      where: { businessId, status: { in: ["COMPLETE", "ABANDONED"] } },
      select: { id: true, hypothesis: true },
    });
    const match = priorRuns.find((p) => looksSimilar(p.hypothesis, hypothesis));
    if (match) {
      return {
        error: `This closely matches a previous experiment ("${match.hypothesis}"). Select it under "Retries a previous experiment" and explain what's different, or change the hypothesis.`,
      };
    }
  }

  const experiment = await prisma.experiment.create({
    data: {
      businessId,
      opportunityId,
      hypothesis,
      audience,
      action,
      channel,
      timeframeStart,
      timeframeEnd,
      successMetric,
      baseline,
      status: "PLANNED",
      supersedesExperimentId,
      whyDifferent,
    },
  });

  await prisma.auditLog.create({
    data: {
      businessId,
      actor: user.id,
      userId: user.id,
      action: `Created experiment "${hypothesis}"${supersedesExperimentId ? " (retry of a previous experiment)" : ""}`,
      entityType: "Experiment",
      entityId: experiment.id,
      requiresApproval: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/b/${businessId}/experiments`);
  return null;
}
