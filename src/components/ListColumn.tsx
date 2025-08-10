"use client";
import { List, Task } from "@/types";
import SortableTask from "./dnd/SortableTask";
import { useCreateTask, useDeleteList, useUpdateList } from "@/hooks/lists";
import { useDeleteTask, useUpdateTask } from "@/hooks/tasks";
import { useState } from "react";
import { Button, Input, Textarea } from "./UI";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

type Props = { list: List; tasks: Task[]; boardId: string };

function DroppableContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

export default function ListColumn({ list, tasks, boardId }: Props) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [title, setTitle] = useState(list.title);

  const createTask = useCreateTask(boardId);
  const updateList = useUpdateList(boardId);
  const delList = useDeleteList(boardId);
  const updateTask = useUpdateTask(boardId);
  const delTask = useDeleteTask(boardId);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input
          className="bg-transparent text-sm font-medium outline-none min-w-0"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() =>
            title.trim() &&
            title !== list.title &&
            updateList.mutate({ id: list.id, patch: { title: title.trim() } })
          }
        />
        <button
          className="text-xs text-red-600 shrink-0"
          onClick={() => delList.mutate(list.id)}
        >
          Delete
        </button>
      </div>

      {/* DnD container: make the list droppable + items sortable */}
      <DroppableContainer id={list.id}>
        <SortableContext
          id={list.id}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {tasks.map((t) => (
              <SortableTask
                key={t.id}
                task={t}
                onToggle={(c) =>
                  updateTask.mutate({ id: t.id, patch: { completed: c } })
                }
                onEdit={() => {
                  const nt = prompt("New title", t.title);
                  if (nt && nt !== t.title)
                    updateTask.mutate({ id: t.id, patch: { title: nt } });
                }}
                onDelete={() => delTask.mutate(t.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DroppableContainer>

      <div className="mt-3 space-y-2">
        <Input
          className="w-full"
          placeholder="New task title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <Textarea
          className="w-full"
          placeholder="Description (optional)"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
        />
        <Button
          variant="primary"
          className="w-full sm:w-auto"
          onClick={() => {
            const t = taskTitle.trim();
            if (!t) return;
            createTask.mutate(
              { listId: list.id, title: t, description: taskDesc || undefined },
              {
                onSuccess: () => {
                  setTaskTitle("");
                  setTaskDesc("");
                },
              }
            );
          }}
        >
          + Add Task
        </Button>
      </div>
    </div>
  );
}
