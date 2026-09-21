import { prisma } from "@/lib/prisma";

/**
 * Builds today's Daily Growth Brief purely from what's already stored
 * (Signals, Opportunities, ActionItems) — never invents new content. If a
 * business has no fresh signals today, the brief says so rather than
 * padding with stale or fabricated items.
 */
export async function buildDailyBrief(businessId: string, date: Date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const recentSignals = await prisma.signal.findMany({
    where: { businessId, createdAt: { gte: startOfDay, lte: endOfDay } },
    orderBy: { confidence: "desc" },
  });

  // Fall back to the most recent signals overall if none landed exactly today
  // (expected in a demo/seed dataset) — but say so explicitly, never pretend
  // they're new.
  const signalsForBrief =
    recentSignals.length > 0
      ? recentSignals
      : await prisma.signal.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 5 });
  const isStale = recentSignals.length === 0;

  const topOpportunity = await prisma.opportunity.findFirst({
    where: { businessId, status: { in: ["IDENTIFIED", "PLANNED"] } },
    orderBy: { totalScore: "desc" },
    include: { signals: { include: { signal: true } } },
  });

  const aiActions = await prisma.actionItem.findMany({
    where: { businessId, executionMode: "AI_CAN_EXECUTE", status: "NOT_STARTED" },
    take: 5,
  });
  const humanActions = await prisma.actionItem.findMany({
    where: { businessId, executionMode: "NEEDS_HUMAN", status: "NOT_STARTED" },
    take: 5,
  });

  return {
    date,
    isStale,
    whatChanged: signalsForBrief.map((s) => ({
      text: s.title,
      signalId: s.id,
      claimType: s.claimType,
      source: s.source,
      confidence: s.confidence,
    })),
    whyItMatters: topOpportunity
      ? `${topOpportunity.title}: ${topOpportunity.summary}`
      : "No prioritized opportunity yet — add signals or run analysis to generate one.",
    biggestOpportunity: topOpportunity,
    whatToDo: topOpportunity ? [topOpportunity.recommendedAction] : [],
    aiCanExecute: aiActions.map((a) => a.action),
    needsHuman: humanActions.map((a) => a.action),
  };
}
