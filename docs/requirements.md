# Implementation Baseline

This document defines the default repository layout and shared development rules for the MVP described in [product.md](/workspace/product.md).

The goal is to remove ambiguity for the first implementation pass. If a future change needs to break one of these rules, the rule should be updated here first.

## 1. Monorepo Structure

Use a single JavaScript/TypeScript monorepo with `pnpm` workspaces.

```text
/
├── apps/
│   ├── web/                 # Frontend app
│   ├── api/                 # Backend API and orchestration
│   └── worker-ai/           # Async AI/STT evaluation worker
├── packages/
│   ├── config/              # Shared env loading, app config schemas
│   ├── types/               # Shared API and domain types
│   ├── ui/                  # Shared frontend primitives and tokens
│   ├── eslint-config/       # Shared lint config
│   └── tsconfig/            # Shared TS config presets
├── infrastructure/
│   ├── docker/              # App Dockerfiles when needed
│   └── compose/             # Local compose files for app dependencies
├── docs/
│   ├── requirements.md
│   ├── design.md
│   └── codex-docker.md
├── scripts/                 # Local dev and repo automation scripts
├── .env.example             # Root-level env variable template
├── package.json             # Root scripts only
├── pnpm-workspace.yaml
└── turbo.json               # Task pipeline config
```

### Why this structure

- `apps/web` owns the speaking test UI, recording flow, timers, and result rendering.
- `apps/api` owns session state, question delivery, upload orchestration, auth, and persistence.
- `apps/worker-ai` owns STT calls, LLM evaluation calls, normalization, retry logic, and background processing.
- `packages/*` holds code that should be reused without creating app-to-app imports.

## 2. Component Responsibilities

### `apps/web`

- React-based frontend application.
- Talks only to `apps/api`.
- Must not call OpenAI APIs directly.
- Must not contain prompt templates, STT logic, or scoring logic.

### `apps/api`

- Public backend entrypoint for the frontend.
- Owns request validation, auth/session rules, upload URL creation, and job enqueueing.
- Returns normalized DTOs from `packages/types`.
- Must not perform long-running STT or LLM evaluation inline with user-facing requests unless explicitly documented.

### `apps/worker-ai`

- Consumes jobs created by the API.
- Downloads temporary audio, runs STT, runs rubric-based evaluation, and writes normalized results back.
- Owns integration with OpenAI and any future queue/backoff logic.
- Must not serve browser traffic or own UI concerns.

### Shared packages

- `packages/config`: `zod` schemas and config readers. No app-specific business logic.
- `packages/types`: shared DTOs, enums, result schemas, and event payload types.
- `packages/ui`: design tokens, primitive components, and layout helpers for the web app only.
- `packages/eslint-config` and `packages/tsconfig`: repo-wide development defaults.

## 3. Naming Conventions

- Directories: kebab-case.
- Package names: `@repo/<name>`.
- React components: PascalCase.
- Hooks: `useXxx`.
- TypeScript files: kebab-case except React component files, which may use PascalCase if the codebase chooses that consistently.
- Environment variables: UPPER_SNAKE_CASE.
- API routes: noun-based, lowercase, plural where appropriate, for example `/sessions`, `/questions`, `/results`.
- Queue and event names: dot-separated lowercase, for example `session.evaluation.requested`.

## 4. Environment and Config Rules

Use one root `.env.example` as the source of truth for required variables. Each app may have its own `.env.local`, but every variable must first be listed and described in `.env.example`.

### Required policy

- Never hardcode secrets in app code, tests, or docs.
- Read env only through `packages/config`.
- Validate env at process startup and fail fast on missing required values.
- Separate public frontend variables from server-only variables.
- Keep provider-specific env names explicit. Example: `OPENAI_API_KEY`, not `AI_KEY`.

### Suggested env split

```text
.env.example
apps/web/.env.local
apps/api/.env.local
apps/worker-ai/.env.local
```

### Variable classes

- Shared infrastructure: database URL, Redis URL, storage bucket config.
- Web public config: public API base URL, public app name.
- API private config: auth secrets, storage credentials, internal worker endpoints if needed.
- Worker private config: OpenAI API key, model IDs, retry/backoff values, queue consumer settings.

## 5. Package Boundary Rules

These boundaries are mandatory for the initial implementation.

- `apps/web` can import from `packages/ui`, `packages/types`, and `packages/config` public client-safe exports only.
- `apps/api` can import from `packages/types` and `packages/config`.
- `apps/worker-ai` can import from `packages/types` and `packages/config`.
- `apps/web` must not import from `apps/api` or `apps/worker-ai`.
- `apps/api` and `apps/worker-ai` must not import from each other directly. Shared contracts belong in `packages/types`.
- Prompt templates, scoring rubrics, and evaluation schemas should live in `apps/worker-ai` unless there is a demonstrated need to promote stable types into `packages/types`.
- UI components stay in `packages/ui`; product-specific screens stay in `apps/web`.

## 6. Local Development Workflow

The current operating model in this repository remains valid:

- Codex runs in Docker.
- Application processes run on the host machine.
- See [codex-docker.md](/workspace/docs/codex-docker.md) for the container workflow.

### Standard local workflow

1. Install dependencies once at repo root with `pnpm install`.
2. Start local dependencies such as database or Redis with Docker Compose if the implementation adds them.
3. Run the web app from `apps/web`.
4. Run the API from `apps/api`.
5. Run the AI worker from `apps/worker-ai`.

### Required root scripts

The root `package.json` should expose these baseline scripts:

- `dev`: run web, api, and worker in parallel.
- `build`: build all workspaces.
- `lint`: lint all workspaces.
- `typecheck`: run TypeScript checks across the repo.
- `test`: run all automated tests.
- `format`: apply formatting across the repo.

### App-level script expectations

Each app should expose at least:

- `dev`
- `build`
- `start`
- `lint`
- `typecheck`
- `test`

## 7. Technology Defaults

These are the pragmatic defaults for the first implementation pass.

- Runtime: Node.js LTS.
- Language: TypeScript across all apps and packages.
- Package manager: `pnpm`.
- Monorepo task runner: Turborepo.
- Frontend: Next.js or React with a server-capable framework, implemented in `apps/web`.
- Backend API: Node.js TypeScript service in `apps/api`.
- Worker: Node.js TypeScript worker in `apps/worker-ai`.
- Validation: `zod`.

If the implementation later needs a different backend framework, keep the directory structure and boundary rules unchanged unless there is a strong reason to revise them.

## 8. API and Data Shape Rules

- API responses must be versionable and explicit.
- Do not return raw provider payloads to the frontend.
- Use DTOs from `packages/types` for request and response contracts.
- Session status should be modeled as explicit states such as `queued`, `processing`, `completed`, `failed`.
- Evaluation payloads should separate raw transcript, normalized feedback, aggregate scores, and user-facing summaries.

## 9. File Storage and Privacy Rules

Based on the product policy:

- Original user audio is temporary processing input, not long-term stored product data.
- The API may issue short-lived upload targets.
- The worker may access temporary audio only long enough to finish STT and evaluation.
- Long-term persistence should default to derived feedback data, not raw audio.
- Any deviation from this policy must be documented in both implementation docs and product docs.

## 10. Frontend Shared Rules

The web app must follow [design.md](/workspace/docs/design.md) as the default design source of truth.

- A near-white lavender-tinted background is the default page foundation.
- The UI uses soft white surfaces, thin lavender borders, and restrained violet gradients for primary actions.
- Violet/lavender is the primary brand and action color family.
- Prefer dashboard clarity, stable spacing, and fast access to speaking tests over decorative visual effects.

## 11. First Implementation Milestones

Build in this order unless the plan is intentionally revised:

1. Scaffold the monorepo structure and root workspace tooling.
2. Implement shared packages: config, types, UI tokens, lint, tsconfig.
3. Implement the web app shell and speaking session flow skeleton.
4. Implement the API session and upload endpoints.
5. Implement the AI worker job flow and normalized evaluation output.
6. Connect end-to-end local development with host-run apps and Codex-in-Docker editing.
