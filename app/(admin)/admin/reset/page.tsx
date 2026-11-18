"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/site/Logo";
import { getBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 10) return setError("يجب أن تتكون كلمة المرور من 10 أحرف على الأقل.");
    if (pw !== pw2) return setError("كلمتا المرور غير متطابقتين.");
    setLoading(true);
    const { error } = await getBrowserClient().auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return setError("تعذّر تحديث كلمة المرور. اطلب رابطًا جديدًا.");
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-md border border-line bg-white p-8 shadow-sm sm:p-10">
        <LogoMark />
        <h1 className="text-2xl font-bold">تعيين كلمة مرور جديدة</h1>
        <div>
          <label className="label" htmlFor="pw">
            كلمة المرور الجديدة
          </label>
          <input id="pw" type="password" autoComplete="new-password" dir="ltr" className="field" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pw2">
            تأكيد كلمة المرور
          </label>
          <input id="pw2" type="password" autoComplete="new-password" dir="ltr" className="field" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        {error ? <p className="text-sm text-racing">{error}</p> : null}
        <button className="btn-red w-full shadow-none" disabled={loading}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          حفظ كلمة المرور
        </button>
      </form>
    </main>
  );
}
