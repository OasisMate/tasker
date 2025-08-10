"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BoardBundle, List, Task } from "@/types";

const boardKey = (id: string) => ["board", id];

export function useCreateList(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { boardId: string; title: string }) =>
      api<List>("/api/lists", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useUpdateList(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      id: string;
      patch: Partial<Pick<List, "title" | "position">>;
    }) =>
      api<List>(`/api/lists/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify(p.patch),
      }),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: boardKey(boardId) });
      const prev = qc.getQueryData<BoardBundle>(boardKey(boardId));
      if (prev) {
        const lists = prev.lists.map((l) =>
          l.id === id ? { ...l, ...patch } : l
        );
        qc.setQueryData<BoardBundle>(boardKey(boardId), { ...prev, lists });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) =>
      ctx?.prev && qc.setQueryData(boardKey(boardId), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useDeleteList(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/lists/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: boardKey(boardId) });
      const prev = qc.getQueryData<BoardBundle>(boardKey(boardId));
      if (prev) {
        const lists = prev.lists.filter((l) => l.id !== id);
        const tasks = prev.tasks.filter((t) => t.list_id !== id);
        qc.setQueryData<BoardBundle>(boardKey(boardId), {
          ...prev,
          lists,
          tasks,
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) =>
      ctx?.prev && qc.setQueryData(boardKey(boardId), ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}

export function useCreateTask(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      listId: string;
      title: string;
      description?: string;
    }) =>
      api<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: boardKey(boardId) }),
  });
}
