"use client";
import { supa } from "./supabase/client";

export async function api<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { data } = await supa.auth.getSession();
  const token = data.session?.access_token ?? "";
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
