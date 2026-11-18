import { ShieldAlert } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

export function NoAccess({ email }: { email: string }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md rounded-md border border-line bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto text-racing" size={40} />
        <h1 className="mt-4 text-xl font-bold">لا توجد صلاحية للوصول</h1>
        <p className="mt-3 leading-7 text-slate-600">
          الحساب <b dir="ltr">{email}</b> لم يُمنح دورًا بعد. اطلب من مسؤول النظام تعيين صلاحيتك من صفحة «المستخدمون والصلاحيات».
        </p>
        <div className="mt-6 flex justify-center">
          <SignOutButton className="btn-outline" />
        </div>
      </div>
    </main>
  );
}

export function Forbidden() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <ShieldAlert className="mx-auto text-racing" size={36} />
        <h1 className="mt-3 text-xl font-bold">هذه الصفحة غير متاحة لصلاحيتك</h1>
      </div>
    </div>
  );
}
