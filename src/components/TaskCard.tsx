"use client";
import { Task } from "@/types";
import { Button } from "./UI";

type Props = {
  task: Task;
  onToggle: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-md border p-3 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div
          className={`text-sm ${
            task.completed ? "line-through text-gray-400" : ""
          }`}
        >
          {task.title}
        </div>
      </div>
      {task.description && (
        <div className="text-xs text-gray-500 mt-1">{task.description}</div>
      )}
      <div className="mt-2 flex gap-2">
        <Button className="text-xs px-2 py-1">Edit</Button>
        <Button className="text-xs px-2 py-1 text-red-600" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
