import { Database } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";

export function SetupNotice() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-2xl rounded-md border border-line bg-white p-8 shadow-sm sm:p-10">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="font-wide text-xl font-extrabold" dir="ltr">
            AL-EMAD
          </span>
        </div>
        <h1 className="mt-8 flex items-center gap-3 text-2xl font-bold">
          <Database className="text-racing" /> اربط قاعدة البيانات لتفعيل لوحة التحكم
        </h1>
        <ol className="mt-6 list-decimal space-y-3 ps-5 leading-8 text-slate-700">
          <li>أنشئ مشروعًا على Supabase.</li>
          <li>
            من <b>SQL Editor</b> شغّل الملف <code className="rounded bg-paper px-1.5" dir="ltr">supabase/schema.sql</code> ثم{" "}
            <code className="rounded bg-paper px-1.5" dir="ltr">supabase/seed.sql</code>.
          </li>
          <li>
            انسخ <code className="rounded bg-paper px-1.5" dir="ltr">.env.example</code> إلى{" "}
            <code className="rounded bg-paper px-1.5" dir="ltr">.env.local</code> وضع رابط المشروع والمفاتيح.
          </li>
          <li>أنشئ أول مستخدم من Authentication ثم امنحه صلاحية المسؤول (التعليمات في نهاية schema.sql).</li>
          <li>أعد تشغيل الخادم وادخل إلى /admin.</li>
        </ol>
        <p className="mt-6 text-sm text-slate-500">التفاصيل الكاملة في ملف README.md.</p>
      </div>
    </main>
  );
}
