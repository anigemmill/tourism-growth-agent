"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/enums";

export async function updateMemberRole(businessId: string, memberId: string, formData: FormData) {
  const newRole = String(formData.get("newRole") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "ADMIN")) {
    throw new Error(`Requires ADMIN+ role; you are ${membership.role}.`);
  }
  if (!ROLES.includes(newRole as Role)) throw new Error(`Invalid role: ${newRole}`);

  const target = await prisma.businessMember.findUniqueOrThrow({ where: { id: memberId } });
  if (target.businessId !== businessId) throw new Error("Member does not belong to this business.");

  if (target.role === "OWNER" && newRole !== "OWNER") {
    const ownerCount = await prisma.businessMember.count({ where: { businessId, role: "OWNER" } });
    if (ownerCount <= 1) throw new Error("A business must have at least one Owner.");
  }

  await prisma.$transaction([
    prisma.businessMember.update({ where: { id: memberId }, data: { role: newRole } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: `Changed a member's role from ${target.role} to ${newRole}`,
        entityType: "BusinessMember",
        entityId: memberId,
        requiresApproval: false,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/settings`);
}
