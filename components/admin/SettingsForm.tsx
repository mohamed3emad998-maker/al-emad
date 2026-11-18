"use client";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { revalidateSite } from "@/app/actions/revalidate";
import { LogoMark } from "@/components/site/Logo";
import { defaultSettings, mergeSettings } from "@/lib/defaults";
import { getBrowserClient } from "@/lib/supabase/client";
import type { BrandColors, SectionKey, SiteSettings } from "@/lib/types";
import { MediaUpload } from "./MediaUpload";
import { Card, Counter, LangTabs, PageHeader, Toggle, useToast } from "./ui";

const COLOR_LABELS: Record<keyof BrandColors, string> = {
  navy: "الأزرق الداكن",
  silver: "الفضي المعدني",
  white: "الأبيض",
  red: "أحمر السباق",
  charcoal: "الفحمي الداكن",
};

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "الواجهة الرئيسية (فيديو)",
  about: "من نحن والإحصائيات",
  services: "خدماتنا",
  parts: "قطع الغيار",
  why: "لماذا العماد",
  gallery: "معرض الورشة",
  testimonials: "آراء العملاء",
  booking: "الحجز والتواصل",
  whatsapp_fab: "زر واتساب العائم",
};

function Section({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={`p-6 sm:p-8 ${className ?? ""}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </Card>
  );
}

export function SettingsForm() {
  const sb = getBrowserClient();
  const toast = useToast();
  const [s, setS] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoLang, setSeoLang] = useState<"ar" | "en">("ar");

  useEffect(() => {
    sb.from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast("error", error.message);
        setS(mergeSettings(data));
        setLoading(false);
      });
  }, [sb, toast]);

  const patch = <K extends keyof SiteSettings>(k: K, v: Partial<SiteSettings[K]> | SiteSettings[K]) =>
    setS((cur) => ({ ...cur, [k]: Array.isArray(v) ? v : typeof v === "object" && v !== null ? { ...(cur[k] as object), ...v } : v }));

  async function save() {
    for (const [k, v] of Object.entries(s.colors)) {
      if (!/^#[0-9a-f]{6}$/i.test(v)) return toast("error", `لون غير صالح: ${COLOR_LABELS[k as keyof BrandColors]}`);
    }
    setSaving(true);
    const { error } = await sb.from("site_settings").upsert({ id: 1, ...s });
    setSaving(false);
    if (error) return toast("error", `تعذّر الحفظ: ${error.message}`);
    toast("success", "تم حفظ الإعدادات ونشرها");
    revalidateSite();
  }

  if (loading)
    return (
      <div className="grid h-80 place-items-center">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );

  const seo = s.seo[seoLang];

  return (
    <div>
      <PageHeader
        title="إعدادات الموقع"
        subtitle="الهوية، الألوان، فيديو الواجهة، SEO، الأقسام وبيانات التواصل."
        actions={
          <button type="button" onClick={save} disabled={saving} className="btn-red px-7 py-3 shadow-none">
            {saving ? <Loader2 size={17} className="animate-spin" /> : null} حفظ ونشر
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="الشعار والهوية" subtitle="يظهر في الشريط العلوي والتذييل. اتركه فارغًا لاستخدام شعار العماد الافتراضي.">
          <div className="grid gap-5 sm:grid-cols-2">
            <MediaUpload label="الشعار (SVG أو PNG شفاف)" value={s.logo_url} onChange={(v) => patch("logo_url", v)} folder="branding" aspect="aspect-[16/9]" />
            <MediaUpload label="أيقونة المتصفح (Favicon)" value={s.favicon_url} onChange={(v) => patch("favicon_url", v)} folder="branding" aspect="aspect-[16/9]" />
          </div>
        </Section>

        <Section title="ألوان الموقع" subtitle="تُطبَّق على كامل الموقع عبر متغيرات CSS.">
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(COLOR_LABELS) as (keyof BrandColors)[]).map((k) => (
              <label key={k} className="flex items-center gap-3 rounded-md border border-line p-3">
                <input type="color" value={s.colors[k]} onChange={(e) => patch("colors", { [k]: e.target.value.toUpperCase() })} className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent p-0" aria-label={COLOR_LABELS[k]} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{COLOR_LABELS[k]}</span>
                  <input value={s.colors[k]} onChange={(e) => patch("colors", { [k]: e.target.value })} dir="ltr" className="w-full bg-transparent font-wide text-xs text-slate-500 outline-none" aria-label={`${COLOR_LABELS[k]} HEX`} />
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-md px-5 py-4" style={{ background: s.colors.navy }}>
            <span className="flex items-center gap-2 font-wide font-extrabold" style={{ color: s.colors.white }} dir="ltr">
              <LogoMark /> AL-EMAD
            </span>
            <span className="flex items-center gap-3 text-sm" style={{ color: s.colors.silver }}>
              معاينة
              <span className="rounded px-4 py-2 font-semibold" style={{ background: s.colors.red, color: s.colors.white }}>
                احجز موعدًا
              </span>
            </span>
          </div>
          <button type="button" onClick={() => patch("colors", defaultSettings.colors)} className="mt-3 text-sm text-slate-500 underline underline-offset-4">
            استعادة ألوان الهوية الأصلية
          </button>
        </Section>

        <Section className="xl:col-span-2" title="فيديو الواجهة الرئيسية" subtitle="يعمل تلقائيًا بدون صوت وبشكل متكرر. تُعرض صورة الغلاف على الأجهزة البطيئة أو مع تقليل الحركة.">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="label" htmlFor="hero-url">
                  رابط الفيديو (MP4 / WebM)
                </label>
                <input id="hero-url" dir="ltr" className="field" value={s.hero.video_url} placeholder="https://…/hero.mp4" onChange={(e) => patch("hero", { video_url: e.target.value })} />
              </div>
              <MediaUpload label="أو ارفع فيديو (حتى 50MB)" kind="video" value={null} onChange={(v) => v && patch("hero", { video_url: v })} folder="hero" aspect="aspect-[21/6]" />
              <div>
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <label htmlFor="overlay">شدة التعتيم فوق الفيديو</label>
                  <span className="font-wide" dir="ltr">
                    {s.hero.overlay}%
                  </span>
                </div>
                <input id="overlay" type="range" min={20} max={95} value={s.hero.overlay} onChange={(e) => patch("hero", { overlay: Number(e.target.value) })} className="w-full accent-racing" />
              </div>
              <p className="text-xs text-slate-500">مقترح: فيديو مرخّص من Pexels بطول 15–30 ثانية، بدقة 1080p وحجم أقل من 8MB.</p>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-md bg-navy">
                {s.hero.video_url ? <video key={s.hero.video_url} src={s.hero.video_url} poster={s.hero.poster_url} muted loop autoPlay playsInline className="h-full w-full object-cover" /> : null}
                <div className="absolute inset-0" style={{ background: `rgb(16 28 44 / ${s.hero.overlay / 100})` }} />
              </div>
              <MediaUpload label="صورة الغلاف (Poster)" value={s.hero.poster_url} onChange={(v) => patch("hero", { poster_url: v ?? "" })} folder="hero" aspect="aspect-[21/6]" />
            </div>
          </div>
        </Section>

        <Section className="xl:col-span-2" title="محركات البحث (SEO)" subtitle="عنوان ووصف الصفحة الرئيسية لكل لغة.">
          <div className="mb-5">
            <LangTabs value={seoLang} onChange={setSeoLang} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5" dir={seoLang === "en" ? "ltr" : "rtl"}>
              <div>
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-semibold" htmlFor="seo-title">
                    {seoLang === "ar" ? "عنوان الصفحة (Title)" : "Page title"}
                  </label>
                  <Counter value={seo.title} max={60} />
                </div>
                <input id="seo-title" className="field" value={seo.title} onChange={(e) => patch("seo", { [seoLang]: { ...seo, title: e.target.value } })} />
              </div>
              <div>
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-semibold" htmlFor="seo-desc">
                    {seoLang === "ar" ? "الوصف (Meta description)" : "Meta description"}
                  </label>
                  <Counter value={seo.description} max={160} />
                </div>
                <textarea id="seo-desc" rows={3} className="field" value={seo.description} onChange={(e) => patch("seo", { [seoLang]: { ...seo, description: e.target.value } })} />
              </div>
            </div>
            <div className="rounded-md border border-line p-5" dir={seoLang === "en" ? "ltr" : "rtl"}>
              <p className="text-xs text-slate-400">معاينة نتيجة البحث</p>
              <p className="mt-3 text-sm text-[#1F6B3A]" dir="ltr" style={{ textAlign: "start" }}>
                al-emad.com › {seoLang}
              </p>
              <p className="mt-1 text-lg text-[#1a0dab]">{seo.title || "—"}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{seo.description || "—"}</p>
            </div>
          </div>
        </Section>

        <Section title="بيانات التواصل والروابط" subtitle="تظهر في قسم التواصل والتذييل وأزرار واتساب والاتصال.">
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["phone", "رقم الهاتف", "+968 …"],
                ["whatsapp", "رقم واتساب", "+968 …"],
                ["email", "البريد الإلكتروني", "info@…"],
                ["maps_url", "رابط Google Maps", "https://maps.app.goo.gl/…"],
              ] as const
            ).map(([k, label, ph]) => (
              <div key={k}>
                <label className="label" htmlFor={`c-${k}`}>
                  {label}
                </label>
                <input id={`c-${k}`} dir="ltr" className="field" placeholder={ph} value={s.contact[k]} onChange={(e) => patch("contact", { [k]: e.target.value })} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="label" htmlFor="c-embed">
                موقع الخريطة المضمّنة (اسم المكان أو الإحداثيات)
              </label>
              <input id="c-embed" className="field" placeholder="مثال: 23.5880,58.3829 أو اسم الورشة والمدينة" value={s.contact.maps_embed_query} onChange={(e) => patch("contact", { maps_embed_query: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="c-addr-ar">
                العنوان (عربي)
              </label>
              <input id="c-addr-ar" className="field" value={s.contact.address_ar} onChange={(e) => patch("contact", { address_ar: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="c-addr-en">
                Address (English)
              </label>
              <input id="c-addr-en" dir="ltr" className="field" value={s.contact.address_en} onChange={(e) => patch("contact", { address_en: e.target.value })} />
            </div>
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold">ساعات العمل</p>
          <div className="space-y-2">
            {s.contact.hours.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <input className="field py-2 text-sm" placeholder="الأيام" value={h.days_ar} onChange={(e) => patch("contact", { hours: s.contact.hours.map((x, j) => (j === i ? { ...x, days_ar: e.target.value } : x)) })} />
                <input className="field py-2 text-sm" dir="ltr" placeholder="Days" value={h.days_en} onChange={(e) => patch("contact", { hours: s.contact.hours.map((x, j) => (j === i ? { ...x, days_en: e.target.value } : x)) })} />
                <input className="field hidden py-2 text-sm sm:block" dir="ltr" placeholder="08:00 – 18:00" value={h.time_ar} onChange={(e) => patch("contact", { hours: s.contact.hours.map((x, j) => (j === i ? { ...x, time_ar: e.target.value, time_en: x.time_en || e.target.value } : x)) })} />
                <input className="field hidden py-2 text-sm sm:block" dir="ltr" placeholder="Closed / 08:00 – 18:00" value={h.time_en} onChange={(e) => patch("contact", { hours: s.contact.hours.map((x, j) => (j === i ? { ...x, time_en: e.target.value } : x)) })} />
                <button type="button" aria-label="حذف" onClick={() => patch("contact", { hours: s.contact.hours.filter((_, j) => j !== i) })} className="px-2 text-slate-400 hover:text-racing">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => patch("contact", { hours: [...s.contact.hours, { days_ar: "", days_en: "", time_ar: "", time_en: "" }] })} className="inline-flex items-center gap-1 text-sm font-semibold text-racing">
              <Plus size={15} /> إضافة صف
            </button>
          </div>

          <p className="mb-2 mt-6 text-sm font-semibold">حسابات التواصل الاجتماعي</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["instagram", "facebook", "tiktok", "x", "youtube"] as const).map((k) => (
              <input key={k} dir="ltr" className="field text-sm" placeholder={`${k} — https://…`} aria-label={k} value={s.social[k]} onChange={(e) => patch("social", { [k]: e.target.value })} />
            ))}
          </div>
        </Section>

        <div className="space-y-6">
          <Section title="أقسام الصفحة الرئيسية" subtitle="أخفِ أي قسم مؤقتًا دون حذف محتواه.">
            <ul className="divide-y divide-line">
              {(Object.keys(SECTION_LABELS) as SectionKey[]).map((k) => (
                <li key={k} className="flex items-center justify-between py-3">
                  <span>{SECTION_LABELS[k]}</span>
                  <Toggle checked={!!s.sections[k]} onChange={(v) => patch("sections", { [k]: v })} label={SECTION_LABELS[k]} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="قائمة التنقل" subtitle="روابط الشريط العلوي وروابط التذييل السريعة.">
            <ul className="space-y-2">
              {s.nav.map((n, i) => (
                <li key={n.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                  <span className="flex flex-col text-slate-400">
                    <button type="button" aria-label="أعلى" disabled={i === 0} onClick={() => { const a = [...s.nav]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; patch("nav", a); }} className="disabled:opacity-25">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" aria-label="أسفل" disabled={i === s.nav.length - 1} onClick={() => { const a = [...s.nav]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; patch("nav", a); }} className="disabled:opacity-25">
                      <ArrowDown size={14} />
                    </button>
                  </span>
                  <input className="field py-2 text-sm" value={n.label_ar} aria-label="العنوان بالعربية" onChange={(e) => patch("nav", s.nav.map((x, j) => (j === i ? { ...x, label_ar: e.target.value } : x)))} />
                  <input className="field py-2 text-sm" dir="ltr" value={n.label_en} aria-label="English label" onChange={(e) => patch("nav", s.nav.map((x, j) => (j === i ? { ...x, label_en: e.target.value } : x)))} />
                  <Toggle checked={n.visible} onChange={(v) => patch("nav", s.nav.map((x, j) => (j === i ? { ...x, visible: v } : x)))} label={`إظهار ${n.label_ar}`} />
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
