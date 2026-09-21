import type { IntegrationStatus } from "@/lib/enums";

export type IntegrationDomain =
  | "SEARCH"
  | "SOCIAL"
  | "BUSINESS"
  | "REPUTATION"
  | "MARKET"
  | "EXTERNAL"
  | "AI";

export interface IntegrationDefinition {
  key: string;
  name: string;
  domain: IntegrationDomain;
  description: string;
  /** Env vars that, if present, would let this connector run. */
  requiredEnv: string[];
  /** Fixed baseline status for this build — see ARCHITECTURE.md §3. */
  baselineStatus: IntegrationStatus;
  notes: string;
}

/**
 * Single source of truth for every data source named in the product spec.
 * The Settings > Integrations page, and every "connected / not connected"
 * badge elsewhere in the product, read from this list — nothing else in the
 * codebase is allowed to invent a status.
 *
 * `resolveStatus()` upgrades a source to CONNECTED only when its required
 * env vars are actually present. Nothing here ever claims a live connection
 * that hasn't been established.
 */
export const INTEGRATION_REGISTRY: IntegrationDefinition[] = [
  {
    key: "google_search_console",
    name: "Google Search Console",
    domain: "SEARCH",
    description: "Organic search queries, clicks, impressions, and indexing status.",
    requiredEnv: ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
    baselineStatus: "REQUIRES_USER_AUTH",
    notes: "Needs the business owner to authorize via Google OAuth (not wired in this build).",
  },
  {
    key: "google_analytics",
    name: "Google Analytics (GA4)",
    domain: "SEARCH",
    description: "Website traffic, conversion, and audience behaviour.",
    requiredEnv: ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
    baselineStatus: "REQUIRES_USER_AUTH",
    notes: "Needs the business owner to authorize via Google OAuth (not wired in this build).",
  },
  {
    key: "google_trends",
    name: "Google Trends",
    domain: "SEARCH",
    description: "Relative search interest over time for destinations, products, and topics.",
    requiredEnv: ["TRENDS_DATA_PROVIDER_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "No official public API; requires a third-party Trends data provider.",
  },
  {
    key: "keyword_data",
    name: "Keyword / SEO data provider",
    domain: "SEARCH",
    description: "Search volume, difficulty, and ranking data (e.g. Ahrefs, Semrush).",
    requiredEnv: ["SEO_PROVIDER_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires a paid provider subscription and API key.",
  },
  {
    key: "instagram",
    name: "Instagram",
    domain: "SOCIAL",
    description: "Posts, engagement, hashtag and mention activity.",
    requiredEnv: ["META_APP_ID", "META_APP_SECRET"],
    baselineStatus: "REQUIRES_USER_AUTH",
    notes: "Requires Meta Graph API app + business account authorization.",
  },
  {
    key: "facebook",
    name: "Facebook",
    domain: "SOCIAL",
    description: "Page activity, engagement, and ad performance.",
    requiredEnv: ["META_APP_ID", "META_APP_SECRET"],
    baselineStatus: "REQUIRES_USER_AUTH",
    notes: "Requires Meta Graph API app + business account authorization.",
  },
  {
    key: "tiktok",
    name: "TikTok",
    domain: "SOCIAL",
    description: "Video performance and trending sounds/hashtags relevant to the business.",
    requiredEnv: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    baselineStatus: "REQUIRES_USER_AUTH",
    notes: "Requires TikTok for Developers app + business account authorization.",
  },
  {
    key: "youtube",
    name: "YouTube",
    domain: "SOCIAL",
    description: "Video search demand and channel performance.",
    requiredEnv: ["YOUTUBE_DATA_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires a YouTube Data API v3 key.",
  },
  {
    key: "reddit",
    name: "Reddit",
    domain: "SOCIAL",
    description: "Traveller discussions, questions, and sentiment in relevant subreddits.",
    requiredEnv: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires a Reddit API app registration.",
  },
  {
    key: "booking_system",
    name: "Booking system",
    domain: "BUSINESS",
    description: "Reservations, occupancy, pricing, and booking funnel data.",
    requiredEnv: [],
    baselineStatus: "REQUIRES_API",
    notes: "Vendor-specific (e.g. Rezdy, Bókun, Cloudbeds) — needs a per-vendor connector.",
  },
  {
    key: "crm",
    name: "CRM / customer data",
    domain: "BUSINESS",
    description: "Customer records, lifecycle stage, and communication history.",
    requiredEnv: [],
    baselineStatus: "REQUIRES_API",
    notes: "Vendor-specific — needs a per-vendor connector.",
  },
  {
    key: "email",
    name: "Email platform",
    domain: "BUSINESS",
    description: "Campaign performance and subscriber engagement.",
    requiredEnv: [],
    baselineStatus: "REQUIRES_API",
    notes: "Vendor-specific (e.g. Klaviyo, Mailchimp) — needs a per-vendor connector.",
  },
  {
    key: "reviews",
    name: "Reviews (Google / TripAdvisor)",
    domain: "REPUTATION",
    description: "Review volume, rating trends, and recurring themes.",
    requiredEnv: ["REVIEWS_PROVIDER_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires a reviews aggregation API.",
  },
  {
    key: "tourism_reports",
    name: "Tourism / government reports",
    domain: "MARKET",
    description: "Destination-level visitor statistics and industry research.",
    requiredEnv: [],
    baselineStatus: "NOT_CONNECTED",
    notes: "No automated feed; supports manual document upload.",
  },
  {
    key: "competitor_sites",
    name: "Competitor websites",
    domain: "EXTERNAL",
    description: "Change detection on competitor pricing, offers, and content.",
    requiredEnv: [],
    baselineStatus: "NOT_CONNECTED",
    notes: "Needs a scheduled fetch+diff worker; not available in a request/response-only app.",
  },
  {
    key: "news",
    name: "News",
    domain: "EXTERNAL",
    description: "Destination and industry news that could affect demand.",
    requiredEnv: ["NEWS_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires a news API subscription.",
  },
  {
    key: "weather",
    name: "Weather",
    domain: "EXTERNAL",
    description: "Forecast and seasonal weather patterns affecting travel demand.",
    requiredEnv: ["WEATHER_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires a weather API subscription.",
  },
  {
    key: "events",
    name: "Events",
    domain: "EXTERNAL",
    description: "Local and regional events that could drive traveller demand.",
    requiredEnv: ["EVENTS_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Requires an events data API subscription.",
  },
  {
    key: "ai_discovery",
    name: "AI search / discovery probing",
    domain: "AI",
    description: "Tests how the business appears when travellers ask AI assistants for recommendations.",
    requiredEnv: ["ANTHROPIC_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Uses the Claude API directly — set ANTHROPIC_API_KEY to enable.",
  },
  {
    key: "website_analysis",
    name: "Website analysis",
    domain: "AI",
    description: "Extracts a structured business profile from the business's own website.",
    requiredEnv: ["ANTHROPIC_API_KEY"],
    baselineStatus: "REQUIRES_API",
    notes: "Uses the Claude API directly — set ANTHROPIC_API_KEY to enable.",
  },
];

export function resolveStatus(def: IntegrationDefinition): IntegrationStatus {
  if (def.baselineStatus === "REQUIRES_API" && def.requiredEnv.length > 0) {
    const hasAll = def.requiredEnv.every((k) => !!process.env[k]);
    if (hasAll) return "CONNECTED";
  }
  return def.baselineStatus;
}

export function getIntegrationStatuses(): Array<IntegrationDefinition & { status: IntegrationStatus }> {
  return INTEGRATION_REGISTRY.map((def) => ({ ...def, status: resolveStatus(def) }));
}

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
