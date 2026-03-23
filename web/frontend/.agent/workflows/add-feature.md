---
description: Create a new API-connected component follow Zerra standards
---

This workflow guides you through creating a new component that fetches data from the Zerra API and manages state correctly.

1. **Verify Endpoint**: Check `DOCS.md` for the correct API endpoint and response format.
2. **State Design**: Decide if the state should be local (`useState`), global (`zustand`), or server-cached (`TanStack Query`).
3. **Write Hook**:
    - For API data, create a hook in `hooks/queries/use[Feature].ts` using `@tanstack/react-query` and `axios`.
    - For global UI state, create/update a store in `stores/use[Feature]Store.ts` using `zustand`.
4. **Build UI**: Create the component using Shadcn UI and follow the `zerra-frontend-standards` for theming and micro-interactions.
5. **Error Handling**: Implement loading states and error boundaries.

// turbo 6. **Lint Check**: Run `pnpm lint` to ensure code quality.
