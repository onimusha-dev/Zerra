# Architecture & Tech Stack

Zerra follows a modern, decoupled architecture designed for scale and developer happiness.

## Core Stack

| Layer             | Technology                                   | Purpose                                               |
| :---------------- | :------------------------------------------- | :---------------------------------------------------- |
| **Framework**     | [Next.js](https://nextjs.org/)               | App Router, Server Components, and Routing.           |
| **API Client**    | [Axios](https://axios-http.com/)             | Centralized HTTP client with interceptors for Auth.   |
| **Server State**  | [TanStack Query](https://tanstack.com/query) | Caching, Polling, and Syncing with the backend.       |
| **Global State**  | [Zustand](https://zustand-demo.pmnd.rs/)     | Handling UI state (Themes, Modals, Auth local state). |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/)          | Accessible, customizable primitive components.        |
| **Styling**       | [Tailwind CSS 4](https://tailwindcss.com/)   | Utility-first CSS with next-gen performance.          |
| **Backend**       | [Hono](https://hono.dev/)                    | Ultra-fast JS framework (documented in `api.md`).     |

## Directory Structure

```text
src/
├── app/             # Router & Page Definitions
├── components/      # UI & Feature Components
│   └── ui/          # Shadcn Primitives
├── hooks/           # Business Logic
│   └── queries/     # TanStack Query Hooks
├── stores/          # Zustand State Definitions
├── lib/             # Utilities & Axiose Instance
└── types/           # TS Interfaces & Schemas
```

## Data Flow

1. **Request**: Triggered via a custom hook in `hooks/queries`.
2. **Execution**: Hook uses the central `lib/api.ts` (Axios) to call the Hono backend.
3. **Caching**: TanStack Query caches the result.
4. **Consumption**: Components subscribe to the hook and render based on success/loading/error states.
