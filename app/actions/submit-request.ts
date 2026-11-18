"use server";
import { headers } from "next/headers";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";

export type SubmitState = {
  status: "idle" | "success" | "error";
  message?: "notConnected" | "error" | "rate";
  fieldErrors?: Partial<Record<"name" | "phone" | "car_brand" | "service" | "preferred_date", string>>;
};

const schema = z.object({
  kind: z.enum(["booking", "quote", "inquiry"]),
  locale: z.enum(["ar", "en"]),
  name: z.string().trim().min(2, "errName").max(120, "errName"),
  phone: z
    .string()
    .trim()
    .max(30, "errPhone")
    .refine((v) => (v.match(/\d/g) ?? []).length >= 7 && /^[+\d\s()-]+$/.test(v), "errPhone"),
  car_brand: z.string().trim().max(60).optional().default(""),
  car_model: z.string().trim().max(120).optional().default(""),
  service: z.string().trim().max(160).optional().default(""),
  part_name: z.string().trim().max(200).optional().default(""),
  preferred_date: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((v) => {
      if (!v) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(`${v}T00:00:00`) >= new Date(today.getTime() - 86400000); // allow timezone slack
    }, "errDate"),
  message: z.string().trim().max(2000).optional().default(""),
});

// Lightweight per-instance throttle (5 requests / 10 min / IP). Use a shared store (e.g. Upstash) at scale.
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function submitRequest(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  // Honeypot: bots fill hidden fields
  if (String(formData.get("company") ?? "").length > 0) return { status: "success" };

  const raw = Object.fromEntries(
    ["kind", "locale", "name", "phone", "car_brand", "car_model", "service", "part_name", "preferred_date", "message"].map((k) => [
      k,
      String(formData.get(k) ?? ""),
    ])
  );
  const parsed = schema.safeParse(raw);
  const fieldErrors: SubmitState["fieldErrors"] = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<SubmitState["fieldErrors"]>;
      fieldErrors[key] = issue.message;
    }
  }
  // Required fields for appointment bookings
  if (raw.kind === "booking") {
    if (!raw.car_brand.trim()) fieldErrors.car_brand = "errBrand";
    if (!raw.service.trim()) fieldErrors.service = "errService";
  }
  if (!parsed.success || Object.keys(fieldErrors).length) return { status: "error", fieldErrors };
  const d = parsed.data;

  if (!isSupabaseConfigured) return { status: "error", message: "notConnected" };

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) return { status: "error", message: "rate" };

  const sb = createPublicClient();
  const { error } = await sb.from("bookings").insert({
    kind: d.kind,
    locale: d.locale,
    name: d.name,
    phone: d.phone,
    car_brand: d.car_brand || null,
    car_model: d.car_model || null,
    service: d.service || null,
    part_name: d.part_name || null,
    preferred_date: d.preferred_date || null,
    message: d.message || null,
  });
  if (error) {
    console.error("[submitRequest]", error.message);
    return { status: "error", message: "error" };
  }
  return { status: "success" };
}
