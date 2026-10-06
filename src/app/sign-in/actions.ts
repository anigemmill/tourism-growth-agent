"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "") || "/";

  if (!email) throw new Error("Email is required.");

  const user = await prisma.user.upsert({
    where: { email },
    update: name ? { name } : {},
    create: { email, name: name || null },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(next);
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/sign-in");
}
