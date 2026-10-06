// Central enum-like constants. SQLite has no native enum type (see
// prisma/schema.prisma header), so these are the single source of truth for
// valid values, validated at the application boundary rather than the DB.

export const ROLES = ["OWNER", "ADMIN", "STRATEGIST", "MARKETER", "VIEWER"] as const;
export type Role = (typeof ROLES)[number];

export const INTEGRATION_STATUSES = [
  "CONNECTED",
  "NOT_CONNECTED",
  "REQUIRES_API",
  "REQUIRES_USER_AUTH",
] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUSES)[number];

export const SIGNAL_TYPES = ["TREND", "DEMAND", "COMPETITOR", "AI_DISCOVERY", "MARKET"] as const;
export type SignalType = (typeof SIGNAL_TYPES)[number];

export const CLAIM_TYPES = ["FACT", "OBSERVATION", "INFERENCE", "HYPOTHESIS", "RECOMMENDATION"] as const;
export type ClaimType = (typeof CLAIM_TYPES)[number];

export const LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export type Level = (typeof LEVELS)[number];

export const MOMENTUM = ["DECLINING", "STABLE", "RISING", "SURGING"] as const;
export type Momentum = (typeof MOMENTUM)[number];

export const OPPORTUNITY_CATEGORIES = ["MARKETING", "PRODUCT", "MARKET", "CONVERSION", "RETENTION"] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export const OPPORTUNITY_STATUSES = [
  "IDENTIFIED",
  "PLANNED",
  "IN_PROGRESS",
  "SHIPPED",
  "MEASURED",
  "DISCARDED",
] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const CONTENT_TYPES = [
  "LANDING_PAGE",
  "BLOG",
  "DESTINATION_GUIDE",
  "FAQ",
  "SOCIAL_POST",
  "VIDEO",
  "EMAIL",
  "PR",
  "COMPARISON",
  "ITINERARY",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_BRIEF_STATUSES = ["PROPOSED", "APPROVED", "IN_PROGRESS", "PUBLISHED", "REJECTED"] as const;
export type ContentBriefStatus = (typeof CONTENT_BRIEF_STATUSES)[number];

export const EXPERIMENT_STATUSES = ["PLANNED", "RUNNING", "COMPLETE", "ABANDONED"] as const;
export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export const ACTION_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "DONE", "BLOCKED"] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const EXECUTION_MODES = ["AI_CAN_EXECUTE", "NEEDS_HUMAN"] as const;
export type ExecutionMode = (typeof EXECUTION_MODES)[number];

export const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  FACT: "Fact",
  OBSERVATION: "Observation",
  INFERENCE: "Inference",
  HYPOTHESIS: "Hypothesis",
  RECOMMENDATION: "Recommendation",
};

export const RUBRIC_LABEL_HINT: Record<
  "impactScore" | "evidenceScore" | "relevanceScore" | "urgencyScore" | "effortScore" | "costScore" | "competitiveScore" | "strategicScore",
  string
> = {
  impactScore: "Potential commercial impact if pursued",
  evidenceScore: "Strength of the supporting evidence",
  relevanceScore: "Fit with this business's audiences/products",
  urgencyScore: "How time-sensitive this is",
  effortScore: "Higher = less effort required",
  costScore: "Higher = lower cost required",
  competitiveScore: "How much competitive pressure makes this matter",
  strategicScore: "Alignment with stated business goals",
};

export const INTEGRATION_STATUS_LABEL: Record<IntegrationStatus, string> = {
  CONNECTED: "Connected",
  NOT_CONNECTED: "Not connected",
  REQUIRES_API: "Requires API",
  REQUIRES_USER_AUTH: "Requires authentication",
};
