import { z } from "zod";

export const CreateBoard = z.object({ title: z.string().min(1) });
export const UpdateBoard = z.object({ title: z.string().min(1) });

export const CreateList = z.object({
  boardId: z.string().uuid(),
  title: z.string().min(1),
  position: z.number().int().optional(),
});
export const UpdateList = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().optional(),
});

export const CreateTask = z.object({
  listId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().optional(),
  due_date: z.string().date().optional(), // yyyy-mm-dd
});
export const UpdateTask = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  position: z.number().int().optional(),
  due_date: z.string().date().optional().nullable(),
  completed: z.boolean().optional(),
  list_id: z.string().uuid().optional(), // ⬅️ allow changing list
});
