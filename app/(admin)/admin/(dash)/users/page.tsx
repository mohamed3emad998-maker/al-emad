import { Forbidden } from "@/components/admin/NoAccess";
import { UsersManager } from "@/components/admin/UsersManager";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const metadata = { title: "المستخدمون والصلاحيات" };

export default async function Page() {
  const session = await getSession();
  if (session?.profile?.role !== "admin") return <Forbidden />;
  const { data } = await createClient().from("profiles").select("*").order("created_at");
  return <UsersManager users={(data ?? []) as Profile[]} meId={session.userId} canInvite={!!process.env.SUPABASE_SERVICE_ROLE_KEY} />;
}
