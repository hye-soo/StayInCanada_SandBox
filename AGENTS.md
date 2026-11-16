<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions (FlowOui)

### Stack

- Next.js (App Router), JavaScript (.js/.jsx, no TypeScript)
- Tailwind CSS + shadcn/ui (Radix UI, Nova preset)
- Use the "@/..." import alias

### Folder structure

- src/components/ui: smallest components (button, label, input, checkbox, logo, shadcn components)
- src/components/patterns: composed components (custom-card, custom-form, data-list, data-table, notice-status, progress-card, upload-card)
- src/components/layouts: page skeletons (header, page-header, sidebar-nav, app-shell, auth)
- Do NOT split components by client/staff. Handle differences with props.
- Routes are split with route groups: src/app/(auth), (client), (staff)
- Client intake steps use one dynamic route (intake/[step]) driven by data in src/data/intake-steps.js

### Styling

- Use design tokens from src/app/globals.css (shadcn variables + @theme navy/lime). Never hardcode hex colors.
- Tokens come from Figma "FlowOui / Foundations" variables.
- Input/Button height is 48px (h-12), pill shape (rounded-full).

### Rules

- Do not modify src/components/ui/button.jsx unless asked.
- Code comments are written in English.
- Auth is mocked for now: src/data/mock-users.js (localStorage). Replace with real API later.
- A01 (accept invitation) is client-only. A02 (sign in) is shared by client and staff and redirects by role.
