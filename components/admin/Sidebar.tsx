"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, FileText, Images, LayoutGrid, Menu, MessageSquare, Package, Settings, UserCheck, Wrench, X } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./SignOutButton";

const ROLE_LABEL: Record<Role, string> = { admin: "مسؤول", editor: "محرر", reception: "الاستقبال" };

const LINKS: { href: string; label: string; Icon: typeof LayoutGrid; roles: Role[]; badge?: boolean }[] = [
  { href: "/admin", label: "لوحة القيادة", Icon: LayoutGrid, roles: ["admin", "editor", "reception"] },
  { href: "/admin/bookings", label: "الحجوزات والاستفسارات", Icon: CalendarDays, roles: ["admin", "reception"], badge: true },
  { href: "/admin/services", label: "الخدمات", Icon: Wrench, roles: ["admin", "editor"] },
  { href: "/admin/parts", label: "قطع الغيار والتصنيفات", Icon: Package, roles: ["admin", "editor"] },
  { href: "/admin/gallery", label: "المعرض والفيديو", Icon: Images, roles: ["admin", "editor"] },
  { href: "/admin/testimonials", label: "آراء العملاء", Icon: MessageSquare, roles: ["admin", "editor"] },
  { href: "/admin/content", label: "محتوى الصفحات", Icon: FileText, roles: ["admin", "editor"] },
  { href: "/admin/settings", label: "إعدادات الموقع", Icon: Settings, roles: ["admin"] },
  { href: "/admin/users", label: "المستخدمون والصلاحيات", Icon: UserCheck, roles: ["admin"] },
];

export function Sidebar({ role, name, newCount }: { role: Role; name: string; newCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <>
      <div className="flex items-center gap-3 px-2">
        <LogoMark />
        <span className="flex flex-col leading-tight">
          <span className="font-wide text-xl font-extrabold tracking-wide" dir="ltr">
            AL-EMAD
          </span>
          <span className="text-xs text-silver">لوحة التحكم</span>
        </span>
      </div>
      <nav className="mt-10 flex-1 space-y-1" aria-label="لوحة التحكم">
        {LINKS.filter((l) => l.roles.includes(role)).map(({ href, label, Icon, badge }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-4 py-3.5 text-[15px] transition-colors",
                active ? "bg-racing font-semibold text-white" : "text-white/80 hover:bg-white/5 hover:text-white"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.7} />
              <span className="flex-1">{label}</span>
              {badge && newCount > 0 ? (
                <span className={cn("grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold", active ? "bg-white text-racing" : "bg-white text-navy")}>
                  {newCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 flex items-center gap-3 rounded-[4px] bg-white/5 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-silver text-lg font-bold text-navy">{name.trim().charAt(0).toUpperCase()}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{name}</span>
          <span className="block text-xs text-silver">صلاحية: {ROLE_LABEL[role]}</span>
        </span>
        <SignOutButton iconOnly className="grid h-10 w-10 place-items-center rounded text-silver hover:bg-white/10 hover:text-white" />
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-navy px-4 text-white lg:hidden">
        <span className="flex items-center gap-2">
          <LogoMark className="h-6 w-7" />
          <span className="font-wide font-extrabold" dir="ltr">
            AL-EMAD
          </span>
        </span>
        <button type="button" onClick={() => setOpen(true)} aria-label="القائمة" className="grid h-10 w-10 place-items-center rounded border border-white/15">
          <Menu size={20} />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-charcoal/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-[290px] flex-col bg-navy p-5 text-white" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="mb-4 self-end">
              <X />
            </button>
            {nav}
          </aside>
        </div>
      ) : null}
      <aside className="sticky top-0 hidden h-screen flex-col bg-navy p-6 text-white lg:flex">{nav}</aside>
    </>
  );
}
