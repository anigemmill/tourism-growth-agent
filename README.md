# Tourism Growth Intelligence

An AI Chief Growth Officer for tourism businesses — continuously answering
what's happening, why it matters, where the growth opportunity is, what to
do, what AI can execute, and whether it worked.

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the full product
architecture, schema, data-source status, and MVP scope. This README covers
setup only.

## Stack

Next.js (App Router, TypeScript) · Prisma + SQLite · Tailwind CSS ·
Anthropic (Claude) API for website analysis and AI-discovery probing.

## Getting started

```bash
npm install
cp .env.example .env        # optionally add ANTHROPIC_API_KEY
npx prisma migrate dev      # creates prisma/dev.db and applies the schema
npm run db:seed             # loads one fully-populated demo business
npm run dev
```

Open http://localhost:3000 — sign in with any email (no password; see
**Authentication** below), and you'll land on the demo business's Executive
Overview. Use **Add business** in the top bar to onboard a real one.

## Authentication & roles

There's no external identity provider wired up (no OAuth credentials exist
in this environment) — signing in just takes an email and upserts a `User`
row, then sets a session cookie. The first person to open a given business
becomes its **Owner**; everyone else who opens it joins as a **Viewer**.
Owners/Admins can promote or demote teammates from **Settings → Team &
roles**.

Every opportunity, action, and experiment status change is gated by role
(`VIEWER < MARKETER < STRATEGIST < ADMIN < OWNER`, see `src/lib/workflow.ts`)
and recorded to an `AuditLog` row — including a stricter approval gate when
a Marketer-started, AI-executable action is marked done (requires
Strategist+). A Viewer sees the same evidence everyone else does but no
mutation buttons.

## Environment variables

| Variable | Required for |
|---|---|
| `DATABASE_URL` | Always (defaults to `file:./dev.db` in `.env.example`) |
| `ANTHROPIC_API_KEY` | Automated website analysis (onboarding) and live AI Discovery probes. Without it, both features report `REQUIRES_API` and no data is invented in their place. |

No other integration in the product (Google Analytics, Search Console,
social platforms, booking/CRM systems, reviews, news, weather, events) is
wired to a live API in this build — see the Settings page or
[ARCHITECTURE.md §3](./ARCHITECTURE.md#3-data-sources) for the honest status
of each and what it would take to connect it.

## What's real vs. demo data

The seeded business ("Summit & Sea Adventures") is entirely illustrative
sample content — every record's `source` field says so explicitly
("Demo seed data"), and the UI renders that source on every card. It exists
to exercise all thirteen dashboard sections, not to represent a real fetch
from any integration. Onboarding a new business through the app starts with
an empty intelligence profile that only fills in from data you add or from
the two Claude-gated features above.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` — ESLint
- `npx prisma migrate dev` — apply schema changes
- `npm run db:seed` — (re)load the demo business
- `npx prisma studio` — inspect the database directly

## Project layout

```
prisma/schema.prisma          full data model (see ARCHITECTURE.md §2)
prisma/seed.ts                demo business + sample intelligence
src/lib/integrations/registry.ts   single source of truth for every data source's status
src/lib/ai/                   Claude-powered website analysis + AI discovery probing
src/lib/opportunity-engine/   explainable rubric scoring + daily brief builder
src/components/intelligence/  evidence-labeled UI primitives (source/timestamp/confidence/claim type)
src/app/onboarding/           business onboarding flow
src/app/b/[businessId]/       the 12-section per-business dashboard
src/app/portfolio/            multi-business portfolio view
```
