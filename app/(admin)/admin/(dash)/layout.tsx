import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { Sidebar } from "@/components/admin/Sidebar";
import { NoAccess } from "@/components/admin/NoAccess";
import { ToastProvider } from "@/components/admin/ui";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const role = session.profile?.role ?? null;
  if (!role) return <NoAccess email={session.email} />;

  let newCount = 0;
  if (role === "admin" || role === "reception") {
    const { count } = await createClient().from("bookings").select("id", { count: "exact", head: true }).eq("status", "new");
    newCount = count ?? 0;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[288px_1fr]">
      <Sidebar role={role} name={session.profile?.full_name || session.email} newCount={newCount} />
      <main className="min-w-0 px-4 pb-16 pt-20 sm:px-8 lg:px-10 lg:pt-10">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
