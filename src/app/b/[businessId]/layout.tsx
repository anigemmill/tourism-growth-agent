import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function BusinessLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) notFound();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar businessId={business.id} businessName={business.name} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar business={business} />
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-background">
          <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
