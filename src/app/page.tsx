import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const business = await prisma.business.findFirst({ orderBy: { createdAt: "asc" } });
  if (business) redirect(`/b/${business.id}`);
  redirect("/onboarding");
}
