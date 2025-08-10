import { NextRequest, NextResponse } from "next/server";
import { supaAdmin } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { CreateTask } from "@/lib/api/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { user, error } = await requireUser(req);
  if (!user) return error!;
  const parsed = CreateTask.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Bad input" }, { status: 400 });

  // Ensure the list belongs to the user's board
  const { data: listOk } = await supaAdmin
    .from("lists")
    .select("id, board_id, boards!inner(owner_id)")
    .eq("id", parsed.data.listId)
    .eq("boards.owner_id", user.id)
    .single();
  if (!listOk)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Default position = max+1 within the list
  let position = parsed.data.position;
  if (position === undefined) {
    const { data: maxRows } = await supaAdmin
      .from("tasks")
      .select("position")
      .eq("list_id", parsed.data.listId)
      .order("position", { ascending: false })
      .limit(1);
    position = maxRows?.[0]?.position != null ? maxRows[0].position + 1 : 0;
  }

  const { data, error: qErr } = await supaAdmin
    .from("tasks")
    .insert({
      list_id: parsed.data.listId,
      title: parsed.data.title,
      description: parsed.data.description,
      position,
      due_date: parsed.data.due_date,
    })
    .select()
    .single();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
