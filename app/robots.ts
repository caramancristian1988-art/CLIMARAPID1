import type { MetadataRoute } from "next";

const BASE_URL = "https://www.climatrapid.md";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/cont", "/cos", "/finalizare-comanda"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
