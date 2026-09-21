# Tourism Growth Intelligence — Architecture

This document defines the product architecture before implementation, per the
project brief. It is the source of truth for what exists, what is scaffolded,
and what is explicitly not yet built.

## 1. Product Architecture

The platform is an **AI Chief Growth Officer** for tourism businesses. It is a
multi-tenant SaaS application, not a script or a one-off report generator.

```
┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Next.js)                          │
│  Dashboard · Onboarding · Settings · Portfolio View                  │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ Server Components / Server Actions
┌───────────────────────────────▼───────────────────────────────────────┐
│                        APPLICATION LAYER (Next.js)                    │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────────────────┐    │
│  │ Onboarding &   │ │ Integration     │ │ Daily Brief / Weekly     │    │
│  │ Profile Builder│ │ Registry        │ │ Plan Generators           │    │
│  └───────────────┘ └────────────────┘ └─────────────────────────┘    │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────────────────┐    │
│  │ Opportunity    │ │ Experiment      │ │ Content / Product         │    │
│  │ Engine         │ │ Engine          │ │ Intelligence               │    │
│  └───────────────┘ └────────────────┘ └─────────────────────────┘    │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ Prisma ORM
┌───────────────────────────────▼───────────────────────────────────────┐
│                          DATA LAYER (PostgreSQL)                      │
│  Businesses · Profiles · Signals · Opportunities · Experiments ·      │
│  Actions · Integrations · Learnings · Users/Roles                     │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │ Connector interfaces (pluggable)
┌───────────────────────────────▼───────────────────────────────────────┐
│         EXTERNAL DATA SOURCES (see §3) — each behind a connector      │
│  GSC · GA4 · Trends · Social · Booking/CRM · Reviews · News/Weather · │
│  Competitor sites · AI discovery surfaces                             │
└─────────────────────────────────────────────────────────────────────┘
```

Design principles:

- **One codebase, many businesses.** Every table is scoped by `businessId`.
  No per-business forks.
- **Connectors are interfaces, not promises.** Every external source is
  implemented behind a `Connector` interface with a `status` the UI reads
  directly — `CONNECTED`, `NOT_CONNECTED`, `REQUIRES_API`,
  `REQUIRES_USER_AUTH`. A connector that has no credentials returns that
  status and **no data** — it never fabricates a result.
- **Evidence is a first-class citizen.** Every signal, opportunity, and
  insight row carries `source`, `sourceTimestamp`, `evidence`, `confidence`,
  and an epistemic `claimType` (`FACT | OBSERVATION | INFERENCE | HYPOTHESIS |
  RECOMMENDATION`). The UI renders these, not just the headline.
- **Explainable scoring, not black-box AI scores.** The Opportunity Engine is
  a documented weighted rubric (§ Opportunity Engine below), so every
  ranking can be explained to a business owner.

## 2. Database / Schema

Implemented in `prisma/schema.prisma`. Summary of core entities:

- **User / Membership** — auth identity + `BusinessMember` join table carrying
  a `Role` (`OWNER, ADMIN, STRATEGIST, MARKETER, VIEWER`) per business, so one
  user can belong to multiple businesses (agency use case) and one business
  can have multiple users.
- **Business** — tenant root: name, website, destination, category, products,
  target markets/audiences, booking URL, social profiles, goals, key metrics.
- **BusinessProfile** — the derived intelligence profile (positioning,
  differentiators, seasonality, FAQs, booking process, policies, current
  search/AI visibility summary) built from onboarding + website analysis.
- **Competitor** — user-defined, scoped to a business.
- **IntegrationConnection** — one row per (business, data source), holding
  `status`, `lastSyncedAt`, `config`. This is the runtime backing for the
  Settings → Integrations page and the CONNECTED/NOT CONNECTED badges used
  everywhere.
- **Signal** (polymorphic via `type`) — the atomic unit of intelligence:
  `TREND | DEMAND | COMPETITOR | AI_DISCOVERY | MARKET`. Carries the evidence
  fields above plus a `relevance/scale/momentum/commercialPotential` block
  for trend evaluation.
- **Opportunity** — links to supporting `Signal`s (many-to-many), holds the
  rubric scores, category (`MARKETING | PRODUCT | MARKET | CONVERSION |
  RETENTION`), and status (`IDENTIFIED | PLANNED | IN_PROGRESS | SHIPPED |
  MEASURED | DISCARDED`).
- **ContentBrief**, **ProductOpportunity** — specialized outputs of the
  Opportunity Engine with their own required-field shape from the spec
  (e.g. product briefs require target traveller, problem, demand, gap,
  proposed product, partners, seasonality, risks, data needed).
- **Experiment** — hypothesis/audience/action/channel/timeframe/metric/
  baseline/result/learning/nextAction, plus `supersedesExperimentId` so a
  retried experiment must explain what's different rather than silently
  repeating.
- **ActionItem** — the Weekly Growth Plan unit (action/why/audience/channel/
  owner/effort/expectedOutcome/measurement/status), optionally linked to an
  Opportunity or Experiment, with `executionMode` (`AI_CAN_EXECUTE |
  NEEDS_HUMAN`) and `requiresApproval`.
- **DailyBrief** — persisted snapshot of the 6-part daily structure so history
  is queryable, not regenerated/rewritten after the fact.
- **Learning** — outcome tracking tied back to actions/experiments, feeding
  the Learning Engine.
- **AuditLog** — every AI-proposed or AI-executed action is logged with
  actor (`AI` or `user id`), what changed, and approval state.

## 3. Data Sources

| Domain | Source | Status in this build |
|---|---|---|
| Search | Google Search Console | `REQUIRES_USER_AUTH` (OAuth not wired) |
| Search | Google Analytics (GA4) | `REQUIRES_USER_AUTH` |
| Search | Google Trends | `REQUIRES_API` (no official free API; needs a data provider) |
| Search | Keyword data provider (e.g. Ahrefs/Semrush) | `REQUIRES_API` |
| Social | Instagram / Facebook (Meta Graph API) | `REQUIRES_USER_AUTH` |
| Social | TikTok | `REQUIRES_USER_AUTH` |
| Social | YouTube Data API | `REQUIRES_API` |
| Social | Reddit API | `REQUIRES_API` |
| Business | Booking system (varies by vendor) | `REQUIRES_API` (per-vendor connector) |
| Business | CRM / email | `REQUIRES_API` |
| Reputation | Reviews (Google/TripAdvisor) | `REQUIRES_API` |
| Market | Tourism/gov't reports | `NOT_CONNECTED` (manual upload supported) |
| External | Competitor websites | `NOT_CONNECTED` — scaffolded as periodic fetch+diff, needs scheduler + storage before "connected" |
| External | News | `REQUIRES_API` |
| External | Weather | `REQUIRES_API` |
| External | Events | `REQUIRES_API` |
| AI Discovery | Claude / AI search probing | `CONNECTED` when `ANTHROPIC_API_KEY` is set; otherwise `REQUIRES_API` |
| Website analysis | Business's own website | `CONNECTED` when `ANTHROPIC_API_KEY` is set (fetch + LLM extraction); otherwise `REQUIRES_API` |

This table is implemented in code at `src/lib/integrations/registry.ts` as the
single source of truth — the UI never hardcodes a status separately.

## 4. Integration Architecture

Every connector implements:

```ts
interface Connector<TResult> {
  id: string;                 // stable key, matches registry
  requiredEnv: string[];      // env vars needed
  status(business): Promise<IntegrationStatus>;
  fetch(business): Promise<TResult>; // throws if not CONNECTED
}
```

Connectors are registered in `src/lib/integrations/` and never called
directly by UI code — always through the registry, which checks status first.
This means adding a real GA4/GSC OAuth flow later is additive: implement the
connector, flip its registry entry, no changes needed elsewhere.

## 5. Agent Architecture

Two categories of AI usage, both gated on `ANTHROPIC_API_KEY`:

1. **Extraction agents** (deterministic-ish, single-shot): website →
   BusinessProfile, AI-discovery question probing. Structured output via
   tool-call/JSON schema, stored with `claimType: INFERENCE` or `OBSERVATION`
   and a confidence.
2. **Synthesis agents** (reasoning over stored Signals): Opportunity Engine
   narrative generation, Daily Brief writing, Weekly Plan drafting. These
   agents only ever summarize/rank data that already exists in the DB as
   Signals — they are not permitted to invent a Signal themselves. The
   scoring rubric itself is deterministic code, not an LLM call, so rankings
   are reproducible and explainable.

Without an API key, both categories are `NOT_CONNECTED` and the product
degrades to: manual data entry + the deterministic rubric only, clearly
labeled.

## 6. User Roles & Permissions

- **Owner** — full control of a business, billing, user management.
- **Admin** — manage business config, integrations, users (not billing).
- **Strategist** — full read, can create/approve opportunities, experiments,
  approve AI actions.
- **Marketer** — full read, can execute approved content/marketing actions.
- **Viewer** — read-only (e.g. a stakeholder or portfolio investor).
- **Agency/Portfolio user** — has memberships across multiple businesses and
  sees an aggregated Portfolio view (read access only to what their role
  allows per business).

Any action that publishes, spends money, or materially changes the business
requires `requiresApproval = true` by default and is blocked until a user
with `Strategist+` role approves it (`AuditLog` records the approval).

## 7. MVP

Built in this session:

- Multi-business schema + seed data for one fully-populated demo business.
- Onboarding form that creates a Business and (if `ANTHROPIC_API_KEY` is set)
  runs website analysis to populate `BusinessProfile`.
- Integration registry + Settings page showing real status per source.
- Opportunity Engine (deterministic rubric) operating over seeded Signals.
- Dashboard: Executive Overview, Today's Intelligence, Growth Opportunities,
  Traveller Demand, Competitors, AI Discovery, Marketing, Product
  Opportunities, Experiments, Analytics, Actions, History, Settings.
- Daily Brief and Weekly Plan views generated from stored data.
- Every insight card shows source/timestamp/evidence/confidence/claim type.

Explicitly **not** built (requires credentials/OAuth this environment does
not have, or a scheduler/worker infra beyond a single request/response app):
live GA4/GSC/social/booking/CRM connectors, review-platform polling,
competitor change-detection scheduler, outbound email/social publishing,
weather/events/news feeds. These are scaffolded as `REQUIRES_API` /
`REQUIRES_USER_AUTH` connectors ready to implement.

## 8. Future Functionality

- Real OAuth connectors for GA4, GSC, Meta, TikTok, YouTube.
- Background worker (queue) for scheduled competitor diffing, review
  polling, AI-discovery re-probing, and daily brief generation.
- Notification delivery (email/Slack) for the Daily Brief.
- Action execution connectors (CMS publish, email send) behind approval.
- Portfolio-level cross-business trend aggregation.

## 9. APIs Required (for full functionality)

Google Search Console API, Google Analytics Data API, Meta Graph API, TikTok
for Developers API, YouTube Data API, Reddit API, a keyword/SEO data
provider, a reviews aggregator, a news API, a weather API, an events API,
and per-vendor booking/CRM APIs. All are optional at runtime — absence is
surfaced, never silently ignored.

## 10. What Can Be Built Without External Credentials

Everything in §7's MVP list except the two Claude-gated features (website
analysis, AI discovery probing), which degrade gracefully to
`REQUIRES_API` with manual-entry fallback for the BusinessProfile.
