# Tasks workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/tasks` into an authenticated workspace with its own header (user identity, live server-health indicator, sign-out menu), a filterable task table, a searchable assignee picker, and full task create/read/update/delete flows that respect the `ADMIN`/`USER` roles.

**Architecture:** The route `/tasks` leaves the marketing layout and gets its own `TasksLayout` + `TasksHeader`. The data layer keeps the existing Axios + TanStack Query stack: `src/lib/api/*` gains the full task CRUD, the healthcheck and the users listing; `src/features/tasks/*` gains the filter-aware queries, the mutations and the health poll. The header's health indicator is a Base UI `Menu` whose trigger is polled every 20 seconds; the row actions and the assignee picker are Base UI `Menu` and `Combobox`. The table is a real `<table>`; the dialogs are native `<dialog>` elements driven like `AuthDialog`.

**Tech Stack:** React 19, TypeScript ~6.0, Vite 8, react-router-dom 7, TanStack Query 5, TanStack Form 1, Zod 4, Axios, Base UI (`@base-ui/react` 1.9), lucide-react, Vitest 5 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-14-tasks-workspace-design.md` — read it before starting; this plan implements it and the spec travels with it.

## Global Constraints

- The backend at `C:\Users\Víctor - PC\Documents\My_Proyectos\aplicando-trabajo\backend\src` is **read-only**. Never modify it.
- **Never run `npm run lint` or `npm run build`.** The human partner runs them. The only verification command in this plan is `npm test`.
- Every query and mutation goes through the shared `apiClient` (`src/lib/api/client.ts`, `baseURL: '/api'`, `withCredentials: true`). Never call `fetch` directly.
- Every user-visible string is in Spanish, in the register of the existing copy ("No se pudieron cargar las tareas.", "Cargando tus tareas...").
- New styles are custom CSS appended to `src/App.css`, using the existing custom properties (`--ink`, `--ink-muted`, `--ink-subtle`, `--line`, `--primary`, `--success`, `--destructive`, `--surface`, `--canvas`) and the BEM-ish naming of the file. Do not introduce Tailwind utility classes; the app does not use them.
- Modals are native `<dialog>` elements opened with `showModal()`, like `src/features/auth/AuthDialog.tsx`. `src/test/setup.ts` already polyfills `showModal`/`close` for jsdom.
- Errors are humanised with `getApiErrorMessage()` from `src/lib/api/errors.ts`. Never show a raw `error.message` from the server.
- Server responses are the only source of truth for the task list. The client never filters the task list locally.

## Verified environment facts

These were checked against the installed packages and the running backend. Trust them; do not re-derive them.

- **Base UI `Menu`** opens with `fireEvent.click(trigger)` in jsdom. Its popup renders in a portal, so query it with `screen.getByRole('menuitem', …)`. `fireEvent.pointerDown` does **not** open it. A `Menu.Item` fires its `onClick` with `fireEvent.click(item)`.
- **Base UI `Combobox`** opens with `fireEvent.mouseDown(input)` — **not** `click` and **not** `focus`. It filters with `fireEvent.change(input, { target: { value } })`. Options are `role="option"` and `fireEvent.click(option)` fires `onValueChange(value, details)`.
- **The combobox only filters when the list renders from the collection.** `<Combobox.List items={items}>{(item) => …}</Combobox.List>` with `Combobox.createItems(data, { getValue, getLabel })` filters correctly. Manually mapped `<Combobox.Item>` children do **not** filter, and a custom `filter` prop does not fix that.
- `GET /api/healthcheck` is public, is **not** rate-limited, and answers `{ status, server: { status, uptimeSeconds, timestamp }, database: { status, latencyMs } }`.
- `GET /api/tasks` is already scoped by role (an `ADMIN` sees the tasks they created, a `USER` the tasks assigned to them) and accepts `?status=&page=&limit=` with `limit` capped at 100.
- `GET /api/users` **does not exist yet**. The contract this client codes against is the one the backend's own plan specifies: `GET /api/users` → `200 [{ id, name, email, role }]`, `ADMIN`-only, `role === 'USER'` accounts only, ordered by `name`.
- `POST /api/tasks` is `ADMIN`-only. `PATCH /api/tasks/:id` lets a `USER` change only the status of a task assigned to them. `DELETE /api/tasks/:id` is restricted to `ADMIN` in the target backend.
- `npm run preview` (port 4173) makes every `POST`/`PATCH`/`DELETE` fail with `403 forbidden`: the backend trusts only the origins `http://localhost:3000` and `http://localhost:5173`. Verify against `npm run dev`.
- No account can be created as `ADMIN` through the API — the backend sets `input: false` on the role field. To exercise the administrator flows by hand: `sqlite3 backend/data/app.db "UPDATE user SET role = 'ADMIN' WHERE email = 'tu@correo.com';"`.

## Review Focus

Five conditions the spec implies that a task's tests must pin down. Each line names where its test lives.

1. **The session expires while the workspace is open.** The table request answers `401`; the app must land on `/` with the sign-in dialog open, not on a frozen table. — Task 2 (`use-tasks.test.tsx`).
2. **`GET /api/users` answers `404`** because the backend has not implemented it yet. The assignee field must degrade to a typed id and the create flow must still post. — Task 5 (`AssigneeCombobox.test.tsx`).
3. **A `USER` must not find the administrator-only surfaces.** The "Crear Tarea" button, the "Eliminar" row action and the "Asignado" field must be absent from the DOM, not merely disabled. — Task 9 (`TasksPage.test.tsx`).
4. **The health endpoint fails.** The indicator must read "Sin conexión" and the menu must still offer "Cerrar sesión". — Task 3 (`TasksHeader.test.tsx`).
5. **A task whose assignee is not in the users listing.** The "Asignado" cell must show the raw id instead of an empty cell. — Task 8 (`TasksTable.test.tsx`).

---

### Task 1: The API layer

**Files:**
- Modify: `src/lib/api/tasks.ts`
- Create: `src/lib/api/tasks.test.ts`
- Create: `src/lib/api/users.ts`
- Create: `src/lib/api/users.test.ts`
- Create: `src/lib/api/healthcheck.ts`
- Create: `src/lib/api/healthcheck.test.ts`
- Modify: `src/lib/api/auth.ts`
- Modify: `src/lib/api/auth.test.ts`
- Modify: `src/lib/api/errors.ts`
- Create: `src/lib/api/errors.test.ts`

**Interfaces:**
- Consumes: `apiClient` from `src/lib/api/client.ts`; `UserRole` from `src/lib/api/types.ts`.
- Produces:
  - `src/lib/api/tasks.ts`
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
    export interface TasksResponse {
      items: Task[]
      pagination: { page: number; limit: number; total: number; totalPages: number }
    }
    export interface ListTasksParams { status?: TaskStatus; page?: number; limit?: number }
    export interface CreateTaskInput { title: string; assigneeId: string; status: TaskStatus }
    export interface UpdateTaskInput { title?: string; status?: TaskStatus; assigneeId?: string }
    export function listTasks(params?: ListTasksParams): Promise<TasksResponse>
    export function createTask(input: CreateTaskInput): Promise<Task>
    export function updateTask(id: string, input: UpdateTaskInput): Promise<Task>
    export function deleteTask(id: string): Promise<void>
    ```
  - `src/lib/api/users.ts`
    ```ts
    export interface UserSummary { id: string; name: string; email: string; role: UserRole }
    export function listUsers(): Promise<UserSummary[]>
    ```
  - `src/lib/api/healthcheck.ts`
    ```ts
    export interface HealthcheckReport {
      status: string
      server: { status: string; uptimeSeconds: number; timestamp: string }
      database: { status: string; latencyMs: number }
    }
    export function getHealthcheck(): Promise<HealthcheckReport>
    ```
  - `src/lib/api/auth.ts`: `export function signOut(): Promise<{ success: boolean }>`
  - `src/lib/api/errors.ts`: `export function isUnauthorizedError(error: unknown): boolean`, plus three new entries in `knownErrorMessages`: `'task-not-found'` → `'La tarea ya no existe.'`, `'assignee-not-found'` → `'El responsable indicado no existe.'`, `'validation-error'` → `'Revisa los datos introducidos e inténtalo de nuevo.'`

- [ ] **Step 1: Write the failing tests for the task endpoints**

Create `src/lib/api/tasks.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { createTask, deleteTask, listTasks, updateTask } from './tasks'

const emptyPage = {
  items: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
}

describe('tasks API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista las tareas con la página, el límite y el filtro de estado', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: emptyPage })

    await listTasks({ status: 'done', page: 1, limit: 100 })

    expect(get).toHaveBeenCalledWith('/tasks', {
      params: { page: 1, limit: 100, status: 'done' },
    })
  })

  it('omite el filtro de estado cuando no se indica', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: emptyPage })

    await listTasks()

    expect(get).toHaveBeenCalledWith('/tasks', { params: { page: 1, limit: 20 } })
  })

  it('crea una tarea con su título, responsable y estado', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} })

    await createTask({
      title: 'Preparar la entrega',
      assigneeId: 'user-1',
      status: 'pending',
    })

    expect(post).toHaveBeenCalledWith('/tasks', {
      title: 'Preparar la entrega',
      assigneeId: 'user-1',
      status: 'pending',
    })
  })

  it('actualiza una tarea con los campos enviados', async () => {
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} })

    await updateTask('task-1', { status: 'done' })

    expect(patch).toHaveBeenCalledWith('/tasks/task-1', { status: 'done' })
  })

  it('elimina una tarea por su identificador', async () => {
    const remove = vi
      .spyOn(apiClient, 'delete')
      .mockResolvedValue({ data: undefined })

    await deleteTask('task-1')

    expect(remove).toHaveBeenCalledWith('/tasks/task-1')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/api/tasks.test.ts`
Expected: FAIL — `listTasks` and the other four functions do not exist yet.

- [ ] **Step 3: Implement the task API**

Rewrite `src/lib/api/tasks.ts`. `Task` gains `creatorId` (the server already returns it). `listTasks` builds the query itself so a missing status is never sent:

```ts
const query = {
  page: params.page ?? 1,
  limit: params.limit ?? 20,
  ...(params.status ? { status: params.status } : {}),
}
const response = await apiClient.get<TasksResponse>('/tasks', { params: query })
```

`createTask` posts to `'/tasks'`, `updateTask` patches `'/' + id`, `deleteTask` deletes and returns nothing. Keep the file's existing style: `async function`, `const response = await apiClient.…`, `return response.data`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/api/tasks.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing tests for the users, healthcheck, sign-out and error helpers**

Create `src/lib/api/users.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { listUsers } from './users'

describe('users API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta los usuarios asignables', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })

    await listUsers()

    expect(get).toHaveBeenCalledWith('/users')
  })
})
```

Create `src/lib/api/healthcheck.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { getHealthcheck } from './healthcheck'

describe('healthcheck API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta el estado del servidor', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} })

    await getHealthcheck()

    expect(get).toHaveBeenCalledWith('/healthcheck')
  })
})
```

Append to `src/lib/api/auth.test.ts`:

```ts
  it('cierra la sesión en el servidor', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { success: true } })

    await signOut()

    expect(post).toHaveBeenCalledWith('/auth/sign-out')
  })
```

and add `signOut` to the import list at the top of that file.

Create `src/lib/api/errors.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, isUnauthorizedError } from './errors'

describe('API errors', () => {
  it('detecta una respuesta 401 del servidor', () => {
    expect(
      isUnauthorizedError({ isAxiosError: true, response: { status: 401 } }),
    ).toBe(true)
  })

  it('no confunde un 403 con una sesión caducada', () => {
    expect(
      isUnauthorizedError({ isAxiosError: true, response: { status: 403 } }),
    ).toBe(false)
  })

  it('traduce al español el código de validación del servidor', () => {
    const error = {
      isAxiosError: true,
      response: { status: 422, data: { code: 'validation-error' } },
    }

    expect(getApiErrorMessage(error)).toBe(
      'Revisa los datos introducidos e inténtalo de nuevo.',
    )
  })
})
```

- [ ] **Step 6: Run the new tests to verify they fail**

Run: `npx vitest run src/lib/api`
Expected: FAIL — `./users`, `./healthcheck`, `signOut` and `isUnauthorizedError` do not exist.

- [ ] **Step 7: Implement the users, healthcheck, sign-out and error helpers**

- `src/lib/api/users.ts`: `export interface UserSummary { id: string; name: string; email: string; role: UserRole }` importing `UserRole` from `./types`; `export async function listUsers()` calls `apiClient.get<UserSummary[]>('/users')` and returns `response.data`.
- `src/lib/api/healthcheck.ts`: the `HealthcheckReport` interface from the Interfaces block; `export async function getHealthcheck()` calls `apiClient.get<HealthcheckReport>('/healthcheck')` and returns `response.data`.
- `src/lib/api/auth.ts`: `export async function signOut()` calls `apiClient.post('/auth/sign-out')` and returns `response.data`.
- `src/lib/api/errors.ts`: add the three entries to `knownErrorMessages` with exactly the copy in the Interfaces block, and add:

```ts
export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}
```

- [ ] **Step 8: Run the whole API test suite to verify it passes**

Run: `npx vitest run src/lib/api`
Expected: PASS, every file green.

- [ ] **Step 9: Commit**

```bash
git add src/lib/api
git commit -m "feat(api): add the task CRUD, the healthcheck, the users listing and the sign-out"
```

---

### Task 2: The data hooks

**Files:**
- Modify: `src/features/tasks/use-tasks.ts`
- Create: `src/features/tasks/use-users.ts`
- Create: `src/features/tasks/use-healthcheck.ts`
- Modify: `src/features/auth/use-auth.ts`
- Create: `src/features/tasks/use-tasks.test.tsx`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces:
  - `src/features/tasks/use-tasks.ts`
    ```ts
    export function useTasks(status?: TaskStatus): UseQueryResult<TasksResponse, Error>
    export function useCreateTask(): UseMutationResult<Task, Error, CreateTaskInput>
    export function useUpdateTask(): UseMutationResult<Task, Error, { id: string; input: UpdateTaskInput }>
    export function useDeleteTask(): UseMutationResult<void, Error, string>
    ```
    - `useTasks` query key: `['tasks', { status: status ?? null }]`; query function calls `listTasks({ status, limit: 100 })`.
    - The three mutations invalidate `['tasks']` on success.
    - `useDeleteTask` mutates with the task id and calls `apiClient.delete` through `deleteTask`.
  - `src/features/tasks/use-users.ts`
    ```ts
    export function useUsers(): UseQueryResult<UserSummary[], Error>
    ```
    - query key `['users']`, query function `listUsers`, `retry: false` (a `404` is an expected answer, not a transient failure).
  - `src/features/tasks/use-healthcheck.ts`
    ```ts
    export function useHealthcheck(): UseQueryResult<HealthcheckReport, Error>
    ```
    - query key `['healthcheck']`; `refetchInterval: 20_000`; `refetchIntervalInBackground: false`; `refetchOnWindowFocus: true`; `staleTime: 15_000`; `retry: 1`.
  - `src/features/auth/use-auth.ts`
    ```ts
    export function useSignOutMutation(): UseMutationResult<{ success: boolean }, Error, void>
    export function useSessionExpiry(): (error: unknown) => void
    ```
    - `useSignOutMutation` on success: `queryClient.removeQueries({ queryKey: ['session'] })`, `notifyToast({ tone: 'success', title: 'Sesión cerrada.', message: 'Has cerrado sesión en este dispositivo.' })`, `navigate('/')`. On error: `notifyToast({ tone: 'error', title: 'No se pudo cerrar la sesión.', message: getApiErrorMessage(error) })`.
    - `useSessionExpiry` returns a callback that calls `queryClient.removeQueries({ queryKey: ['session'] })` when `isUnauthorizedError(error)` is true, and does nothing otherwise.

- [ ] **Step 1: Write the failing test**

Create `src/features/tasks/use-tasks.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { apiClient } from '../../lib/api/client'
import type { AuthSession } from '../../lib/api/types'
import { useTasks } from './use-tasks'

const session: AuthSession = {
  session: {
    id: 'session-1',
    token: 'session-token',
    userId: 'user-1',
    expiresAt: '2026-11-21T12:00:00.000Z',
    ipAddress: null,
    userAgent: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  user: {
    id: 'user-1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    emailVerified: false,
    image: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
    role: 'USER',
  },
}

const emptyPage = {
  items: [],
  pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
}

describe('useTasks', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('pide las tareas con el límite máximo y sin filtro', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: emptyPage })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    renderHook(() => useTasks(), { wrapper: createWrapper(client) })

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100 },
      })
    })
  })

  it('pide las tareas filtradas por estado', async () => {
    const get = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ data: emptyPage })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    renderHook(() => useTasks('done'), { wrapper: createWrapper(client) })

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100, status: 'done' },
      })
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/tasks/use-tasks.test.tsx`
Expected: FAIL — `useTasks` does not accept a status filter and asks for the default limit of 20.

- [ ] **Step 3: Implement the filter-aware query and the three mutations**

Rewrite `src/features/tasks/use-tasks.ts`:

- `useTasks(status?: TaskStatus)` uses `queryKey: ['tasks', { status: status ?? null }]` and `queryFn: () => listTasks({ status, limit: 100 })`.
- `useCreateTask()` uses `useMutation({ mutationFn: createTask, onSuccess: invalidateTasks })`.
- `useUpdateTask()` uses `useMutation({ mutationFn: ({ id, input }) => updateTask(id, input), onSuccess: invalidateTasks })`.
- `useDeleteTask()` uses `useMutation({ mutationFn: deleteTask, onSuccess: invalidateTasks })`.
- `invalidateTasks` is a module-level helper that calls `queryClient.invalidateQueries({ queryKey: ['tasks'] })`; obtain the client with `useQueryClient()` inside each hook.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/tasks/use-tasks.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Write the failing test for the expired session**

Append to `src/features/tasks/use-tasks.test.tsx`:

```tsx
  it('cierra la sesión cuando el servidor responde 401', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    })
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    client.setQueryData(['session'], session)

    renderHook(() => useTasks(), { wrapper: createWrapper(client) })

    await waitFor(() => {
      expect(client.getQueryData(['session'])).toBeUndefined()
    })
  })
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run src/features/tasks/use-tasks.test.tsx`
Expected: FAIL — the session query is still in the cache after the `401`.

- [ ] **Step 7: Implement the session expiry handling and the remaining hooks**

- `src/features/auth/use-auth.ts`: add `useSignOutMutation()` and `useSessionExpiry()` exactly as the Interfaces block describes. Import `signOut` from `../../lib/api/auth`, `notifyToast` from `../../lib/toast-store`, `getApiErrorMessage` from `../../lib/api/errors` and `isUnauthorizedError` from `../../lib/api/errors`.
- `src/features/tasks/use-tasks.ts`: give `useTasks` an `onError: expireSession` where `const expireSession = useSessionExpiry()`.
- `src/features/tasks/use-users.ts`: `useQuery({ queryKey: ['users'], queryFn: listUsers, retry: false })`.
- `src/features/tasks/use-healthcheck.ts`: `useQuery({ queryKey: ['healthcheck'], queryFn: getHealthcheck, refetchInterval: 20_000, refetchIntervalInBackground: false, refetchOnWindowFocus: true, staleTime: 15_000, retry: 1 })`.

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/features/tasks/use-tasks.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 9: Repair the stale assertion in the existing page test**

`src/pages/TasksPage.test.tsx` still asserts the old call shape of the task list. `listTasks` now sends the pagination and the filter as query parameters, so the assertion must change:

```ts
await waitFor(() => {
  expect(get).toHaveBeenCalledWith('/tasks')
})
```

becomes

```ts
await waitFor(() => {
  expect(get).toHaveBeenCalledWith('/tasks', {
    params: { page: 1, limit: 100 },
  })
})
```

Run: `npx vitest run src/pages/TasksPage.test.tsx`
Expected: PASS, the three existing cases stay green.

- [ ] **Step 10: Commit**

```bash
git add src/features src/pages/TasksPage.test.tsx
git commit -m "feat(tasks): add the filter-aware task queries, the mutations and the health poll"
```

---

### Task 3: The workspace shell

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/layout/TasksLayout.tsx`
- Create: `src/components/tasks/TasksHeader.tsx`
- Create: `src/components/tasks/TasksHeader.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `useSessionQuery`, `useSignOutMutation` (Task 2); `useHealthcheck` (Task 2); `HomeFooter` from `src/components/home/HomeFooter.tsx`.
- Produces:
  - `src/components/layout/TasksLayout.tsx`
    ```tsx
    export function TasksLayout({ children }: { children: ReactNode })
    ```
    Renders the skip link (`<a className="skip-link" href="#contenido">Saltar al contenido</a>`), `<TasksHeader />`, the children, and `<HomeFooter />`.
  - `src/components/tasks/TasksHeader.tsx`
    ```tsx
    export function TasksHeader()
    ```
    Renders the brand link to `/`, the user block (avatar initial, name, email, role badge) from `useSessionQuery()`, and the health `Menu`.

- [ ] **Step 1: Write the failing test**

Create `src/components/tasks/TasksHeader.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import type { AuthSession } from '../../lib/api/types'
import { TasksHeader } from './TasksHeader'

const session: AuthSession = {
  session: {
    id: 'session-1',
    token: 'session-token',
    userId: 'user-1',
    expiresAt: '2026-11-21T12:00:00.000Z',
    ipAddress: null,
    userAgent: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  user: {
    id: 'user-1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    emailVerified: false,
    image: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
    role: 'ADMIN',
  },
}

const healthy = {
  status: 'ok',
  server: { status: 'up', uptimeSeconds: 120, timestamp: '2026-11-14T12:00:00.000Z' },
  database: { status: 'up', latencyMs: 0.42 },
}

function renderHeader() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TasksHeader />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TasksHeader', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra los datos del usuario conectado y su rol', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })

    renderHeader()

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('no muestra los enlaces de navegación del sitio', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })

    renderHeader()

    await screen.findByText('Ana Pérez')

    expect(screen.queryByRole('link', { name: 'Tech Stack' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Uso de la IA' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Comenzar' })).not.toBeInTheDocument()
  })

  it('muestra el estado de conexión del servidor', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })

    renderHeader()

    expect(await screen.findByText('Servidor conectado')).toBeInTheDocument()
  })

  it('avisa cuando el servidor no responde y permite cerrar sesión igualmente', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.reject(new Error('Servidor caído'))
    })

    renderHeader()

    expect(await screen.findByText('Sin conexión')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Estado del servidor/ }))

    expect(
      await screen.findByRole('menuitem', { name: 'Cerrar sesión' }),
    ).toBeInTheDocument()
  })

  it('cierra la sesión en el servidor', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }
      return Promise.resolve({ data: healthy })
    })
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { success: true } })

    renderHeader()

    await screen.findByText('Ana Pérez')
    fireEvent.click(screen.getByRole('button', { name: /Estado del servidor/ }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Cerrar sesión' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/auth/sign-out')
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/tasks/TasksHeader.test.tsx`
Expected: FAIL — `./TasksHeader` does not exist.

- [ ] **Step 3: Implement the header**

Create `src/components/tasks/TasksHeader.tsx`:

- The brand: reuse the existing markup of `src/components/home/HomeHeader.tsx` — `<Link className="site-brand" to="/" aria-label="Tarea, ir al inicio">` with the `site-brand__mark` (a `Check` icon from lucide-react), `site-brand__name` and `site-brand__context`.
- The user block: read `session` from `useSessionQuery()`. Render the avatar initial (`session.user.name.charAt(0).toUpperCase()`), the name, the email and a role badge whose text is the literal role (`ADMIN` / `USER`).
- The health indicator: a Base UI `Menu` whose trigger is a `<button>` with the accessible name "Estado del servidor", containing a status dot and a label. The label is one of `Comprobando…`, `Servidor conectado`, `Sin conexión`, chosen from the query state: `isPending` → `Comprobando…`; `isError` → `Sin conexión`; otherwise → `Servidor conectado`. Put the label inside an element with `aria-live="polite"`.
- The menu popup contains a non-interactive line with the last check time (`Última comprobación: …`, formatted `es-ES` from `dataUpdatedAt`), a separator, and the item "Cerrar sesión" whose `onClick` calls `signOut.mutate()`.

The Base UI import is `import { Menu } from '@base-ui/react/menu'`. The parts used are `Menu.Root`, `Menu.Trigger`, `Menu.Portal`, `Menu.Positioner`, `Menu.Popup`, `Menu.Item` and `Menu.Separator`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/tasks/TasksHeader.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Write the failing test for the layout**

Create `src/components/layout/TasksLayout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TasksLayout } from './TasksLayout'

describe('TasksLayout', () => {
  it('conserva el enlace de salto y el pie de página', () => {
    render(
      <TasksLayout>
        <p>Contenido del espacio de trabajo</p>
      </TasksLayout>,
    )

    expect(
      screen.getByRole('link', { name: 'Saltar al contenido' }),
    ).toHaveAttribute('href', '#contenido')
    expect(screen.getByText('Contenido del espacio de trabajo')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run src/components/layout/TasksLayout.test.tsx`
Expected: FAIL — `./TasksLayout` does not exist.

- [ ] **Step 7: Implement the layout and move the route**

Create `src/components/layout/TasksLayout.tsx`:

```tsx
import type { ReactNode } from 'react'
import { HomeFooter } from '../home/HomeFooter'
import { TasksHeader } from '../tasks/TasksHeader'

export function TasksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <TasksHeader />
      {children}
      <HomeFooter />
    </>
  )
}
```

Modify `src/App.tsx`: move the `tasks` route out of the `SiteLayout` branch and give it its own shell, keeping the splat `*` route inside `SiteLayout` so the unknown URLs still render `NotFoundPage` with the marketing chrome:

```tsx
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
```

`tasks` is a static segment, so it outranks the splat `*` of the marketing branch: `/tasks` renders the workspace and every other unknown URL still renders `NotFoundPage`.

- [ ] **Step 8: Run the layout test to verify it passes**

Run: `npx vitest run src/components/layout/TasksLayout.test.tsx`
Expected: PASS.

- [ ] **Step 9: Style the new blocks**

Append to `src/App.css`. Reuse the tokens of the existing header and profile blocks:

- `.tasks-header` — a sticky bar like `.site-header`: `border-block-end: 1px solid var(--line)`, `background: rgba(248, 250, 252, 0.92)`, `backdrop-filter: blur(18px)`.
- `.tasks-header__inner` — a `page-shell` flex row, `justify-content: space-between`, `gap: 1.5rem`, `min-block-size: 4.75rem`.
- `.tasks-header__account` — a flex row with `gap: 1rem`, `align-items: center`.
- `.tasks-user` — reuse the proportions of `.tasks-profile`: an avatar tile, a name, an email and a role badge.
- `.tasks-user__role` — a pill with `background: var(--blue-soft)`, `color: var(--primary)`.
- `.health-pill` — the trigger: a flex row with `gap: 0.5rem`, `min-block-size: 2.75rem`, `border: 1px solid var(--line)`, `border-radius: 999px`, `background: var(--surface)`, `padding-inline: 0.85rem`.
- `.health-pill__dot` — a 0.55rem circle; `--ok` uses `var(--success)`, `--down` uses `var(--destructive)`, `--checking` uses `#f59e0b`.
- `.health-pill__label` — `font-size: 0.82rem`, `font-weight: 700`, `color: var(--ink-muted)`.
- `.app-menu` — the popup: `min-inline-size: 14rem`, `border: 1px solid var(--line)`, `border-radius: 0.7rem`, `background: var(--surface)`, `padding: 0.35rem`, `box-shadow: 0 1.5rem 3rem rgba(16, 24, 40, 0.16)`.
- `.app-menu__item` — a block button with `inline-size: 100%`, `text-align: left`, `border: 0`, `border-radius: 0.45rem`, `background: transparent`, `padding: 0.6rem 0.7rem`, `font: inherit`, `cursor: pointer`.
- `.app-menu__item--danger` — `color: var(--destructive)`.
- `.app-menu__separator` — `height: 1px`, `margin: 0.35rem 0`, `background: var(--line)`, `border: 0`.
- `.app-menu__meta` — the read-only line: `padding: 0.6rem 0.7rem`, `color: var(--ink-subtle)`, `font-size: 0.75rem`.

Also add a `.visually-hidden` class if it is missing — it already exists in `src/App.css` (line 25).

- [ ] **Step 10: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS. The three existing `TasksPage` cases must still be green: `/tasks` without a session renders the home page and opens the sign-in dialog, and the sign-in flow lands on `/tasks`.

- [ ] **Step 11: Commit**

```bash
git add src/App.tsx src/App.css src/components
git commit -m "feat(tasks): add the workspace layout and the header with the server health indicator"
```

---

### Task 4: The status badge and the status filter

**Files:**
- Create: `src/components/tasks/TaskStatusBadge.tsx`
- Create: `src/components/tasks/TaskStatusFilter.tsx`
- Create: `src/components/tasks/TaskStatusFilter.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `TaskStatus` from `src/lib/api/tasks.ts`.
- Produces:
  - `src/components/tasks/TaskStatusBadge.tsx`
    ```tsx
    export function TaskStatusBadge({ status }: { status: TaskStatus })
    ```
    Renders the label of the status inside a span with the classes `task-badge` and `task-badge--<status>`.
  - `src/components/tasks/TaskStatusFilter.tsx`
    ```tsx
    export type TaskStatusFilterValue = TaskStatus | 'all'
    export function TaskStatusFilter({
      value,
      onChange,
      counts,
    }: {
      value: TaskStatusFilterValue
      onChange: (value: TaskStatusFilterValue) => void
      counts?: Partial<Record<TaskStatusFilterValue, number>>
    })
    ```
    Renders a `role="group"` with `aria-label="Filtrar por estado"` holding one button per option: `Todas`, `Pendiente`, `En curso`, `Hecha`. The active button carries `aria-pressed="true"` and the class `tasks-filter--active`.

  The label map is shared by both components and lives in `src/components/tasks/TaskStatusBadge.tsx`:

  ```ts
  export const taskStatusLabels: Record<TaskStatus, string> = {
    pending: 'Pendiente',
    in_progress: 'En curso',
    done: 'Hecha',
  }
  ```

- [ ] **Step 1: Write the failing test**

Create `src/components/tasks/TaskStatusFilter.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskStatusFilter } from './TaskStatusFilter'

describe('TaskStatusFilter', () => {
  it('marca el filtro activo y avisa del cambio', () => {
    const onChange = vi.fn()

    render(<TaskStatusFilter value="all" onChange={onChange} />)

    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: 'En curso' }))

    expect(onChange).toHaveBeenCalledWith('in_progress')
  })

  it('ofrece los cuatro estados de la tarea', () => {
    render(<TaskStatusFilter value="all" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Todas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pendiente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'En curso' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hecha' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/tasks/TaskStatusFilter.test.tsx`
Expected: FAIL — `./TaskStatusFilter` does not exist.

- [ ] **Step 3: Implement the badge and the filter**

Create `src/components/tasks/TaskStatusBadge.tsx` with the `taskStatusLabels` map and a component that renders:

```tsx
<span className={`task-badge task-badge--${status}`}>{taskStatusLabels[status]}</span>
```

Create `src/components/tasks/TaskStatusFilter.tsx` with the options in this order:

```ts
const options: Array<{ value: TaskStatusFilterValue; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'done', label: 'Hecha' },
]
```

Each option is a `<button type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>`. When `counts` provides a number for an option, render it inside a `<span>` after the label.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/tasks/TaskStatusFilter.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Style the new blocks**

Append to `src/App.css`:

- `.task-badge` — a pill: `border-radius: 999px`, `padding: 0.3rem 0.6rem`, `font-size: 0.72rem`, `font-weight: 740`.
- `.task-badge--pending` — `background: #eef2f7`, `color: var(--ink-muted)`.
- `.task-badge--in_progress` — `background: #fef3c7`, `color: #92400e`.
- `.task-badge--done` — `background: #d1fae5`, `color: #065f46`.
- `.tasks-filters` — a flex row with `gap: 0.4rem`, `flex-wrap: wrap`.
- `.tasks-filter` — a button with `border: 1px solid var(--line)`, `border-radius: 999px`, `background: var(--surface)`, `color: var(--ink-muted)`, `padding: 0.45rem 0.8rem`, `font: inherit`, `font-size: 0.82rem`, `font-weight: 700`, `cursor: pointer`.
- `.tasks-filter--active` — `border-color: var(--primary)`, `background: var(--primary)`, `color: var(--surface)`.

- [ ] **Step 6: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/tasks src/App.css
git commit -m "feat(tasks): add the status badge and the status filter"
```

---

### Task 5: The assignee picker

**Files:**
- Create: `src/components/tasks/AssigneeCombobox.tsx`
- Create: `src/components/tasks/AssigneeCombobox.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `useUsers` from `src/features/tasks/use-users.ts` (Task 2); `UserSummary` from `src/lib/api/users.ts`; `useSessionQuery` from `src/features/auth/use-auth.ts`.
- Produces:
  - `src/components/tasks/AssigneeCombobox.tsx`
    ```tsx
    export function AssigneeCombobox({
      value,
      onChange,
      disabled,
    }: {
      value: string
      onChange: (value: string) => void
      disabled?: boolean
    })
    ```
    - Renders a Base UI `Combobox` over the `USER` accounts.
    - The list is sorted by `name` and then by `email` with `localeCompare('es')`.
    - When the users query failed (the endpoint answers `404` or `403`), it renders a plain `<input type="text">` labelled "Responsable" that holds the raw id, plus a hint naming the caller's own id, taken from `useSessionQuery()`.

- [ ] **Step 1: Write the failing test**

Create `src/components/tasks/AssigneeCombobox.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import { AssigneeCombobox } from './AssigneeCombobox'

const users = [
  { id: 'user-2', name: 'Luis Gómez', email: 'luis@example.com', role: 'USER' },
  { id: 'user-1', name: 'Ana Pérez', email: 'ana@example.com', role: 'USER' },
]

function renderCombobox(onChange = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <AssigneeCombobox value="" onChange={onChange} />
    </QueryClientProvider>,
  )

  return onChange
}

describe('AssigneeCombobox', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista los usuarios ordenados por nombre y filtra al buscar', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: users })

    renderCombobox()

    const input = screen.getByRole('combobox', { name: 'Responsable' })
    fireEvent.mouseDown(input)

    const options = await screen.findAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'Ana Pérez',
      'Luis Gómez',
    ])

    fireEvent.change(input, { target: { value: 'luis' } })

    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'Ana Pérez' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('option', { name: 'Luis Gómez' })).toBeInTheDocument()
  })

  it('avisa del responsable elegido', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ data: users })
    const onChange = renderCombobox()

    const input = screen.getByRole('combobox', { name: 'Responsable' })
    fireEvent.mouseDown(input)
    fireEvent.click(await screen.findByRole('option', { name: 'Luis Gómez' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('user-2')
    })
  })

  it('degrada a un campo de texto cuando el servidor no lista los usuarios', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    })

    renderCombobox()

    expect(
      await screen.findByText(
        'El listado de usuarios no está disponible en el servidor.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Responsable')).toHaveAttribute('type', 'text')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/tasks/AssigneeCombobox.test.tsx`
Expected: FAIL — `./AssigneeCombobox` does not exist.

- [ ] **Step 3: Implement the combobox**

Create `src/components/tasks/AssigneeCombobox.tsx`.

The combobox must be built the way the installed Base UI filters, which the verified facts pin down:

```tsx
const items = Combobox.createItems(sortedUsers, {
  getValue: (user) => user.id,
  getLabel: (user) => user.name,
})

<Combobox.Root
  items={items}
  value={value || null}
  onValueChange={(next) => onChange(String(next ?? ''))}
>
  <Combobox.Input aria-label="Responsable" className="assignee-combobox__input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup className="assignee-combobox__popup">
        <Combobox.Empty className="assignee-combobox__empty">
          Sin resultados
        </Combobox.Empty>
        <Combobox.List items={items} className="assignee-combobox__list">
          {(user) => (
            <Combobox.Item key={user.id} value={user.id} className="assignee-combobox__item">
              <span className="assignee-combobox__name">{user.name}</span>
              <span className="assignee-combobox__email">{user.email}</span>
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
```

The import is `import { Combobox } from '@base-ui/react/combobox'`. Render the users sorted by `name` and then `email` with `localeCompare('es')` before building the collection.

When `useUsers().isError` is true, render instead:

```tsx
<input
  type="text"
  aria-label="Responsable"
  value={value}
  onChange={(event) => onChange(event.target.value)}
  className="assignee-combobox__input"
/>
```

plus a `<p className="assignee-combobox__hint">El listado de usuarios no está disponible en el servidor. Puedes escribir el identificador del responsable; el tuyo es {session?.user.id}.</p>`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/tasks/AssigneeCombobox.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Style the new blocks**

Append to `src/App.css`:

- `.assignee-combobox__input` — `inline-size: 100%`, `min-block-size: 2.9rem`, `border: 1px solid var(--input)`, `border-radius: 0.55rem`, `padding-inline: 0.75rem`, `font: inherit`.
- `.assignee-combobox__popup` — `min-inline-size: 16rem`, `border: 1px solid var(--line)`, `border-radius: 0.7rem`, `background: var(--surface)`, `padding: 0.3rem`, `box-shadow: 0 1.5rem 3rem rgba(16, 24, 40, 0.16)`.
- `.assignee-combobox__item` — a block with `border-radius: 0.45rem`, `padding: 0.55rem 0.65rem`, `cursor: pointer`.
- `.assignee-combobox__item[data-highlighted]` — `background: var(--blue-soft)`.
- `.assignee-combobox__name` — `display: block`, `font-size: 0.88rem`, `font-weight: 700`, `color: var(--ink)`.
- `.assignee-combobox__email` — `display: block`, `font-size: 0.75rem`, `color: var(--ink-subtle)`.
- `.assignee-combobox__empty` — `padding: 0.7rem`, `color: var(--ink-subtle)`, `font-size: 0.82rem`.
- `.assignee-combobox__hint` — `margin: 0.4rem 0 0`, `color: var(--ink-subtle)`, `font-size: 0.75rem`.

- [ ] **Step 6: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/tasks src/App.css
git commit -m "feat(tasks): add the searchable assignee picker"
```

---

### Task 6: The task form dialog

**Files:**
- Create: `src/lib/schemas/tasks.ts`
- Create: `src/components/tasks/TaskFormDialog.tsx`
- Create: `src/components/tasks/TaskFormDialog.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `useCreateTask`, `useUpdateTask` (Task 2); `AssigneeCombobox` (Task 5); `TaskStatus` from `src/lib/api/tasks.ts`; `getValidationMessage` and `focusFirstInvalidField` from `src/features/auth/form-utils.ts`; `getApiErrorMessage` from `src/lib/api/errors.ts`.
- Produces:
  - `src/lib/schemas/tasks.ts`
    ```ts
    export const taskStatusValues = ['pending', 'in_progress', 'done'] as const
    export const taskFormSchema = z.object({
      title: z.string().trim().min(1, 'Escribe un título.').max(200, 'El título no puede superar 200 caracteres.'),
      status: z.enum(taskStatusValues),
      assigneeId: z.string().trim().min(1, 'Elige un responsable.').max(64, 'El identificador no puede superar 64 caracteres.'),
    })
    export type TaskFormValues = z.infer<typeof taskFormSchema>
    ```
  - `src/components/tasks/TaskFormDialog.tsx`
    ```tsx
    export function TaskFormDialog({
      open,
      mode,
      task,
      onOpenChange,
    }: {
      open: boolean
      mode: 'create' | 'edit'
      task?: Task
      onOpenChange: (open: boolean) => void
    })
    ```
    - `open` false renders the `<dialog>` closed; `open` true calls `showModal()` in an effect, like `src/features/auth/AuthDialog.tsx`.
    - The role comes from `useSessionQuery()`: `session.user.role === 'ADMIN'`.
    - For an `ADMIN` the form shows the title (editable), the status (a `<select>`) and the assignee (`AssigneeCombobox`).
    - For a `USER` the form shows the title as read-only text and only the status as an editable control, and the payload sent to the server contains `{ status }` alone.
    - Create mode posts `{ title, assigneeId, status }`; edit mode patches `{ title, status, assigneeId }` for an `ADMIN` and `{ status }` for a `USER`.
    - On success it calls `onOpenChange(false)` and `notifyToast({ tone: 'success', title: mode === 'create' ? 'Tarea creada.' : 'Tarea actualizada.' })`.
    - On failure it renders the message of `getApiErrorMessage(error)` in a `role="alert"` block and keeps the dialog open.

- [ ] **Step 1: Write the failing test**

Create `src/components/tasks/TaskFormDialog.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../lib/api/client'
import type { AuthSession } from '../../lib/api/types'
import { TaskFormDialog } from './TaskFormDialog'

const adminSession: AuthSession = {
  session: {
    id: 'session-1',
    token: 'session-token',
    userId: 'admin-1',
    expiresAt: '2026-11-21T12:00:00.000Z',
    ipAddress: null,
    userAgent: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  user: {
    id: 'admin-1',
    name: 'Ana Pérez',
    email: 'ana@example.com',
    emailVerified: false,
    image: null,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
    role: 'ADMIN',
  },
}

const userSession: AuthSession = {
  ...adminSession,
  user: { ...adminSession.user, id: 'user-1', role: 'USER' },
}

const task = {
  id: 'task-1',
  title: 'Preparar la entrega',
  status: 'pending' as const,
  creatorId: 'admin-1',
  assigneeId: 'user-1',
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
}

function renderDialog(
  session: AuthSession,
  mode: 'create' | 'edit',
  taskToEdit = task,
) {
  vi.spyOn(apiClient, 'get').mockImplementation((url) => {
    if (url === '/auth/get-session') {
      return Promise.resolve({ data: session })
    }

    if (url === '/users') {
      return Promise.resolve({
        data: [
          {
            id: 'admin-1',
            name: 'Ana Pérez',
            email: 'ana@example.com',
            role: 'USER',
          },
        ],
      })
    }

    return Promise.resolve({ data: [] })
  })

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <TaskFormDialog
        open
        mode={mode}
        task={mode === 'edit' ? taskToEdit : undefined}
        onOpenChange={vi.fn()}
      />
    </QueryClientProvider>,
  )
}

describe('TaskFormDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('crea una tarea con el título, el responsable y el estado', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: task })
    renderDialog(adminSession, 'create')

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Preparar la entrega' },
    })
    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'in_progress' },
    })
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Responsable' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Ana Pérez' }))

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/tasks', {
        title: 'Preparar la entrega',
        assigneeId: 'admin-1',
        status: 'in_progress',
      })
    })
  })
  it('permite a un usuario cambiar solo el estado', async () => {
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: task })
    renderDialog(userSession, 'edit')

    fireEvent.change(screen.getByLabelText('Estado'), {
      target: { value: 'done' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(patch).toHaveBeenCalledWith('/tasks/task-1', { status: 'done' })
    })
    expect(screen.queryByLabelText('Responsable')).not.toBeInTheDocument()
  })

  it('exige un título antes de enviar', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: task })
    renderDialog(adminSession, 'create')

    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Escribe un título.')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/tasks/TaskFormDialog.test.tsx`
Expected: FAIL — `./TaskFormDialog` does not exist.

- [ ] **Step 3: Implement the schema and the dialog**

Create `src/lib/schemas/tasks.ts` with the schema from the Interfaces block.

Create `src/components/tasks/TaskFormDialog.tsx`:

- Build the form with `useForm` from `@tanstack/react-form`, the same shape as `src/features/auth/SignInForm.tsx`: `defaultValues` seeded from the task when editing and blank when creating, `validators: { onSubmit: taskFormSchema }`, an `onSubmit` that calls the mutation inside a `try`/`catch`, and an `onSubmitInvalid` that calls `focusFirstInvalidField('task-form', formApi.getAllErrors().fields)`.
- Give the `<form>` the attribute `data-auth-form="task-form"` so `focusFirstInvalidField` finds the fields.
- The title field is a `<label htmlFor="task-title">Título</label>` with an `<input id="task-title" name="title">`. For a `USER` render the title as a `<p>` instead of an input.
- The status field is a `<label htmlFor="task-status">Estado</label>` with a `<select id="task-status" name="status">` holding the three options with the labels of `taskStatusLabels`.
- The assignee field renders `<AssigneeCombobox value={…} onChange={…} />` only for an `ADMIN`.
- The payload: build it explicitly so a `USER` never sends a field the server would refuse:

```ts
const payload = isAdmin
  ? { title: values.title, status: values.status, assigneeId: values.assigneeId }
  : { status: values.status }
```

- The submit button reads "Guardar" and is disabled while the mutation is pending.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/tasks/TaskFormDialog.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Style the new blocks**

Append to `src/App.css`:

- `.task-dialog` — like `.auth-dialog`: `width: min(calc(100% - 2rem), 34rem)`, `max-block-size: calc(100dvh - 2rem)`, `margin: auto`, `overflow: auto`, `border: 0`, `border-radius: 1rem`, `background: var(--surface)`, `padding: 0`.
- `.task-dialog::backdrop` — like `.auth-dialog::backdrop`.
- `.task-dialog__surface` — `padding: clamp(1.35rem, 4vw, 2.25rem)`.
- `.task-dialog__header` — `padding-inline-end: 2.5rem`.
- `.task-dialog__header h2` — `margin: 0`, `font-size: clamp(1.5rem, 4vw, 2rem)`, `font-weight: 810`, `letter-spacing: -0.035em`.
- `.task-dialog__eyebrow` — the kicker: `margin: 0 0 0.45rem`, `color: var(--primary)`, `font-size: 0.72rem`, `font-weight: 780`, `text-transform: uppercase`, `letter-spacing: 0.05em`.
- `.task-form` — `display: grid`, `gap: 1.1rem`, `margin-block-start: 1.5rem`.
- `.task-field` — `display: grid`, `gap: 0.35rem`.
- `.task-field > label` — `font-size: 0.82rem`, `font-weight: 700`, `color: var(--ink-muted)`.
- `.task-field input`, `.task-field select` — `inline-size: 100%`, `min-block-size: 2.9rem`, `border: 1px solid var(--input)`, `border-radius: 0.55rem`, `padding-inline: 0.75rem`, `font: inherit`.
- `.task-field__error` — `margin: 0`, `color: var(--destructive)`, `font-size: 0.76rem`.
- `.task-form__error` — `border: 1px solid var(--destructive)`, `border-radius: 0.55rem`, `background: #fef3f2`, `color: var(--destructive)`, `padding: 0.7rem 0.8rem`, `font-size: 0.82rem`.
- `.task-dialog__actions` — a flex row with `justify-content: flex-end`, `gap: 0.75rem`, `margin-block-start: 1.6rem`.

Reuse the existing `.button`, `.button--primary` and `.button--quiet` classes for the buttons.

- [ ] **Step 6: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/schemas src/components/tasks src/App.css
git commit -m "feat(tasks): add the task form dialog for creating and editing"
```

---

### Task 7: The task detail dialog

**Files:**
- Create: `src/components/tasks/TaskDetailDialog.tsx`
- Create: `src/components/tasks/TaskDetailDialog.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `Task` from `src/lib/api/tasks.ts`; `taskStatusLabels` and `TaskStatusBadge` from `src/components/tasks/TaskStatusBadge.tsx`.
- Produces:
  - `src/components/tasks/TaskDetailDialog.tsx`
    ```tsx
    export function TaskDetailDialog({
      open,
      task,
      assigneeName,
      onOpenChange,
    }: {
      open: boolean
      task?: Task
      assigneeName?: string
      onOpenChange: (open: boolean) => void
    })
    ```
    - Renders a native `<dialog>` with the accessible name "Detalle de la tarea".
    - Shows, read-only: the title, the status badge, the assignee (the given name, or the raw `assigneeId` when there is no name), the creation date, the update date and the identifier.
    - Contains no input, no select and no "Guardar" button.

- [ ] **Step 1: Write the failing test**

Create `src/components/tasks/TaskDetailDialog.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskDetailDialog } from './TaskDetailDialog'

const task = {
  id: 'task-1',
  title: 'Preparar la entrega',
  status: 'in_progress' as const,
  creatorId: 'admin-1',
  assigneeId: 'user-1',
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
}

describe('TaskDetailDialog', () => {
  it('muestra los datos de la tarea sin controles editables', () => {
    render(
      <TaskDetailDialog
        open
        task={task}
        assigneeName="Ana Pérez"
        onOpenChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: 'Detalle de la tarea' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Preparar la entrega')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument()
  })

  it('muestra el identificador del responsable cuando no se conoce su nombre', () => {
    render(
      <TaskDetailDialog open task={task} onOpenChange={vi.fn()} />,
    )

    expect(screen.getByText('user-1')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/tasks/TaskDetailDialog.test.tsx`
Expected: FAIL — `./TaskDetailDialog` does not exist.

- [ ] **Step 3: Implement the dialog**

Create `src/components/tasks/TaskDetailDialog.tsx`:

- Copy the `<dialog>` plumbing of `src/features/auth/AuthDialog.tsx`: a `useRef<HTMLDialogElement>`, an effect that calls `showModal()` when `open` is true and `close()` when it is false, and an `onClose` that calls `onOpenChange(false)`.
- Give the `<dialog>` the class `task-dialog`, `aria-labelledby="task-detail-title"` and a title "Detalle de la tarea".
- Render the fields in a `<dl className="task-dialog__grid">` with a `<dt>` for the label and a `<dd>` for the value: Título, Estado, Responsable, Creada, Actualizada, Identificador.
- Format the dates with `new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(task.createdAt))`.
- The identifier goes in a `<code>` with the class `task-dialog__id`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/tasks/TaskDetailDialog.test.tsx`
Expected: PASS, 2 tests.

- [ ] **Step 5: Style the new blocks**

Append to `src/App.css`:

- `.task-dialog__grid` — a grid with `grid-template-columns: minmax(0, 10rem) minmax(0, 1fr)`, `gap: 0.6rem 1rem`, `margin-block-start: 1.4rem`.
- `.task-dialog__grid dt` — `color: var(--ink-subtle)`, `font-size: 0.78rem`, `font-weight: 700`.
- `.task-dialog__grid dd` — `margin: 0`, `color: var(--ink)`, `font-size: 0.9rem`.
- `.task-dialog__id` — `font-family: ui-monospace, SFMono-Regular, Menlo, monospace`, `font-size: 0.78rem`, `color: var(--ink-subtle)`.

- [ ] **Step 6: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/tasks src/App.css
git commit -m "feat(tasks): add the read-only task detail dialog"
```

---

### Task 8: The table, the row menu and the delete confirmation

**Files:**
- Create: `src/components/tasks/TaskRowMenu.tsx`
- Create: `src/components/tasks/TaskConfirmDialog.tsx`
- Create: `src/components/tasks/TasksTable.tsx`
- Create: `src/components/tasks/TasksTable.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `Task` and `TaskStatus` from `src/lib/api/tasks.ts`; `TaskStatusBadge` and `taskStatusLabels` (Task 4); `useDeleteTask` (Task 2); `getApiErrorMessage` from `src/lib/api/errors.ts`; `notifyToast` from `src/lib/toast-store.ts`.
- Produces:
  - `src/components/tasks/TaskRowMenu.tsx`
    ```tsx
    export function TaskRowMenu({
      task,
      canDelete,
      onView,
      onEdit,
      onDelete,
    }: {
      task: Task
      canDelete: boolean
      onView: (task: Task) => void
      onEdit: (task: Task) => void
      onDelete: (task: Task) => void
    })
    ```
    - A Base UI `Menu` whose trigger is an icon button with the accessible name `Acciones de la tarea ${task.title}`.
    - The items are "Ver tarea", "Editar" and, only when `canDelete` is true, "Eliminar" (with the class `app-menu__item--danger`).
  - `src/components/tasks/TaskConfirmDialog.tsx`
    ```tsx
    export function TaskConfirmDialog({
      open,
      task,
      onOpenChange,
      onConfirm,
      isPending,
    }: {
      open: boolean
      task?: Task
      onOpenChange: (open: boolean) => void
      onConfirm: () => void
      isPending: boolean
    })
    ```
    - A native `<dialog>` with the accessible name "Eliminar la tarea" that repeats the title of the task, warns that the action is irreversible and offers "Cancelar" and "Eliminar".
  - `src/components/tasks/TasksTable.tsx`
    ```tsx
    export function TasksTable({
      tasks,
      isPending,
      isError,
      error,
      onRetry,
      assigneeName,
      canDelete,
      onViewTask,
      onEditTask,
      onDeleteTask,
    }: {
      tasks: Task[]
      isPending: boolean
      isError: boolean
      error: unknown
      onRetry: () => void
      assigneeName: (assigneeId: string) => string | undefined
      canDelete: boolean
      onViewTask: (task: Task) => void
      onEditTask: (task: Task) => void
      onDeleteTask: (task: Task) => void
    })
    ```
    - Renders a `<table className="tasks-table">` with a `<caption className="visually-hidden">Tareas</caption>`, a `<thead>` with the columns `Tarea`, `Estado`, `Responsable`, `Actualizada` and an empty header for the actions, and a `<tbody>` with one row per task.
    - When `isPending` it renders the loading state "Cargando tus tareas...".
    - When `isError` it renders the error state with `getApiErrorMessage(error)` and a "Reintentar" button that calls `onRetry`.
    - When `tasks` is empty and there is no error it renders the empty state "Todavía no hay tareas.".

- [ ] **Step 1: Write the failing test**

Create `src/components/tasks/TasksTable.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TasksTable } from './TasksTable'

const task = {
  id: 'task-1',
  title: 'Preparar la entrega',
  status: 'in_progress' as const,
  creatorId: 'admin-1',
  assigneeId: 'user-1',
  createdAt: '2026-11-14T12:00:00.000Z',
  updatedAt: '2026-11-14T12:00:00.000Z',
}

function renderTable(overrides: Partial<React.ComponentProps<typeof TasksTable>> = {}) {
  const props = {
    tasks: [task],
    isPending: false,
    isError: false,
    error: null,
    onRetry: vi.fn(),
    assigneeName: () => 'Ana Pérez',
    canDelete: true,
    onViewTask: vi.fn(),
    onEditTask: vi.fn(),
    onDeleteTask: vi.fn(),
    ...overrides,
  }

  render(<TasksTable {...props} />)

  return props
}

describe('TasksTable', () => {
  it('muestra una fila por tarea con su estado y su responsable', () => {
    renderTable()

    expect(screen.getByText('Preparar la entrega')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
  })

  it('muestra el identificador del responsable cuando no se conoce su nombre', () => {
    renderTable({ assigneeName: () => undefined })

    expect(screen.getByText('user-1')).toBeInTheDocument()
  })

  it('ofrece las tres acciones de la fila a un administrador', async () => {
    const props = renderTable()

    fireEvent.click(
      screen.getByRole('button', { name: 'Acciones de la tarea Preparar la entrega' }),
    )

    fireEvent.click(await screen.findByRole('menuitem', { name: 'Ver tarea' }))
    expect(props.onViewTask).toHaveBeenCalledWith(task)

    fireEvent.click(
      screen.getByRole('button', { name: 'Acciones de la tarea Preparar la entrega' }),
    )
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Editar' }))
    expect(props.onEditTask).toHaveBeenCalledWith(task)

    fireEvent.click(
      screen.getByRole('button', { name: 'Acciones de la tarea Preparar la entrega' }),
    )
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Eliminar' }))
    expect(props.onDeleteTask).toHaveBeenCalledWith(task)
  })

  it('oculta la eliminación a un usuario que no es administrador', async () => {
    renderTable({ canDelete: false })

    fireEvent.click(
      screen.getByRole('button', { name: 'Acciones de la tarea Preparar la entrega' }),
    )

    expect(await screen.findByRole('menuitem', { name: 'Ver tarea' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).not.toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay tareas', () => {
    renderTable({ tasks: [] })

    expect(screen.getByText('Todavía no hay tareas.')).toBeInTheDocument()
  })

  it('muestra el error y permite reintentar', () => {
    const props = renderTable({
      isError: true,
      error: { isAxiosError: true, response: { status: 500, data: { detail: 'Fallo' } } },
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(props.onRetry).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/tasks/TasksTable.test.tsx`
Expected: FAIL — `./TasksTable` does not exist.

- [ ] **Step 3: Implement the row menu**

Create `src/components/tasks/TaskRowMenu.tsx`:

```tsx
<Menu.Root>
  <Menu.Trigger
    className="tasks-table__actions-button"
    aria-label={`Acciones de la tarea ${task.title}`}
  >
    <MoreVertical size={18} aria-hidden="true" />
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup className="app-menu">
        <Menu.Item className="app-menu__item" onClick={() => onView(task)}>
          Ver tarea
        </Menu.Item>
        <Menu.Item className="app-menu__item" onClick={() => onEdit(task)}>
          Editar
        </Menu.Item>
        {canDelete ? (
          <Menu.Item
            className="app-menu__item app-menu__item--danger"
            onClick={() => onDelete(task)}
          >
            Eliminar
          </Menu.Item>
        ) : null}
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

The icon comes from lucide-react (`MoreVertical`).

- [ ] **Step 4: Implement the delete confirmation**

Create `src/components/tasks/TaskConfirmDialog.tsx` with the same `<dialog>` plumbing as the detail dialog. Its title is "Eliminar la tarea", its body repeats the title of the task and states "Esta acción no se puede deshacer.", and its buttons are "Cancelar" (which calls `onOpenChange(false)`) and "Eliminar" (which calls `onConfirm` and is disabled while `isPending`).

- [ ] **Step 5: Implement the table**

Create `src/components/tasks/TasksTable.tsx`:

- The table has a `<caption className="visually-hidden">Tareas</caption>`, a `<thead>` with `<th scope="col">` for `Tarea`, `Estado`, `Responsable`, `Actualizada` and an empty `<th scope="col" aria-label="Acciones">`.
- Each row renders the title, the `TaskStatusBadge`, the responsible (`assigneeName(task.assigneeId) ?? task.assigneeId`), the update date formatted `es-ES` and the `TaskRowMenu`.
- The loading, error and empty states reuse the existing `.tasks-state`, `.tasks-state--error` and `.tasks-state--empty` classes of `src/App.css`. The error state container carries `role="alert"`, the loading state carries `role="status"`, exactly as the current `src/pages/TasksPage.tsx` does.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/components/tasks/TasksTable.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 7: Style the new blocks**

Append to `src/App.css`:

- `.tasks-table` — `inline-size: 100%`, `border-collapse: collapse`, `background: var(--surface)`.
- `.tasks-table__head th` — `text-align: left`, `padding: 0.75rem 1rem`, `border-block-end: 1px solid var(--line)`, `color: var(--ink-subtle)`, `font-size: 0.74rem`, `font-weight: 780`, `text-transform: uppercase`, `letter-spacing: 0.04em`.
- `.tasks-table__row` — `border-block-end: 1px solid var(--line)`.
- `.tasks-table__row:last-child` — `border-block-end: 0`.
- `.tasks-table__cell` — `padding: 0.85rem 1rem`, `vertical-align: middle`.
- `.tasks-table__title` — `color: var(--ink)`, `font-size: 0.95rem`, `font-weight: 700`.
- `.tasks-table__date` — `color: var(--ink-subtle)`, `font-size: 0.78rem`, `white-space: nowrap`.
- `.tasks-table__assignee` — `color: var(--ink-muted)`, `font-size: 0.85rem`.
- `.tasks-table__actions` — `text-align: right`, `inline-size: 3rem`.
- `.tasks-table__actions-button` — `display: inline-grid`, `place-items: center`, `inline-size: 2.25rem`, `block-size: 2.25rem`, `border: 1px solid transparent`, `border-radius: 0.45rem`, `background: transparent`, `color: var(--ink-muted)`, `cursor: pointer`.
- `.tasks-table__actions-button:hover` — `border-color: var(--line)`, `background: var(--canvas)`.

Add a responsive block at the end of the file, next to the existing `@media (max-width: 47.99rem)` block, that hides the `Responsable` and `Actualizada` columns on narrow screens.

- [ ] **Step 8: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/tasks src/App.css
git commit -m "feat(tasks): add the tasks table with the row actions and the delete confirmation"
```

---

### Task 9: The page assembly

**Files:**
- Modify: `src/pages/TasksPage.tsx`
- Modify: `src/pages/TasksPage.test.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: everything the previous tasks produce.
- Produces: the `/tasks` workspace page.

- [ ] **Step 1: Write the failing tests**

Extend `src/pages/TasksPage.test.tsx`. Keep the three existing cases untouched and add:

```tsx
  it('filtra las tareas por estado', async () => {
    const get = vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }

      if (url === '/healthcheck') {
        return Promise.resolve({ data: healthy })
      }

      if (url === '/users') {
        return Promise.resolve({ data: [] })
      }

      return Promise.resolve({
        data: {
          items: [],
          pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
        },
      })
    })

    renderAt('/tasks')

    await screen.findByRole('heading', { level: 1, name: 'Tus tareas' })
    fireEvent.click(screen.getByRole('button', { name: 'En curso' }))

    await waitFor(() => {
      expect(get).toHaveBeenCalledWith('/tasks', {
        params: { page: 1, limit: 100, status: 'in_progress' },
      })
    })
  })

  it('oculta las acciones de administrador a un usuario', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/get-session') {
        return Promise.resolve({ data: session })
      }

      if (url === '/healthcheck') {
        return Promise.resolve({ data: healthy })
      }

      return Promise.resolve({
        data: {
          items: [
            {
              id: 'task-1',
              title: 'Preparar la entrega',
              status: 'in_progress',
              creatorId: 'admin-1',
              assigneeId: 'user-1',
              createdAt: '2026-11-14T12:00:00.000Z',
              updatedAt: '2026-11-14T12:00:00.000Z',
            },
          ],
          pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      })
    })

    renderAt('/tasks')

    await screen.findByText('Preparar la entrega')

    expect(
      screen.queryByRole('button', { name: 'Crear Tarea' }),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Acciones de la tarea Preparar la entrega',
      }),
    )

    expect(await screen.findByRole('menuitem', { name: 'Ver tarea' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).not.toBeInTheDocument()
  })
```

The `session` fixture in that file has `role: 'USER'`; add an `adminSession` fixture with `role: 'ADMIN'` for the administrator cases.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/pages/TasksPage.test.tsx`
Expected: FAIL — the page has no filter, no table and no "Crear Tarea" button.

- [ ] **Step 3: Rewrite the page**

Rewrite `src/pages/TasksPage.tsx`:

- `usePageTitle('Tus tareas | Tarea')`.
- Read the session with `useSessionQuery()`; `isAdmin = session?.user.role === 'ADMIN'`.
- Hold the filter state with `useState<TaskStatusFilterValue>('all')` and feed it to `useTasks(filter === 'all' ? undefined : filter)`.
- Render, inside `<main className="tasks-page" id="contenido" tabIndex={-1}>`:
  - a hero with the title "Tus tareas" and the count of `tasksQuery.data.pagination.total`,
  - the "Crear Tarea" button, rendered only when `isAdmin`, that opens the `TaskFormDialog` in create mode,
  - the `TaskStatusFilter` bound to the filter state,
  - the `TasksTable` fed with the query state and with `assigneeName` built from the users list (`useUsers()`) and the session,
  - the `TaskDetailDialog` for the task being viewed,
  - the `TaskFormDialog` for the task being edited,
  - the `TaskConfirmDialog` for the task being deleted.
- When `pagination.total` is greater than the number of rows rendered, show a quiet line under the table: "Mostrando las primeras 100 tareas." The client asks for `limit: 100`, which is the maximum the server accepts.
- The delete flow: `useDeleteTask()`; on success `notifyToast({ tone: 'success', title: 'Tarea eliminada.' })` and close the dialog; on error `notifyToast({ tone: 'error', title: 'No se pudo eliminar la tarea.', message: getApiErrorMessage(error) })`.
- The assignee name resolution:

```ts
const assigneeName = (assigneeId: string) => {
  const known = usersQuery.data?.find((user) => user.id === assigneeId)
  if (known) {
    return known.name
  }
  return assigneeId === session?.user.id ? session.user.name : undefined
}
```

- The "Crear Tarea" button opens the dialog with `mode="create"` and no task; the row menu's "Editar" opens it with `mode="edit"` and the task.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/pages/TasksPage.test.tsx`
Expected: PASS, every case.

- [ ] **Step 5: Remove the obsolete styles**

In `src/App.css`, delete the `.tasks-hero`, `.tasks-hero__inner`, `.tasks-hero h1`, `.tasks-hero__inner > div:first-child > p:last-child`, `.tasks-profile`, `.tasks-profile__avatar`, `.tasks-profile > div`, `.tasks-profile strong`, `.tasks-profile span`, `.tasks-profile small`, `.tasks-profile small`, `.tasks-list`, `.tasks-list__item`, `.tasks-list__status`, `.tasks-list__status--pending`, `.tasks-list__status--in_progress`, `.tasks-list__status--done`, `.tasks-list__copy`, `.tasks-list__copy strong`, `.tasks-list__copy span` and `.tasks-list__label` blocks, and their rules inside the `@media (max-width: 47.99rem)` block. Nothing else in the file references them.

Keep `.tasks-page`, `.tasks-section`, `.tasks-section__header`, `.tasks-section__header h2`, `.tasks-count` and `.tasks-state`, and reuse them in the new page.

- [ ] **Step 6: Run the whole suite to verify it passes**

Run: `npm test`
Expected: PASS, every file green.

- [ ] **Step 7: Commit**

```bash
git add src/pages src/App.css
git commit -m "feat(tasks): assemble the tasks workspace page"
```

---

## Manual verification

After the tasks are done, verify against a running backend with `npm run dev` (never `npm run preview`, whose origin the backend does not trust).

1. Sign in as a `USER`. Confirm that `/tasks` shows the table, that the row menu offers "Ver tarea" and "Editar", that the "Editar" dialog only lets the status change, and that neither "Crear Tarea" nor "Eliminar" exist.
2. Sign in as an `ADMIN` (promote the account with the SQLite statement in the Global Constraints). Confirm that "Crear Tarea" exists, that the assignee picker lists the `USER` accounts, and that the row menu offers "Eliminar".
3. Watch the health indicator for at least 40 seconds and confirm that it polls the healthcheck endpoint twice.
4. Stop the backend and confirm that the indicator reads "Sin conexión" and that the menu still offers "Cerrar sesión".
5. Sign out from the menu and confirm that the app returns to `/` and that `/tasks` redirects there on the next visit.
