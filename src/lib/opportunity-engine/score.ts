/**
 * Opportunity Engine — explainable, deterministic rubric.
 *
 * This intentionally does NOT ask an LLM "how good is this opportunity,
 * 0-100?" — that produces an unreproducible, unexplainable number. Instead
 * every sub-score is either derived from concrete Signal metadata (evidence
 * strength from confidence, urgency from momentum, etc.) or entered by a
 * human/analysis step, and the weighted total is fully reproducible from its
 * inputs. `explain()` always renders the same reasoning a human could redo
 * by hand.
 */

export interface OpportunityScoreInputs {
  /** Potential commercial impact if this opportunity is pursued, 0-100. */
  impactScore: number;
  /** Strength of the supporting evidence, 0-100 (derived from Signal confidence). */
  evidenceScore: number;
  /** How relevant this is to this specific business's audiences/products, 0-100. */
  relevanceScore: number;
  /** How time-sensitive this is, 0-100 (higher = more urgent). */
  urgencyScore: number;
  /** Ease of execution, 0-100 (higher = LESS effort required). */
  effortScore: number;
  /** Cost efficiency, 0-100 (higher = LOWER cost required). */
  costScore: number;
  /** How much competitive pressure makes this important, 0-100. */
  competitiveScore: number;
  /** Alignment with the business's stated goals, 0-100. */
  strategicScore: number;
}

export const RUBRIC_WEIGHTS: Record<keyof OpportunityScoreInputs, number> = {
  impactScore: 0.25,
  evidenceScore: 0.15,
  relevanceScore: 0.15,
  urgencyScore: 0.1,
  effortScore: 0.1,
  costScore: 0.1,
  competitiveScore: 0.075,
  strategicScore: 0.075,
};

export const RUBRIC_LABELS: Record<keyof OpportunityScoreInputs, string> = {
  impactScore: "Commercial impact",
  evidenceScore: "Evidence strength",
  relevanceScore: "Relevance to this business",
  urgencyScore: "Urgency",
  effortScore: "Ease of execution",
  costScore: "Cost efficiency",
  competitiveScore: "Competitive pressure",
  strategicScore: "Strategic alignment",
};

export function computeTotalScore(inputs: OpportunityScoreInputs): number {
  const total = (Object.keys(RUBRIC_WEIGHTS) as Array<keyof OpportunityScoreInputs>).reduce(
    (sum, key) => sum + inputs[key] * RUBRIC_WEIGHTS[key],
    0
  );
  return Math.round(total);
}

/** Confidence (0-1) from Signal evidence -> a 0-100 evidence-strength score. */
export function evidenceScoreFromConfidence(confidence: number): number {
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100);
}

export function explainScore(inputs: OpportunityScoreInputs): string {
  const entries = (Object.keys(RUBRIC_WEIGHTS) as Array<keyof OpportunityScoreInputs>)
    .map((key) => ({
      key,
      label: RUBRIC_LABELS[key],
      value: inputs[key],
      weight: RUBRIC_WEIGHTS[key],
      contribution: inputs[key] * RUBRIC_WEIGHTS[key],
    }))
    .sort((a, b) => b.contribution - a.contribution);

  const top = entries.slice(0, 3);
  const drivers = top.map((e) => `${e.label.toLowerCase()} (${e.value}/100)`).join(", ");
  const weakest = entries[entries.length - 1];

  return (
    `Ranked primarily on ${drivers}. ` +
    `Weakest factor: ${weakest.label.toLowerCase()} (${weakest.value}/100). ` +
    `Score = ${entries
      .map((e) => `${Math.round(e.weight * 100)}%×${RUBRIC_LABELS[e.key]}`)
      .join(" + ")}.`
  );
}
