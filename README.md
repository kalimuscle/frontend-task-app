# Tarea — Gestión de tareas full-stack

Aplicación de gestión de tareas con dos piezas:

- **`frontend-app`** (este repositorio): SPA en React que consume la API.
- **`backend`**: API REST en Node.js con autenticación por sesión, roles `ADMIN`/`USER` y persistencia en SQLite.

La parte pública del frontend explica el reto y el stack. La parte útil es `/tasks`: un espacio de trabajo privado al que solo se entra con sesión iniciada, con la tabla de tareas, el filtro por estado, el alta y la edición de tareas, y un indicador en vivo del estado del servidor.

## Requisitos

- Node.js 24 LTS.
- npm.
- Permiso de escritura en `backend/data/` (la base de datos SQLite).

## Inicialización

### 1. Backend

```bash
cd ../backend
npm ci
```

Crea el archivo de entorno (en PowerShell: `Copy-Item .env.example .env`):

```bash
cp .env.example .env
```

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=./data/app.db
BETTER_AUTH_SECRET=una-clave-secreta-de-al-menos-32-caracteres
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173
```

Genera el secreto y prepara la base de datos:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node -e "require('node:fs').mkdirSync('data', { recursive: true })"
npx drizzle-kit migrate
```

Arranca la API:

```bash
npm run dev
```

Queda disponible en `http://localhost:3000`.

### 2. Frontend

```bash
cd ../frontend-app
npm ci
npm run dev
```

Queda disponible en `http://localhost:5173`. El proxy de Vite reenvía `/api` a `http://localhost:3000`, así que no hace falta configurar ninguna URL en el cliente.

> Usa siempre `npm run dev`. `npm run preview` sirve en el puerto 4173 y el backend solo confía los orígenes 3000 y 5173, así que en `preview` las peticiones que modifican datos fallan con `403`.

### 3. Primer usuario

El formulario de registro permite elegir el tipo de cuenta (`USER` o `ADMIN`) y el backend lo respeta:

- `ADMIN`: ve las tareas que crea, puede crearlas, reasignarlas, editarlas y eliminarlas.
- `USER`: ve las tareas que tiene asignadas y solo puede cambiar su estado.

## Comandos

### Frontend

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173`. |
| `npm run build` | Compila TypeScript y genera el bundle de producción en `dist/`. |
| `npm run preview` | Sirve el bundle de producción en el puerto 4173; úsalo solo para revisar la interfaz, porque el backend no confía ese origen. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm run typecheck` | `tsc` en modo comprobación, sin emitir archivos. |
| `npm test` | Ejecuta la suite de Vitest una vez. |
| `npm run test:watch` | Ejecuta la suite en modo watch. |

### Backend

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API en `http://localhost:3000`. |
| `npm test` | Pruebas de integración HTTP con Jest y Supertest. |
| `npm run test:watch` | Pruebas en modo watch. |
| `npm run test:coverage` | Pruebas con informe de cobertura (umbral del 80 %). |
| `npx drizzle-kit migrate` | Aplica las migraciones. |
| `npx drizzle-kit generate` | Genera una migración a partir del esquema. |

## Pruebas

```bash
npm test
```

La suite del frontend usa Vitest, Testing Library y jsdom. Cubre el guard de `/tasks`, el ciclo de alta, acceso y cierre de sesión, la tabla, el filtro por estado, los diálogos de ver, editar y eliminar, las reglas por rol y el indicador de conexión del servidor.

> **Las pruebas de autenticación requieren el backend en marcha.**
> Los casos de alta y de inicio de sesión de `src/features/auth/AuthDialog.test.tsx` comprueban también la renovación de la sesión, que se pide a la API real mediante `GET /api/auth/get-session`. Si el servidor no está levantado en `http://localhost:3000`, esa llamada falla y los avisos de "Cuenta creada correctamente." y "Sesión iniciada correctamente." no llegan a aparecer. Arranca el backend antes de lanzar la suite:
>
> ```bash
> cd ../backend
> npm run dev
> ```
>
> El resto de la suite no depende del servidor: las peticiones a la API están simuladas en cada test.

```bash
npm run typecheck
```

Comprueba los tipos de todo el proyecto sin emitir archivos.

En el backend, las pruebas de integración usan Supertest contra la API exportada por `src/app.ts`, sin abrir un puerto, y sobre una base de datos aislada por worker. El contrato OpenAPI 3.1 se mantiene por dominio y también se verifica.

## Tech stack

### Frontend

| Tecnología | Uso |
| --- | --- |
| React 19 | Componentes y hooks. |
| TypeScript 6 | Tipado estricto de toda la aplicación. |
| Vite 8 | Servidor de desarrollo, proxy a la API y build. |
| React Router 7 | Rutas y layouts (`SiteLayout` para el público, `TasksLayout` para `/tasks`). |
| TanStack Query 5 | Estado del servidor: tareas, usuarios, sesión y healthcheck. |
| TanStack Form 1 + Zod 4 | Formularios con validación en el borde. |
| Axios | Cliente HTTP con `baseURL: '/api'` y cookie de sesión. |
| Base UI (`@base-ui/react`) | Primitivas accesibles: menús, pestañas y diálogos. |
| Tailwind CSS 4 | Tokens y utilidades; la maquetación vive en `src/App.css`. |
| lucide-react | Iconografía. |
| Vitest 5 + Testing Library + jsdom | Pruebas de componente y de página. |

La sesión se resuelve con las rutas REST de Better Auth (`/api/auth/get-session`) usando la cookie `HttpOnly`; el frontend no instancia el cliente de Better Auth.

### Backend

| Tecnología | Uso |
| --- | --- |
| Node.js 24 LTS | Runtime con TypeScript nativo (ESM). |
| Express 5 | Servidor HTTP y enrutado. |
| Better Auth 1.7 | Usuarios, sesiones por cookie, roles y plugin JWT. |
| Drizzle ORM + better-sqlite3 | Persistencia tipada en SQLite. |
| Zod | Validación de entorno, parámetros y cuerpos. |
| pino + pino-http | Logs estructurados. |
| Jest 30 + Supertest | Pruebas de integración. |

## Arquitectura

### Capas del frontend

```text
pages/           componen la pantalla y conectan capas
    ↓
components/      UI sin conocimiento del transporte
    ↓
features/        hooks de servidor (TanStack Query) y estado de sesión
    ↓
lib/api/         funciones por endpoint sobre un único cliente Axios
```

- `lib/api/client.ts` es el único punto de salida HTTP: `baseURL: '/api'`, `withCredentials: true`. Cada endpoint tiene su función (`listTasks`, `createTask`, `listUsers`, `getHealthcheck`, `signOut`…) y sus tipos.
- `features/*/use-*.ts` expone el estado del servidor como hooks. Las mutaciones invalidan la caché afectada (`['tasks']`, `['users']`, `['session']`), de modo que la tabla se refresca sola tras un alta o un borrado.
- `components/` contiene la interfaz. Los diálogos son `<dialog>` nativos; los menús y las pestañas usan Base UI.
- `lib/schemas/` valida con Zod en el borde del formulario, con los mismos límites que aplica el servidor.
- `src/App.css` contiene la maquetación con clases BEM y los tokens de `src/index.css`.

```text
src/
├── components/
│   ├── home/           # secciones de la landing
│   ├── layout/         # SiteLayout (marketing) y TasksLayout (workspace)
│   ├── notifications/  # viewport de avisos
│   ├── tasks/          # header, tabla, menús y diálogos de /tasks
│   └── ui/             # primitivas propias
├── features/
│   ├── auth/           # sesión, alta, acceso y cierre de sesión
│   └── tasks/          # hooks de tareas, usuarios y healthcheck
├── lib/
│   ├── api/            # cliente HTTP y funciones por endpoint
│   ├── schemas/        # validación Zod
│   ├── query-client.ts
│   └── toast-store.ts
├── pages/              # Home, Tech Stack, Uso de la IA, Candidato, Tasks, 404
└── test/               # configuración de Vitest
```

### La vista `/tasks`

`/tasks` no usa el layout público: vive dentro de `TasksLayout`, protegido por `RequireAuth`. Sin sesión, el guard redirige a `/` y abre el diálogo de acceso.

- **Header propio**: identidad del usuario, indicador de conexión que consulta `GET /api/healthcheck` cada 20 segundos y un menú con el cierre de sesión.
- **Tabla**: una fila por tarea con su estado, responsable y fecha de actualización, y un filtro por estado que filtra en el servidor.
- **Acciones por fila**: ver la tarea (modal de solo lectura), editarla (formulario) y eliminarla (con confirmación).
- **Alta**: el botón "Crear Tarea" abre el mismo formulario en vacío.
- **Roles**: un `ADMIN` edita todos los campos y ve el selector de responsable; un `USER` solo cambia el estado.

## Uso de la IA

Se utilizó un coding agent como colaborador para explorar el proyecto, implementar cambios y acelerar verificaciones. Cada resultado se revisó antes de darlo por terminado. Usando la metodologia Spec Driven

**Criterio de uso:** la IA propone y ejecuta; la persona define, valida y decide.

| Herramienta | Aportación |
| --- | --- |
| **OpenCode** (coding agent CLI) | Exploró el código, planificó el trabajo y colaboró en la implementación. |
| **MiniMax M3** (modelo) | Redactó, explicó, propuso y refinó el código junto al agente. |
| [obra/superpowers](https://github.com/obra/superpowers) | Skills especializadas y una metodología que estructura el trabajo desde la exploración hasta la verificación. |
| [autoskills](https://www.autoskills.sh/) | Detección automática del stack e instalación de las skills adequadas al proyecto. |
| [modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) | Guía actualizada por Google sobre interfaces, accesibilidad, rendimiento y APIs web. |

Estas herramientas aportan contexto, disciplina y prácticas concretas. No sustituyen las decisiones técnicas: las orientan y ayudan a verificarlas.
