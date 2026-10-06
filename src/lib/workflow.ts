import type { ActionStatus, ContentBriefStatus, ExperimentStatus, OpportunityStatus, Role } from "@/lib/enums";

export interface Transition<S extends string> {
  next: S;
  label: string;
  /** Minimum role required to perform this transition. */
  minRole: Role;
}

/**
 * Explicit state machines for the two things in the product that get
 * "approved" or "shipped" — an opportunity's lifecycle and an action item's
 * execution. Keeping this in one place means the UI (which buttons to show)
 * and the server actions (which transitions to accept) can never disagree.
 */
export const OPPORTUNITY_TRANSITIONS: Record<OpportunityStatus, Transition<OpportunityStatus>[]> = {
  IDENTIFIED: [
    { next: "PLANNED", label: "Plan this", minRole: "STRATEGIST" },
    { next: "DISCARDED", label: "Discard", minRole: "STRATEGIST" },
  ],
  PLANNED: [
    { next: "IN_PROGRESS", label: "Start", minRole: "STRATEGIST" },
    { next: "DISCARDED", label: "Discard", minRole: "STRATEGIST" },
  ],
  IN_PROGRESS: [{ next: "SHIPPED", label: "Mark shipped", minRole: "STRATEGIST" }],
  SHIPPED: [{ next: "MEASURED", label: "Mark measured", minRole: "STRATEGIST" }],
  MEASURED: [],
  DISCARDED: [],
};

export const ACTION_ITEM_TRANSITIONS: Record<ActionStatus, Transition<ActionStatus>[]> = {
  NOT_STARTED: [
    { next: "IN_PROGRESS", label: "Start", minRole: "MARKETER" },
    { next: "BLOCKED", label: "Block", minRole: "MARKETER" },
  ],
  IN_PROGRESS: [
    { next: "DONE", label: "Mark done", minRole: "MARKETER" },
    { next: "BLOCKED", label: "Block", minRole: "MARKETER" },
  ],
  BLOCKED: [{ next: "IN_PROGRESS", label: "Unblock", minRole: "MARKETER" }],
  DONE: [],
};

export const EXPERIMENT_TRANSITIONS: Record<ExperimentStatus, Transition<ExperimentStatus>[]> = {
  PLANNED: [
    { next: "RUNNING", label: "Start", minRole: "STRATEGIST" },
    { next: "ABANDONED", label: "Abandon", minRole: "STRATEGIST" },
  ],
  RUNNING: [
    { next: "COMPLETE", label: "Mark complete", minRole: "STRATEGIST" },
    { next: "ABANDONED", label: "Abandon", minRole: "STRATEGIST" },
  ],
  COMPLETE: [],
  ABANDONED: [],
};

export const CONTENT_BRIEF_TRANSITIONS: Record<ContentBriefStatus, Transition<ContentBriefStatus>[]> = {
  PROPOSED: [
    { next: "APPROVED", label: "Approve", minRole: "STRATEGIST" },
    { next: "REJECTED", label: "Reject", minRole: "STRATEGIST" },
  ],
  APPROVED: [{ next: "IN_PROGRESS", label: "Start drafting", minRole: "MARKETER" }],
  IN_PROGRESS: [{ next: "PUBLISHED", label: "Mark published", minRole: "STRATEGIST" }],
  PUBLISHED: [],
  REJECTED: [],
};

/**
 * An AI_CAN_EXECUTE action that requiresApproval needs a stricter gate than
 * the base transition table before it can be marked DONE — a Marketer can
 * start/block it, but only a Strategist+ can approve the AI's output as
 * executed. Call sites check this in addition to the base table.
 */
export const AI_EXECUTION_APPROVAL_ROLE: Role = "STRATEGIST";
