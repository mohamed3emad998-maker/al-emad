"use client";
import { Loader2, Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { inviteUser, setUserRole } from "@/app/actions/users";
import type { Profile, Role } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Card, PageHeader, useToast } from "./ui";

const ROLES: { value: Role; label: string; cls: string }[] = [
  { value: "admin", label: "مسؤول", cls: "bg-navy text-white" },
  { value: "editor", label: "محرر", cls: "bg-[#1E4E8C]/10 text-[#1E4E8C]" },
  { value: "reception", label: "الاستقبال", cls: "bg-[#1F6B3A]/10 text-[#1F6B3A]" },
];

export function UsersManager({ users, meId, canInvite }: { users: Profile[]; meId: string; canInvite: boolean }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "editor" as Role });

  const changeRole = (id: string, role: string) =>
    start(async () => {
      const res = await setUserRole(id, role || null);
      toast(res.ok ? "success" : "error", res.ok ? "تم تحديث الصلاحية" : res.error ?? "خطأ");
    });

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await inviteUser(form.email, form.name, form.role);
      if (res.ok) {
        toast("success", "تم إرسال الدعوة بالبريد الإلكتروني");
        setOpen(false);
        setForm({ email: "", name: "", role: "editor" });
      } else toast("error", res.error ?? "خطأ");
    });
  };

  return (
    <div>
      <PageHeader
        title="المستخدمون والصلاحيات"
        subtitle="المسؤول: كل الصلاحيات · المحرر: المحتوى فقط · الاستقبال: الحجوزات فقط."
        actions={
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn-outline px-5 py-3">
            {open ? <X size={17} /> : <Plus size={17} />} دعوة مستخدم
          </button>
        }
      />

      {open ? (
        <Card className="mb-6 p-6">
          {canInvite ? (
            <form onSubmit={invite} className="grid gap-4 md:grid-cols-[1fr_1fr_200px_auto] md:items-end">
              <div>
                <label className="label" htmlFor="inv-email">
                  البريد الإلكتروني
                </label>
                <input id="inv-email" type="email" required dir="ltr" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="inv-name">
                  الاسم
                </label>
                <input id="inv-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="inv-role">
                  الدور
                </label>
                <select id="inv-role" className="field appearance-auto" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-red shadow-none" disabled={pending}>
                {pending ? <Loader2 size={17} className="animate-spin" /> : null} إرسال الدعوة
              </button>
            </form>
          ) : (
            <p className="leading-7 text-slate-600">
              لتفعيل الدعوات من هنا أضف <code dir="ltr">SUPABASE_SERVICE_ROLE_KEY</code> إلى ملف البيئة. بديلًا: أنشئ المستخدم من Supabase ← Authentication ← Add user، ثم عيّن دوره من الجدول أدناه.
            </p>
          )}
        </Card>
      ) : null}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-[15px]">
          <thead className="text-sm text-slate-500">
            <tr className="border-b border-line">
              <th className="px-6 py-4 text-start font-medium">المستخدم</th>
              <th className="px-6 py-4 text-start font-medium">البريد</th>
              <th className="px-6 py-4 text-start font-medium">الدور</th>
              <th className="px-6 py-4 text-start font-medium">آخر دخول</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const r = ROLES.find((x) => x.value === u.role);
              return (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-semibold">
                    {u.full_name || "—"} {u.id === meId ? <span className="text-xs font-normal text-slate-400">(أنت)</span> : null}
                  </td>
                  <td className="px-6 py-4" dir="ltr" style={{ textAlign: "start" }}>
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      aria-label={`دور ${u.email}`}
                      value={u.role ?? ""}
                      disabled={pending}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className={cn("rounded-full border-0 px-3 py-1.5 text-xs font-semibold", r?.cls ?? "bg-slate-100 text-slate-500")}
                    >
                      <option value="">بدون صلاحية</option>
                      {ROLES.map((x) => (
                        <option key={x.value} value={x.value}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{u.last_sign_in_at ? formatDate(u.last_sign_in_at, "ar", true) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
