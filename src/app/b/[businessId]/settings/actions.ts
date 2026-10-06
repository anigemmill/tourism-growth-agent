"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { ROLES, type Role } from "@/lib/enums";
import type { FormActionResult } from "@/components/ui/submit-form";

export async function updateMemberRole(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const newRole = String(formData.get("newRole") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "ADMIN")) {
    return { error: `Requires ADMIN+ role; you are ${membership.role}.` };
  }
  if (!ROLES.includes(newRole as Role)) return { error: `Invalid role: ${newRole}` };

  const target = await prisma.businessMember.findUniqueOrThrow({ where: { id: memberId } });
  if (target.businessId !== businessId) return { error: "Member does not belong to this business." };

  if (target.role === "OWNER" && newRole !== "OWNER") {
    const ownerCount = await prisma.businessMember.count({ where: { businessId, role: "OWNER" } });
    if (ownerCount <= 1) return { error: "A business must have at least one Owner." };
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
  return null;
}

function splitLines(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  return value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export async function addCompetitor(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "ADMIN")) {
    return { error: `Requires ADMIN+ role; you are ${membership.role}.` };
  }

  const name = String(formData.get("name") ?? "").trim();
  const websiteRaw = String(formData.get("website") ?? "").trim();
  if (!name) return { error: "Competitor name is required." };
  const website = websiteRaw ? (websiteRaw.startsWith("http") ? websiteRaw : `https://${websiteRaw}`) : "";

  const competitor = await prisma.competitor.create({ data: { businessId, name, website } });

  await prisma.auditLog.create({
    data: {
      businessId,
      actor: user.id,
      userId: user.id,
      action: `Added competitor "${name}"`,
      entityType: "Competitor",
      entityId: competitor.id,
      requiresApproval: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/b/${businessId}/settings`);
  revalidatePath(`/b/${businessId}/competitors`);
  return null;
}

export async function removeCompetitor(businessId: string, competitorId: string) {
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "ADMIN")) {
    throw new Error(`Requires ADMIN+ role; you are ${membership.role}.`);
  }

  const competitor = await prisma.competitor.findUniqueOrThrow({ where: { id: competitorId } });
  if (competitor.businessId !== businessId) throw new Error("Competitor does not belong to this business.");

  await prisma.$transaction([
    prisma.competitor.delete({ where: { id: competitorId } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: `Removed competitor "${competitor.name}"`,
        entityType: "Competitor",
        entityId: competitorId,
        requiresApproval: false,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/settings`);
  revalidatePath(`/b/${businessId}/competitors`);
}

export async function updateBusinessProfile(
  _prevState: FormActionResult,
  formData: FormData
): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "ADMIN")) {
    return { error: `Requires ADMIN+ role; you are ${membership.role}.` };
  }

  const goals = splitLines(formData.get("goals"));
  const targetMarkets = splitLines(formData.get("targetMarkets"));
  const targetAudiences = splitLines(formData.get("targetAudiences"));

  await prisma.$transaction([
    prisma.business.update({ where: { id: businessId }, data: { goals, targetMarkets, targetAudiences } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: "Updated business goals / target markets / target audiences",
        entityType: "Business",
        entityId: businessId,
        requiresApproval: false,
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/settings`);
  return null;
}
