# Development Workflow

To maintain the high standards of Zerra, development follows a strict workflow supported by AI Skills and Workflows.

## Antigravity (AI) Integration

I (Antigravity) have been trained on the following specific assets:

### 🛠️ Skills

The `Zerra Frontend Standards` skill ensures that whenever I write code, I check for:

- Proper API response status handling.
- Theme variable usage.
- Performance-optimized React patterns.

### 🏗️ Workflows

Use the `/add-feature` slash command to trigger a guided implementation of new features. This ensures we never skip critical steps like error handling or mobile responsiveness.

## Common Tasks

### Adding a New API Endpoint

1. Update backend (if needed).
2. Document in `docs/api.md`.
3. Create a query hook in `src/hooks/queries`.
4. Implement the UI using Shadcn.

### Creating a Global UI Feature

1. Create a store in `src/stores`.
2. Bind the UI to the store's state.
3. Test with multiple theme schemes.

## Quality Control

- **Linting**: Run `pnpm lint` frequently.
- **Micro-animations**: Every new interactive element must have a Framer Motion gesture (hover/tap).
- **Mobile First**: All layouts must work seamlessly on mobile before being considered finished.
