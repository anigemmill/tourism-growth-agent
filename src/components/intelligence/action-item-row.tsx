import type { ActionItem } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";
import { ACTION_ITEM_TRANSITIONS, AI_EXECUTION_APPROVAL_ROLE } from "@/lib/workflow";
import { roleAtLeast } from "@/lib/auth";
import type { ActionStatus } from "@/lib/enums";
import { transitionActionItem } from "@/app/b/[businessId]/actions/actions";

const STATUS_TONE = {
  NOT_STARTED: "neutral",
  IN_PROGRESS: "accent",
  DONE: "success",
  BLOCKED: "danger",
} as const;

export function ActionItemRow({ action, role }: { action: ActionItem; role?: string }) {
  const transitions = ACTION_ITEM_TRANSITIONS[action.status as ActionStatus];
  const needsApproval = action.executionMode === "AI_CAN_EXECUTE" && action.requiresApproval;

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

      {role && transitions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {transitions.map((t) => {
            const isApproval = needsApproval && t.next === "DONE";
            const minRole = isApproval ? AI_EXECUTION_APPROVAL_ROLE : t.minRole;
            if (!roleAtLeast(role, minRole)) return null;
            return (
              <form key={t.next} action={transitionActionItem.bind(null, action.businessId, action.id, t.next)}>
                <Button type="submit" size="sm" variant={t.next === "BLOCKED" ? "outline" : "secondary"}>
                  {isApproval ? "Approve & mark done" : t.label}
                </Button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
