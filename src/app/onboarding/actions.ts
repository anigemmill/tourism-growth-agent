"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { analyzeBusinessWebsite } from "@/lib/ai/website-analysis";
import { INTEGRATION_REGISTRY, resolveStatus } from "@/lib/integrations/registry";

function splitLines(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createBusiness(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!name || !website || !destination || !category) {
    throw new Error("Name, website, destination, and category are required.");
  }

  const products = splitLines(formData.get("products"));
  const services = splitLines(formData.get("services"));
  const targetMarkets = splitLines(formData.get("targetMarkets"));
  const targetAudiences = splitLines(formData.get("targetAudiences"));
  const competitors = splitLines(formData.get("competitors"));
  const marketingChannels = splitLines(formData.get("marketingChannels"));
  const goals = splitLines(formData.get("goals"));
  const bookingUrl = String(formData.get("bookingUrl") ?? "").trim() || null;

  const business = await prisma.business.create({
    data: {
      name,
      website,
      destination,
      category,
      products,
      services,
      targetMarkets,
      targetAudiences,
      bookingUrl,
      socialProfiles: {},
      marketingChannels,
      goals,
      keyMetrics: {},
    },
  });

  if (competitors.length > 0) {
    await prisma.competitor.createMany({
      data: competitors.map((c) => ({
        businessId: business.id,
        name: c,
        website: c.startsWith("http") ? c : `https://${c}`,
      })),
    });
  }

  // Seed integration status rows for every known source so Settings has
  // something real to show immediately.
  await prisma.integrationConnection.createMany({
    data: INTEGRATION_REGISTRY.map((def) => ({
      businessId: business.id,
      sourceKey: def.key,
      status: resolveStatus(def),
    })),
  });

  // Best-effort, inline website analysis. This blocks onboarding submission
  // briefly when ANTHROPIC_API_KEY is configured; if not, it returns
  // immediately with REQUIRES_API and no invented profile data.
  const analysis = await analyzeBusinessWebsite(website);
  await prisma.businessProfile.create({
    data: {
      businessId: business.id,
      positioning: analysis.status === "CONNECTED" ? analysis.positioning : null,
      differentiators: analysis.status === "CONNECTED" ? (analysis.differentiators ?? []) : undefined,
      pricingSummary: analysis.status === "CONNECTED" ? analysis.pricingSummary : null,
      experiences: analysis.status === "CONNECTED" ? (analysis.experiences ?? []) : undefined,
      seasonality: analysis.status === "CONNECTED" ? (analysis.seasonality ?? {}) : undefined,
      faqs: analysis.status === "CONNECTED" ? (analysis.faqs ?? []) : undefined,
      bookingProcess: analysis.status === "CONNECTED" ? analysis.bookingProcess : null,
      policies: analysis.status === "CONNECTED" ? (analysis.policies ?? []) : undefined,
      currentContentSummary: analysis.status === "CONNECTED" ? analysis.currentContentSummary : null,
      analysisSource: analysis.status,
      analysisConfidence: analysis.status === "CONNECTED" ? analysis.confidence ?? null : null,
      analyzedAt: analysis.status === "CONNECTED" ? new Date() : null,
    },
  });

  redirect(`/b/${business.id}`);
}
