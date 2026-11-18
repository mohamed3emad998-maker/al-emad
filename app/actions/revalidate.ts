"use server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

/** Called by the dashboard after any content change so the public site updates immediately. */
export async function revalidateSite() {
  const session = await getSession();
  const role = session?.profile?.role;
  if (role !== "admin" && role !== "editor") return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
