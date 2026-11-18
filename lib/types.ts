export type Locale = "ar" | "en";
export const LOCALES: Locale[] = ["ar", "en"];

export type Role = "admin" | "editor" | "reception";

export type BrandColors = {
  navy: string;
  silver: string;
  red: string;
  charcoal: string;
  white: string;
};

export type NavItem = {
  id: string;
  href: string;
  label_ar: string;
  label_en: string;
  visible: boolean;
};

export type HoursRow = { days_ar: string; days_en: string; time_ar: string; time_en: string };

export type SiteSettings = {
  logo_url: string | null;
  favicon_url: string | null;
  colors: BrandColors;
  hero: { video_url: string; poster_url: string; overlay: number };
  seo: Record<Locale, { title: string; description: string }>;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    maps_url: string;
    maps_embed_query: string;
    address_ar: string;
    address_en: string;
    hours: HoursRow[];
  };
  social: { instagram: string; facebook: string; tiktok: string; x: string; youtube: string };
  sections: Record<SectionKey, boolean>;
  nav: NavItem[];
};

export type SectionKey =
  | "hero"
  | "about"
  | "services"
  | "parts"
  | "why"
  | "gallery"
  | "testimonials"
  | "booking"
  | "whatsapp_fab";

export type ContentMap = Record<string, { ar: string; en: string }>;

export type Stat = {
  id: string;
  value: number | null;
  suffix: string;
  label_ar: string;
  label_en: string;
  published: boolean;
  sort_order: number;
};

export type Service = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  details_ar: string;
  details_en: string;
  image_url: string | null;
  image_alt_ar: string;
  image_alt_en: string;
  published: boolean;
  sort_order: number;
};

export type PartCategory = {
  id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
};

export type Part = {
  id: string;
  category_id: string | null;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  image_url: string | null;
  image_alt_ar: string;
  image_alt_en: string;
  brands: string[];
  published: boolean;
  sort_order: number;
};

export type GalleryCategory = "workshop" | "technicians" | "cars" | "engines" | "parts" | "diagnostics";

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  media_type: "image" | "video";
  url: string;
  poster_url: string | null;
  caption_ar: string;
  caption_en: string;
  published: boolean;
  sort_order: number;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  car: string;
  text_ar: string;
  text_en: string;
  rating: number;
  photo_url: string | null;
  published: boolean;
  sort_order: number;
};

export type BookingStatus = "new" | "contacted" | "completed" | "cancelled";
export type BookingKind = "booking" | "quote" | "inquiry";

export type Booking = {
  id: string;
  ref: number;
  kind: BookingKind;
  name: string;
  phone: string;
  car_brand: string | null;
  car_model: string | null;
  service: string | null;
  part_name: string | null;
  preferred_date: string | null;
  message: string | null;
  status: BookingStatus;
  notes: string | null;
  locale: Locale;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role | null;
  last_sign_in_at: string | null;
  created_at: string;
};

export type SiteData = {
  settings: SiteSettings;
  content: ContentMap;
  stats: Stat[];
  services: Service[];
  categories: PartCategory[];
  parts: Part[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  source: "database" | "defaults";
};

export const JAPANESE_BRANDS = ["Toyota", "Lexus", "Nissan", "Honda", "Mitsubishi", "Mazda", "Subaru"] as const;
