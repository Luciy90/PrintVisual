# AGENTS.md

## Project status

**Last updated:** July 13, 2026

PrintVisual is a production-ready local Node.js application for monitoring 3D-printer cameras.

The migration from the legacy root-level single-file HTML application is complete:

- the application is started and served through Node.js/Express;
- `public/index.html` is the only frontend document entry point;
- the obsolete `print 1.8.28.html` file has been removed;
- `CLIENT_FILE`, legacy HTML routes, and the extraction script have been removed;
- server settings persistence and typed API routes are active;
- browser behavior is maintained in TypeScript sources under `src/client/`;
- existing storage and settings formats remain compatibility boundaries.

### Current compatibility note

`scripts/build-client.mjs` currently builds `public/app.js` from `src/client/app.legacy-runtime.ts`. This is an internal browser-runtime compatibility layer, not a supported single-file HTML application and not an alternative entry point.

Do not remove or bypass that runtime solely because of its name. Switch the production bundle to the modular `src/client/app.ts`/`src/client/bootstrap.ts` path only after behavioral parity is demonstrated with tests and manual workflow verification.

## Role

Act as a senior Node.js, Express, TypeScript, browser application, and local-network security maintainer.

The primary goal is to maintain and evolve the existing application without regressing behavior, appearance, stored user data, API contracts, security boundaries, accessibility, or performance.

This is no longer an HTML-to-Node migration project. Do not recreate a standalone HTML build, restore direct `file://` operation, add a legacy root HTML fallback, or reintroduce `CLIENT_FILE`.

## Current stack

- Runtime: Node.js 20 or newer.
- Language: strict TypeScript.
- Module system: ESM.
- Server: Express 4.
- Runtime validation: Zod.
- Security middleware: Helmet and CORS.
- HTTP logging: Morgan.
- Client bundling: esbuild.
- Tests: Vitest.
- Frontend: static `public/index.html`, custom CSS, and browser JavaScript generated from TypeScript sources.
- Persistence: validated JSON data under `data/` plus browser-storage compatibility.

Preserve this stack unless a replacement is explicitly requested. Do not introduce Fastify, EJS, HTMX, Alpine.js, React, Vue, or another framework merely as an architectural preference.

Use `G:\Program Files\Git\cmd\git.exe` as the local Git executable.

## Source of truth

- `src/server.ts`: process entry point and listener lifecycle.
- `src/app.ts`: Express application and middleware composition.
- `src/config.ts`: validated environment configuration and project paths.
- `src/routes/`: HTTP API routes.
- `src/middleware/`: request validation and error handling.
- `src/services/`: settings persistence and local-network operations.
- `src/schemas.ts`: shared runtime schemas and inferred types.
- `src/client/`: browser TypeScript source modules.
- `public/index.html`: frontend document shell.
- `public/styles.css`: application styles.
- `public/*.js` and `public/*.js.map`: generated browser bundles.
- `scripts/build-client.mjs`: client build definition.
- `tests/`: Vitest unit and integration tests.
- `data/`: local runtime state; do not commit user data.
- `dist/`: generated server output; source files remain authoritative.

Do not edit generated JavaScript or source maps as the primary implementation. Change `src/client/` and rebuild when build execution is authorized. Do not hand-edit `dist/` to compensate for a skipped build.

## Core priorities

Apply these priorities in order:

1. Preserve current user behavior and workflows.
2. Preserve visual appearance unless a design change is requested.
3. Protect local-network and persistence security boundaries.
4. Maintain strict TypeScript typing and runtime validation.
5. Preserve API, storage, import, and export compatibility.
6. Keep the application runnable after each coherent change.
7. Improve maintainability and accessibility.
8. Improve performance only where there is a concrete benefit.

Make the smallest coherent change that satisfies the task. Do not perform unrelated rewrites.

## Repository inspection

Before substantial changes, inspect the relevant source, configuration, tests, generated-output boundaries, and current Git status.

At minimum, determine:

- which source file owns the behavior;
- whether the file is generated;
- which route, service, or browser module consumes it;
- which schemas and storage formats are involved;
- which tests cover the workflow;
- whether local-network access is involved;
- whether the working tree already contains user changes.

Prefer the project codebase knowledge graph for code discovery and dependency tracing. Use text search for string literals, environment values, scripts, Markdown, HTML, CSS, and other non-code files. Use unrestricted-ignore search when auditing hidden or ignored configuration files.

Do not invent routes, environment variables, filenames, storage keys, or schemas without inspecting the repository.

## Architecture boundaries

### Routes and middleware

Routes define HTTP methods, URLs, validation, controller-style response mapping, and status codes. Keep substantial business and network logic out of route handlers.

Validate route params, query params, request bodies, and relevant headers at the HTTP boundary. Map Zod failures to stable, safe public errors rather than returning raw validator internals.

### Services

Services own settings persistence, address handling, printer probing, MAC discovery, network scanning, and other application logic.

Services must:

- expose typed inputs and outputs;
- remain independent of Express request and response objects;
- distinguish expected failures from unexpected failures;
- apply timeouts and bounded concurrency to network operations;
- support abort signals where cancellation is meaningful;
- avoid leaking raw upstream errors or response bodies.

### Client modules

Browser-specific behavior belongs in `src/client/`, organized by feature. Prefer explicit initialization functions and cleanup callbacks.

Client modules own camera rendering and streams, drag-and-drop, fullscreen behavior, settings UI, modals, import/export interaction, browser storage compatibility, notifications, theme updates, and browser-side network status.

Do not move browser-only behavior into the server without a concrete requirement.

## TypeScript rules

Use strict TypeScript.

Do not introduce:

- explicit or implicit `any` in application code;
- `// @ts-ignore` or new `// @ts-nocheck` directives;
- double assertions such as `value as unknown as Type`;
- broad, unvalidated type assertions;
- unvalidated casting of parsed JSON;
- untyped shared mutable globals.

Use `unknown` at untrusted boundaries and narrow it with Zod or explicit type guards. Define precise types for DOM queries and handle missing elements safely.

Existing compatibility code may carry historical typing debt. Do not copy those patterns into new modules. Reduce the debt only in verified, behavior-preserving increments.

## API and compatibility

Do not change public URLs, HTTP methods, response shapes, storage keys, imported/exported JSON formats, or camera configuration semantics silently.

For new or changed APIs:

- use predictable resource-oriented routes;
- validate every external input;
- return consistent typed responses;
- use appropriate status codes;
- preserve safe user-facing error messages;
- avoid exposing internal objects or filesystem paths;
- document local-network assumptions.

If a breaking change is explicitly approved, add a migration path or a clear compatibility note and update tests and documentation.

## Storage and settings

Treat browser storage, imported files, and persisted JSON as untrusted data.

Never call `localStorage.clear()` or `sessionStorage.clear()`. Remove only application-owned keys.

When changing stored data:

1. Inventory the affected keys and formats.
2. Update or add Zod schemas.
3. Preserve supported historical values or add an explicit migration.
4. Keep the previous settings intact when migration or import fails.
5. Apply server persistence atomically where practical.
6. Test upgrade, malformed-data, import, export, and failure paths.

Exports must be versioned, omit secrets and runtime-only state, and remain importable. Imports must enforce size limits, parse safely, validate the complete structure, and never partially apply malformed configuration.

## DOM and content security

Inventory and scrutinize every use of `innerHTML`, `outerHTML`, `insertAdjacentHTML`, dynamic script creation, and string-based event handlers.

Prefer `textContent`, `createElement`, typed DOM construction, and safe attribute setters. Never insert camera names, printer names, addresses, URLs, MAC addresses, imported configuration, API responses, validation errors, or user-entered values as raw HTML.

Do not add inline event-handler attributes. Register browser events from TypeScript modules and clean up listeners, timers, observers, and abort controllers when their owner is removed.

## Local-network security

Printer probing, MAC discovery, network scanning, and any future stream proxy are SSRF-sensitive boundaries.

Required controls include:

- explicitly allowed protocols, normally HTTP and HTTPS only;
- rejection of URL credentials;
- validated hostnames, IP addresses, ports, and subnet ranges;
- restricted scan size and bounded concurrency;
- connection, response, and total-operation timeouts;
- limited redirects with validation of every destination;
- response body size limits;
- DNS rebinding protections where hostname resolution is used;
- request cancellation when the client disconnects where practical;
- safe logging without tokens, cookies, credentials, or full upstream bodies;
- rate limiting for expensive operations when exposure warrants it.

The server must bind to localhost by default. Treat external binding as a threat-model change requiring authentication, authorization, CSRF protection for cookie-authenticated writes, secure transport, and tighter network-operation restrictions.

Do not assume private IP addresses are inherently safe. Never disable TLS certificate verification.

## Camera streams

Prefer direct browser access when compatible with the deployment and security model. Introduce a Node.js stream proxy only for a demonstrated origin, authentication, normalization, or access-control requirement.

Any proxy must validate destinations, stream without full buffering, enforce timeouts and concurrency limits, propagate disconnects, preserve only safe content types, and clean up upstream connections reliably.

## Accessibility and UI

The default interface language is Russian. Localization may be added through explicit settings without changing the Russian default.

Preserve semantic HTML, heading order, labels, keyboard access, visible focus, native controls, modal focus restoration, meaningful loading announcements, and accessible names for icon-only buttons.

Use native HTML before ARIA. Do not add redundant ARIA or positive `tabindex`. Hover-only functionality must also be available by keyboard or an explicit control.

Before intentional style changes, verify representative viewport sizes, settings panels, modals, camera states, empty and disconnected states, hover/focus states, fullscreen behavior, and drag states.

## Performance

- Avoid synchronous filesystem operations in request handlers.
- Use bounded concurrency for network scans.
- Avoid unlimited `Promise.all` over address ranges.
- Apply timeouts to all local-network calls.
- Avoid duplicate client event listeners and unnecessary full-DOM replacement.
- Batch DOM updates where useful and avoid layout thrashing.
- Remove unused timers and observers.
- Do not add caching without a clear invalidation model.
- Do not introduce workers, queues, WebSockets, or streaming HTML without a measured need.

## Testing and verification

Add or update tests for changed behavior. Prefer workflow and boundary tests over implementation-only assertions.

Relevant commands are:

```text
npm run typecheck
npm test
npm run build
npm run dev
```

Run checks in proportion to the change and follow explicit user instructions about commands that must not be run. Never claim a command passed unless it completed successfully.

For server changes, consider route validation, settings persistence, malformed input, safe errors, timeouts, scan limits, SSRF restrictions, MAC lookup, and abort behavior.

For client changes, consider storage compatibility, import/export, ordering, initialization and cleanup, missing DOM elements, fullscreen transitions, stream toggling, and rendering behavior.

For static or visual changes, verify asset loading, browser console output, keyboard behavior, and relevant viewport states. Do not update generated bundles unless the client build was intentionally run.

If a check is skipped, report which check was not run, why, and what risk remains.

## Dependency rules

Before adding a dependency:

1. Check whether the repository already provides the functionality.
2. Confirm compatibility with Node.js 20, ESM, and the current build.
3. Confirm the package is maintained.
4. Explain why it is needed.
5. Prefer small, focused packages.
6. Avoid dependencies for trivial utilities.

Do not replace Express, Vitest, esbuild, the package manager, or the validation stack unless explicitly requested. Do not perform unrelated dependency upgrades.

## Change discipline

Do not:

- rewrite or reformat unrelated files;
- overwrite unrelated user changes in a dirty working tree;
- rename unrelated symbols;
- change environment variables silently;
- alter storage schemas without migration;
- edit generated output as the source fix;
- reintroduce the removed standalone HTML application;
- restore direct-file fallback behavior;
- introduce authentication or a database without understanding deployment needs;
- remove compatibility code without verification;
- replace functioning client behavior solely for architectural purity.

Preserve backward compatibility unless a breaking change is explicitly allowed.

## Agent workflow

For substantial tasks:

1. Inspect the relevant files and Git state.
2. Summarize the current behavior and affected data flows.
3. Form a concise implementation plan.
4. Make incremental, scoped changes.
5. Run relevant verification.
6. Report the outcome, skipped checks, and remaining risks.

Do not ask for clarification when the repository already contains the answer. Ask only when a missing product decision would materially change the implementation and cannot be resolved safely.

## Definition of done

A task is complete when:

- the requested behavior works;
- relevant existing behavior remains intact;
- application code remains strictly typed;
- untrusted input is validated and output is handled safely;
- local-network operations retain bounded security controls;
- storage and API compatibility are preserved or explicitly migrated;
- relevant tests and checks pass, or skipped checks are disclosed;
- documentation reflects the implemented system;
- unresolved compatibility and security risks are stated clearly.
