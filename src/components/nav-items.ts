export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide-react icon name, resolved in sidebar.tsx
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Executive Overview", href: "", icon: "LayoutDashboard", description: "What's happening and what to do today" },
  { label: "Growth Opportunities", href: "opportunities", icon: "Target", description: "Prioritized, evidence-backed opportunities" },
  { label: "Traveller Demand", href: "demand", icon: "Users", description: "Emerging needs, segments, and questions" },
  { label: "Competitors", href: "competitors", icon: "Swords", description: "Meaningful competitor changes" },
  { label: "AI Discovery", href: "ai-discovery", icon: "Sparkles", description: "How this business appears in AI search" },
  { label: "Marketing", href: "marketing", icon: "Megaphone", description: "Content and campaign briefs" },
  { label: "Product Opportunities", href: "product", icon: "PackagePlus", description: "Evidence-based new product ideas" },
  { label: "Experiments", href: "experiments", icon: "FlaskConical", description: "Structured growth experiments" },
  { label: "Analytics", href: "analytics", icon: "BarChart3", description: "Performance and trend data" },
  { label: "Actions", href: "actions", icon: "ListChecks", description: "This week's growth plan" },
  { label: "History", href: "history", icon: "History", description: "Past briefs, actions, and outcomes" },
  { label: "Settings", href: "settings", icon: "Settings", description: "Business profile and integrations" },
];
