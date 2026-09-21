import Link from "next/link";
import type { Business } from "@prisma/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ business }: { business: Business }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div>
        <div className="text-sm font-semibold">{business.name}</div>
        <div className="text-xs text-foreground-subtle">
          {business.destination} · {business.category}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/onboarding">
          <Button variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add business
          </Button>
        </Link>
      </div>
    </header>
  );
}
