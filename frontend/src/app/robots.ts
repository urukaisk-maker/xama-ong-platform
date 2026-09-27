import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/public"],
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/inventory",
          "/families",
          "/deliveries",
          "/nevera",
          "/shifts",
          "/volunteers",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
