"use client";
import { useBoards, useCreateBoard } from "@/hooks/boards";
import BoardCard from "@/components/BoardCard";
import Loader from "@/components/Loader";
import { useState } from "react";
import { supa } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/UI";

export default function BoardsPage() {
  const router = useRouter();
  const { data, isLoading } = useBoards();
  const create = useCreateBoard();
  const [title, setTitle] = useState("");

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Boards</h2>
        <Button
          onClick={async () => {
            await supa.auth.signOut();
            router.replace("/");
          }}
        >
          Sign out
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="flex flex-col gap-3">
          <div className="text-sm font-medium">Create board</div>
          <Input
            className="w-full"
            placeholder="Board title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={() =>
              title.trim() &&
              create.mutate(title.trim(), { onSuccess: () => setTitle("") })
            }
          >
            + Create
          </Button>
        </Card>

        {data?.map((b) => (
          <BoardCard key={b.id} board={b} />
        ))}
      </div>
    </div>
  );
}
