"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BoardBundle, Task } from "@/types";

const boardKey = (id: string) => ["board", id];

export function useUpdateTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; patch: Partial<Task> }) =>
      api<Task>(`/api/tasks/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify(p.patch),
      }),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: boardKey(boardId) });
      const prev = qc.getQueryData<BoardBundle>(boardKey(boardId));
      if (prev) {
        const tasks = prev.tasks.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        );
        qc.setQueryData<BoardBundle>(boardKey(boardId), { ...prev, tasks });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) =>
      ctx?.prev && qc.setQueryData(boardKey(boardId), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useDeleteTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/tasks/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: boardKey(boardId) });
      const prev = qc.getQueryData<BoardBundle>(boardKey(boardId));
      if (prev) {
        const tasks = prev.tasks.filter((t) => t.id !== id);
        qc.setQueryData<BoardBundle>(boardKey(boardId), { ...prev, tasks });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) =>
      ctx?.prev && qc.setQueryData(boardKey(boardId), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}
