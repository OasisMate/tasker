import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";

export function getToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

export async function requireUser(req: NextRequest) {
  const token = getToken(req);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }),
    };
  }
  const { data, error } = await supaAdmin.auth.getUser(token);
  if (error || !data.user) {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
  return { user: data.user };
}
