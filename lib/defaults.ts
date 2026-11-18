import seed from "@/supabase/seed-data.json";
import type {
  ContentMap,
  GalleryItem,
  Part,
  PartCategory,
  Service,
  SiteData,
  SiteSettings,
  Stat,
  Testimonial,
} from "./types";

/**
 * Default content = the same data that supabase/seed.sql inserts.
 * Used (1) before Supabase is connected and (2) to fill any content key missing from the DB.
 */
export const defaultSettings = seed.settings as unknown as SiteSettings;
export const defaultContent = seed.content as ContentMap;

export function getDefaultSiteData(): SiteData {
  const categories: PartCategory[] = seed.part_categories.map((c) => ({
    id: `cat-${c.key}`,
    name_ar: c.name_ar,
    name_en: c.name_en,
    sort_order: c.sort_order,
  }));
  const parts: Part[] = seed.parts.map((p, i) => ({
    id: `part-${i}`,
    category_id: `cat-${p.category}`,
    name_ar: p.name_ar,
    name_en: p.name_en,
    description_ar: p.description_ar,
    description_en: p.description_en,
    image_url: p.image_url,
    image_alt_ar: p.image_alt_ar,
    image_alt_en: p.image_alt_en,
    brands: p.brands,
    published: true,
    sort_order: p.sort_order,
  }));
  const services: Service[] = seed.services.map((s, i) => ({ id: `svc-${i}`, published: true, ...s }));
  const stats: Stat[] = seed.stats.map((s, i) => ({ id: `stat-${i}`, published: true, ...s }));
  const gallery: GalleryItem[] = seed.gallery.map((g, i) => ({
    id: `gal-${i}`,
    published: true,
    media_type: ((g as { media_type?: string }).media_type ?? "image") as GalleryItem["media_type"],
    poster_url: (g as { poster_url?: string }).poster_url ?? null,
    category: g.category as GalleryItem["category"],
    url: g.url,
    caption_ar: g.caption_ar,
    caption_en: g.caption_en,
    sort_order: g.sort_order,
  }));
  const testimonials: Testimonial[] = seed.testimonials.map((t, i) => ({
    id: `t-${i}`,
    photo_url: null,
    published: true,
    ...t,
  }));
  return {
    settings: defaultSettings,
    content: defaultContent,
    stats,
    services,
    categories,
    parts,
    gallery,
    testimonials,
    source: "defaults",
  };
}

/** Deep-merge DB settings over defaults so missing keys never break the page. */
export function mergeSettings(db: Partial<SiteSettings> | null | undefined): SiteSettings {
  const d = defaultSettings;
  if (!db) return d;
  return {
    logo_url: db.logo_url ?? d.logo_url,
    favicon_url: db.favicon_url ?? d.favicon_url,
    colors: { ...d.colors, ...(db.colors ?? {}) },
    hero: { ...d.hero, ...(db.hero ?? {}) },
    seo: {
      ar: { ...d.seo.ar, ...(db.seo?.ar ?? {}) },
      en: { ...d.seo.en, ...(db.seo?.en ?? {}) },
    },
    contact: { ...d.contact, ...(db.contact ?? {}), hours: db.contact?.hours ?? d.contact.hours },
    social: { ...d.social, ...(db.social ?? {}) },
    sections: { ...d.sections, ...(db.sections ?? {}) },
    nav: Array.isArray(db.nav) && db.nav.length ? db.nav : d.nav,
  };
}
