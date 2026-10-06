import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function RootPage() {
  const user = await requireUser("/");

  const membership = await prisma.businessMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  if (membership) redirect(`/b/${membership.businessId}`);

  const anyBusiness = await prisma.business.findFirst({ orderBy: { createdAt: "asc" } });
  if (anyBusiness) redirect(`/b/${anyBusiness.id}`);

  redirect("/onboarding");
}
