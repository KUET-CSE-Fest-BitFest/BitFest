import type { MetadataRoute } from "next";
import { CONTEST_PAGES_LIVE, events } from "@/lib/fest";

export const dynamic = "force-static";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://csefest.kuet.ac.bd";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // Contest pages join the sitemap once they are public (nothing links to them before that).
    ...(CONTEST_PAGES_LIVE ? events : []).map((e) => ({
      url: `${SITE}/events/${e.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
