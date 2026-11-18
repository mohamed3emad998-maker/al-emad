"use client";
import { ArrowDown, ArrowUp, Loader2, Plus, Search, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { revalidateSite } from "@/app/actions/revalidate";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn, slugify } from "@/lib/utils";
import { MediaUpload } from "./MediaUpload";
import { Card, Counter, LangTabs, PageHeader, Toggle, useToast } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "slug" | "select" | "multi" | "image" | "video" | "rating";
  /** stored as `${key}_ar` / `${key}_en` */
  bilingual?: boolean;
  required?: boolean;
  max?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** for slug: field to derive from */
  from?: string;
  folder?: string;
  hint?: string;
  span?: "full" | "half";
  ltr?: boolean;
  nullable?: boolean;
  /** media field whose kind (image/video) follows another field's value */
  kindFrom?: string;
};

export type CollectionConfig = {
  table: string;
  title: string;
  singular: string;
  eyebrow?: (row: Row, index: number) => string;
  listTitle: (row: Row) => string;
  listSubtitle?: (row: Row) => string;
  listImage?: (row: Row) => string | null | undefined;
  fields: FieldDef[];
  defaults: Row;
  hasPublished?: boolean;
  searchKeys?: string[];
  embedded?: boolean;
  newLabel?: string;
  /** called after a successful save/delete */
  onChange?: () => void;
};

export function CollectionManager({ config }: { config: CollectionConfig }) {
  const toast = useToast();
  const sb = getBrowserClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Row | null>(null);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(
    async (selectId?: string) => {
      const { data, error } = await sb.from(config.table).select("*").order("sort_order").order("created_at");
      if (error) toast("error", `تعذّر التحميل: ${error.message}`);
      const list = data ?? [];
      setRows(list);
      setLoading(false);
      setDraft((cur) => {
        const id = selectId ?? cur?.id;
        if (id) return list.find((r) => r.id === id) ?? list[0] ?? null;
        return cur ?? list[0] ?? null;
      });
    },
    [sb, config.table, toast]
  );

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const keys = config.searchKeys ?? [];
    return rows.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q.toLowerCase())));
  }, [rows, q, config.searchKeys]);

  const set = (key: string, value: any) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const fieldKey = (f: FieldDef) => (f.bilingual ? `${f.key}_${lang}` : f.key);

  function validate(d: Row) {
    const e: Record<string, string> = {};
    for (const f of config.fields) {
      const keys = f.bilingual ? [`${f.key}_ar`] : [f.key];
      for (const k of keys) {
        const v = d[k];
        if (f.required && (v === null || v === undefined || String(v).trim() === "")) e[k] = "حقل مطلوب";
        if (f.max && typeof v === "string" && v.length > f.max) e[k] = `الحد الأقصى ${f.max} حرفًا`;
        if (f.type === "slug" && v && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) e[k] = "أحرف إنجليزية صغيرة وأرقام وشرطات فقط";
      }
      if (f.bilingual && f.max && typeof d[`${f.key}_en`] === "string" && d[`${f.key}_en`].length > f.max) e[`${f.key}_en`] = `الحد الأقصى ${f.max} حرفًا`;
    }
    setErrors(e);
    if (Object.keys(e).length) {
      const firstAr = Object.keys(e).some((k) => !k.endsWith("_en"));
      setLang(firstAr ? "ar" : "en");
    }
    return !Object.keys(e).length;
  }

  async function save() {
    if (!draft || !validate(draft)) return;
    setSaving(true);
    const payload: Row = {};
    for (const f of config.fields) {
      if (f.bilingual) {
        payload[`${f.key}_ar`] = draft[`${f.key}_ar`] ?? "";
        payload[`${f.key}_en`] = draft[`${f.key}_en`] ?? "";
      } else {
        let v = draft[f.key];
        if (f.type === "number") v = v === "" || v === null || v === undefined ? null : Number(v);
        if ((f.type === "select" || f.type === "image" || f.type === "video") && v === "") v = null;
        payload[f.key] = v ?? (f.type === "multi" ? [] : f.nullable || f.type === "image" || f.type === "video" || f.type === "number" ? null : "");
      }
    }
    if (config.hasPublished) payload.published = !!draft.published;
    let res;
    if (draft.id) {
      res = await sb.from(config.table).update(payload).eq("id", draft.id).select("id").single();
    } else {
      payload.sort_order = (rows.at(-1)?.sort_order ?? 0) + 1;
      res = await sb.from(config.table).insert(payload).select("id").single();
    }
    setSaving(false);
    if (res.error) {
      toast("error", res.error.code === "23505" ? "القيمة مستخدمة مسبقًا (الرابط مكرر)" : `تعذّر الحفظ: ${res.error.message}`);
      return;
    }
    toast("success", "تم حفظ التغييرات ونشرها");
    await load(res.data.id);
    config.onChange?.();
    revalidateSite();
  }

  async function remove() {
    if (!draft?.id) return setDraft(rows[0] ?? null);
    if (!confirm(`حذف «${config.listTitle(draft)}» نهائيًا؟ لا يمكن التراجع.`)) return;
    const { error } = await sb.from(config.table).delete().eq("id", draft.id);
    if (error) return toast("error", `تعذّر الحذف: ${error.message}`);
    toast("success", "تم الحذف");
    setDraft(null);
    await load();
    config.onChange?.();
    revalidateSite();
  }

  async function togglePublished(row: Row, value: boolean) {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, published: value } : r)));
    if (draft?.id === row.id) set("published", value);
    const { error } = await sb.from(config.table).update({ published: value }).eq("id", row.id);
    if (error) {
      toast("error", "تعذّر تحديث حالة النشر");
      load();
    } else revalidateSite();
  }

  async function move(index: number, dir: -1 | 1) {
    const a = rows[index];
    const b = rows[index + dir];
    if (!a || !b) return;
    const next = [...rows];
    next[index] = { ...b, sort_order: a.sort_order };
    next[index + dir] = { ...a, sort_order: b.sort_order };
    if (a.sort_order === b.sort_order) next[index + dir].sort_order = a.sort_order + dir;
    setRows(next);
    const r1 = await sb.from(config.table).update({ sort_order: next[index].sort_order }).eq("id", next[index].id);
    const r2 = await sb.from(config.table).update({ sort_order: next[index + dir].sort_order }).eq("id", next[index + dir].id);
    if (r1.error || r2.error) toast("error", "تعذّر حفظ الترتيب");
    else revalidateSite();
  }

  const published = rows.filter((r) => r.published).length;

  return (
    <div>
      {!config.embedded ? (
        <PageHeader
          title={config.title}
          subtitle={config.hasPublished ? `${published} منشورة من أصل ${rows.length} · رتّب العناصر بالأسهم كما تظهر في الموقع.` : `${rows.length} عنصر`}
          actions={
            <button type="button" onClick={() => { setErrors({}); setDraft({ ...config.defaults }); }} className="btn-red px-5 py-3 shadow-none">
              <Plus size={18} /> {config.newLabel ?? `${config.singular} جديدة`}
            </button>
          }
        />
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{config.title}</h2>
          <button type="button" onClick={() => { setErrors({}); setDraft({ ...config.defaults }); }} className="btn-outline px-4 py-2 text-sm">
            <Plus size={16} /> {config.newLabel ?? "إضافة"}
          </button>
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.85fr)_1.3fr]">
        {/* List */}
        <Card className="overflow-hidden">
          {config.searchKeys?.length && rows.length > 6 ? (
            <div className="relative border-b border-line p-3">
              <Search size={16} className="absolute start-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث…" className="field ps-10" />
            </div>
          ) : null}
          {loading ? (
            <div className="grid h-40 place-items-center">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : !filtered.length ? (
            <p className="p-8 text-center text-slate-500">لا توجد عناصر بعد.</p>
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((row) => {
                const index = rows.findIndex((r) => r.id === row.id);
                const img = config.listImage?.(row);
                const active = draft?.id === row.id;
                return (
                  <li key={row.id} className={cn("flex items-center gap-3 p-3 transition-colors", active ? "bg-paper shadow-[inset_-3px_0_0_rgb(var(--c-red))]" : "hover:bg-paper/60")}>
                    <div className="flex flex-col">
                      <button type="button" aria-label="تحريك لأعلى" disabled={index === 0 || !!q} onClick={() => move(index, -1)} className="text-slate-400 hover:text-navy disabled:opacity-25">
                        <ArrowUp size={15} />
                      </button>
                      <button type="button" aria-label="تحريك لأسفل" disabled={index === rows.length - 1 || !!q} onClick={() => move(index, 1)} className="text-slate-400 hover:text-navy disabled:opacity-25">
                        <ArrowDown size={15} />
                      </button>
                    </div>
                    <button type="button" onClick={() => { setErrors({}); setDraft(row); }} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                      {config.listImage ? (
                        <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-line">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <span className="hatch-light absolute inset-0" />
                          )}
                        </span>
                      ) : null}
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{config.listTitle(row) || "—"}</span>
                        {config.listSubtitle ? <span className="block truncate text-sm text-slate-500">{config.listSubtitle(row)}</span> : null}
                      </span>
                    </button>
                    {config.hasPublished ? <Toggle checked={!!row.published} onChange={(v) => togglePublished(row, v)} label="منشورة على الموقع" /> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Editor */}
        {draft ? (
          <Card className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-wide text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" dir="ltr">
                  {draft.id ? config.eyebrow?.(draft, rows.findIndex((r) => r.id === draft.id)) ?? "EDIT" : "NEW"}
                </p>
                <h2 className="mt-1 text-2xl font-bold">{draft.id ? config.listTitle(draft) || "—" : `${config.singular} جديدة`}</h2>
              </div>
              {config.fields.some((f) => f.bilingual) ? <LangTabs value={lang} onChange={setLang} /> : null}
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {config.fields.map((f) => {
                const k = fieldKey(f);
                const v = draft[k];
                const err = errors[k];
                const full = f.span !== "half" && (f.type === "textarea" || f.type === "multi" || f.span === "full");
                const dir = f.ltr || (f.bilingual && lang === "en") ? "ltr" : undefined;
                return (
                  <div key={f.key} className={cn(full && "md:col-span-2")}>
                    {f.type === "image" || f.type === "video" ? (
                      <MediaUpload
                        key={`${draft.id ?? "new"}-${k}-${f.kindFrom ? draft[f.kindFrom] : ""}`}
                        label={f.label}
                        value={v}
                        onChange={(url) => set(k, url)}
                        folder={f.folder ?? config.table}
                        kind={f.kindFrom ? (draft[f.kindFrom] === "video" ? "video" : "image") : f.type === "video" ? "video" : "image"}
                        hint={f.hint}
                      />
                    ) : (
                      <>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <label htmlFor={`f-${k}`} className="text-sm font-semibold">
                            {f.label} {f.required && (!f.bilingual || lang === "ar") ? <span className="text-racing">*</span> : null}
                            {f.bilingual ? <span className="ms-1 text-xs font-normal text-slate-400">({lang === "ar" ? "عربي" : "English"})</span> : null}
                          </label>
                          {typeof v === "string" ? <Counter value={v} max={f.max} /> : null}
                        </div>
                        {f.type === "textarea" ? (
                          <textarea id={`f-${k}`} rows={4} dir={dir} className="field" value={v ?? ""} placeholder={f.placeholder} onChange={(e) => set(k, e.target.value)} />
                        ) : f.type === "select" ? (
                          <select id={`f-${k}`} className="field appearance-auto" value={v ?? ""} onChange={(e) => set(k, e.target.value)}>
                            <option value="">—</option>
                            {f.options?.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : f.type === "multi" ? (
                          <div className="flex flex-wrap gap-2">
                            {f.options?.map((o) => {
                              const on = (v ?? []).includes(o.value);
                              return (
                                <button
                                  key={o.value}
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() => set(k, on ? (v ?? []).filter((x: string) => x !== o.value) : [...(v ?? []), o.value])}
                                  className={cn("chip px-4 py-2 font-wide text-xs uppercase tracking-wider", on && "chip-active")}
                                >
                                  {o.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : f.type === "rating" ? (
                          <div className="flex gap-1" role="radiogroup" aria-label={f.label}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} type="button" role="radio" aria-checked={v === n} aria-label={`${n}`} onClick={() => set(k, n)}>
                                <Star size={26} className={n <= (v ?? 0) ? "fill-[#F2B53A] text-[#F2B53A]" : "text-slate-300"} />
                              </button>
                            ))}
                          </div>
                        ) : f.type === "slug" ? (
                          <div className="flex gap-2">
                            <input id={`f-${k}`} dir="ltr" className="field bg-paper" value={v ?? ""} placeholder={f.placeholder} onChange={(e) => set(k, e.target.value.toLowerCase())} />
                            {f.from ? (
                              <button type="button" className="btn-outline shrink-0 px-3 py-2 text-xs" onClick={() => set(k, slugify(String(draft[f.from!] ?? "")))}>
                                توليد
                              </button>
                            ) : null}
                          </div>
                        ) : (
                          <input
                            id={`f-${k}`}
                            type={f.type === "number" ? "number" : "text"}
                            dir={dir}
                            className="field"
                            value={v ?? ""}
                            placeholder={f.placeholder}
                            onChange={(e) => set(k, e.target.value)}
                          />
                        )}
                        {f.hint ? <p className="mt-1.5 text-xs text-slate-500">{f.hint}</p> : null}
                      </>
                    )}
                    {err ? <p className="mt-1 text-xs font-medium text-racing">{err}</p> : null}
                  </div>
                );
              })}
              {config.hasPublished ? (
                <div className="flex items-center justify-between rounded-md border border-line p-4 md:col-span-2">
                  <span>
                    <span className="block font-semibold">منشورة على الموقع</span>
                    <span className="text-sm text-slate-500">{draft.published ? "ظاهرة للزوار الآن" : "مخفية عن الزوار"}</span>
                  </span>
                  <Toggle checked={!!draft.published} onChange={(val) => set("published", val)} label="منشورة على الموقع" />
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <button type="button" onClick={remove} className="btn border border-racing/30 px-5 py-3 text-racing hover:bg-racing/5">
                {draft.id ? "حذف" : "إلغاء"}
              </button>
              <button type="button" onClick={save} disabled={saving} className="btn-navy px-8 py-3.5">
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                حفظ التغييرات
              </button>
            </div>
          </Card>
        ) : (
          <Card className="grid h-60 place-items-center text-slate-500">اختر عنصرًا لتعديله أو أضف عنصرًا جديدًا.</Card>
        )}
      </div>
    </div>
  );
}
