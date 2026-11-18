import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "./env";
import { defaultContent, getDefaultSiteData, mergeSettings } from "./defaults";
import { createPublicClient } from "./supabase/server";
import type { ContentMap, SiteData } from "./types";

/**
 * Loads everything the public website renders. Pages using this are ISR-cached
 * and revalidated on demand whenever content is saved in the dashboard.
 */
export const getSiteData = cache(async (): Promise<SiteData> => {
  if (!isSupabaseConfigured) return getDefaultSiteData();

  try {
    const sb = createPublicClient();
    const [settings, content, stats, services, categories, parts, gallery, testimonials] = await Promise.all([
      sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      sb.from("content").select("key, value_ar, value_en"),
      sb.from("stats").select("*").eq("published", true).order("sort_order"),
      sb.from("services").select("*").eq("published", true).order("sort_order"),
      sb.from("part_categories").select("*").order("sort_order"),
      sb.from("parts").select("*").eq("published", true).order("sort_order"),
      sb.from("gallery_items").select("*").eq("published", true).order("sort_order"),
      sb.from("testimonials").select("*").eq("published", true).order("sort_order"),
    ]);

    const firstError = [settings, content, stats, services, categories, parts, gallery, testimonials].find((r) => r.error);
    if (firstError?.error) throw firstError.error;

    const contentMap: ContentMap = { ...defaultContent };
    for (const row of content.data ?? []) contentMap[row.key] = { ar: row.value_ar, en: row.value_en };

    return {
      settings: mergeSettings(settings.data),
      content: contentMap,
      stats: stats.data ?? [],
      services: services.data ?? [],
      categories: categories.data ?? [],
      parts: parts.data ?? [],
      gallery: gallery.data ?? [],
      testimonials: testimonials.data ?? [],
      source: "database",
    };
  } catch (err) {
    console.error("[getSiteData] falling back to defaults:", err);
    return getDefaultSiteData();
  }
});
