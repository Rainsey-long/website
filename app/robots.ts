import type { MetadataRoute } from "next";
import { AI_BOT_USER_AGENTS } from "@/lib/aiBots";
import { FEATURES, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/km/admin", "/api/", "/styleguide", "/km/styleguide"] },
      ...(FEATURES.BLOCK_AI_CRAWLERS ? [{ userAgent: [...AI_BOT_USER_AGENTS], disallow: "/" }] : []),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
