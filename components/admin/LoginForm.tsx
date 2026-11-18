"use client";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ? "انتهت صلاحية الرابط أو أنه غير صالح. حاول مجددًا." : "");
  const [info, setInfo] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { error } = await getBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message.includes("Invalid") ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "تعذّر تسجيل الدخول. حاول مرة أخرى.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  async function forgot() {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("اكتب بريدك الإلكتروني أولًا ثم اضغط «نسيت كلمة المرور؟».");
      return;
    }
    const { error } = await getBrowserClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/reset`,
    });
    if (error) setError("تعذّر إرسال رابط الاستعادة.");
    else setInfo("إن كان البريد مسجّلًا فستصلك رسالة لإعادة تعيين كلمة المرور.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="label">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          placeholder="admin@al-emad.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field text-end"
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold">
            كلمة المرور
          </label>
          <button type="button" onClick={forgot} className="text-sm text-racing underline underline-offset-4">
            نسيت كلمة المرور؟
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field ps-12"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute inset-y-0 start-0 grid w-12 place-items-center text-slate-500"
            aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error ? (
        <p role="alert" className="rounded border border-racing/30 bg-racing/5 px-4 py-3 text-sm text-racing">
          {error}
        </p>
      ) : null}
      {info ? <p className="rounded border border-whatsapp/30 bg-whatsapp/5 px-4 py-3 text-sm text-whatsapp">{info}</p> : null}
      <button type="submit" disabled={loading || !email || !password} className="btn-red w-full py-4 shadow-none">
        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
        دخول إلى لوحة التحكم
      </button>
      <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Lock size={14} /> اتصال مشفّر · مصادقة Supabase · صلاحيات حسب الدور
      </p>
    </form>
  );
}
