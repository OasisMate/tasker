import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { UpdateBoard } from "@/lib/api/schemas";

export const runtime = "nodejs";

function getIdFromUrl(req: NextRequest) {
  const m = new URL(req.url).pathname.match(/\/api\/boards\/([^/]+)/);
  return m?.[1] ?? "";
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;

  const boardId = getIdFromUrl(req);
  if (!boardId) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const { data: board, error: bErr } = await supaAdmin
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .eq("owner_id", user.id)
    .single();
  if (bErr || !board)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: lists, error: lErr } = await supaAdmin
    .from("lists")
    .select("*")
    .eq("board_id", boardId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  const listIds = (lists ?? []).map((l) => l.id);
  const { data: tasks, error: tErr } = await supaAdmin
    .from("tasks")
    .select("*")
    .in(
      "list_id",
      listIds.length ? listIds : ["00000000-0000-0000-0000-000000000000"]
    )
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  return NextResponse.json({ board, lists, tasks });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const parsed = UpdateBoard.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Bad input" }, { status: 400 });

  const { data, error: qErr } = await supaAdmin
    .from("boards")
    .update({ title: parsed.data.title })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();
  if (qErr || !data)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const { error: qErr } = await supaAdmin
    .from("boards")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
