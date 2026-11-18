"use client";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { JAPANESE_BRANDS } from "@/lib/types";
import { CollectionManager, type CollectionConfig } from "./CollectionManager";

const GALLERY_CATS = [
  { value: "workshop", label: "الورشة" },
  { value: "technicians", label: "الفنيون" },
  { value: "cars", label: "السيارات اليابانية" },
  { value: "engines", label: "صيانة المحركات" },
  { value: "parts", label: "قطع الغيار" },
  { value: "diagnostics", label: "أجهزة التشخيص" },
];

const services: CollectionConfig = {
  table: "services",
  title: "الخدمات",
  singular: "خدمة",
  eyebrow: (_r, i) => `SERVICE ${String(i + 1).padStart(2, "0")}`,
  listTitle: (r) => r.title_ar,
  listSubtitle: (r) => r.title_en,
  listImage: (r) => r.image_url,
  hasPublished: true,
  searchKeys: ["title_ar", "title_en"],
  defaults: { published: true, title_ar: "", title_en: "", summary_ar: "", summary_en: "", details_ar: "", details_en: "", slug: "", image_url: null },
  fields: [
    { key: "title", label: "عنوان الخدمة", type: "text", bilingual: true, required: true, max: 60, span: "full" },
    { key: "summary", label: "الوصف المختصر (يظهر في البطاقة)", type: "textarea", bilingual: true, required: true, max: 140 },
    { key: "details", label: "التفاصيل (تظهر عند «اعرف المزيد»)", type: "textarea", bilingual: true, max: 800 },
    { key: "image_url", label: "صورة الخدمة", type: "image", folder: "services", hint: "1600×1200 · JPG / WEBP · حتى 5MB · تُضغط تلقائيًا" },
    { key: "image_alt", label: "النص البديل للصورة (Alt)", type: "text", bilingual: true, max: 120, placeholder: "وصف الصورة لمحركات البحث وقارئات الشاشة", span: "half" },
    { key: "slug", label: "الرابط (Slug)", type: "slug", required: true, from: "title_en", placeholder: "engine-maintenance", span: "half" },
  ],
};

const gallery: CollectionConfig = {
  table: "gallery_items",
  title: "المعرض والفيديو",
  singular: "عنصر",
  newLabel: "إضافة صورة / فيديو",
  eyebrow: (r) => (r.media_type === "video" ? "VIDEO" : "PHOTO"),
  listTitle: (r) => r.caption_ar || "بدون عنوان",
  listSubtitle: (r) => `${GALLERY_CATS.find((c) => c.value === r.category)?.label ?? ""}${r.media_type === "video" ? " · فيديو" : ""}`,
  listImage: (r) => (r.media_type === "video" ? r.poster_url : r.url),
  hasPublished: true,
  searchKeys: ["caption_ar", "caption_en"],
  defaults: { published: true, category: "workshop", media_type: "image", url: null, poster_url: null, caption_ar: "", caption_en: "" },
  fields: [
    { key: "category", label: "التصنيف", type: "select", required: true, options: GALLERY_CATS, span: "half" },
    {
      key: "media_type",
      label: "النوع",
      type: "select",
      required: true,
      options: [
        { value: "image", label: "صورة" },
        { value: "video", label: "فيديو" },
      ],
      span: "half",
    },
    { key: "caption", label: "التعليق", type: "text", bilingual: true, max: 80, span: "full" },
    { key: "url", label: "الملف (صورة أو فيديو MP4)", type: "image", kindFrom: "media_type", required: true, folder: "gallery", hint: "للفيديو: ارفع MP4 أو الصق رابطًا" },
    { key: "poster_url", label: "صورة الغلاف (للفيديو)", type: "image", folder: "gallery" },
  ],
};

const testimonials: CollectionConfig = {
  table: "testimonials",
  title: "آراء العملاء",
  singular: "تقييم",
  newLabel: "تقييم جديد",
  eyebrow: (r) => `${r.rating ?? 5} ★`,
  listTitle: (r) => r.customer_name,
  listSubtitle: (r) => r.car,
  listImage: (r) => r.photo_url,
  hasPublished: true,
  searchKeys: ["customer_name", "car"],
  defaults: { published: true, rating: 5, customer_name: "", car: "", text_ar: "", text_en: "", photo_url: null },
  fields: [
    { key: "customer_name", label: "اسم العميل", type: "text", required: true, max: 80, span: "half" },
    { key: "car", label: "السيارة / الطراز", type: "text", max: 80, span: "half" },
    { key: "text", label: "نص التقييم", type: "textarea", bilingual: true, required: true, max: 600 },
    { key: "rating", label: "التقييم", type: "rating", span: "half" },
    { key: "photo_url", label: "صورة العميل (اختيارية)", type: "image", folder: "testimonials" },
  ],
};

const stats: CollectionConfig = {
  table: "stats",
  title: "عدّادات الإحصائيات",
  singular: "عدّاد",
  newLabel: "عدّاد جديد",
  embedded: true,
  listTitle: (r) => `${r.value ?? "[00]"}${r.suffix ?? ""} — ${r.label_ar}`,
  listSubtitle: (r) => r.label_en,
  hasPublished: true,
  defaults: { published: true, value: null, suffix: "+", label_ar: "", label_en: "" },
  fields: [
    { key: "value", label: "القيمة", type: "number", hint: "اتركها فارغة لعرض [00] حتى تتوفر الأرقام الحقيقية", span: "half" },
    { key: "suffix", label: "اللاحقة", type: "text", max: 3, placeholder: "+ أو %", ltr: true, span: "half" },
    { key: "label", label: "الوصف", type: "text", bilingual: true, required: true, max: 40, span: "full" },
  ],
};

const categories: CollectionConfig = {
  table: "part_categories",
  title: "تصنيفات قطع الغيار",
  singular: "تصنيف",
  newLabel: "تصنيف جديد",
  embedded: true,
  listTitle: (r) => r.name_ar,
  listSubtitle: (r) => r.name_en,
  defaults: { name_ar: "", name_en: "" },
  fields: [{ key: "name", label: "اسم التصنيف", type: "text", bilingual: true, required: true, max: 40, span: "full" }],
};

export function ServicesAdmin() {
  return <CollectionManager config={services} />;
}
export function GalleryAdmin() {
  return <CollectionManager config={gallery} />;
}
export function TestimonialsAdmin() {
  return <CollectionManager config={testimonials} />;
}
export function StatsAdmin() {
  return <CollectionManager config={stats} />;
}

export function PartsAdmin() {
  const [cats, setCats] = useState<{ value: string; label: string }[] | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    getBrowserClient()
      .from("part_categories")
      .select("id,name_ar")
      .order("sort_order")
      .then(({ data }) => setCats((data ?? []).map((c) => ({ value: c.id, label: c.name_ar }))));
  }, [tick]);

  const parts: CollectionConfig = {
    table: "parts",
    title: "قطع الغيار",
    singular: "قطعة",
    newLabel: "قطعة جديدة",
    eyebrow: () => "SPARE PART",
    listTitle: (r) => r.name_ar,
    listSubtitle: (r) => `${cats?.find((c) => c.value === r.category_id)?.label ?? "بدون تصنيف"} · ${(r.brands ?? []).length} علامات`,
    listImage: (r) => r.image_url,
    hasPublished: true,
    searchKeys: ["name_ar", "name_en"],
    defaults: { published: true, name_ar: "", name_en: "", description_ar: "", description_en: "", brands: [], category_id: null, image_url: null },
    fields: [
      { key: "name", label: "اسم المنتج", type: "text", bilingual: true, required: true, max: 70, span: "full" },
      { key: "description", label: "وصف مختصر", type: "textarea", bilingual: true, max: 200 },
      { key: "category_id", label: "التصنيف", type: "select", options: cats ?? [], span: "half", nullable: true },
      { key: "brands", label: "العلامات المتوافقة", type: "multi", options: JAPANESE_BRANDS.map((b) => ({ value: b, label: b })) },
      { key: "image_url", label: "صورة المنتج", type: "image", folder: "parts", hint: "حتى 5MB · تُضغط تلقائيًا" },
      { key: "image_alt", label: "النص البديل للصورة", type: "text", bilingual: true, max: 120, span: "half" },
    ],
  };

  return (
    <div className="space-y-14">
      {cats ? <CollectionManager config={parts} /> : null}
      <CollectionManager config={{ ...categories, onChange: () => setTick((t) => t + 1) }} />
      <p className="text-sm text-slate-500">لا تُعرض أسعار في الموقع — كل قطعة تظهر بزر «اطلب عرض سعر» وتصل الطلبات إلى صفحة الحجوزات والاستفسارات.</p>
    </div>
  );
}
