"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { SITE_URL } from "@/lib/env";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const roleSchema = z.enum(["admin", "editor", "reception"]).nullable();

async function requireAdmin() {
  const s = await getSession();
  if (s?.profile?.role !== "admin") throw new Error("forbidden");
  return s;
}

export async function setUserRole(userId: string, role: string | null) {
  const me = await requireAdmin();
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: "دور غير صالح" };
  if (userId === me.userId && parsed.data !== "admin") return { ok: false, error: "لا يمكنك إزالة صلاحية المسؤول عن حسابك" };
  // Uses the admin's own session — RLS ("profiles: admin update") authorizes it.
  const { error } = await createClient().from("profiles").update({ role: parsed.data }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function inviteUser(email: string, fullName: string, role: string) {
  await requireAdmin();
  const e = z.string().trim().email().safeParse(email);
  const r = z.enum(["admin", "editor", "reception"]).safeParse(role);
  if (!e.success || !r.success) return { ok: false, error: "بيانات غير صالحة" };
  const svc = createServiceClient();
  if (!svc) return { ok: false, error: "أضف SUPABASE_SERVICE_ROLE_KEY في ملف البيئة لتفعيل الدعوات، أو أنشئ المستخدم من لوحة Supabase." };

  const { data, error } = await svc.auth.admin.inviteUserByEmail(e.data, {
    redirectTo: `${SITE_URL}/admin/auth/callback?next=/admin/reset`,
    data: { full_name: fullName.trim() || undefined },
  });
  if (error || !data.user) return { ok: false, error: error?.message ?? "تعذّر إرسال الدعوة" };

  const { error: pErr } = await svc
    .from("profiles")
    .upsert({ id: data.user.id, email: e.data, full_name: fullName.trim() || e.data.split("@")[0], role: r.data });
  if (pErr) return { ok: false, error: pErr.message };
  revalidatePath("/admin/users");
  return { ok: true };
}
