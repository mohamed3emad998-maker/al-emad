import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "./env";
import { createClient } from "./supabase/server";
import type { Profile, Role } from "./types";

export const getSession = cache(async (): Promise<{ userId: string; email: string; profile: Profile | null } | null> => {
  if (!isSupabaseConfigured) return null;
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { userId: user.id, email: user.email ?? "", profile: (profile as Profile) ?? null };
});

export const ROLE_ACCESS = {
  dashboard: ["admin", "editor", "reception"],
  bookings: ["admin", "reception"],
  content: ["admin", "editor"],
  settings: ["admin"],
  users: ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Area = keyof typeof ROLE_ACCESS;

export function canAccess(role: Role | null | undefined, area: Area) {
  return !!role && (ROLE_ACCESS[area] as readonly Role[]).includes(role);
}
