import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../globals.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم | العماد", template: "%s | لوحة تحكم العماد" },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={fontVars}>
      <body className="bg-paper text-navy">{children}</body>
    </html>
  );
}
