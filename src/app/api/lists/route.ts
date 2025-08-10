import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { CreateList } from "@/lib/api/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;
  const parsed = CreateList.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Bad input" }, { status: 400 });

  // Check board ownership
  const { data: board, error: bErr } = await supaAdmin
    .from("boards")
    .select("id")
    .eq("id", parsed.data.boardId)
    .eq("owner_id", user.id)
    .single();
  if (bErr || !board)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Default position = max+1
  let position = parsed.data.position;
  if (position === undefined) {
    const { data: maxRows } = await supaAdmin
      .from("lists")
      .select("position")
      .eq("board_id", parsed.data.boardId)
      .order("position", { ascending: false })
      .limit(1);
    position = maxRows?.[0]?.position != null ? maxRows[0].position + 1 : 0;
  }

  const { data, error: qErr } = await supaAdmin
    .from("lists")
    .insert({
      board_id: parsed.data.boardId,
      title: parsed.data.title,
      position,
    })
    .select()
    .single();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
