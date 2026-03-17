---
name: Zerra Frontend Standards
description: Instructions for building the Zerra frontend, including API handling, component structure, and design patterns.
---

# Zerra Frontend Development Standards

When working on the Zerra frontend, always adhere to these standards to ensure a premium, performant, and consistent experience.

## 1. Tech Stack Standards

### 📡 API & Data Fetching (Axios + TanStack Query)

- **Client**: Use a central `axios` instance with interceptors for auth tokens.
- **Queries**: Always use `@tanstack/react-query` for data fetching (`useQuery`) and mutations (`useMutation`).
- **Keys**: Use a consistent query key factory pattern (e.g., `userKeys.profile(id)`).
- **Hooks**: Wrap all API logic in custom hooks. Never call `axios` directly in components.

### 🧠 State Management (Zustand)

- **Global State**: Use `zustand` for high-frequency or global UI state (Auth, Theme, Modals).
- **Separation**: Keep stores small and focused (e.g., `useAuthStore`, `useThemeStore`).
- **Persistence**: Use `persist` middleware for tokens and theme preferences.

### 🎨 Styling & UI (Shadcn UI + Tailwind 4)

- **Consistency**: Use Shadcn UI components for all interactive elements (Buttons, Dialogs, Inputs).
- **Customization**: Extend Shadcn styles to match the "Zerra" premium aesthetic (glassmorphism, subtle borders).
- **Animations**: Use Framer Motion for micro-interactions (hover, transitions).

## 2. Multi-Theme System (The 5 Schemes)

Zerra supports 5 distinct color schemes. Always use CSS variables (`--primary`, `--accent`, etc.) instead of hardcoded hex values.

| Theme       | Name     | Primary Tone        | Mood                   |
| :---------- | :------- | :------------------ | :--------------------- |
| **Default** | Midnight | Pure Black / White  | Classic, High Contrast |
| **Dim**     | Eclipse  | Charcoal / Indigo   | Soft, Eye-friendly     |
| **Ocean**   | Aurora   | Deep Navy / Cyan    | Tech-focused, Calm     |
| **Crimson** | Velocity | Dark Red / Rose     | Energetic, Bold        |
| **Forest**  | Verdant  | Deep Emerald / Mint | Organic, Unique        |

- **Mechanism**: Set the `data-theme` attribute on the `<html>` or `<body>` tag.
- **Variables**: Ensure all components respond to `--background`, `--foreground`, and `--primary`.

## 3. UI/UX Philosophy

- **"Twitter-Inspired, Zerra-Enhanced"**: Use the familiar 3-column layout but add premium touches:
    - Glassmorphism on sidebars/headers.
    - Smooth layout transitions.
    - Custom scrollbars.
- **Micro-interactions**: Every click should have subtle feedback.

## 4. Workflows

- **Check `docs/api.md`**: Always refer to the API documentation before building features.
- **Zerra Standards**: Use the `/add-feature` workflow for consistent implementation.
