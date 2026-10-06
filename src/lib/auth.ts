import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROLES, type Role } from "@/lib/enums";
import type { User, BusinessMember } from "@prisma/client";

export const SESSION_COOKIE = "tgi_uid";

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  MARKETER: 1,
  STRATEGIST: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function roleAtLeast(role: string, min: Role): boolean {
  return (ROLE_RANK[role as Role] ?? -1) >= ROLE_RANK[min];
}

/**
 * Reads the signed-in user from a plain cookie. There is no password or
 * external OAuth provider wired up (no credentials exist in this
 * environment) — this is a dev-grade identity layer intended to be replaced
 * by a real auth provider, but it's enough to make the Role/Membership
 * model in the schema actually mean something end to end.
 */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const uid = store.get(SESSION_COOKIE)?.value;
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid } });
}

export async function requireUser(nextPath?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in");
  }
  return user;
}

/**
 * Returns this user's membership for the business, creating one on first
 * visit: the business's very first visitor becomes OWNER, everyone after
 * that joins as VIEWER. A real product would use an invite flow instead —
 * this keeps the demo usable without one while still exercising the role
 * model (see Settings for the member list and Opportunities/Actions for
 * role-gated actions).
 */
export async function getOrCreateMembership(userId: string, businessId: string): Promise<BusinessMember> {
  const existing = await prisma.businessMember.findUnique({
    where: { userId_businessId: { userId, businessId } },
  });
  if (existing) return existing;

  const memberCount = await prisma.businessMember.count({ where: { businessId } });
  const role: Role = memberCount === 0 ? "OWNER" : "VIEWER";
  return prisma.businessMember.create({ data: { userId, businessId, role } });
}

export async function requireMembership(businessId: string): Promise<{ user: User; membership: BusinessMember }> {
  const user = await requireUser(`/b/${businessId}`);
  const membership = await getOrCreateMembership(user.id, businessId);
  return { user, membership };
}

export { ROLES };
