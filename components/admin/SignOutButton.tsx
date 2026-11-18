"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await getBrowserClient().auth.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="تسجيل الخروج"
      title="تسجيل الخروج"
    >
      <LogOut size={18} className="rtl:rotate-180" />
      {iconOnly ? null : "تسجيل الخروج"}
    </button>
  );
}
