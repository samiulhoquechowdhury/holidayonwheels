import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Transactional and internal surfaces. These also carry `noindex` in
      // their own metadata — robots.txt alone is not a guarantee.
      disallow: ["/checkout", "/account/", "/dev"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
