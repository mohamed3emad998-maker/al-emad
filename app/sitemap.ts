import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return (["ar", "en"] as const).map((l) => ({
    url: `${SITE_URL}/${l}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: l === "ar" ? 1 : 0.9,
    alternates: { languages: { ar: `${SITE_URL}/ar`, en: `${SITE_URL}/en` } },
  }));
}
