/**
 * Demo seed data for one fully-populated tourism business, used to exercise
 * every screen in the product. Every record's `source` is explicitly labeled
 * "Demo seed data" (or similarly obvious) — this is illustrative sample
 * content, not a claim that it was fetched from a live integration. See
 * ARCHITECTURE.md §3 for what's actually connected.
 */
import { PrismaClient } from "@prisma/client";
import { INTEGRATION_REGISTRY, resolveStatus } from "../src/lib/integrations/registry";
import { computeTotalScore, explainScore, type OpportunityScoreInputs } from "../src/lib/opportunity-engine/score";

const prisma = new PrismaClient();

const DEMO_SOURCE = "Demo seed data";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function mondayOfWeek(offsetWeeks = 0): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offsetWeeks * 7;
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function main() {
  console.log("Seeding demo business...");

  await prisma.business.deleteMany({ where: { name: "Summit & Sea Adventures" } });

  const business = await prisma.business.create({
    data: {
      name: "Summit & Sea Adventures",
      website: "https://example-summitandsea.com",
      destination: "Queenstown, New Zealand",
      category: "Adventure tour operator",
      products: [
        "Half-day alpine hiking tours",
        "Multi-day trekking packages",
        "Guided via ferrata climbing",
        "Sunset lake kayaking",
      ],
      services: ["Private guiding", "Equipment rental", "Custom itinerary planning"],
      targetMarkets: ["Australia", "USA", "UK", "Domestic NZ"],
      targetAudiences: ["Adventure couples 30-45", "Solo experienced hikers", "Small friend groups"],
      bookingUrl: "https://example-summitandsea.com/book",
      socialProfiles: { instagram: "https://instagram.com/summitandsea", facebook: "https://facebook.com/summitandsea" },
      marketingChannels: ["Instagram", "Google Ads", "Email newsletter", "Partner referrals"],
      goals: [
        "Grow direct bookings 20% this year",
        "Increase shoulder-season (Apr-May, Sep-Oct) demand",
        "Improve AI-search discoverability",
      ],
      keyMetrics: {
        "Monthly website sessions": "8,400 (self-reported, last full month)",
        "Direct booking conversion rate": "2.1% (self-reported)",
        "Average booking value": "NZD $340 (self-reported)",
      },
    },
  });

  const profile = await prisma.businessProfile.create({
    data: {
      businessId: business.id,
      positioning:
        "Premium small-group alpine adventure operator differentiated on expert local guiding and low group sizes (max 8).",
      differentiators: ["Max group size of 8", "NZ Mountain Guides certified staff", "Custom multi-day itineraries"],
      pricingSummary: "Mid-to-premium pricing, NZD $180-$650 depending on tour length and group size.",
      experiences: [
        { name: "Ben Lomond Alpine Day Hike", description: "Full-day guided summit hike with lunch included.", priceHint: "NZD $220" },
        { name: "Routeburn 3-Day Trek", description: "Multi-day guided trek with hut accommodation.", priceHint: "NZD $650" },
      ],
      seasonality: { Dec: "Peak", Jan: "Peak", Feb: "Peak", Apr: "Shoulder — low demand", Sep: "Shoulder — low demand", Jun: "Off-season" },
      faqs: [
        { question: "What fitness level is required?", answer: "Moderate fitness for day hikes; multi-day treks require good fitness." },
        { question: "Is transport included?", answer: "Yes, pickup from central Queenstown accommodation is included." },
      ],
      bookingProcess: "Online booking with 20% deposit, balance due 14 days before the tour date.",
      policies: ["Free cancellation up to 7 days before", "Weather-dependent reschedule policy"],
      currentContentSummary: "Demo seed data — illustrative summary: site has strong photography but thin destination-guide content and no dedicated FAQ or comparison pages.",
      searchVisibilitySummary: "Demo seed data — illustrative: ranks for branded terms only; minimal visibility for high-intent non-branded queries.",
      aiVisibilitySummary: "Demo seed data — illustrative: not consistently mentioned when AI assistants are asked for Queenstown adventure recommendations.",
      analysisSource: "NOT_CONNECTED",
      analysisConfidence: null,
      analyzedAt: null,
    },
  });
  void profile;

  const [competitorA, competitorB] = await Promise.all([
    prisma.competitor.create({ data: { businessId: business.id, name: "Peak Trails Co.", website: "https://example-peaktrails.com" } }),
    prisma.competitor.create({ data: { businessId: business.id, name: "Alpine Base Tours", website: "https://example-alpinebase.com" } }),
  ]);

  await prisma.integrationConnection.createMany({
    data: INTEGRATION_REGISTRY.map((def) => ({
      businessId: business.id,
      sourceKey: def.key,
      status: resolveStatus(def),
    })),
  });

  const signalDemandFamily = await prisma.signal.create({
    data: {
      businessId: business.id,
      type: "DEMAND",
      title: "Rising search interest in multi-generational family adventure trips",
      summary:
        "Demo seed data — illustrative signal: growing traveller interest in adventure trips that work for both grandparents and grandchildren, with a preference for shorter, lower-intensity guided options.",
      claimType: "HYPOTHESIS",
      source: DEMO_SOURCE,
      sourceTimestamp: daysAgo(1),
      evidence: "Illustrative: pattern consistent with broader industry reporting on multi-generational travel growth; not yet confirmed with this business's own search data (GSC not connected).",
      confidence: 0.55,
      relevance: "MEDIUM",
      targetAudience: "Multi-generational family groups",
      scale: "MEDIUM",
      momentum: "RISING",
      commercialPotential: "MEDIUM",
    },
  });

  const signalDemandShoulder = await prisma.signal.create({
    data: {
      businessId: business.id,
      type: "DEMAND",
      title: "Shoulder-season travellers ask about weather reliability before booking",
      summary:
        "Demo seed data — illustrative signal: a recurring pre-booking objection is uncertainty about weather-related cancellations during April-May and September-October.",
      claimType: "OBSERVATION",
      source: DEMO_SOURCE,
      sourceTimestamp: daysAgo(2),
      evidence: "Illustrative: consistent with the business's own shoulder-season booking policy FAQ being a top-viewed page (would be confirmed by GA4 once connected).",
      confidence: 0.6,
      relevance: "HIGH",
      targetAudience: "Shoulder-season travellers",
      scale: "MEDIUM",
      momentum: "STABLE",
      commercialPotential: "HIGH",
    },
  });

  const signalCompetitorPricing = await prisma.signal.create({
    data: {
      businessId: business.id,
      type: "COMPETITOR",
      title: "Peak Trails Co. launched a discounted shoulder-season bundle",
      summary:
        "Demo seed data — illustrative signal: competitor introduced a 15% shoulder-season 2-tour bundle, directly targeting the Sep-Oct low-demand window this business also serves.",
      claimType: "OBSERVATION",
      source: DEMO_SOURCE,
      sourceTimestamp: daysAgo(3),
      evidence: "Illustrative: based on a manual review of the competitor's public pricing page.",
      confidence: 0.8,
      relevance: "HIGH",
      scale: "MEDIUM",
      momentum: "RISING",
      commercialPotential: "MEDIUM",
      competitorId: competitorA.id,
    },
  });

  const signalCompetitorContent = await prisma.signal.create({
    data: {
      businessId: business.id,
      type: "COMPETITOR",
      title: "Alpine Base Tours published a new Routeburn comparison guide",
      summary:
        "Demo seed data — illustrative signal: competitor published a long-form comparison of Queenstown multi-day treks that ranks for several non-branded search terms this business does not currently target.",
      claimType: "OBSERVATION",
      source: DEMO_SOURCE,
      sourceTimestamp: daysAgo(5),
      evidence: "Illustrative: based on a manual review of the competitor's blog.",
      confidence: 0.7,
      relevance: "HIGH",
      scale: "LOW",
      momentum: "STABLE",
      commercialPotential: "MEDIUM",
      competitorId: competitorB.id,
    },
  });

  const signalAIDiscovery = await prisma.signal.create({
    data: {
      businessId: business.id,
      type: "AI_DISCOVERY",
      title: "Business not mentioned when asked for best Queenstown adventure experiences",
      summary:
        "Demo seed data — illustrative signal: a sample AI-assistant query for 'best adventure experiences in Queenstown' surfaced two competitors but not this business.",
      claimType: "OBSERVATION",
      source: DEMO_SOURCE,
      sourceTimestamp: daysAgo(4),
      evidence: "Illustrative example only — run a live probe from the AI Discovery page (requires ANTHROPIC_API_KEY) to get a real result.",
      confidence: 0.65,
      relevance: "HIGH",
      commercialPotential: "HIGH",
    },
  });

  const signalMarketTrend = await prisma.signal.create({
    data: {
      businessId: business.id,
      type: "TREND",
      title: "NZ tourism board reports growth in 'active wellness' travel positioning",
      summary:
        "Demo seed data — illustrative signal: destination-level reporting suggests growing traveller interest in framing adventure activities around wellness benefits, not just adrenaline.",
      claimType: "INFERENCE",
      source: DEMO_SOURCE,
      sourceTimestamp: daysAgo(7),
      evidence: "Illustrative: representative of the kind of signal a connected tourism-report feed would surface.",
      confidence: 0.45,
      relevance: "MEDIUM",
      scale: "MEDIUM",
      momentum: "RISING",
      commercialPotential: "LOW",
    },
  });

  // ---- Opportunities ----------------------------------------------------

  const shoulderInputs: OpportunityScoreInputs = {
    impactScore: 78,
    evidenceScore: 70,
    relevanceScore: 90,
    urgencyScore: 75,
    effortScore: 65,
    costScore: 70,
    competitiveScore: 80,
    strategicScore: 90,
  };
  const shoulderOpportunity = await prisma.opportunity.create({
    data: {
      businessId: business.id,
      title: "Launch a weather-guarantee shoulder-season offer",
      category: "CONVERSION",
      summary:
        "Address the recurring weather-reliability objection directly with a clear reschedule/refund guarantee for Apr-May and Sep-Oct bookings, and promote it against the competitor's new shoulder-season bundle.",
      recommendedAction:
        "Publish a 'Weather Guarantee' policy page and add it prominently to shoulder-season tour listings and checkout; A/B test its effect on shoulder-season conversion rate.",
      impactScore: shoulderInputs.impactScore,
      evidenceScore: shoulderInputs.evidenceScore,
      relevanceScore: shoulderInputs.relevanceScore,
      urgencyScore: shoulderInputs.urgencyScore,
      effortScore: shoulderInputs.effortScore,
      costScore: shoulderInputs.costScore,
      competitiveScore: shoulderInputs.competitiveScore,
      strategicScore: shoulderInputs.strategicScore,
      totalScore: computeTotalScore(shoulderInputs),
      scoreExplanation: explainScore(shoulderInputs),
      status: "IDENTIFIED",
      signals: { create: [{ signalId: signalDemandShoulder.id }, { signalId: signalCompetitorPricing.id }] },
    },
  });

  const aiDiscoveryInputs: OpportunityScoreInputs = {
    impactScore: 65,
    evidenceScore: 60,
    relevanceScore: 80,
    urgencyScore: 55,
    effortScore: 55,
    costScore: 75,
    competitiveScore: 60,
    strategicScore: 85,
  };
  const aiDiscoveryOpportunity = await prisma.opportunity.create({
    data: {
      businessId: business.id,
      title: "Improve AI-search discoverability for 'best Queenstown adventure' queries",
      category: "MARKETING",
      summary:
        "This business is currently absent from AI-assistant answers to high-intent destination queries where competitors appear. Structured, fact-rich content is likely to improve inclusion.",
      recommendedAction:
        "Publish a comprehensive, fact-dense 'Best Queenstown Adventure Experiences' guide with structured FAQs, and re-probe AI discovery monthly to track inclusion.",
      impactScore: aiDiscoveryInputs.impactScore,
      evidenceScore: aiDiscoveryInputs.evidenceScore,
      relevanceScore: aiDiscoveryInputs.relevanceScore,
      urgencyScore: aiDiscoveryInputs.urgencyScore,
      effortScore: aiDiscoveryInputs.effortScore,
      costScore: aiDiscoveryInputs.costScore,
      competitiveScore: aiDiscoveryInputs.competitiveScore,
      strategicScore: aiDiscoveryInputs.strategicScore,
      totalScore: computeTotalScore(aiDiscoveryInputs),
      scoreExplanation: explainScore(aiDiscoveryInputs),
      status: "IDENTIFIED",
      signals: { create: [{ signalId: signalAIDiscovery.id }, { signalId: signalCompetitorContent.id }] },
    },
  });

  const familyInputs: OpportunityScoreInputs = {
    impactScore: 55,
    evidenceScore: 40,
    relevanceScore: 60,
    urgencyScore: 35,
    effortScore: 50,
    costScore: 60,
    competitiveScore: 40,
    strategicScore: 50,
  };
  await prisma.opportunity.create({
    data: {
      businessId: business.id,
      title: "Explore a multi-generational 'easy adventure' package",
      category: "PRODUCT",
      summary:
        "Early, low-confidence signal of demand for shorter, lower-intensity guided adventures suited to multi-generational groups. Needs validation before investment.",
      recommendedAction:
        "Run a low-cost experiment: list a single 'easy adventure' half-day product and measure interest before building a full package line.",
      impactScore: familyInputs.impactScore,
      evidenceScore: familyInputs.evidenceScore,
      relevanceScore: familyInputs.relevanceScore,
      urgencyScore: familyInputs.urgencyScore,
      effortScore: familyInputs.effortScore,
      costScore: familyInputs.costScore,
      competitiveScore: familyInputs.competitiveScore,
      strategicScore: familyInputs.strategicScore,
      totalScore: computeTotalScore(familyInputs),
      scoreExplanation: explainScore(familyInputs),
      status: "IDENTIFIED",
      signals: { create: [{ signalId: signalDemandFamily.id }, { signalId: signalMarketTrend.id }] },
    },
  });

  // ---- Content briefs -----------------------------------------------------

  await prisma.contentBrief.create({
    data: {
      businessId: business.id,
      contentType: "FAQ",
      title: "Weather & Cancellation Guarantee page",
      whyNow: "Directly answers the top pre-booking objection identified in shoulder-season demand signals.",
      targetAudience: "Shoulder-season travellers evaluating whether to book",
      keyPoints: [
        "Clear reschedule/refund terms for weather cancellations",
        "Comparison to industry-standard policies",
        "Link prominently from shoulder-season tour pages",
      ],
      seoNotes: "Target 'Queenstown tour weather cancellation' and similar long-tail queries.",
      aiDiscoveryNotes: "Structured Q&A format increases likelihood of AI-assistant citation.",
      status: "PROPOSED",
    },
  });

  await prisma.contentBrief.create({
    data: {
      businessId: business.id,
      contentType: "DESTINATION_GUIDE",
      title: "Best Queenstown Adventure Experiences (comprehensive guide)",
      whyNow: "Closes the AI-discovery and non-branded search gap versus Alpine Base Tours' comparison content.",
      targetAudience: "High-intent travellers researching Queenstown adventure options",
      keyPoints: [
        "Cover all major experience categories, not just this business's own tours",
        "Include specific, factual details AI assistants can cite (group sizes, durations, difficulty)",
        "Add comparison table against common alternatives",
      ],
      seoNotes: "Target 'best adventure experiences Queenstown' and variants.",
      aiDiscoveryNotes: "Fact density and clear structure are the primary lever for AI citation.",
      status: "PROPOSED",
    },
  });

  // ---- Product opportunities ----------------------------------------------

  await prisma.productOpportunity.create({
    data: {
      businessId: business.id,
      targetTraveller: "Multi-generational family groups (grandparents + grandchildren)",
      problem: "Existing tours are pitched at a fitness/intensity level that excludes less-active family members.",
      demandEvidence: "Early hypothesis-level signal only — see 'Rising search interest' demand signal.",
      existingSupply: "No dedicated low-intensity guided product currently offered by this business or, as far as observed, by competitors.",
      gap: "A shorter, lower-intensity guided experience marketed explicitly for mixed-ability family groups.",
      proposedProduct: "2-hour 'Family Alpine Walk' with flexible pacing and a picnic stop.",
      potentialPartners: ["Local family-friendly accommodation providers", "Queenstown i-SITE visitor centre"],
      seasonality: "Best suited to peak season (Dec-Feb) when family travel is highest.",
      risks: ["Demand not yet confirmed", "Could dilute premium/adventure brand positioning if not marketed as a distinct product line"],
      dataNeeded: ["Actual search volume data (Google Trends not connected)", "Direct customer survey on interest"],
      confidence: 0.35,
    },
  });

  // ---- Experiments ---------------------------------------------------------

  const pastExperiment = await prisma.experiment.create({
    data: {
      businessId: business.id,
      hypothesis: "Adding a visible 'Free reschedule for weather' badge to shoulder-season listings increases conversion.",
      audience: "Shoulder-season website visitors",
      action: "Added badge to 4 shoulder-season tour listing pages",
      channel: "Website",
      timeframeStart: daysAgo(35),
      timeframeEnd: daysAgo(21),
      successMetric: "Shoulder-season listing → booking conversion rate",
      baseline: "1.4% (self-reported, prior 2-week average)",
      result: "1.6% over the test window — a modest, inconclusive improvement given small sample size.",
      learning: "Directionally positive but underpowered; the objection is real but the badge alone may be too subtle to fully resolve it.",
      nextAction: "Try a more prominent, dedicated guarantee page rather than a small badge.",
      status: "COMPLETE",
    },
  });

  await prisma.experiment.create({
    data: {
      businessId: business.id,
      opportunityId: shoulderOpportunity.id,
      hypothesis: "A dedicated Weather Guarantee page linked from checkout increases shoulder-season conversion more than a listing badge did.",
      audience: "Shoulder-season website visitors",
      action: "Publish dedicated guarantee page + link from checkout and listings",
      channel: "Website",
      timeframeStart: daysAgo(2),
      timeframeEnd: daysAgo(-12),
      successMetric: "Shoulder-season listing → booking conversion rate",
      baseline: "1.6% (result of prior badge experiment)",
      status: "RUNNING",
      supersedesExperimentId: pastExperiment.id,
      whyDifferent: "Prior test only added a small listing badge; this test gives the guarantee its own dedicated, more visible page linked from checkout, addressing the 'too subtle' learning from the last run.",
    },
  });

  // ---- Action items (this week's plan) -------------------------------------

  const weekOf = mondayOfWeek(0);
  await prisma.actionItem.createMany({
    data: [
      {
        businessId: business.id,
        opportunityId: shoulderOpportunity.id,
        action: "Draft Weather Guarantee policy page copy",
        why: "Directly addresses the top shoulder-season booking objection.",
        audience: "Shoulder-season travellers",
        channel: "Website",
        owner: "AI",
        effort: "LOW",
        expectedOutcome: "Publishable draft ready for review",
        measurement: "Draft delivered and approved",
        status: "NOT_STARTED",
        executionMode: "AI_CAN_EXECUTE",
        requiresApproval: true,
        weekOf,
      },
      {
        businessId: business.id,
        opportunityId: shoulderOpportunity.id,
        action: "Publish Weather Guarantee page live",
        why: "Ships the approved guarantee content to the site.",
        audience: "Shoulder-season travellers",
        channel: "Website",
        owner: "Marketing lead",
        effort: "LOW",
        expectedOutcome: "Page live and linked from checkout",
        measurement: "Page publish confirmed",
        status: "NOT_STARTED",
        executionMode: "NEEDS_HUMAN",
        requiresApproval: true,
        weekOf,
      },
      {
        businessId: business.id,
        opportunityId: aiDiscoveryOpportunity.id,
        action: "Draft 'Best Queenstown Adventure Experiences' guide outline",
        why: "First step toward improving AI-search discoverability.",
        audience: "High-intent researching travellers",
        channel: "Website / SEO",
        owner: "AI",
        effort: "MEDIUM",
        expectedOutcome: "Structured outline with fact-checkable claims marked",
        measurement: "Outline delivered",
        status: "NOT_STARTED",
        executionMode: "AI_CAN_EXECUTE",
        requiresApproval: true,
        weekOf,
      },
      {
        businessId: business.id,
        action: "Review and respond to Peak Trails Co. shoulder-season bundle",
        why: "Competitor is directly targeting the same low-demand window.",
        audience: "Internal / strategy",
        channel: "Internal",
        owner: "Owner",
        effort: "LOW",
        expectedOutcome: "Decision on whether to price-match or differentiate",
        measurement: "Decision documented",
        status: "NOT_STARTED",
        executionMode: "NEEDS_HUMAN",
        requiresApproval: false,
        weekOf,
      },
      {
        businessId: business.id,
        action: "Re-run AI discovery probe after guide is published",
        why: "Measures whether the new content changed AI-assistant inclusion.",
        audience: "Internal / measurement",
        channel: "AI Discovery",
        owner: "AI",
        effort: "LOW",
        expectedOutcome: "Updated AI Discovery signal recorded",
        measurement: "Probe result logged",
        status: "BLOCKED",
        executionMode: "AI_CAN_EXECUTE",
        requiresApproval: false,
        weekOf,
      },
    ],
  });

  // ---- Daily brief snapshot --------------------------------------------------

  await prisma.dailyBrief.create({
    data: {
      businessId: business.id,
      date: new Date(new Date().setHours(0, 0, 0, 0)),
      whatChanged: [
        { text: signalCompetitorPricing.title, signalId: signalCompetitorPricing.id },
        { text: signalDemandShoulder.title, signalId: signalDemandShoulder.id },
      ],
      whyItMatters:
        "A competitor is now actively discounting the same shoulder-season window where this business's own booking data shows weather-reliability is the top objection — addressing that objection directly is both defensive and high-leverage.",
      biggestOpportunityId: shoulderOpportunity.id,
      whatToDo: [shoulderOpportunity.recommendedAction],
      aiCanExecute: ["Draft Weather Guarantee policy page copy", "Draft 'Best Queenstown Adventure Experiences' guide outline"],
      needsHuman: ["Publish Weather Guarantee page live", "Review and respond to Peak Trails Co. shoulder-season bundle"],
    },
  });

  // ---- Learnings ---------------------------------------------------------

  await prisma.learning.create({
    data: {
      businessId: business.id,
      relatedType: "EXPERIMENT",
      relatedId: pastExperiment.id,
      observation: "A small listing badge produced only a modest, inconclusive lift in shoulder-season conversion.",
      implication: "Future trust-signal experiments on this objection should test more prominent placements before concluding the objection itself isn't addressable.",
    },
  });

  console.log(`Seeded business ${business.id} (${business.name})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
