"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { EXPERIMENT_TRANSITIONS } from "@/lib/workflow";
import type { ExperimentStatus } from "@/lib/enums";

async function assertTransition(businessId: string, experimentId: string, nextStatus: string) {
  const { user, membership } = await requireMembership(businessId);
  const experiment = await prisma.experiment.findUniqueOrThrow({ where: { id: experimentId } });
  if (experiment.businessId !== businessId) throw new Error("Experiment does not belong to this business.");

  const allowed = EXPERIMENT_TRANSITIONS[experiment.status as ExperimentStatus].find((t) => t.next === nextStatus);
  if (!allowed) throw new Error(`Cannot move an experiment from ${experiment.status} to ${nextStatus}.`);
  if (!roleAtLeast(membership.role, allowed.minRole)) {
    throw new Error(`Requires ${allowed.minRole}+ role; you are ${membership.role}.`);
  }
  return { user, experiment };
}

export async function transitionExperiment(businessId: string, experimentId: string, nextStatus: string) {
  const { user, experiment } = await assertTransition(businessId, experimentId, nextStatus);

  await prisma.$transaction([
    prisma.experiment.update({ where: { id: experimentId }, data: { status: nextStatus } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: `Moved experiment "${experiment.hypothesis}" from ${experiment.status} to ${nextStatus}`,
        entityType: "Experiment",
        entityId: experimentId,
        requiresApproval: false,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/experiments`);
}

export async function completeExperiment(businessId: string, experimentId: string, formData: FormData) {
  const result = String(formData.get("result") ?? "").trim();
  const learning = String(formData.get("learning") ?? "").trim();
  const nextAction = String(formData.get("nextAction") ?? "").trim();
  if (!result || !learning) throw new Error("Result and learning are required to complete an experiment.");

  const { user, experiment } = await assertTransition(businessId, experimentId, "COMPLETE");

  await prisma.$transaction([
    prisma.experiment.update({
      where: { id: experimentId },
      data: { status: "COMPLETE", result, learning, nextAction: nextAction || null },
    }),
    prisma.learning.create({
      data: {
        businessId,
        relatedType: "EXPERIMENT",
        relatedId: experimentId,
        observation: result,
        implication: learning,
      },
    }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: `Completed experiment "${experiment.hypothesis}" and recorded a learning`,
        entityType: "Experiment",
        entityId: experimentId,
        requiresApproval: false,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/experiments`);
  revalidatePath(`/b/${businessId}/history`);
}
