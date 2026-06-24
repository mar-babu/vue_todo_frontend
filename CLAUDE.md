# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repo.

## Project

Todo App Frontend is a task management interface built to connect with the Laravel backend API.

Stack: Vue 3 (Composition API), TypeScript, Vite, Tailwind CSS, Vue Router, Axios for API requests, TipTap for rich text editing, Radix-style UI components.

## Common Commands

```bash
npm run dev      # vite dev server
npm run build    # production bundle
npm run preview  # preview production build locally
```

## Architecture

### Component Structure
- `src/components/` - Contains all Vue components.
  - `auth/` - Login and Signup components.
  - `task/` - Task list, items, forms, and rich text editor (`DescriptionEditor.vue`).
  - `ui/` - Reusable shared UI primitives (shadcn-vue style components like Button, Card, Dialog, Input).
  - `Dashboard.vue` - Main authenticated view container.

### Services and State
- `src/services/taskService.ts` - Centralizes all Axios API calls to the Laravel backend. Includes response interceptors to handle 401 Unauthorized errors by automatically destroying the local token and redirecting to login.
- `src/router/index.ts` - Handles client-side routing and route guards (e.g., redirecting unauthenticated users to `/login`).
- `src/lib/` - Shared utility functions (e.g., `utils.ts` for Tailwind merge and class manipulation).

## Conventions

### Vue & TypeScript
- Use Composition API with `<script setup lang="ts">`.
- Define explicit types and interfaces for component props and API payloads (e.g., `Task`, `TaskStatus` enum).
- Prefer Vue 3 reactivity (`ref`, `computed`, `watch`).
- Use `@/` alias to refer to `src/` directory files.

### Styling
- Use Tailwind CSS utility classes.
- Ensure responsive design, particularly checking mobile views (e.g., adjusting padding using `p-2 sm:p-6` and ensuring hover states are properly handled on touch devices).

### API & Authentication
- Read the API base URL from Vite environment variables: `import.meta.env.VITE_API_BASE_URL`.
- Store the authentication token in `localStorage` as `auth_token`.
- Axios is configured globally in `taskService.ts` to attach the Bearer token to all requests.
