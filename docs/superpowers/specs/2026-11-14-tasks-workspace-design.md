# Tasks workspace — Design

**Status:** proposed
**Date:** 2026-11-14
**Scope:** frontend only (`frontend-app`). The backend (`backend/`) is read-only for this change.

---

## 1. Intent

`/tasks` is the product's real surface, but today it is a thin read-only list wrapped in the marketing header. The change turns it into a workspace: the visitor authenticates or is sent home, the app shell drops the marketing navigation, the session's owner is always visible, the health of the API is always visible, and the owner can read, create, change and remove tasks without leaving the page.

## 2. Goals

- `/tasks` is reachable only with a live session. Without one the visitor lands on `/` and the sign-in dialog opens.
- `/tasks` renders its own header: no marketing links, no "Comenzar" call to action.
- The header carries the signed-in user's identity and a live indicator of the API's health, polled every 20 seconds against `GET /api/healthcheck`.
- Pressing that indicator opens a menu whose only action is signing out.
- The main section is a table of the caller's tasks, filterable by status.
- Every row exposes three actions through a menu: view, edit, delete.
- Viewing shows a read-only modal with the task's data.
- Editing opens a form dialog. An `ADMIN` may change every field; a `USER` may change the status only.
- The "Asignado" field is a searchable select over the `USER` accounts, sorted by name.
- A "Crear Tarea" button above the table opens the same dialog empty; saving creates the task, saving an edit updates it.

## 3. Non-goals

- No server-side changes. The missing `GET /api/users` endpoint is consumed as specified by the backend's own plan and is not worked around.
- No pagination UI. The backend paginates; the client asks for `limit=100` and shows the total.
- No dark mode, no i18n, no offline mode, no bulk actions, no task comments, no due dates. The task model has no such fields.
- No redesign of the marketing pages, the auth dialog, or the footer.

## 4. Anti-goals

- A visible control that always fails. A control is hidden when the caller is known to be refused by the server.
- A second source of truth for the task list. The table renders exactly what the server returned for the active filter.
- Client-side role enforcement as a security boundary. The server remains the only authority; the client only mirrors what the server already says to avoid dead ends.

## 5. Constraints

### 5.1 What the server exposes today

| Need | Endpoint | Contract | Notes |
|---|---|---|---|
| Session | `GET /api/auth/get-session` | `AuthSession \| null` (`null`, never `401`) | Cookie session, `withCredentials` already on |
| Sign out | `POST /api/auth/sign-out` | `{ success: true }` | Idempotent, clears the cookie |
| Health | `GET /api/healthcheck` | `{ status, server: { status, uptimeSeconds, timestamp }, database: { status, latencyMs } }` | Public, **not** rate-limited, sends `Cache-Control: no-store` |
| List | `GET /api/tasks?status=&page=&limit=` | `{ items: Task[], pagination: { page, limit, total, totalPages } }` | **Already scoped by role**: an `ADMIN` sees the tasks they created, a `USER` the tasks assigned to them |
| Read one | `GET /api/tasks/:id` | `Task` | Not role-scoped yet (backend plan Task 3 pending) — therefore unused by this design |
| Create | `POST /api/tasks` | body `{ title, assigneeId, status? }` → `201 Task` | **`ADMIN` only**; `creatorId` is derived from the session |
| Update | `PATCH /api/tasks/:id` | body `{ title?, status?, assigneeId? }` → `200 Task` | Today a `USER` may send `title` on a task assigned to them; the target backend (plan Task 3) refuses it. The client sends `status` only, which is valid under both. |
| Delete | `DELETE /api/tasks/:id` | `204` | Today a `USER` may delete a task assigned to them; the target backend (plan Task 3) refuses it. The client hides the action from `USER`, which is the stricter of the two. |

Task payload: `{ id, title, status, creatorId, assigneeId, createdAt, updatedAt }`, `status ∈ { pending, in_progress, done }`. The frontend's `Task` type is missing `creatorId` today — it gets added.

### 5.2 The missing users endpoint

`GET /api/users` **does not exist yet**. The backend's own plan (`backend/docs/superpowers/plans/2026-11-14-task-scope-and-users-endpoint.md`, Task 4) specifies it precisely:

```
GET /api/users  →  200 [ { id, name, email, role } ]   // role === 'USER' only, ADMIN-only route
```

ordered by `name` ascending. This frontend is written against that exact contract. The endpoint is `ADMIN`-only and only `ADMIN` can create or reassign a task, so the two surfaces line up.

The listing holds only `USER` accounts, while the server's `assigneeExists` accepts **any** account id, including an administrator's own. Two consequences:

- An administrator cannot pick another administrator in the combobox. Assigning to themselves is still possible by typing the id.
- A task assigned to an administrator never resolves to a name; the table shows the raw id in a subdued style.

Because the endpoint may answer `404` (not implemented yet) or `403` (caller is not an `ADMIN`), the assignee field degrades instead of breaking:

- `404` → the select shows "El listado de usuarios no está disponible en el servidor." and collapses into a plain text input for the id.
- `403` → the select shows "Necesitas permisos de administrador para consultar los usuarios." and degrades the same way.

In the degraded mode the helper text tells the administrator where to find an id: the ids shown in the "Asignado" column of the table, and their own id, which the client knows from the session. The create flow therefore stays usable before the backend lands the endpoint, and the combobox lights up with no frontend change afterwards.

### 5.3 Environment constraints

- No `lint` and no `build` are run by the agent. The human partner runs them.
- The server code is read-only for this change.

### 5.4 Two environment realities the plan must respect

**The write endpoints only work from the dev server.** The backend trusts the origins `http://localhost:3000` and `http://localhost:5173` (`backend/src/middleware/origin.ts`) and `CORS_ORIGINS` holds only `http://localhost:5173`. `npm run dev` (port 5173, proxied by Vite) therefore works, but `npm run preview` (port 4173) makes every `POST`, `PATCH` and `DELETE` fail with `403 forbidden`. The design is verified against `npm run dev`.

**No account can be created as `ADMIN` through the API.** The backend declares the role as an additional field with `input: false` (`backend/src/lib/auth.ts`), so the role a client sends at sign-up is ignored and every new account is a `USER`. The sign-up form's role radio therefore does nothing today. Reaching the administrator flows by hand requires promoting an account in the database:

```bash
sqlite3 backend/data/app.db "UPDATE user SET role = 'ADMIN' WHERE email = 'tu@correo.com';"
```

This is a documented manual step, not a code change: the backend is out of scope for this work. The role radio's fate is decided by the human partner (see §8).

### 5.5 Project conventions to follow

- React 19 + TypeScript + Vite 8, `react-router-dom` v7 with declarative `<Routes>`.
- TanStack Query v5 for server state, TanStack Form + Zod for forms, Axios with `baseURL: '/api'` and `withCredentials: true`.
- Vite proxies `/api` → `http://localhost:3000` in both `dev` and `preview`.
- Styling is custom CSS in `src/App.css` using BEM-ish class names and the CSS custom properties (`--ink`, `--ink-muted`, `--ink-subtle`, `--line`, `--primary`, `--success`, `--surface`, `--canvas`, `--radius`). Tailwind v4 is installed but the app does not use utilities; the new styles follow the existing convention.
- Modals use the native `<dialog>` element driven by `showModal()`/`close()`, exactly like `AuthDialog`.
- Base UI (`@base-ui/react`) is the primitive library: `Tabs` is already used in the auth dialog.
- Toasts go through `src/lib/toast-store.ts` (`notifyToast`).
- API errors are humanised through `getApiErrorMessage()` in `src/lib/api/errors.ts`.
- Tests are Vitest + Testing Library, located next to the code (`src/pages/TasksPage.test.tsx`).

---

## 6. Approaches considered

### 6.1 Primitives for the row menu, the header menu and the assignee select

| Approach | Trade-off |
|---|---|
| **A. Base UI `Menu` + Base UI `Combobox`** (chosen) | Keyboard navigation, focus trapping and ARIA come from the library. `Combobox` gives a real searchable select. Cost: the frontend leans on Base UI's collection API for the combobox. |
| B. Hand-rolled `<button>` + conditional `<ul>` menus | No new dependency surface, but every menu needs its own focus management, `Escape` handling, click-outside handling and ARIA wiring, written and tested by hand. |
| C. Native `<select>` / `<details>` | Cheap, but a native `<select>` cannot be searched, and `<details>` menus are poor with a mouse and worse with a keyboard. |

Chosen: **A**. The project already depends on Base UI, the requirement explicitly asks for a searchable select and a dropdown menu, and A is the only option that delivers both accessibly without inventing them.

### 6.2 Where the task list comes from

| Approach | Trade-off |
|---|---|
| **A. Server-side filtering** (chosen) | `GET /api/tasks?status=…` returns exactly the filtered page, and the totals describe the filtered set. The filter is the server's. |
| B. Client-side filtering | The whole list is fetched once and filtered in the browser. Diverges from the server's totals, breaks at the pagination limit, and ignores the scoping the server already applies. |

Chosen: **A**. The server exposes the filter and already scopes the list by role, so the client's only job is to send the filter and render what comes back.

### 6.3 The "Ver tarea" modal

| Approach | Trade-off |
|---|---|
| **A. Render the row's data** (chosen) | No request, no flash, and it cannot disagree with the table. The row already holds every field the modal shows. |
| B. `GET /api/tasks/:id` on open | Fetches the authoritative record, but that endpoint is not role-scoped yet, and the user asked for "only the task's data", which is exactly what the row holds. |

Chosen: **A**.

### 6.4 The sign-out action

| Approach | Trade-off |
|---|---|
| **A. `POST /api/auth/sign-out`, then drop the session query and navigate to `/`** (chosen) | Ends the session server-side, clears the cookie, and leaves no stale session in the query cache. |
| B. Drop the client cache only | The cookie survives, so a refresh silently restores the session. Wrong. |

Chosen: **A**.

---

## 7. The design

### 7.1 Routing and layout

`/tasks` leaves the marketing layout and gets its own shell.

```
src/App.tsx
  <Routes>
    <Route element={<SiteLayout />}>          // marketing shell: HomeHeader + Outlet + HomeFooter
      <Route index element={<HomePage />} />
      <Route path="tech-stack" element={<TechStackPage />} />
      <Route path="uso-de-la-ia" element={<AiUsagePage />} />
      <Route path="candidato" element={<CandidatePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>

    <Route
      path="tasks"
      element={
        <RequireAuth>
          <TasksLayout>
            <TasksPage />
          </TasksLayout>
        </RequireAuth>
      }
    />
  </Routes>
```

`tasks` is a static segment, so it outranks the splat `*` of the marketing branch: `/tasks` renders the workspace shell, every other unknown URL still renders `NotFoundPage` inside the marketing shell.

`RequireAuth` already exists and already does the right thing: it waits for `GET /api/auth/get-session`, renders a "Comprobando tu sesión…" state, shows an error state with a retry button, and finally redirects to `/` with `state={{ openAuth: true }}`, which the `AuthDialogProvider` turns into an open sign-in dialog. **No change to `RequireAuth` is needed.**

`TasksLayout` (new, `src/components/layout/TasksLayout.tsx`) mirrors `SiteLayout`'s chrome minus the marketing navigation:

- the same skip link (`Saltar al contenido` → `#contenido`),
- `TasksHeader`,
- the children,
- `HomeFooter` — the footer stays; only the header was asked to change.

### 7.2 `TasksHeader`

`src/components/tasks/TasksHeader.tsx`

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [✓] Tarea │ Prueba técnica      Ana Pérez  ana@example.com  [ADMIN]        │
│                                        ● Servidor conectado  ▾            │
└────────────────────────────────────────────────────────────────────────────┘
```

From left to right:

1. **Brand** — the same mark and wordmark as the marketing header, still a link to `/`. It is identity, not navigation between sections, and it gives the visitor a way out of the workspace.
2. **User block** — avatar initial, name, email, and a role badge that reads `ADMIN` or `USUCIÓN`… precisely: the badge reads `ADMIN` or `Usuario`. The role string comes from `session.user.role`.
3. **Health indicator** — a Base UI `Menu` trigger. The trigger is a pill with a status dot, a label and a chevron.

The health trigger's label is one of:

| State | Dot | Label |
|---|---|---|
| First check in flight | amber, pulsing | `Comprobando…` |
| Last check succeeded | green | `Servidor conectado` |
| Last check failed | red | `Sin conexión` |

The status text lives in an `aria-live="polite"` region so a screen reader announces a change of connectivity without stealing focus.

The menu that opens contains:

- a non-interactive line with the last check time (`Última comprobación: 12:04:31`) and the API's reported uptime,
- a separator,
- the action **Cerrar sesión**.

### 7.3 Health polling

`src/lib/api/healthcheck.ts` + `src/features/tasks/use-healthcheck.ts`

```ts
useQuery({
  queryKey: ['healthcheck'],
  queryFn: getHealthcheck,
  refetchInterval: 20_000,
  refetchIntervalInBackground: false,   // no polling on a hidden tab
  refetchOnWindowFocus: true,           // overrides the shared default of false
  staleTime: 15_000,
  retry: 1,
})
```

- `GET /api/healthcheck`, no body, no credentials needed (public route), but the shared Axios instance is used anyway.
- `refetchIntervalInBackground: false` stops the timer when the tab is hidden, so a background tab does not keep the network busy.
- `refetchOnWindowFocus: true` **overrides the shared client's `false`**: the indicator would otherwise keep displaying a reading that is up to 20 seconds old, which is exactly the information the visitor is reading. One extra request per focus is the price of an honest indicator.
- `retry: 1` so a single transient failure does not flip the indicator to red permanently; the indicator reads `Sin conexión` only after the request actually fails.
- The query is mounted only by `TasksHeader`, so the polling exists only on `/tasks`.

### 7.4 Signing out

`src/lib/api/auth.ts` gains:

```ts
export async function signOut() {
  const response = await apiClient.post('/auth/sign-out')
  return response.data
}
```

`src/features/auth/use-auth.ts` gains `useSignOutMutation()`:

- on success: `queryClient.removeQueries({ queryKey: ['session'] })`, `notifyToast({ tone: 'success', title: 'Sesión cerrada.', message: 'Has cerrado sesión en este dispositivo.' })`, `navigate('/')`.
- on error: `notifyToast({ tone: 'error', … })` with `getApiErrorMessage(error)`, and the session stays.

Because the route is guarded by `RequireAuth`, the removal of the session query makes `/tasks` redirect to `/` on the next navigation.

#### Session expiry while the workspace is open

`RequireAuth` checks the session once, on mount. If the cookie expires afterwards, `GET /api/tasks` answers `401 authentication-required` and the mutations answer `401` too.

The client answers that with one shared helper in `src/features/tasks/use-tasks.ts`:

```ts
function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
```

When a query or a mutation fails with `401`, the helper calls `queryClient.removeQueries({ queryKey: ['session'] })`. `RequireAuth` re-renders with no session and redirects to `/` with `state={{ openAuth: true }}`, so the visitor lands on the home page with the sign-in dialog open — the same path as a first-time visitor. No separate expiry screen is built.

Every `401` therefore ends in the guard, and no error copy about expired sessions is needed.

### 7.5 The tasks table

`src/pages/TasksPage.tsx` is rewritten. Structure:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Tus tareas                                                              │
│  Gestiona el trabajo del equipo…                          [ Crear Tarea ] │
├────────────────────────────────────────────────────────────────────────────┤
│  [Todas 12] [Pendiente 4] [En curso 5] [Hecha 3]            12 tareas     │
├────────────────────────────────────────────────────────────────────────────┤
│  Tarea                              Estado      Asignado     Actualizada  ⋮  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Preparar la entrega                En curso    Ana Pérez    14 nov 12:04 ⋮ │
│  Revisar el contrato                Pendiente   Luis Gómez   13 nov 09:12 ⋮ │
└────────────────────────────────────────────────────────────────────────────┘
```

**Columns:** `Tarea` (title), `Estado` (status badge), `Asignado` (assignee name), `Actualizada` (relative or absolute date), and a final column holding the row's action menu.

**Status filter** — a segmented control of buttons (`Todas`, `Pendiente`, `En curso`, `Hecha`) above the table, rendered as a `role="group"` with `aria-pressed` on the active one. Selecting one refetches with `?status=…`; `Todas` sends no `status` parameter. The count next to the filter comes from `pagination.total` of the **active** filter, so it always describes what the table shows.

**Pagination** — the request is `GET /api/tasks?page=1&limit=100`. `pagination.total` is displayed as "N tareas". If `total > items.length`, a quiet line under the table says that only the first 100 are shown. No pager.

**Assignee name** — resolved from the users list when it is available. For a `USER` the caller sees only their own tasks, so the name is the caller's own name from the session. When the name cannot be resolved, the cell shows the raw id in a subdued style.

**Row action menu** — a Base UI `Menu` whose trigger is an icon button (`⋮`) with `aria-label="Acciones de la tarea <title>"`. Items:

| Item | Behaviour |
|---|---|
| **Ver tarea** | Opens the read-only detail modal |
| **Editar** | Opens the form dialog in edit mode |
| **Eliminar** | Asks for confirmation, then `DELETE /api/tasks/:id` |

**Eliminar is shown to `ADMIN` only.** The target backend behaviour restricts deletion to administrators, and a menu item that always answers `403` is a dead end. The choice was made by the human partner.

Deletion asks for confirmation first, in a `role="alertdialog"`-styled native `<dialog>`: the task title is repeated, the action is irreversible, and the confirm button is destructive. On success the task disappears from the table and a success toast appears. On `404` the toast says the task no longer exists and the table refetches. On `403` the toast explains the permission problem.

### 7.6 The "Ver tarea" modal

`src/components/tasks/TaskDetailDialog.tsx`

A native `<dialog>` in the same shape as `AuthDialog` (`showModal()`, a `::backdrop`, an escape key and a close button). The body is a read-only definition list:

- **Título** — the task title.
- **Estado** — the status badge.
- **Asignado** — the assignee's name, or the id when it cannot be resolved.
- **Creada** — `createdAt` formatted `es-ES`.
- **Actualizada** — `updatedAt` formatted `es-ES`.
- **Identificador** — the task id, in a monospace, subdued style.

No editable control, no form, no save button.

### 7.7 The form dialog (create and edit)

`src/components/tasks/TaskFormDialog.tsx`

One component, two modes.

| Field | `ADMIN` | `USER` | Create mode |
|---|---|---|---|
| Título | editable, required | read-only | editable, required |
| Estado | editable | editable | editable |
| Asignado | editable (combobox) | absent | editable (combobox), required |

`USER` sees the title as read-only text and only the status as an editable control, and the payload sent to the server contains **only** `status`. This mirrors the server rule (a `USER` may only change the status of a task assigned to them) and stays correct when the backend's stricter rule lands.

**Validation** — Zod, matching the server's contract:

```ts
const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Escribe un título.').max(200, 'Máximo 200 caracteres.'),
  status: z.enum(['pending', 'in_progress', 'done']),
  assigneeId: z.string().trim().min(1, 'Elige un responsable.').max(64),
})
```

The `assigneeId` rule applies only when the field is present (create mode, or an `ADMIN` edit). The form is built with TanStack Form, exactly like `SignInForm`: `form.Field` per field, `getValidationMessage(field.state.meta.errors[0])` for the message, and `focusFirstInvalidField` for the focus behaviour.

**Payloads**

| Situation | Request |
|---|---|
| Create, `ADMIN` | `POST /api/tasks` `{ title, assigneeId, status }` |
| Edit, `ADMIN` | `PATCH /api/tasks/:id` `{ title, status, assigneeId }` |
| Edit, `USER` | `PATCH /api/tasks/:id` `{ status }` |

The edit payload sends only the fields the caller may change, never the untouched ones, so a `USER` can never provoke a `403` for touching a title.

**Save** — the submit button is disabled while the mutation is in flight and reads `Guardando…`. On success the dialog closes, the tasks list is invalidated and refetched, and a toast confirms (`Tarea creada.` / `Tarea actualizada.`). On failure the error is rendered inline in the dialog, using `getApiErrorMessage(error)`, and the dialog stays open with the user's input intact.

### 7.8 The "Asignado" combobox

`src/components/tasks/AssigneeCombobox.tsx`

A Base UI `Combobox`:

- `Combobox.Root` with `items` = the users array, `value` = the selected user id, `onValueChange` = the form setter, `filter` = a case-insensitive match over `name` and `email`.
- `Combobox.Input` is the search box. `Combobox.Portal` → `Combobox.Positioner` → `Combobox.Popup` → `Combobox.List` → `Combobox.Item` for each user, `Combobox.Empty` when nothing matches.
- Each item shows the name in bold and the email underneath.
- The list is the users array **already sorted by name** (the server's order is by `name`; the client additionally sorts by `name` then `email` with `localeCompare` so the order is stable regardless of the server's collation).
- The field is **not** a free-text id entry by default: it is a real select. But when the users endpoint is unavailable the component degrades to a plain text input for the id, so an administrator can still create a task.

### 7.9 Data layer

`src/lib/api/tasks.ts` grows:

```ts
export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  creatorId: string
  assigneeId: string
  createdAt: string
  updatedAt: string
}

export interface TasksResponse { items: Task[]; pagination: {...} }

export async function listTasks(params?: { status?: TaskStatus; page?: number; limit?: number })
export async function createTask(input: { title: string; assigneeId: string; status: TaskStatus })
export async function updateTask(id: string, input: { title?: string; status?: TaskStatus; assigneeId?: string })
export async function deleteTask(id: string)
```

`src/lib/api/users.ts` (new):

```ts
export interface UserSummary { id: string; name: string; email: string; role: UserRole }
export async function listUsers(): Promise<UserSummary[]>
```

`src/lib/api/healthcheck.ts` (new):

```ts
export interface HealthcheckReport {
  status: 'ok'
  server: { status: 'up'; uptimeSeconds: number; timestamp: string }
  database: { status: 'up'; latencyMs: number }
}
export async function getHealthcheck(): Promise<HealthcheckReport>
```

`src/lib/api/errors.ts` gains three mappings so server problems read in Spanish:

- `'task-not-found'` → `La tarea ya no existe.`
- `'assignee-not-found'` → `El responsable indicado no existe.`
- `'validation-error'` → `Revisa los datos introducidos e inténtalo de nuevo.`

The third one matters: the backend's own Zod failures use the kebab-case code `validation-error`, while the map only held Better Auth's `VALIDATION_ERROR`. Without it, a `422` from a task endpoint would render the English `detail` of the problem document inside a Spanish interface.

**Query keys**

| Key | Used by |
|---|---|
| `['session']` | `RequireAuth`, the header's user block |
| `['healthcheck']` | the header's indicator |
| `['tasks', { status }]` | the table |
| `['users']` | the assignee combobox |

The tasks key includes the filter so switching filters does not reuse another filter's cache. Every mutation invalidates `['tasks']`.

### 7.10 Roles in the interface

| Capability | `ADMIN` | `USER` |
|---|---|---|
| See the table | Yes, the tasks they created | Yes, the tasks assigned to them |
| "Ver tarea" | Yes | Yes |
| "Editar" | Yes, all fields | Yes, status only |
| "Eliminar" | Yes | **No** (hidden) |
| "Crear Tarea" | Yes | **No** (hidden) |
| "Asignado" field | Yes | Not shown |

The session's role comes from `session.user.role`. The server remains the authority; the client hides what the server would refuse, so the visitor never meets a dead control.

### 7.11 Styling

New blocks appended to `src/App.css`, following the file's existing conventions (`--line` borders, `--surface`/`--canvas` backgrounds, `--ink`/`--ink-muted`/`--ink-subtle` text, `--primary` for actions, `--success` for healthy states, `--destructive` for removals):

- `.tasks-header`, `.tasks-header__inner`, `.tasks-header__brand`, `.tasks-user`, `.tasks-user__avatar`, `.tasks-user__meta`, `.tasks-user__name`, `.tasks-user__email`, `.tasks-user__role`
- `.health-pill`, `.health-pill__dot`, `.health-pill__dot--ok`, `.health-pill__dot--down`, `.health-pill__dot--checking`, `.health-pill__label`
- `.app-menu`, `.app-menu__content`, `.app-menu__item`, `.app-menu__item--danger`, `.app-menu__separator`, `.app-menu__meta`
- `.tasks-toolbar`, `.tasks-filters`, `.tasks-filter`, `.tasks-filter--active`, `.tasks-table`, `.tasks-table__head`, `.tasks-table__body`, `.tasks-table__cell`, `.tasks-table__row`, `.tasks-table__actions`, `.tasks-table__empty`
- `.task-badge`, `.task-badge--pending`, `.task-badge--in_progress`, `.task-badge--done`
- `.task-dialog`, `.task-dialog__surface`, `.task-dialog__header`, `.task-dialog__grid`, `.task-dialog__row`, `.task-dialog__actions`
- `.task-form`, `.task-field`, `.task-field__label`, `.task-field__error`
- `.assignee-combobox`, `.assignee-combobox__input`, `.assignee-combobox__popup`, `.assignee-combobox__item`, `.assignee-combobox__item--selected`, `.assignee-combobox__empty`, `.assignee-combobox__hint`
- `.confirm-dialog`

The existing `.tasks-hero`, `.tasks-profile` and `.tasks-list` blocks are replaced by the new workspace blocks; nothing else in the file references them.

### 7.12 Accessibility

- The status filter is a `role="group"` of buttons with `aria-pressed`.
- The row menu trigger is a real `<button>` with an `aria-label` naming the task.
- Both dialogs are native `<dialog>` elements opened with `showModal()`, so the focus is trapped and `Escape` closes them; both restore focus to their trigger on close.
- The health status text is inside an `aria-live="polite"` region.
- The table is a real `<table>` with a `<caption class="visually-hidden">`, a `<thead>` with `scope="col"` headers and a `<tbody>`.
- The status badge carries its own text, not only a colour.
- Every control has a visible focus ring, matching the rest of the app.
- The combobox follows the ARIA combobox pattern through Base UI.

### 7.13 Tests

`src/pages/TasksPage.test.tsx` is extended (Vitest + Testing Library, the existing setup). The existing three cases stay green. New cases:

1. **Guard** — without a session, `/tasks` renders the home page and opens the sign-in dialog. (Exists.)
2. **Header** — with a session, the header shows the user's name, email and role, and the marketing navigation links are absent.
3. **Health indicator** — the header triggers `GET /api/healthcheck` and shows the connected state; on a rejected request it shows the disconnected state.
4. **Polling** — the health request is repeated after 20 seconds (fake timers).
5. **Table** — the tasks from the server are rendered as rows with their status, assignee and updated date.
6. **Filter** — choosing a status refetches with `?status=…` and the count reflects the filtered set.
7. **Row menu** — "Ver tarea" opens a modal with the task's data and no editable controls.
8. **Edit as `ADMIN`** — the dialog exposes the title, the status and the assignee; saving sends `PATCH /api/tasks/:id` with the three fields.
9. **Edit as `USER`** — the dialog exposes only the status; saving sends `PATCH /api/tasks/:id` with `{ status }` alone.
10. **Create** — "Crear Tarea" opens an empty dialog; saving sends `POST /api/tasks` with the title, the assignee and the status.
11. **Delete** — as an `ADMIN`, confirming the removal sends `DELETE /api/tasks/:id` and the table refreshes; as a `USER` the menu has no "Eliminar" item.
12. **Sign out** — the menu's "Cerrar sesión" sends `POST /api/auth/sign-out` and returns to `/`.
13. **Expired session** — when the tasks request answers `401`, the app drops the session query, returns to `/` and opens the sign-in dialog.
14. **Users endpoint unavailable** — when `GET /api/users` answers `404`, the assignee field falls back to a text input and the create flow still sends `POST /api/tasks` with the typed id.

The suite keeps mocking `apiClient.get`/`post`/`patch`/`delete`, as it does today.

### 7.14 The files

**New**

```
src/components/layout/TasksLayout.tsx
src/components/tasks/TasksHeader.tsx
src/components/tasks/TasksTable.tsx
src/components/tasks/TaskRowMenu.tsx
src/components/tasks/TaskDetailDialog.tsx
src/components/tasks/TaskFormDialog.tsx
src/components/tasks/TaskConfirmDialog.tsx
src/components/tasks/AssigneeCombobox.tsx
src/components/tasks/TaskStatusFilter.tsx
src/components/tasks/TaskStatusBadge.tsx
src/features/tasks/use-healthcheck.ts
src/features/tasks/use-users.ts
src/lib/api/healthcheck.ts
src/lib/api/users.ts
src/lib/schemas/tasks.ts
```

**Modified**

```
src/App.tsx                     the route tree
src/pages/TasksPage.tsx         rewritten as the workspace
src/pages/TasksPage.test.tsx    extended
src/features/auth/use-auth.ts   useSignOutMutation
src/features/tasks/use-tasks.ts the filter-aware query and the mutations
src/lib/api/tasks.ts            the full task CRUD
src/lib/api/auth.ts             signOut
src/lib/api/errors.ts           two new code mappings
src/App.css                     the new blocks, replacing .tasks-hero/.tasks-profile/.tasks-list
```

---

## 8. Decisions taken by the human partner

- **"Eliminar" is shown to `ADMIN` only.** The target backend restricts deletion to administrators; the current one still lets a `USER` remove a task assigned to them. The stricter rule wins, so the action disappears from the `USER` menu.
- **The sign-up form's "Tipo de usuario" radio stays as it is.** It is inert — the server ignores the role a client sends and creates every account as a `USER` — but the form is out of scope for this change. The administrator flows are reached by the documented database promotion step (§5.4).

## 9. Left to the builder

- The exact wording of the empty states and of the toast copy, in the application's Spanish register.
- The exact pixel values inside the new CSS blocks, within the existing design language.
- Whether the date column shows an absolute or a relative timestamp, as long as both formats are `es-ES`.
- The order of the checks inside the delete confirmation dialog.
- The exact copy of the degraded states of the assignee field.

