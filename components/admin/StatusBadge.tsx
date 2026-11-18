import type { BookingKind, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<BookingStatus, { label: string; badge: string; bar: string }> = {
  new: { label: "جديد", badge: "bg-racing/10 text-racing", bar: "bg-racing" },
  contacted: { label: "تم التواصل", badge: "bg-[#1E4E8C]/10 text-[#1E4E8C]", bar: "bg-[#1E4E8C]" },
  completed: { label: "مكتمل", badge: "bg-[#1F6B3A]/10 text-[#1F6B3A]", bar: "bg-[#1F6B3A]" },
  cancelled: { label: "ملغي", badge: "bg-slate-200 text-slate-600", bar: "bg-slate-300" },
};

export const KIND_LABEL: Record<BookingKind, string> = { booking: "حجز موعد", quote: "عرض سعر", inquiry: "استفسار" };

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const m = STATUS_META[status];
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", m.badge, className)}>{m.label}</span>;
}
