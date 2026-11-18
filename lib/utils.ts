import { clsx, type ClassValue } from "clsx";
import type { Locale } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Pick the localized field `${base}_${locale}` from a row, falling back to the other language. */
export function loc<T extends Record<string, unknown>>(row: T, base: string, locale: Locale): string {
  const primary = row[`${base}_${locale}`];
  if (typeof primary === "string" && primary.trim()) return primary;
  const other = row[`${base}_${locale === "ar" ? "en" : "ar"}`];
  return typeof other === "string" ? other : "";
}

/** "#D62828" -> "214 40 40" for CSS rgb(var(--x) / alpha) tokens. */
export function hexToRgbTriplet(hex: string, fallback: string): string {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex?.trim() ?? "");
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** Keep digits and a leading + for tel: links; digits only for wa.me. */
export function telHref(phone: string) {
  const clean = phone.replace(/[^\d+]/g, "");
  return clean ? `tel:${clean}` : "";
}
export function whatsappHref(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(iso: string | null | undefined, locale: Locale = "ar", withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-OM-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 60) return `${Math.max(m, 1)}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
