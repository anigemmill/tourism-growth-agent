"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { ACTION_ITEM_TRANSITIONS, AI_EXECUTION_APPROVAL_ROLE } from "@/lib/workflow";
import { LEVELS, EXECUTION_MODES, type ActionStatus, type ExecutionMode, type Level } from "@/lib/enums";
import type { FormActionResult } from "@/components/ui/submit-form";

function mondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

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

export async function createActionItem(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "MARKETER")) {
    return { error: `Requires MARKETER+ role; you are ${membership.role}.` };
  }

  const action = String(formData.get("action") ?? "").trim();
  const why = String(formData.get("why") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const channel = String(formData.get("channel") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const effort = String(formData.get("effort") ?? "");
  const expectedOutcome = String(formData.get("expectedOutcome") ?? "").trim();
  const measurement = String(formData.get("measurement") ?? "").trim();
  const executionMode = String(formData.get("executionMode") ?? "NEEDS_HUMAN");
  const requiresApproval = formData.get("requiresApproval") === "on";
  const opportunityId = String(formData.get("opportunityId") ?? "") || null;
  const weekOfRaw = String(formData.get("weekOf") ?? "");

  if (!action || !why || !audience || !channel || !owner || !expectedOutcome || !measurement) {
    return { error: "All fields except the linked opportunity are required." };
  }
  if (!LEVELS.includes(effort as Level)) return { error: `Invalid effort level: ${effort}` };
  if (!EXECUTION_MODES.includes(executionMode as ExecutionMode)) {
    return { error: `Invalid execution mode: ${executionMode}` };
  }

  const weekOf = mondayOfWeek(weekOfRaw ? new Date(weekOfRaw) : new Date());

  const item = await prisma.actionItem.create({
    data: {
      businessId,
      opportunityId,
      action,
      why,
      audience,
      channel,
      owner,
      effort,
      expectedOutcome,
      measurement,
      executionMode,
      requiresApproval,
      weekOf,
      status: "NOT_STARTED",
    },
  });

  await prisma.auditLog.create({
    data: {
      businessId,
      actor: user.id,
      userId: user.id,
      action: `Added action "${action}" to the week of ${weekOf.toDateString()}`,
      entityType: "ActionItem",
      entityId: item.id,
      requiresApproval: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/b/${businessId}/actions`);
  revalidatePath(`/b/${businessId}`);
  return null;
}
