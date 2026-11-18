"use client";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { revalidateSite } from "@/app/actions/revalidate";
import { defaultContent } from "@/lib/defaults";
import { getBrowserClient } from "@/lib/supabase/client";
import type { ContentMap } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MediaUpload } from "./MediaUpload";
import { Card, PageHeader, useToast } from "./ui";

type F = { key: string; label: string; type?: "text" | "textarea" | "image"; ltr?: boolean };
type Group = { id: string; title: string; fields: F[] };

const GROUPS: Group[] = [
  {
    id: "hero",
    title: "الواجهة الرئيسية",
    fields: [
      { key: "hero.eyebrow", label: "السطر العلوي الصغير", ltr: true },
      { key: "hero.title_1", label: "العنوان — السطر 1", ltr: true },
      { key: "hero.title_2", label: "العنوان — السطر 2", ltr: true },
      { key: "hero.title_accent", label: "العنوان — السطر الأحمر", ltr: true },
      { key: "hero.subtitle", label: "العنوان العربي الداعم" },
      { key: "hero.description", label: "الوصف", type: "textarea" },
      { key: "hero.cta_primary", label: "الزر الرئيسي" },
      { key: "hero.cta_secondary", label: "الزر الثانوي" },
      { key: "hero.brands_label", label: "عنوان شريط العلامات" },
    ],
  },
  {
    id: "brand",
    title: "الهوية والتنقل",
    fields: [
      { key: "brand.tagline", label: "السطر أسفل الشعار" },
      { key: "nav.cta", label: "زر «احجز موعدًا» في الشريط العلوي" },
    ],
  },
  {
    id: "about",
    title: "من نحن",
    fields: [
      { key: "about.eyebrow", label: "السطر العلوي", ltr: true },
      { key: "about.title", label: "العنوان" },
      { key: "about.subtitle", label: "العنوان الفرعي (اتركه فارغًا لإخفائه)" },
      { key: "about.body", label: "نص التعريف", type: "textarea" },
      { key: "about.mission_title", label: "عنوان الرسالة" },
      { key: "about.mission", label: "نص الرسالة", type: "textarea" },
      { key: "about.vision_title", label: "عنوان الرؤية" },
      { key: "about.vision", label: "نص الرؤية", type: "textarea" },
      { key: "about.badge_number", label: "رقم الشارة", ltr: true },
      { key: "about.badge_text", label: "نص الشارة" },
      { key: "about.image_main", label: "الصورة الرئيسية", type: "image" },
      { key: "about.image_main_alt", label: "وصف الصورة الرئيسية" },
      { key: "about.image_secondary", label: "الصورة الثانوية", type: "image" },
      { key: "about.image_secondary_alt", label: "وصف الصورة الثانوية" },
    ],
  },
  {
    id: "services",
    title: "قسم الخدمات",
    fields: [
      { key: "services.eyebrow", label: "السطر العلوي", ltr: true },
      { key: "services.title", label: "العنوان" },
      { key: "services.description", label: "الوصف", type: "textarea" },
    ],
  },
  {
    id: "parts",
    title: "قسم قطع الغيار",
    fields: [
      { key: "parts.eyebrow", label: "السطر العلوي", ltr: true },
      { key: "parts.title", label: "العنوان" },
      { key: "parts.description", label: "الوصف", type: "textarea" },
      { key: "parts.custom_request", label: "زر طلب قطعة غير موجودة" },
      { key: "parts.note", label: "الملاحظة أسفل القسم", type: "textarea" },
    ],
  },
  {
    id: "why",
    title: "لماذا العماد",
    fields: [
      { key: "why.eyebrow", label: "السطر العلوي", ltr: true },
      { key: "why.title", label: "العنوان" },
      { key: "why.description", label: "الوصف", type: "textarea" },
      { key: "why.image", label: "الصورة", type: "image" },
      { key: "why.image_alt", label: "وصف الصورة" },
      ...[1, 2, 3, 4, 5, 6].flatMap((n) => [
        { key: `why.${n}_title`, label: `الميزة ${n} — العنوان` },
        { key: `why.${n}_text`, label: `الميزة ${n} — النص`, type: "textarea" as const },
      ]),
    ],
  },
  {
    id: "other",
    title: "المعرض، الآراء، الحجز",
    fields: [
      { key: "gallery.eyebrow", label: "المعرض — السطر العلوي", ltr: true },
      { key: "gallery.title", label: "المعرض — العنوان" },
      { key: "testimonials.eyebrow", label: "الآراء — السطر العلوي", ltr: true },
      { key: "testimonials.title", label: "الآراء — العنوان" },
      { key: "testimonials.description", label: "الآراء — الوصف", type: "textarea" },
      { key: "booking.eyebrow", label: "الحجز — السطر العلوي", ltr: true },
      { key: "booking.title", label: "الحجز — العنوان" },
      { key: "booking.description", label: "الحجز — الوصف", type: "textarea" },
    ],
  },
  {
    id: "footer",
    title: "التذييل",
    fields: [
      { key: "footer.description", label: "وصف الشركة", type: "textarea" },
      { key: "footer.copyright", label: "نص حقوق النشر" },
    ],
  },
];

export function ContentEditor() {
  const sb = getBrowserClient();
  const toast = useToast();
  const [values, setValues] = useState<ContentMap>({});
  const [saved, setSaved] = useState<ContentMap>({});
  const [group, setGroup] = useState(GROUPS[0].id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sb.from("content")
      .select("key,value_ar,value_en")
      .then(({ data, error }) => {
        if (error) toast("error", error.message);
        const map: ContentMap = { ...defaultContent };
        for (const r of data ?? []) map[r.key] = { ar: r.value_ar, en: r.value_en };
        setValues(map);
        setSaved(map);
        setLoading(false);
      });
  }, [sb, toast]);

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter((k) => values[k]?.ar !== saved[k]?.ar || values[k]?.en !== saved[k]?.en),
    [values, saved]
  );

  const set = (key: string, lang: "ar" | "en", v: string) => setValues((s) => ({ ...s, [key]: { ar: s[key]?.ar ?? "", en: s[key]?.en ?? "", [lang]: v } }));

  async function save() {
    if (!dirtyKeys.length) return;
    setSaving(true);
    const { error } = await sb.from("content").upsert(dirtyKeys.map((k) => ({ key: k, value_ar: values[k].ar, value_en: values[k].en })));
    setSaving(false);
    if (error) return toast("error", `تعذّر الحفظ: ${error.message}`);
    setSaved(values);
    toast("success", "تم حفظ المحتوى ونشره");
    revalidateSite();
  }

  const g = GROUPS.find((x) => x.id === group)!;

  return (
    <div>
      <PageHeader
        title="محتوى الصفحات"
        subtitle="عدّل العناوين والنصوص والصور في كل أقسام الموقع باللغتين."
        actions={
          <button type="button" onClick={save} disabled={saving || !dirtyKeys.length} className="btn-red px-6 py-3 shadow-none">
            {saving ? <Loader2 size={17} className="animate-spin" /> : null}
            حفظ ونشر {dirtyKeys.length ? `(${dirtyKeys.length})` : ""}
          </button>
        }
      />
      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto">
        {GROUPS.map((x) => (
          <button key={x.id} type="button" onClick={() => setGroup(x.id)} className={cn("chip shrink-0", group === x.id && "chip-active")}>
            {x.title}
          </button>
        ))}
      </div>
      <Card className="p-6 sm:p-8">
        {loading ? (
          <div className="grid h-40 place-items-center">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-7">
            <div className="hidden grid-cols-[220px_1fr_1fr] gap-5 text-sm font-semibold text-slate-500 lg:grid">
              <span />
              <span>العربية</span>
              <span>English</span>
            </div>
            {g.fields.map((f) => {
              const v = values[f.key] ?? { ar: "", en: "" };
              const dirty = dirtyKeys.includes(f.key);
              if (f.type === "image") {
                return (
                  <div key={f.key} className="grid gap-3 lg:grid-cols-[220px_1fr] lg:gap-5">
                    <span className="pt-2 text-sm font-semibold">
                      {f.label} {dirty ? <span className="text-racing">•</span> : null}
                    </span>
                    <div className="max-w-md">
                      <MediaUpload value={v.ar} onChange={(url) => setValues((s) => ({ ...s, [f.key]: { ar: url ?? "", en: url ?? "" } }))} folder="content" aspect="aspect-[16/10]" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={f.key} className="grid gap-3 lg:grid-cols-[220px_1fr_1fr] lg:gap-5">
                  <span className="pt-2 text-sm font-semibold">
                    {f.label} {dirty ? <span className="text-racing">•</span> : null}
                  </span>
                  {(["ar", "en"] as const).map((lang) =>
                    f.type === "textarea" ? (
                      <textarea
                        key={lang}
                        rows={3}
                        dir={lang === "en" || f.ltr ? "ltr" : "rtl"}
                        aria-label={`${f.label} (${lang})`}
                        className="field"
                        value={v[lang]}
                        onChange={(e) => set(f.key, lang, e.target.value)}
                      />
                    ) : (
                      <input
                        key={lang}
                        dir={lang === "en" || f.ltr ? "ltr" : "rtl"}
                        aria-label={`${f.label} (${lang})`}
                        className="field"
                        value={v[lang]}
                        onChange={(e) => set(f.key, lang, e.target.value)}
                      />
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
