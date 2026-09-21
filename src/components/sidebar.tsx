"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Users,
  Swords,
  Sparkles,
  Megaphone,
  PackagePlus,
  FlaskConical,
  BarChart3,
  ListChecks,
  History,
  Settings,
  Compass,
  Building2,
} from "lucide-react";
import { NAV_ITEMS } from "@/components/nav-items";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Target,
  Users,
  Swords,
  Sparkles,
  Megaphone,
  PackagePlus,
  FlaskConical,
  BarChart3,
  ListChecks,
  History,
  Settings,
};

export function Sidebar({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const pathname = usePathname();
  const base = `/b/${businessId}`;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Compass className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Growth Intelligence</div>
          <div className="text-[11px] text-foreground-subtle">AI Chief Growth Officer</div>
        </div>
      </div>

      <Link
        href="/portfolio"
        className="flex items-center gap-2 px-5 h-11 border-b border-border text-xs text-foreground-muted hover:text-foreground hover:bg-surface-muted transition-colors"
      >
        <Building2 className="h-3.5 w-3.5" />
        <span className="truncate">{businessName}</span>
        <span className="ml-auto text-foreground-subtle">Switch</span>
      </Link>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const href = item.href ? `${base}/${item.href}` : base;
          const active = pathname === href;
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href || "overview"}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-soft text-brand font-medium"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
