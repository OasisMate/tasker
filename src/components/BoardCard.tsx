"use client";
import Link from "next/link";
import { Board } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useDeleteBoard } from "@/hooks/boards";

export default function BoardCard({ board }: { board: Board }) {
  const qc = useQueryClient();
  const del = useDeleteBoard();
  const prefetch = () =>
    qc.prefetchQuery({
      queryKey: ["board", board.id],
      queryFn: () => api(`/api/boards/${board.id}`),
    });

  return (
    <Link
      href={`/boards/${board.id}`}
      onMouseEnter={prefetch}
      className="group card hover:shadow-sm transition relative overflow-hidden"
    >
      {/* Delete icon button */}
      <button
        type="button"
        aria-label="Delete board"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!confirm("Delete this board? This cannot be undone.")) return;
          del.mutate(board.id);
        }}
        className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full
                   border border-white/60 bg-white/70 backdrop-blur text-gray-700 shadow-sm
                   opacity-0 group-hover:opacity-100 focus:opacity-100 transition
                   hover:bg-white hover:border-white focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-2 focus-visible:outline-gray-400"
      >
        {/* trash icon (inline SVG, no extra deps) */}
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M9 3h6m-9 4h12m-1 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7m4 3v7m4-7v7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="h-16 rounded-md mb-3 board-hero" />
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{board.title}</div>
        <span className="opacity-0 group-hover:opacity-100 text-gray-500 transition">
          Open →
        </span>
      </div>
    </Link>
  );
}
