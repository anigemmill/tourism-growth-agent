import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/intelligence/stat-tile";
import { ProductOpportunityCard } from "@/components/intelligence/product-opportunity-card";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProductPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const products = await prisma.productOpportunity.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Product Opportunities"
        description="Evidence-based new product, package, and partnership ideas. Confidence and outstanding data needs are always shown — nothing is claimed as commercially viable without sufficient evidence."
      />
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-foreground-muted">No product opportunities yet.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <ProductOpportunityCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
