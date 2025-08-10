"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Board, BoardBundle } from "@/types";

const boardsKey = ["boards"];
const boardKey = (id: string) => ["board", id];

export function useBoards() {
  return useQuery<Board[]>({
    queryKey: boardsKey,
    queryFn: () => api("/api/boards"),
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) =>
      api<Board>("/api/boards", {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    onMutate: async (title) => {
      await qc.cancelQueries({ queryKey: boardsKey });
      const prev = qc.getQueryData<Board[]>(boardsKey) || [];
      const optimistic: Board = {
        id: "optimistic-" + Math.random().toString(36).slice(2),
        owner_id: "me",
        title,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<Board[]>(boardsKey, [optimistic, ...prev]);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(boardsKey, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: boardsKey }),
  });
}

export function useBoard(id: string) {
  return useQuery<BoardBundle>({
    queryKey: boardKey(id),
    queryFn: () => api(`/api/boards/${id}`),
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/boards/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["boards"] });
      const prev = qc.getQueryData<Board[]>(["boards"]) || [];
      qc.setQueryData<Board[]>(
        ["boards"],
        prev.filter((b) => b.id !== id)
      );
      return { prev };
    },
    onError: (_e, _id, ctx) =>
      ctx?.prev && qc.setQueryData(["boards"], ctx.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
