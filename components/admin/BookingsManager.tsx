"use client";
import { Download, Loader2, Phone, Search, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/site/icons";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Booking, BookingStatus, Role } from "@/lib/types";
import { cn, formatDate, telHref, whatsappHref } from "@/lib/utils";
import { KIND_LABEL, STATUS_META, StatusBadge } from "./StatusBadge";
import { Card, PageHeader, useToast } from "./ui";

const STATUSES: BookingStatus[] = ["new", "contacted", "completed", "cancelled"];
const ref = (b: Booking) => `${b.kind === "booking" ? "B" : "Q"}-${b.ref}`;

export function BookingsManager({ role }: { role: Role }) {
  const sb = getBrowserClient();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<BookingStatus | "all">((params.get("status") as BookingStatus) || "all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(params.get("id"));
  const [notes, setNotes] = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(
    async (search = "") => {
      let query = sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(500);
      const term = search.replace(/[,()%*\\]/g, " ").trim();
      if (term) {
        const like = `%${term}%`;
        query = query.or(`name.ilike.${like},phone.ilike.${like},car_brand.ilike.${like},car_model.ilike.${like},service.ilike.${like},part_name.ilike.${like}`);
      }
      const { data, error } = await query;
      if (error) toast("error", `تعذّر تحميل الطلبات: ${error.message}`);
      setRows((data ?? []) as Booking[]);
      setLoading(false);
    },
    [sb, toast]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Live updates when a new request arrives (requires Realtime enabled for "bookings")
  useEffect(() => {
    const ch = sb
      .channel("bookings-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        setRows((r) => [payload.new as Booking, ...r]);
        toast("success", "وصل طلب جديد");
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [sb, toast]);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(q), 350);
    return () => clearTimeout(debounce.current);
  }, [q, load]);

  const counts = useMemo(() => {
    const c = { all: rows.length } as Record<BookingStatus | "all", number>;
    STATUSES.forEach((s) => (c[s] = rows.filter((r) => r.status === s).length));
    return c;
  }, [rows]);

  const visible = tab === "all" ? rows : rows.filter((r) => r.status === tab);
  const selected = rows.find((r) => r.id === selectedId) ?? null;

  useEffect(() => setNotes(selected?.notes ?? ""), [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function update(id: string, patch: Partial<Booking>) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const { error } = await sb.from("bookings").update(patch).eq("id", id);
    if (error) {
      setRows(prev);
      toast("error", "تعذّر الحفظ");
      return false;
    }
    router.refresh(); // refresh sidebar badge
    return true;
  }

  async function remove(b: Booking) {
    if (!confirm(`حذف الطلب ${ref(b)} نهائيًا؟`)) return;
    const { error } = await sb.from("bookings").delete().eq("id", b.id);
    if (error) return toast("error", "تعذّر الحذف");
    setRows((rs) => rs.filter((r) => r.id !== b.id));
    setSelectedId(null);
    toast("success", "تم حذف الطلب");
  }

  function exportCsv() {
    const header = ["#", "النوع", "الحالة", "الاسم", "الهاتف", "الماركة", "الطراز", "الخدمة", "القطعة", "الموعد المفضل", "الرسالة", "ملاحظات", "تاريخ الإرسال"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`;
    const lines = visible.map((b) =>
      [ref(b), KIND_LABEL[b.kind], STATUS_META[b.status].label, b.name, b.phone, b.car_brand, b.car_model, b.service, b.part_name, b.preferred_date, b.message, b.notes, b.created_at]
        .map(esc)
        .join(",")
    );
    const blob = new Blob(["﻿" + [header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `al-emad-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <PageHeader
        title="الحجوزات والاستفسارات"
        subtitle="كل ما يُرسل من نموذج الحجز وطلبات عروض الأسعار في الموقع يصل هنا."
        actions={
          <button type="button" onClick={exportCsv} className="btn-outline px-5 py-3" disabled={!visible.length}>
            <Download size={17} /> تصدير CSV
          </button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="scrollbar-none flex gap-1 overflow-x-auto" role="tablist">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={tab === s}
                onClick={() => setTab(s)}
                className={cn("flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition", tab === s ? "border-racing text-navy" : "border-transparent text-slate-500 hover:text-navy")}
              >
                {s === "all" ? "الكل" : STATUS_META[s].label}
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-paper px-1.5 text-xs">{counts[s]}</span>
              </button>
            ))}
          </div>
          <div className="relative lg:w-80">
            <Search size={17} className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو الهاتف أو السيارة" className="field ps-11" aria-label="بحث" />
          </div>
        </div>

        <div className={cn("grid", selected && "xl:grid-cols-[1fr_400px]")}>
          <div className="min-w-0 overflow-x-auto">
            {loading ? (
              <div className="grid h-60 place-items-center">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            ) : !visible.length ? (
              <p className="p-10 text-center text-slate-500">لا توجد طلبات {tab !== "all" ? `بحالة «${STATUS_META[tab].label}»` : ""}.</p>
            ) : (
              <table className="w-full min-w-[860px] text-[15px]">
                <thead className="bg-paper/70 text-sm text-slate-500">
                  <tr>
                    {["#", "العميل", "النوع", "السيارة", "الخدمة", "الموعد", "الحالة"].map((h) => (
                      <th key={h} className="px-5 py-3 text-start font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((b) => (
                    <tr key={b.id} onClick={() => setSelectedId(b.id)} className={cn("cursor-pointer transition-colors", selectedId === b.id ? "bg-paper" : "hover:bg-paper/50")}>
                      <td className="px-5 py-4 font-wide text-sm text-slate-500" dir="ltr">
                        {ref(b)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block font-semibold">{b.name}</span>
                        <span className="block text-sm text-slate-500" dir="ltr" style={{ textAlign: "start" }}>
                          {b.phone}
                        </span>
                      </td>
                      <td className="px-5 py-4">{KIND_LABEL[b.kind]}</td>
                      <td className="px-5 py-4" dir="auto">
                        {[b.car_brand, b.car_model].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-5 py-4">{b.kind === "quote" ? `قطع الغيار — ${b.part_name ?? ""}` : b.service || "—"}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{formatDate(b.preferred_date)}</td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={b.status}
                          onChange={(e) => update(b.id, { status: e.target.value as BookingStatus })}
                          className={cn("rounded-full border-0 px-3 py-1 text-xs font-semibold", STATUS_META[b.status].badge)}
                          aria-label="تحديث الحالة"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selected ? (
            <aside className="border-t border-line p-6 xl:border-s xl:border-t-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-wide text-xs text-slate-500" dir="ltr" style={{ textAlign: "start" }}>
                    {ref(selected)} · {formatDate(selected.created_at, "en", true)}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{selected.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <button type="button" onClick={() => setSelectedId(null)} aria-label="إغلاق" className="text-slate-400 hover:text-navy">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-[15px]">
                <Info label="الهاتف" value={selected.phone} ltr />
                <Info label="نوع الطلب" value={KIND_LABEL[selected.kind]} />
                <Info label="السيارة" value={[selected.car_brand, selected.car_model].filter(Boolean).join(" ") || "—"} />
                <Info label="الموعد المفضل" value={formatDate(selected.preferred_date)} />
                <Info label={selected.kind === "quote" ? "القطعة" : "الخدمة"} value={(selected.kind === "quote" ? selected.part_name : selected.service) || "—"} full />
              </dl>
              {selected.message ? (
                <div className="mt-5">
                  <p className="text-sm text-slate-500">رسالة العميل</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-md bg-paper p-4 leading-7">{selected.message}</p>
                </div>
              ) : null}

              <p className="mt-6 font-semibold">تحديث الحالة</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update(selected.id, { status: s })}
                    className={cn("rounded-[4px] border px-3 py-3 font-semibold transition", selected.status === s ? "border-navy bg-navy text-white" : "border-line hover:border-navy")}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={whatsappHref(selected.phone, `مرحبًا ${selected.name}، معك فريق العماد بخصوص طلبك ${ref(selected)}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-whatsapp py-3 text-white hover:brightness-110"
                >
                  <WhatsAppIcon className="h-5 w-5" /> واتساب
                </a>
                <a href={telHref(selected.phone)} className="btn-navy py-3">
                  <Phone size={17} /> اتصال
                </a>
              </div>

              <label htmlFor="notes" className="mt-6 block font-semibold">
                ملاحظات داخلية
              </label>
              <textarea
                id="notes"
                rows={4}
                className="field mt-2"
                placeholder="تظهر للفريق فقط"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={async () => {
                  if ((selected.notes ?? "") !== notes && (await update(selected.id, { notes: notes || null }))) toast("success", "تم حفظ الملاحظات");
                }}
              />
              {role === "admin" ? (
                <button type="button" onClick={() => remove(selected)} className="mt-6 inline-flex items-center gap-2 text-sm text-racing hover:underline">
                  <Trash2 size={15} /> حذف الطلب
                </button>
              ) : null}
            </aside>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value, ltr, full }: { label: string; value: string; ltr?: boolean; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : undefined}>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-bold" dir={ltr ? "ltr" : undefined} style={ltr ? { textAlign: "start" } : undefined}>
        {value}
      </dd>
    </div>
  );
}
