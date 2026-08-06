import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getTours } from "@/content/tours";
import { getMotorcycleTours } from "@/content/motorcycle-tours";
import { getHomestays } from "@/content/homestays";
import { getEvents } from "@/content/events";
import { getDestinations } from "@/content/destinations";
import { getJournalPosts } from "@/content/journal";
import { getPolicies } from "@/content/site-content";

/**
 * Built from the same accessors the pages use, so a new tour appears in the
 * sitemap without anyone remembering to add it. Checkout, the account screens
 * and /dev are deliberately absent — they are all noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/tours", priority: 0.9 },
    { path: "/motorcycle-tours", priority: 0.9 },
    { path: "/destinations", priority: 0.8 },
    { path: "/homestays", priority: 0.8 },
    { path: "/events", priority: 0.8 },
    { path: "/ilp", priority: 0.7 },
    { path: "/ilp/apply", priority: 0.5 },
    { path: "/rentals", priority: 0.5 },
    { path: "/journal", priority: 0.6 },
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/faq", priority: 0.5 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...getTours().map((tour) => ({
      url: `${base}/tours/${tour.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getMotorcycleTours().map((tour) => ({
      url: `${base}/motorcycle-tours/${tour.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getDestinations().map((destination) => ({
      url: `${base}/destinations/${destination.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getHomestays().map((stay) => ({
      url: `${base}/homestays/${stay.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...getEvents().map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...getJournalPosts().map((post) => ({
      url: `${base}/journal/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...getPolicies().map((policy) => ({
      url: `${base}/policies/${policy.slug}`,
      lastModified: new Date(policy.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
