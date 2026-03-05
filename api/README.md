# App Backend

work in progress...

<!--
##  Technical Stack

-   **Runtime**: Node.js (via `tsx`)
-   **Language**: TypeScript
-   **Framework**: Koa.js
-   **Database**: PostgreSQL + Prisma
-   **Validation**: Zod (for Environment and Request validation)
-   **Queue**: BullMQ (Redis-backed)
-   **Authentication**: JWT + Argon2 for password hashing

--- -->

## Getting Started

### 1. Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis (for queues and caching)

### 2. Environment Setup

Create a `.env` file in the `api/` root:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/todoapp"
JWT_SECRET="your-super-long-secret-key-at-least-32-chars"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Installation

```bash
pnpm install
```

### 4. Database Setup

```bash
pnpm dlx db:push
pnpm dlx db:generate
```

### 5. Running the App

```bash
# Development mode (with auto-reload)
pnpm run dev

# Production build
pnpm run build
pnpm start
```

---

## Directory Structure (Infrastructure)

- `src/main.ts`: Entry point of the engine.
- `src/platform/application/`: Contains the `Application` manager and `Container` (IoC).
- `src/platform/http/`: The `HttpServer` and custom middleware.
- `src/platform/database/`: The `DatabaseService` (Prisma wrapper).
- `src/platform/config/`: Self-validating configuration via Zod.
- `src/modules/`: Individual feature-based modules following the Controller-Service-Repository pattern.

---
