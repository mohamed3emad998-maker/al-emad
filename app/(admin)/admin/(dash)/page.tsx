import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { StatusBadge, STATUS_META } from "@/components/admin/StatusBadge";
import { Card, PageHeader } from "@/components/admin/ui";
import { canAccess, getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "لوحة القيادة" };

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.profile?.role;
  const sb = createClient();
  const canBookings = canAccess(role, "bookings");
  const canContent = canAccess(role, "content");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const head = { count: "exact" as const, head: true };
  const [total, month, svcAll, svcPub, partsAll, cats, recent, messages, ...statusCounts] = await Promise.all([
    canBookings ? sb.from("bookings").select("id", head) : null,
    canBookings ? sb.from("bookings").select("id", head).gte("created_at", monthStart.toISOString()) : null,
    sb.from("services").select("id", head),
    sb.from("services").select("id", head).eq("published", true),
    sb.from("parts").select("id", head),
    sb.from("part_categories").select("id", head),
    canBookings ? sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(6) : null,
    canBookings ? sb.from("bookings").select("*").not("message", "is", null).order("created_at", { ascending: false }).limit(3) : null,
    ...(["new", "contacted", "completed", "cancelled"] as BookingStatus[]).map((s) => (canBookings ? sb.from("bookings").select("id", head).eq("status", s) : null)),
  ]);

  const counts = Object.fromEntries((["new", "contacted", "completed", "cancelled"] as BookingStatus[]).map((s, i) => [s, statusCounts[i]?.count ?? 0])) as Record<BookingStatus, number>;
  const statusTotal = Object.values(counts).reduce((a, b) => a + b, 0);
  const recentRows = (recent?.data ?? []) as Booking[];
  const msgRows = (messages?.data ?? []) as Booking[];

  const tiles = [
    canBookings && { label: "إجمالي الاستفسارات", value: total?.count ?? 0, foot: <span className="text-[#1F6B3A]">هذا الشهر: {month?.count ?? 0}</span> },
    canBookings && {
      label: "طلبات حجز جديدة",
      value: counts.new,
      accent: true,
      foot: (
        <Link href="/admin/bookings?status=new" className="text-racing underline underline-offset-4">
          مراجعة الآن ←
        </Link>
      ),
    },
    { label: "الخدمات المنشورة", value: svcPub.count ?? 0, foot: `من أصل ${svcAll.count ?? 0} خدمات` },
    { label: "قطع الغيار", value: partsAll.count ?? 0, foot: `في ${cats.count ?? 0} تصنيفات · 7 علامات` },
  ].filter(Boolean) as { label: string; value: number; foot: React.ReactNode; accent?: boolean }[];

  return (
    <div>
      <PageHeader
        title="مرحبًا بعودتك"
        subtitle="نظرة عامة على نشاط الموقع والحجوزات."
        actions={
          <>
            <Link href="/ar" target="_blank" className="btn-outline px-5 py-3">
              <ExternalLink size={17} /> عرض الموقع
            </Link>
            {canContent ? (
              <Link href="/admin/services" className="btn-red px-5 py-3 shadow-none">
                <Plus size={17} /> إضافة خدمة
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className={t.accent ? "border-racing/40 p-6" : "p-6"}>
            <p className="text-sm text-slate-500">{t.label}</p>
            <p className={`mt-3 font-wide text-5xl font-black ${t.accent ? "text-racing" : ""}`} dir="ltr" style={{ textAlign: "start" }}>
              {t.value}
            </p>
            <p className="mt-3 text-sm text-slate-500">{t.foot}</p>
          </Card>
        ))}
      </div>

      {canBookings ? (
        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-6">
              <h2 className="text-xl font-bold">أحدث طلبات الحجز</h2>
              <Link href="/admin/bookings" className="text-sm text-racing underline underline-offset-4">
                عرض الكل
              </Link>
            </div>
            {recentRows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-start text-[15px]">
                  <thead className="text-sm text-slate-500">
                    <tr className="border-b border-line">
                      <th className="px-6 py-3 text-start font-medium">العميل</th>
                      <th className="px-6 py-3 text-start font-medium">السيارة</th>
                      <th className="px-6 py-3 text-start font-medium">الخدمة</th>
                      <th className="px-6 py-3 text-start font-medium">الموعد المفضل</th>
                      <th className="px-6 py-3 text-start font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {recentRows.map((b) => (
                      <tr key={b.id} className="hover:bg-paper/60">
                        <td className="px-6 py-4 font-semibold">
                          <Link href={`/admin/bookings?id=${b.id}`}>{b.name}</Link>
                        </td>
                        <td className="px-6 py-4" dir="auto">
                          {[b.car_brand, b.car_model].filter(Boolean).join(" ") || "—"}
                        </td>
                        <td className="px-6 py-4">{b.service || b.part_name || "—"}</td>
                        <td className="px-6 py-4">{formatDate(b.preferred_date)}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-8 text-center text-slate-500">لم تصل طلبات بعد. ستظهر هنا فور إرسالها من نموذج الحجز في الموقع.</p>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold">حالة الطلبات</h2>
              <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-line">
                {statusTotal
                  ? (Object.keys(counts) as BookingStatus[]).map((s) =>
                      counts[s] ? <span key={s} style={{ width: `${(counts[s] / statusTotal) * 100}%` }} className={STATUS_META[s].bar} /> : null
                    )
                  : null}
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {(Object.keys(counts) as BookingStatus[]).map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-sm ${STATUS_META[s].bar}`} /> {STATUS_META[s].label} · {counts[s]}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="border-b border-line p-6 text-xl font-bold">أحدث الرسائل</h2>
              {msgRows.length ? (
                <ul className="divide-y divide-line">
                  {msgRows.map((m) => (
                    <li key={m.id}>
                      <Link href={`/admin/bookings?id=${m.id}`} className="flex gap-4 p-5 hover:bg-paper/60">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {m.kind === "quote" ? "طلب عرض سعر" : m.kind === "inquiry" ? "استفسار" : "حجز"} — {m.part_name || m.service || m.name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{m.message}</p>
                        </div>
                        <span className="font-wide text-xs text-slate-400">{timeAgo(m.created_at).toUpperCase()}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-6 text-sm text-slate-500">لا توجد رسائل بعد.</p>
              )}
            </Card>
          </div>
        </div>
      ) : null}

      {canContent ? (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold">إجراءات سريعة</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["/admin/services", "تعديل الخدمات"],
              ["/admin/parts", "إضافة قطعة غيار"],
              ["/admin/gallery", "رفع صور للمعرض"],
              [role === "admin" ? "/admin/settings" : "/admin/content", role === "admin" ? "تغيير فيديو الواجهة" : "تعديل نصوص الصفحة"],
            ].map(([href, label]) => (
              <Link key={href + label} href={href} className="rounded-md border border-line p-5 font-semibold transition hover:border-navy hover:shadow-sm">
                {label}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
