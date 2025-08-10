import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { CreateBoard } from "@/lib/api/schemas";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;
  const { data, error: qErr } = await supaAdmin
    .from("boards")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;
  const parsed = CreateBoard.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Bad input" }, { status: 400 });

  const { data, error: qErr } = await supaAdmin
    .from("boards")
    .insert({ title: parsed.data.title, owner_id: user.id })
    .select()
    .single();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
