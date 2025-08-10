import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { UpdateList } from "@/lib/api/schemas";

export const runtime = "nodejs";

// Next 14/15 compatible params helper
type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };
async function getId(ctx: Ctx) {
  const p = await ctx.params;
  return p.id as string;
}

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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;
  const id = await getId(ctx);

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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;
  const id = await getId(ctx);

  const ok = await ensureListOwner(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error: qErr } = await supaAdmin.from("lists").delete().eq("id", id);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
