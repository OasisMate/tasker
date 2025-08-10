Here’s a drop-in **README.md** (with API docs + deploy checklist). Paste it at the repo root.

---

# Tasker — Next.js + Supabase Kanban

Minimal Trello-style boards → lists → tasks. Email magic-link auth, App Router API routes, React Query, DnD, themed & responsive.

## Features

* Auth: Supabase email magic link
* API: thin Next.js route handlers (server-side Supabase, owner checks)
* UI: boards grid, board view with lists & task cards
* CRUD: boards / lists / tasks (+ optimistic updates)
* DnD: drag tasks across/within lists (dnd-kit)
* Theming: gradient themes with a picker
* Mobile: column snapping, scrollable lists, responsive layout

## Stack

Next.js (App Router) • TypeScript • React Query • Tailwind v4 • @supabase/supabase-js • dnd-kit

---

# Quick start

## 1) Requirements

* Node **20+**
* A Supabase project (URL + anon key + service-role key)

## 2) Environment

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## 3) Database (SQL)

Run this in Supabase SQL editor:

```sql
-- Extensions (usually already enabled)
create extension if not exists "pgcrypto";

-- Boards
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  title text not null,
  created_at timestamptz not null default now()
);

-- Lists
create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Suggested indexes
create index if not exists idx_boards_owner on boards(owner_id);
create index if not exists idx_lists_board on lists(board_id, position);
create index if not exists idx_tasks_list on tasks(list_id, position);
```

> RLS can remain **on** if you add policies, but this app calls Supabase **server-side** with the **service role** key, so RLS is effectively bypassed inside API routes. (Do **not** expose the service key to clients.)

## 4) Auth (magic link)

Supabase Dashboard → Authentication → **Turn on** Email OTP/Magic Link.
Add your local callback: `http://localhost:3000/` to Redirect URLs.

## 5) Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

---

# Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run build
npm run lint    # lint
```

---

# Project structure (high-level)

```
src/
  app/
    api/
      boards/route.ts
      boards/[id]/route.ts
      lists/route.ts
      lists/[id]/route.ts
      tasks/route.ts
      tasks/[id]/route.ts
    boards/page.tsx
    boards/[id]/page.tsx
    layout.tsx
    page.tsx
  components/
    BoardCard.tsx
    ListColumn.tsx
    TaskCard.tsx
    Loader.tsx
    UI.tsx
    dnd/
      DragDropProvider.tsx
      SortableTask.tsx
  hooks/
    boards.ts
    lists.ts
    tasks.ts
  lib/
    api.ts
    supabase/
      client.ts
      server.ts
  theme/
    palettes.ts
    ThemeProvider.tsx
```

---

# API (App Router)

All endpoints require:

```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

Get a token from `supa.auth.getSession()` on the client; our `api()` helper injects it automatically.

## Boards

* **GET** `/api/boards` → `Board[]` (current user’s boards)
* **POST** `/api/boards` `{ "title": string }` → `Board`
* **GET** `/api/boards/:id` → `{ board, lists, tasks }`
* **PATCH** `/api/boards/:id` `{ "title": string }` → `Board`
* **DELETE** `/api/boards/:id` → `{ ok: true }`

### cURL

```bash
# list boards
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/boards

# create
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"New Board"}' http://localhost:3000/api/boards

# get bundle
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/boards/<boardId>

# rename
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Renamed"}' http://localhost:3000/api/boards/<boardId>

# delete
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/boards/<boardId>
```

## Lists

* **POST** `/api/lists` `{ boardId, title, position }` → `List`
* **PATCH** `/api/lists/:id` `{ title?, position? }` → `List`
* **DELETE** `/api/lists/:id` → `{ ok: true }`

## Tasks

* **POST** `/api/tasks` `{ listId, title, description?, position? }` → `Task`
* **PATCH** `/api/tasks/:id` `{ title?, description?, position?, completed?, list_id? }` → `Task`
* **DELETE** `/api/tasks/:id` → `{ ok: true }`

### Notes

* Route handlers read the token from `Authorization` and `supaAdmin.auth.getUser(token)` to resolve `user.id`, then enforce ownership.
* Drag-and-drop updates `position` (simple integer index). For heavy reordering, consider fractional positions (e.g., `position = (prev+next)/2`) to avoid full reindexing.

---

# Theming

* Global tokens in `globals.css` using CSS variables: `--brand`, `--bg-start`, `--bg-end`, `--card`.
* Picker writes `data-theme="<blue|green|purple|orange|gray>"` to `<html>`.
* Only **primary** buttons use brand color.

---

# Known gotchas

* **Next 15 dynamic params**: in API routes, `ctx.params` can be a **Promise** — our handlers `await` it (works on 14/15). If you see `params.id` warning, rebuild (`rm -rf .next && npm run dev`).
* **Node 18 deprecation**: Supabase SDK logs a warning; use **Node 20+**.
* **Hydration mismatch**: some browser extensions inject attributes (e.g., password managers). Try an incognito window.
* **Magic link domains**: ensure your local/production URLs are in Supabase Auth → Redirect URLs.

---

# Deploy (Vercel + Supabase)

## 1) Prep

* Push `main` to GitHub (done).
* In Supabase → Auth → add production URL: `https://<your-vercel-domain>/` to Redirect URLs.

## 2) Vercel project

* Import repo on Vercel.
* Framework preset: **Next.js** (defaults are fine).
* **Environment Variables** (both Preview & Production):

  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `SUPABASE_SERVICE_ROLE_KEY` (Server/Encrypted)
* Deploy.

## 3) Post-deploy checks

* Open the live URL → sign in via magic link.
* Create a board, lists, tasks → drag cards → delete a board.
* If you see 401s: confirm the `Authorization: Bearer <token>` header is present (our `api()` helper handles this) and envs are set on Vercel.
* If `params.id` warning shows in logs: you deployed an older build. Redeploy after making sure your API routes `await ctx.params`.

---

# Demo (what to record)

* Sign in with magic link.
* Create a board → add 2–3 lists.
* Add tasks → drag across lists → edit, complete, delete.
* Delete the board from the grid.
* Switch a theme.

---

# License

MIT (or your choice).

---

If you want, I can also generate a **`.sql` seed** (a sample board with lists/tasks) and a **short Loom script** for the demo.
