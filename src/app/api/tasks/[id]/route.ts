import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { UpdateTask } from "@/lib/api/schemas";

export const runtime = "nodejs";

function getIdFromUrl(req: NextRequest) {
  const m = new URL(req.url).pathname.match(/\/api\/tasks\/([^/]+)/);
  return m?.[1] ?? "";
}

// ensure task belongs to a list whose board the user owns
async function ensureTaskOwner(taskId: string, userId: string) {
  const { data, error } = await supaAdmin
    .from("tasks")
    .select("id, list_id, lists!inner(board_id, boards!inner(owner_id))")
    .eq("id", taskId)
    .eq("lists.boards.owner_id", userId)
    .single();
  return !error && !!data;
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const parsed = UpdateTask.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Bad input" }, { status: 400 });

  const ok = await ensureTaskOwner(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error: qErr } = await supaAdmin
    .from("tasks")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const ok = await ensureTaskOwner(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: qErr } = await supaAdmin.from("tasks").delete().eq("id", id);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
