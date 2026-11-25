import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://csefest.kuet.ac.bd";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/r4"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
