# Karakeep Project Overview

This document provides context about the Karakeep project for the different agents.

## LinkSteward Context

LinkSteward is a fork of KaraKeep. The project is currently in the v0.1-alpha / early implementation phase.

The final technical analysis and decision basis for the fork is:

- `docs/docs/linksteward/analysis/karakeep-analysis-v0.1.md`

### Binding v0.1-alpha Decisions

These decisions are binding for LinkSteward v0.1-alpha unless the user explicitly asks to revise them:

- KaraKeep remains the technical base.
- SQLite remains the database for v0.1-alpha.
- Do not do a PostgreSQL migration before alpha.
- Keep the `@karakeep/*` namespace for alpha.
- Do not do a large branding or namespace rename in the first alpha slice.
- Use Extension Tables first.
- Do not add a direct `bookmarks.deletedAt` column in the first alpha slice.
- Build the Linkwarden-compatible API first.
- Test Floccus in Linkwarden mode first.
- KaraKeep-Floccus mode: basic sync confirmed working out-of-the-box (2026-05-14, Floccus v5.8.6, Firefox). Intensive testing (bidirectional, conflict, large datasets) is deferred. See docs/docs/linksteward/testing/floccus-sync-results-v0.1.md.
- Implement alpha Soft Delete through `linksteward_item_extensions.deletedAt`.
- Implement External Mappings through `linksteward_external_mappings`.
- Filter non-URL items from compatibility APIs.
- Hide AI-generated tags from Linkwarden compatibility during alpha, or treat them as read-only if explicitly required.
- The queue system is `queue-liteque` / `queue-restate`, not Bull.

### LinkSteward Agent Safety Rules

- For analysis tasks, do not change source files.
- Do not install dependencies unless explicitly asked.
- Do not change `package.json`, `pnpm-lock.yaml`, or migrations unless explicitly asked.
- Do not perform broad refactors.
- Keep changes small and reviewable.
- Before code changes, create or update the relevant plan, ADR, or issue first.
- After changes, state which tests or build commands should be run, and run them when appropriate for the task.
- `CLAUDE.md` and `GEMINI.md` are symlinks to `AGENTS.md`; write shared agent instructions only to `AGENTS.md`.

## Project Overview

Karakeep is a monorepo project managed with Turborepo. It appears to be a web application with a focus on collecting and organizing information, possibly a bookmarking or "read-it-later" service. The project is built with a modern tech stack, including:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Hono (a lightweight web framework), tRPC
- **Database:** Drizzle ORM (likely with a relational database like PostgreSQL or SQLite)
- **Tooling:** Oxfmt, oxlint, Vitest, pnpm

## Project Structure

The project is organized into `apps` and `packages`:

### Applications (`apps/`)

- **`web`:** The main web application, built with Next.js.
- **`browser-extension`:** A browser extension, likely for saving content to karakeep.
- **`cli`:** A command-line interface for interacting with the service.
- **`landing`:** A landing page for the project.
- **`mobile`:** A mobile application (details unknown).
- **`mcp`:** The Model Context Protocol (MCP) server to communicate with Karakeep.
- **`workers`:** Background workers for processing tasks.

### Packages (`packages/`)

- **`api`:** The main API, built with Hono and tRPC.
- **`db`:** Database schema and migrations, using Drizzle ORM.
- **`e2e_tests`:** End-to-end tests for the project.
- **`open-api`:** OpenAPI specifications for the API.
- **`sdk`:** A software development kit for interacting with the API.
- **`shared`:** Shared code and types between packages.
- **`shared-react`:** Shared React components and hooks.
- **`shared-server`:** Shared logic that's meant to be used on the server-side.
- **`trpc`:** tRPC router and procedures. Most of the business logic is here.

### Docs

- **docs/docs/03-configuration.md**: Explains configuration options for the project.

## Development Workflow

- **Package Manager:** pnpm
- **Build System:** Turborepo
- **Code Formatting:** Oxfmt
- **Linting:** oxlint
- **Testing:** Vitest

## Other info

- This project uses shadcn/ui. The shadcn components in the web app are in `packages/web/components/ui`.
- This project uses Tailwind CSS.
- For the mobile app, we use [expo](https://expo.dev/).

### Common Commands

- `pnpm typecheck`: Typecheck the codebase.
- `pnpm lint`: Lint the codebase.
- `pnpm lint:fix`: Fix linting issues.
- `pnpm format`: Format the codebase.
- `pnpm format:fix`: Fix formatting issues.
- `pnpm test`: Run tests.
- `pnpm db:generate --name description_of_schema_change`: db migration after making schema changes

Starting services:
- `pnpm web`: Start the web application (this doesn't return, unless you kill it).
- `pnpm workers`: Starts the background workers (this doesn't return, unless you kill it).
