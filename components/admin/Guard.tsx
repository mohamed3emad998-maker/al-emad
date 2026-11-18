import type { ReactNode } from "react";
import { canAccess, getSession, type Area } from "@/lib/auth";
import { Forbidden } from "./NoAccess";

/** Server-side role gate for a dashboard page. (RLS enforces the same rules in the database.) */
export async function Guard({ area, children }: { area: Area; children: ReactNode }) {
  const session = await getSession();
  if (!canAccess(session?.profile?.role, area)) return <Forbidden />;
  return <>{children}</>;
}
