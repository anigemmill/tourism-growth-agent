"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { OPPORTUNITY_TRANSITIONS } from "@/lib/workflow";
import type { OpportunityStatus } from "@/lib/enums";

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
