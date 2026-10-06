import Link from "next/link";
import type { Business, User } from "@prisma/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/app/sign-in/actions";

export function Topbar({ business, user, role }: { business: Business; user: User; role: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div>
        <div className="text-sm font-semibold">{business.name}</div>
        <div className="text-xs text-foreground-subtle">
          {business.destination} · {business.category}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/onboarding">
          <Button variant="outline" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add business
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <Badge tone="neutral">{role}</Badge>
          <span className="text-foreground-muted">{user.name || user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-foreground-subtle hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
