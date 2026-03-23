# App Backend

work in progress...

## Technical Stack

- **Runtime**: Node.js (via `pnpm dev`)
- **Framework**: [Hono](https://hono.dev/)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Caching**: Redis
- **Validation**: Zod
- **Logging**: Pino

---

## Documentation

Detailed documentation is available in the [`/docs`](./docs) directory:

- [**Project Structure**](./docs/PROJECT_STRUCTURE.md) - Understanding the modular architecture.
- [**API Routing**](./docs/API_ROUTING.md) - How endpoints, validation, and responses work.
- [**Clean Code Guidelines**](./docs/CLEAN_CODE_GUIDELINES.md) - Best practices and conventions for this repo.

---

## Getting Started

### 1. Prerequisites

- Node.js (v20+)
- PostgreSQL
- Redis (for caching)

### 2. Environment Setup

Create a `.env` file in the `api/` root (refer to `.env.example` for all required fields).

### 3. Installation

```bash
pnpm install
```

### 4. Database Setup

```bash
pnpm db:migrate
pnpm prisma generate
```

### 5. Running the App

```bash
# Development mode (with auto-reload)
pnpm dev

# Production build
pnpm build
pnpm start
```

---
