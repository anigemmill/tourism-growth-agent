"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { ACTION_ITEM_TRANSITIONS, AI_EXECUTION_APPROVAL_ROLE } from "@/lib/workflow";
import type { ActionStatus } from "@/lib/enums";

export async function transitionActionItem(businessId: string, actionItemId: string, nextStatus: string) {
  const { user, membership } = await requireMembership(businessId);

  const item = await prisma.actionItem.findUniqueOrThrow({ where: { id: actionItemId } });
  if (item.businessId !== businessId) throw new Error("Action item does not belong to this business.");

  const allowed = ACTION_ITEM_TRANSITIONS[item.status as ActionStatus].find((t) => t.next === nextStatus);
  if (!allowed) throw new Error(`Cannot move an action from ${item.status} to ${nextStatus}.`);

  // Marking an AI-executed, approval-required action DONE is an approval,
  // not just a status edit — require the stricter role regardless of the
  // base transition table.
  const isAIApproval = item.executionMode === "AI_CAN_EXECUTE" && item.requiresApproval && nextStatus === "DONE";
  const minRole = isAIApproval ? AI_EXECUTION_APPROVAL_ROLE : allowed.minRole;
  if (!roleAtLeast(membership.role, minRole)) {
    throw new Error(`Requires ${minRole}+ role; you are ${membership.role}.`);
  }

  await prisma.$transaction([
    prisma.actionItem.update({ where: { id: actionItemId }, data: { status: nextStatus } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: isAIApproval
          ? `Approved AI-executed action "${item.action}" as done`
          : `Moved action "${item.action}" from ${item.status} to ${nextStatus}`,
        entityType: "ActionItem",
        entityId: actionItemId,
        requiresApproval: isAIApproval,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/actions`);
  revalidatePath(`/b/${businessId}`);
}
