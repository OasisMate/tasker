export type Board = {
  id: string;
  owner_id: string;
  title: string;
  created_at: string;
};
export type List = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
};
export type Task = {
  id: string;
  list_id: string;
  title: string;
  description?: string | null;
  position: number;
  due_date?: string | null;
  completed: boolean;
  created_at: string;
};
export type BoardBundle = { board: Board; lists: List[]; tasks: Task[] };
