import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { LogoMark } from "@/components/site/Logo";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "تسجيل الدخول" };
export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.15fr]">
      <section className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/33814734/pexels-photo-33814734.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="hatch absolute inset-0" />
        <div className="relative flex items-center gap-3">
          <LogoMark />
          <span className="flex flex-col leading-tight">
            <span className="font-wide text-2xl font-extrabold" dir="ltr">
              AL-EMAD
            </span>
            <span className="text-sm text-silver">لوحة إدارة المحتوى</span>
          </span>
        </div>
        <div className="relative">
          <p className="font-wide text-xs font-semibold uppercase tracking-eyebrow text-silver" dir="ltr">
            Content Management System
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.35]">أدِر موقع العماد، الحجوزات، الخدمات وقطع الغيار من مكان واحد.</h1>
        </div>
      </section>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-md rounded-md border border-line bg-white p-8 shadow-[0_30px_80px_-40px_rgba(16,28,44,.35)] sm:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark />
            <span className="font-wide text-xl font-extrabold" dir="ltr">
              AL-EMAD
            </span>
          </div>
          <h2 className="text-3xl font-bold">تسجيل الدخول</h2>
          <p className="mt-2 text-slate-500">للمسؤولين والمحررين المصرّح لهم فقط.</p>
          <LoginForm initialError={searchParams.error} />
        </div>
      </section>
    </main>
  );
}
