"use client";
import { useParams, useRouter } from "next/navigation";
import { useBoard } from "@/hooks/boards";
import { useDeleteBoard } from "@/hooks/boards";
import Loader from "@/components/Loader";
import ListColumn from "@/components/ListColumn";
import { useCreateList } from "@/hooks/lists";
import { useState, useMemo, useCallback } from "react";
import { Button, Input } from "@/components/UI";
import DragDropProvider from "@/components/dnd/DragDropProvider";
import { useUpdateTask } from "@/hooks/tasks";
import type { Task } from "@/types";
import type { DragEndEvent } from "@dnd-kit/core";

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useBoard(id);
  const delBoard = useDeleteBoard();
  const createList = useCreateList(id);
  const updateTask = useUpdateTask(id);
  const [title, setTitle] = useState("");

  const board = data?.board;
  const lists = data?.lists ?? [];
  const tasks = data?.tasks ?? [];

  const tasksByList = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const l of lists) map[l.id] = [];
    for (const t of tasks) (map[t.list_id] ||= []).push(t);
    for (const lid in map)
      map[lid].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return map;
  }, [lists, tasks]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      if (!active || !over) return;
      const movingId = String(active.id);
      const fromListId = active.data.current?.sortable?.containerId as
        | string
        | undefined;
      const toListId = over.data.current?.sortable?.containerId as
        | string
        | undefined;
      if (!fromListId || !toListId) return;

      const to = tasksByList[toListId] || [];
      const overId = String(over.id);
      const idx = to.findIndex((t) => t.id === overId);
      const toIndex = idx >= 0 ? idx : to.length;

      updateTask.mutate({
        id: movingId,
        patch: { list_id: toListId, position: toIndex },
      });
    },
    [tasksByList, updateTask]
  );

  if (isLoading || !board) return <Loader />;

  return (
    <div className="space-y-4">
      {/* Responsive header */}
      <div className="rounded-xl p-4 text-white board-hero">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="text-white/90 self-start"
            onClick={() => router.push("/boards")}
          >
            ← Boards
          </button>

          <h2 className="text-xl font-semibold text-white">{board.title}</h2>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              className="w-full sm:w-56 bg-white/90 text-gray-900 placeholder:text-gray-700"
              placeholder="New list title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() =>
                title.trim() &&
                createList.mutate(
                  { boardId: board.id, title: title.trim() },
                  { onSuccess: () => setTitle("") }
                )
              }
              className="bg-white !text-black border-white hover:opacity-90"
            >
              + Add List
            </Button>
            <Button
              onClick={() => {
                if (!confirm("Delete this board? This cannot be undone."))
                  return;
                delBoard.mutate(board.id, {
                  onSuccess: () => router.push("/boards"),
                });
              }}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              Delete Board
            </Button>
          </div>
        </div>
      </div>

      {/* Columns */}
      <DragDropProvider onDragEnd={onDragEnd}>
        <div
          className="-mx-3 px-3 sm:mx-0 sm:px-0 flex gap-4 overflow-x-auto pb-3
                snap-x snap-mandatory scroll-pt-3"
        >
          {lists.map((l) => (
            <div
              key={l.id}
              className="col"
              style={{ borderTop: "4px solid rgb(var(--brand))" }}
            >
              <ListColumn
                list={l}
                tasks={tasksByList[l.id] || []}
                boardId={board.id}
              />
            </div>
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}
