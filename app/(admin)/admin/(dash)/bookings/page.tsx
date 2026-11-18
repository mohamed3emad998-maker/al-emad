import { Suspense } from "react";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { Forbidden } from "@/components/admin/NoAccess";
import { canAccess, getSession } from "@/lib/auth";

export const metadata = { title: "الحجوزات والاستفسارات" };

export default async function Page() {
  const session = await getSession();
  const role = session?.profile?.role;
  if (!role || !canAccess(role, "bookings")) return <Forbidden />;
  return (
    <Suspense>
      <BookingsManager role={role} />
    </Suspense>
  );
}
