import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { UpdateList } from "@/lib/api/schemas";

export const runtime = "nodejs";

// ensure the list belongs to a board the user owns
async function ensureListOwner(listId: string, userId: string) {
  const { data, error } = await supaAdmin
    .from("lists")
    .select("id, board_id, boards!inner(owner_id)")
    .eq("id", listId)
    .eq("boards.owner_id", userId)
    .single();
  return !error && !!data;
}

// tiny helper: /api/lists/:id → id
function getIdFromUrl(req: NextRequest) {
  const pathname = new URL(req.url).pathname; // e.g. /api/lists/123
  const m = pathname.match(/\/api\/lists\/([^/]+)/);
  return m?.[1] ?? "";
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;

  const id = getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const parsed = UpdateList.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Bad input" }, { status: 400 });

  const ok = await ensureListOwner(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error: qErr } = await supaAdmin
    .from("lists")
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

  const ok = await ensureListOwner(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: qErr } = await supaAdmin.from("lists").delete().eq("id", id);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
