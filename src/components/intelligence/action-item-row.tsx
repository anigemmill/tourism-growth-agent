import type { ActionItem } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Bot, User } from "lucide-react";

const STATUS_TONE = {
  NOT_STARTED: "neutral",
  IN_PROGRESS: "accent",
  DONE: "success",
  BLOCKED: "danger",
} as const;

export function ActionItemRow({ action }: { action: ActionItem }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{action.action}</div>
        <Badge tone={STATUS_TONE[action.status as keyof typeof STATUS_TONE] ?? "neutral"}>
          {action.status.replace("_", " ")}
        </Badge>
      </div>
      <p className="text-xs text-foreground-muted">{action.why}</p>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge tone="neutral">Audience: {action.audience}</Badge>
        <Badge tone="neutral">Channel: {action.channel}</Badge>
        <Badge tone="neutral">Effort: {action.effort}</Badge>
        <Badge tone="neutral">Owner: {action.owner}</Badge>
        <Badge tone={action.executionMode === "AI_CAN_EXECUTE" ? "brand" : "warning"}>
          {action.executionMode === "AI_CAN_EXECUTE" ? (
            <>
              <Bot className="h-3 w-3" /> AI can execute
            </>
          ) : (
            <>
              <User className="h-3 w-3" /> Needs human
            </>
          )}
        </Badge>
      </div>
      <div className="text-[11px] text-foreground-subtle">
        Expected outcome: {action.expectedOutcome} · Measured by: {action.measurement}
      </div>
    </div>
  );
}
