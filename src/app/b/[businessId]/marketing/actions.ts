"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireMembership, roleAtLeast } from "@/lib/auth";
import { CONTENT_BRIEF_TRANSITIONS } from "@/lib/workflow";
import { CONTENT_TYPES, type ContentType, type ContentBriefStatus } from "@/lib/enums";
import type { FormActionResult } from "@/components/ui/submit-form";

function splitLines(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  return value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export async function createContentBrief(_prevState: FormActionResult, formData: FormData): Promise<FormActionResult> {
  const businessId = String(formData.get("businessId") ?? "");
  const { user, membership } = await requireMembership(businessId);
  if (!roleAtLeast(membership.role, "MARKETER")) {
    return { error: `Requires MARKETER+ role; you are ${membership.role}.` };
  }

  const contentType = String(formData.get("contentType") ?? "");
  if (!CONTENT_TYPES.includes(contentType as ContentType)) return { error: `Invalid content type: ${contentType}` };

  const title = String(formData.get("title") ?? "").trim();
  const whyNow = String(formData.get("whyNow") ?? "").trim();
  const targetAudience = String(formData.get("targetAudience") ?? "").trim();
  const keyPoints = splitLines(formData.get("keyPoints"));
  const seoNotes = String(formData.get("seoNotes") ?? "").trim() || null;
  const aiDiscoveryNotes = String(formData.get("aiDiscoveryNotes") ?? "").trim() || null;

  if (!title || !whyNow || !targetAudience) {
    return { error: "Title, why-now, and target audience are required." };
  }

  const brief = await prisma.contentBrief.create({
    data: { businessId, contentType, title, whyNow, targetAudience, keyPoints, seoNotes, aiDiscoveryNotes },
  });

  await prisma.auditLog.create({
    data: {
      businessId,
      actor: user.id,
      userId: user.id,
      action: `Proposed content brief "${title}"`,
      entityType: "ContentBrief",
      entityId: brief.id,
      requiresApproval: false,
      approved: true,
      approvedAt: new Date(),
    },
  });

  revalidatePath(`/b/${businessId}/marketing`);
  return null;
}

export async function transitionContentBrief(businessId: string, briefId: string, nextStatus: string) {
  const { user, membership } = await requireMembership(businessId);

  const brief = await prisma.contentBrief.findUniqueOrThrow({ where: { id: briefId } });
  if (brief.businessId !== businessId) throw new Error("Content brief does not belong to this business.");

  const allowed = CONTENT_BRIEF_TRANSITIONS[brief.status as ContentBriefStatus].find((t) => t.next === nextStatus);
  if (!allowed) throw new Error(`Cannot move a content brief from ${brief.status} to ${nextStatus}.`);
  if (!roleAtLeast(membership.role, allowed.minRole)) {
    throw new Error(`Requires ${allowed.minRole}+ role; you are ${membership.role}.`);
  }

  await prisma.$transaction([
    prisma.contentBrief.update({ where: { id: briefId }, data: { status: nextStatus } }),
    prisma.auditLog.create({
      data: {
        businessId,
        actor: user.id,
        userId: user.id,
        action: `Moved content brief "${brief.title}" from ${brief.status} to ${nextStatus}`,
        entityType: "ContentBrief",
        entityId: briefId,
        requiresApproval: nextStatus === "PUBLISHED",
        approved: true,
        approvedAt: new Date(),
      },
    }),
  ]);

  revalidatePath(`/b/${businessId}/marketing`);
}
