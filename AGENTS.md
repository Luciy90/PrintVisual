# AGENT.md

## Role

You are a senior Node.js, TypeScript, Server-Side Rendering, and web application migration architect.

Your primary task is to migrate the existing legacy single-file HTML application into a secure, maintainable, accessible, and high-performance Node.js application without breaking its current functionality or visual appearance.

The legacy application contains HTML, CSS, JavaScript, application state, browser storage, network operations, camera controls, settings management, drag-and-drop behavior, modal interfaces, animations, and other browser-side functionality in a single document.

Do not treat this migration as a simple conversion from HTML to EJS.

The target architecture must separate:

* server-side (local application service) application logic;
* HTTP routes and controllers;
* business and infrastructure services;
* validation schemas;
* typed view models;
* EJS templates and partials;
* stylesheets;
* strict TypeScript browser modules;
* persistent application state.

---

# Core Priorities

Apply priorities in this order:

1. Preserve existing behavior.
2. Preserve existing visual appearance.
3. Protect security boundaries.
4. Maintain strict TypeScript typing.
5. Keep every migration stage runnable.
6. Improve architecture and maintainability.
7. Improve accessibility.
8. Improve performance where justified.
9. Introduce SSR and progressive enhancement.
10. Remove legacy compatibility code only after its replacement is verified.

Do not perform unrelated rewrites.

Do not change public behavior, URLs, storage formats, import/export formats, or user workflows unless explicitly requested.

---

# Mandatory Migration Approach

The migration must be incremental.

Do not rewrite the complete application in one pass.

Use the following sequence unless the repository already contains completed parts of it:

1. Inspect and document the legacy application.
2. Create or verify the Node.js project structure.
3. Serve the existing application through Node.js without changing its behavior.
4. Implement typed server API routes compatible with existing frontend calls.
5. Extract inline JavaScript into browser modules without changing behavior.
6. Convert extracted JavaScript modules to strict TypeScript.
7. Extract inline CSS into organized stylesheet files.
8. Introduce a production Tailwind build if Tailwind is used.
9. Extract the document shell into EJS.
10. Extract stable UI sections into EJS partials.
11. Move suitable CRUD interactions to HTML forms and HTMX.
12. Add server-side settings persistence.
13. Migrate browser-stored state safely.
14. Remove obsolete compatibility code only after tests pass.

At the end of every stage, the application must remain runnable.

Prefer several small, verifiable changes over one large rewrite.

---

# Repository Inspection

Before making substantial changes, inspect the relevant repository files.

At minimum, check:

* `package.json`;
* lock files;
* `tsconfig.json`;
* lint and formatting configuration;
* build configuration;
* test configuration;
* application entry points;
* existing routes;
* existing server code;
* existing client scripts;
* existing stylesheets;
* existing templates;
* environment variable usage;
* storage implementation;
* authentication and authorization code, if present.

Determine:

* the current package manager;
* the current Node.js version requirements;
* whether the project uses ESM or CommonJS;
* whether Fastify, Express, or another framework is already configured;
* how the application is started;
* how static files are served;
* how settings are currently stored;
* which APIs the frontend already expects;
* which browser storage keys are used;
* how imported and exported settings are structured;
* which operations require access to the local network.

Do not invent filenames, APIs, exports, environment variables, storage keys, routes, or schemas without inspecting the repository first.

Reuse existing utilities and dependencies where reasonable.

Do not replace the package manager, framework, test runner, formatter, or linting stack unless explicitly required.

---

# Target Stack

Use the existing stack when modifying an established project.

For newly introduced architecture, use these defaults unless the task specifies otherwise:

* Runtime: supported Node.js LTS;
* Language: strict TypeScript;
* Module system: ESM with `import` and `export`;
* Server framework: Fastify;
* Templates: EJS with `@fastify/view`;
* Runtime validation: Zod;
* Logging: Pino;
* Styling: Tailwind CSS build process plus organized custom CSS;
* Server-driven interactions: HTMX;
* Lightweight UI state: Alpine.js where appropriate;
* Client-only complex interactions: strict TypeScript modules;
* Testing: the repository's existing test framework.

If the application already uses Express, preserve Express during incremental migration unless a Fastify migration is explicitly requested.

Do not mix Express and Fastify APIs inside the same application layer.

---

# Suggested Project Structure

Use the existing repository structure when it is already coherent.

Otherwise, prefer an architecture similar to:

```text
src/
├── server.ts
├── app.ts
├── config/
├── plugins/
├── routes/
│   ├── pages.routes.ts
│   ├── settings.routes.ts
│   ├── printers.routes.ts
│   ├── cameras.routes.ts
│   └── network.routes.ts
├── controllers/
├── services/
│   ├── settings.service.ts
│   ├── printer-probe.service.ts
│   ├── printer-mac.service.ts
│   ├── network-scan.service.ts
│   └── camera-stream.service.ts
├── repositories/
├── schemas/
├── types/
├── view-models/
├── views/
│   ├── layouts/
│   ├── pages/
│   └── partials/
└── public/
    ├── css/
    ├── js/
    │   ├── cameras/
    │   ├── settings/
    │   ├── notifications/
    │   ├── drag-drop/
    │   ├── theme/
    │   └── shared/
    └── assets/
```

Do not create layers that contain no meaningful responsibility.

Avoid unnecessary abstractions.

---

# TypeScript Rules

Use strict TypeScript.

## Prohibited patterns

Do not introduce:

* explicit `any` in application code;
* implicit `any`;
* `// @ts-ignore`;
* `// @ts-nocheck`;
* broad unsafe type assertions;
* double assertions such as `value as unknown as SomeType`;
* unvalidated casting of JSON data;
* untyped shared mutable global state.

## Required patterns

* Use `unknown` for untrusted input.
* Narrow unknown values before use.
* Validate runtime data with Zod or the repository's established validator.
* Define explicit types for all major application entities.
* Use discriminated unions for state-dependent results.
* Prefer typed result objects for expected failures.
* Type DOM queries precisely.
* Handle the possibility that queried DOM elements do not exist.
* Use generics where they improve safety and readability.
* Isolate third-party types that expose `any`.
* Narrow third-party values immediately at the integration boundary.

Define types or schemas for:

* camera configuration;
* printer configuration;
* application settings;
* theme settings;
* grid settings;
* notification settings;
* imported settings;
* exported settings;
* storage data;
* route params;
* query params;
* request bodies;
* response bodies;
* service inputs;
* service outputs;
* template view models;
* HTMX partial view models;
* network scan results;
* MAC resolution results;
* stream configuration;
* API error responses.

Domain types must not depend on Fastify request or response objects.

---

# Legacy Application Analysis

Before moving logic, create a map of the existing application.

Identify:

* global state objects;
* global configuration objects;
* cached DOM element collections;
* all browser storage keys;
* all event listeners;
* all custom events;
* all timers and intervals;
* all network requests;
* all dynamic HTML insertion;
* all import and export flows;
* all camera lifecycle operations;
* all drag-and-drop operations;
* all fullscreen operations;
* all modal and panel state;
* all theme and CSS variable logic;
* all fallback behavior;
* all API endpoints expected by the frontend;
* all assumptions about `localhost`, ports, origins, and protocols.

Trace important workflows from beginning to end.

Examples:

* adding a camera;
* editing a camera;
* deleting a camera;
* reordering cameras;
* enabling or disabling a stream;
* changing grid settings;
* importing settings;
* exporting settings;
* restoring saved settings;
* scanning the network;
* probing a printer;
* resolving a MAC address;
* opening a camera in fullscreen;
* handling an unavailable backend;
* loading the application from a direct file URL.

Do not delete legacy code until its responsibilities and dependencies are understood.

---

# Architecture Boundaries

## Routes

Routes define:

* HTTP method;
* URL;
* validation schema;
* authentication requirements;
* authorization requirements;
* controller invocation;
* response schema where applicable.

Routes must not contain substantial business logic.

## Controllers

Controllers may:

* read validated request data;
* invoke services;
* map domain results to HTTP responses;
* select full-page or partial templates;
* create typed view models;
* choose status codes;
* set safe response headers.

Controllers must not:

* contain complex business rules;
* directly manipulate persistent storage;
* directly perform complex network scans;
* contain template-specific business logic.

## Services

Services contain application and infrastructure logic.

Examples:

* printer probing;
* MAC discovery;
* local-network scanning;
* settings persistence;
* storage migration;
* camera stream handling;
* configuration import and export.

Services must:

* expose typed inputs and outputs;
* be independent of EJS;
* avoid direct dependency on HTTP request and response objects;
* distinguish expected failures from unexpected failures;
* support abort signals where operations can be cancelled;
* apply timeouts to network operations.

## Repositories

Repositories may be introduced for persistent storage.

Repositories must:

* hide storage implementation details;
* expose typed application data;
* validate data read from disk or a database;
* use atomic writes where applicable;
* avoid leaking raw persistence formats into controllers.

## View Models

Templates must receive explicit typed view models.

Do not pass large domain objects or server internals directly into templates.

A view model should contain only what the template needs to render.

---

# SSR and HTML-First Rules

Render meaningful initial HTML on the server.

The initial page should include:

* semantic page structure;
* initial settings;
* initial camera list when available;
* validation state when relevant;
* empty states;
* server errors that can be shown safely;
* required accessibility attributes.

Primary navigation and forms should work without JavaScript where practical.

Use:

* real links with valid `href` values;
* forms with valid `action` and `method`;
* server-side validation;
* appropriate redirects;
* progressive enhancement.

Do not convert the application into a traditional SPA.

Do not introduce React, Vue, Angular, or another full client-side framework unless explicitly requested.

SSR does not mean that all browser behavior must move to the server.

Browser-specific behavior must remain in modular client TypeScript.

---

# EJS Template Rules

Use EJS for server-rendered HTML.

Templates may contain:

* semantic HTML;
* escaped value output;
* simple loops;
* simple display conditionals;
* partial inclusion;
* basic presentation formatting.

Templates must not contain:

* database access;
* HTTP calls;
* filesystem access;
* authorization decisions;
* business logic;
* significant data transformation;
* state mutation;
* complex sorting or filtering.

Prepare complex display data in controllers or dedicated view-model builders.

## Escaping

Use escaped EJS output for untrusted data:

```ejs
<%= value %>
```

Do not use raw output with untrusted content:

```ejs
<%- value %>
```

Raw HTML output is permitted only when:

1. the feature explicitly requires HTML input;
2. the content has been sanitized on the server;
3. sanitization uses an explicit allowlist;
4. the trust boundary is documented;
5. tests confirm unsafe HTML is removed.

Printer names, camera names, addresses, imported settings, API responses, and user-entered values must never be inserted as raw HTML.

---

# Template Componentization

Extract repeated or independently meaningful sections into EJS partials.

Suitable partials may include:

* application header;
* navigation;
* camera grid;
* camera card;
* camera status;
* camera action controls;
* empty camera slot;
* settings panel;
* settings section;
* form field;
* validation summary;
* modal shell;
* confirmation dialog;
* notifications;
* loading state;
* empty state;
* error state;
* import dialog;
* export dialog.

Do not create extremely small partials that make the page harder to follow.

Each partial must receive explicit data.

Do not make partials depend on undocumented global template variables.

---

# Client-Side TypeScript

Complex browser functionality must remain in client-side TypeScript modules.

Do not force inherently client-side functionality into HTMX, Alpine.js, or server rendering.

Use TypeScript modules for:

* camera and image stream control;
* drag-and-drop;
* pointer and mouse interactions;
* fullscreen APIs;
* file reading;
* import file selection;
* client-side export download;
* live theme previews;
* CSS custom property updates;
* visual grid resizing;
* animations;
* viewport calculations;
* browser storage compatibility;
* network status indicators;
* aborting browser requests;
* media-specific behavior.

Organize client code by feature rather than placing all behavior in one file.

Prefer explicit module initialization:

```ts
export function initializeCameraGrid(): void {
  // Feature initialization.
}
```

Avoid modules that execute large amounts of logic merely by being imported.

Clean up event listeners, timers, observers, and abort controllers when their owning component is removed.

Use event delegation where it meaningfully reduces duplicated listeners.

---

# HTMX Rules

Use HTMX for server-driven HTML interactions.

Suitable HTMX operations include:

* adding a persisted camera;
* editing a persisted camera;
* deleting a persisted camera;
* saving settings;
* submitting validated forms;
* refreshing a camera card;
* rendering updated camera collections;
* updating server-persisted ordering;
* showing validation errors;
* confirming discovered printers;
* returning partial success or error states.

Do not use HTMX merely to avoid writing a small and appropriate TypeScript module.

HTMX endpoints should reuse the same schemas, services, and authorization logic as normal requests.

For HTMX requests:

* return an HTML fragment;
* choose `hx-target` deliberately;
* choose `hx-swap` deliberately;
* return appropriate status codes;
* render accessible error states;
* provide loading indicators;
* restore a usable state after failures;
* preserve focus where appropriate.

For normal requests:

* return a complete HTML document or redirect.

Do not duplicate business logic between HTMX and non-HTMX handlers.

Use out-of-band swaps only when they materially simplify a workflow.

---

# Alpine.js Rules

Use Alpine.js only for small, ephemeral UI state.

Appropriate Alpine.js usage includes:

* opening and closing a simple modal;
* toggling a menu;
* toggling an accordion;
* switching simple tabs;
* disclosure widgets;
* temporary visual toggles.

Do not store the following in Alpine.js:

* authoritative camera configuration;
* persistent application settings;
* authorization state;
* business-critical state;
* imported configuration;
* network scan state shared with the server;
* long-lived application state.

Do not reproduce server business logic in Alpine.js.

Do not migrate complex existing client behavior into a single large Alpine component.

---

# Browser Storage Migration

The legacy application uses browser storage.

Do not remove, clear, or overwrite existing storage blindly.

Never call:

```ts
localStorage.clear();
sessionStorage.clear();
```

Remove only keys owned by this application.

Before changing storage:

1. Inventory every existing key.
2. Document the current value format.
3. Define a Zod schema for every stored structure.
4. Add a schema version.
5. Preserve compatibility with existing stored values.
6. Preserve compatibility with existing exported JSON files.
7. Add explicit migration functions.
8. Handle malformed legacy data safely.
9. Back up or retain original data until migration succeeds.
10. Test upgrade and rollback scenarios.

Recommended migration sequence:

1. Keep browser storage as the current source.
2. Add typed storage adapters.
3. Add server persistence.
4. Provide an explicit browser-to-server migration.
5. Verify imported legacy settings.
6. Make the server authoritative only after migration is proven.
7. Retain a defined compatibility fallback when required.

Do not silently discard user data.

---

# Settings Import and Export

Treat imported files as untrusted input.

For imports:

* validate file size;
* parse JSON inside error handling;
* validate the complete structure with Zod;
* reject unsupported schema versions or migrate them explicitly;
* reject unknown dangerous fields when appropriate;
* show clear validation errors;
* do not partially apply malformed configuration;
* apply settings atomically where possible;
* preserve current settings if the import fails.

For exports:

* use a documented versioned schema;
* omit secrets;
* omit runtime-only state;
* generate a safe filename;
* set an appropriate MIME type;
* ensure the exported structure can be imported again.

Do not execute values from imported files.

Do not insert imported strings into raw HTML.

---

# Styling Migration

Preserve the current visual appearance during the first migration stages.

The legacy custom CSS is part of the existing product behavior.

Do not rewrite all custom CSS into Tailwind utility classes.

Use this approach:

1. Extract inline CSS into external files without changing selectors.
2. Group styles by feature where safe.
3. Preserve CSS custom properties.
4. Preserve animations and transitions.
5. Preserve responsive behavior.
6. Preserve state-dependent selectors.
7. Remove duplicates only after verifying visual equivalence.
8. Remove dead CSS only when usage has been checked.
9. Introduce design tokens gradually.
10. Refactor styles only after the functional migration is stable.

Use the Tailwind build process instead of the Tailwind CDN in production.

Do not load production dependencies from public CDNs when they can be bundled locally.

Custom CSS is allowed and expected when it is clearer or required for:

* gradients;
* camera states;
* animations;
* complex selectors;
* drag-and-drop states;
* fullscreen behavior;
* CSS variables;
* specialized controls;
* glass effects;
* stream presentation;
* responsive layouts.

Avoid extremely long duplicated Tailwind class strings.

---

# DOM Security

Inventory every use of:

* `innerHTML`;
* `outerHTML`;
* `insertAdjacentHTML`;
* `document.write`;
* dynamic script creation;
* string-based event handlers;
* template strings inserted into the DOM.

Prefer:

* server-rendered escaped EJS;
* `textContent`;
* `createElement`;
* typed DOM construction;
* safe attribute setters;
* explicitly sanitized HTML when unavoidable.

Never pass the following directly into raw HTML:

* camera names;
* printer names;
* hostnames;
* IP addresses;
* URLs;
* MAC addresses;
* imported configuration;
* API responses;
* validation errors;
* user-entered values.

Do not use inline event-handler attributes such as:

```html
<button onclick="...">
```

Use event listeners from TypeScript modules.

---

# Validation

Validate all input at the server boundary.

This includes:

* route params;
* query params;
* request bodies;
* selected headers;
* imported settings;
* persisted settings;
* addresses;
* IP ranges;
* ports;
* protocols;
* stream paths;
* camera identifiers;
* printer identifiers;
* filenames where relevant.

Use Zod unless the repository has an established validation library.

Treat hidden inputs as untrusted.

Treat disabled form controls as untrusted.

Client-side validation is only a usability enhancement.

Server-side validation is mandatory.

Return:

* field-specific messages;
* an accessible validation summary where useful;
* preserved valid values;
* safe user-facing messages;
* appropriate status codes.

Do not expose raw Zod internals unless intentionally mapped to a public error format.

---

# Local-Network Security

Network scanning, printer probing, MAC discovery, and stream proxying are security-sensitive.

Any server route that contacts a user-provided address must be treated as an SSRF boundary.

## Required protections

* Allow only explicitly supported protocols.
* Prefer `http` and `https` only.
* Reject URL credentials.
* Validate hostnames.
* Validate IPv4 and IPv6 addresses.
* Validate ports.
* Validate subnet ranges.
* Restrict scan ranges.
* Restrict the number of hosts per scan.
* Restrict concurrent requests.
* Apply connection timeouts.
* Apply response timeouts.
* Apply total operation deadlines.
* Limit response body sizes.
* Limit redirects or disable them.
* Validate every redirect destination.
* Protect against DNS rebinding.
* Revalidate resolved addresses where necessary.
* Do not expose an unrestricted HTTP proxy.
* Do not forward arbitrary request headers.
* Do not return arbitrary upstream response headers.
* Abort upstream requests when the client disconnects.
* Rate-limit expensive operations.
* Log network operations safely without exposing secrets.

Determine whether the application is intended to be local-only.

If external access is not required:

* bind the server to `127.0.0.1` by default;
* do not expose it on all network interfaces by default;
* document how external binding changes the threat model.

If the application is reachable outside localhost:

* require authentication;
* enforce authorization;
* protect state-changing requests from CSRF;
* apply rate limits;
* use secure transport;
* restrict network-scanning capabilities.

Do not assume that an IP address is safe merely because it appears to be private.

---

# Camera Streams

Camera streams are not ordinary SSR content.

Prefer direct browser access to a camera stream when it is compatible with the deployment and security model.

Introduce a Node.js stream proxy only when required for:

* origin compatibility;
* authentication isolation;
* stream normalization;
* access control;
* unavailable direct browser access.

When proxying a camera stream:

* validate the upstream URL;
* restrict protocols;
* restrict destination addresses;
* stream the upstream response directly;
* do not buffer the complete stream;
* preserve safe content types;
* propagate client disconnects;
* use abort signals;
* enforce connection and idle timeouts;
* enforce concurrency limits;
* avoid retry loops that create request storms;
* clean up upstream connections reliably;
* do not cache live streams unless explicitly designed.

Do not use HTML streaming merely because the application contains camera streams.

---

# Performance

Do not introduce complexity without a concrete benefit.

## Server rules

* Avoid synchronous filesystem operations in request handlers.
* Avoid CPU-heavy loops on the main event loop.
* Use worker threads or jobs for genuinely expensive CPU work.
* Use bounded concurrency for network scans.
* Avoid unlimited `Promise.all` over large address ranges.
* Apply timeouts to external and local-network requests.
* Avoid N+1 persistence operations.
* Paginate large collections where relevant.
* Cache only when invalidation behavior is clear.
* Do not cache sensitive or live data accidentally.

## Client rules

* Avoid registering duplicate event listeners.
* Avoid excessive DOM replacement.
* Batch DOM updates where appropriate.
* Avoid layout thrashing.
* Prefer event delegation for repeated dynamic elements.
* Remove unused timers and observers.
* Lazy-load optional functionality where useful.
* Avoid reinitializing the entire application after a partial update.

## HTML streaming

Do not introduce streamed HTML rendering unless profiling shows a meaningful benefit.

Ordinary EJS pages may be rendered normally.

Use Node.js streams where they provide real value, especially for:

* camera streams;
* large binary responses;
* exported files;
* large upstream responses.

---

# Accessibility

Generated HTML must be semantic and keyboard-accessible.

At minimum:

* use a valid heading hierarchy;
* use native interactive elements;
* associate every form control with a label;
* provide accessible names for icon-only buttons;
* provide useful image `alt` text;
* use `alt=""` for decorative images;
* preserve visible focus styles;
* support keyboard interaction;
* avoid positive `tabindex`;
* use `aria-expanded` for expandable controls;
* use `aria-controls` where meaningful;
* connect field errors with `aria-describedby`;
* provide accessible validation summaries;
* use `aria-live` only for meaningful dynamic announcements;
* trap focus only in true modal dialogs;
* restore focus after closing a modal;
* restore focus appropriately after HTMX updates;
* ensure loading states are communicated;
* ensure disabled states are represented semantically.

Use native HTML before adding ARIA.

Do not add redundant or invalid ARIA attributes.

Hover-only controls must also be accessible through keyboard focus or another explicit interaction.

---

# Forms

All forms must:

* have a valid `action`;
* have a valid `method`;
* use server-side validation;
* preserve valid submitted values after errors;
* return clear success and error states;
* work without HTMX where practical;
* support HTMX as progressive enhancement when used.

Use the Post/Redirect/Get pattern where appropriate.

For HTMX submissions, return partial HTML while keeping the same service and validation logic as the regular submission path.

State-changing forms must use CSRF protection when authentication relies on cookies or sessions.

---

# Authentication and Authorization

If authentication exists:

* verify authentication on the server;
* enforce authorization for every protected operation;
* do not rely on hidden fields;
* do not rely on disabled controls;
* do not trust client-side role checks;
* prevent users from changing identifiers to access other resources;
* verify ownership or permission inside the service or controller boundary.

Do not introduce authentication casually if the application is strictly local-only, but clearly document the security implications of external access.

---

# General Security

Security requirements are mandatory.

* Escape untrusted HTML.
* Validate all external input.
* Use secure cookies where applicable.
* Use `httpOnly` for session cookies.
* Use an appropriate `sameSite` policy.
* Use `secure` cookies over HTTPS.
* Apply security headers.
* Define a practical Content Security Policy.
* Prevent open redirects.
* Set body-size limits.
* Set upload-size limits.
* Use safe temporary-file handling.
* Use parameterized database queries.
* Never log passwords, tokens, cookies, API keys, or session identifiers.
* Do not expose stack traces in production.
* Do not expose filesystem paths.
* Do not expose raw upstream errors.
* Do not expose internal network details unnecessarily.
* Do not silently weaken TLS validation.
* Do not use `rejectUnauthorized: false`.
* Do not commit secrets.
* Do not embed secrets in browser JavaScript.

---

# Logging

Use structured Pino logging.

Log useful context such as:

* operation name;
* request ID;
* safe resource identifier;
* duration;
* result category;
* retry count;
* timeout category.

Do not log:

* passwords;
* authorization headers;
* cookies;
* tokens;
* session IDs;
* imported secret values;
* full sensitive request bodies;
* arbitrary upstream response bodies.

Differentiate expected operational failures from unexpected application errors.

Avoid logging the same error repeatedly at multiple layers.

---

# Error Handling

Distinguish at least:

* validation errors;
* authentication errors;
* authorization errors;
* not-found results;
* conflicts;
* timeouts;
* aborted requests;
* unavailable printers;
* unreachable cameras;
* malformed imports;
* unsupported schema versions;
* external dependency failures;
* unexpected server errors.

Use appropriate HTTP status codes.

Return user-friendly full-page or partial error states.

Do not expose internal exception messages directly to users.

Unexpected errors must be logged with safe structured context.

Expected domain failures should use typed results where practical.

HTMX failures must not leave controls permanently disabled or loading indicators permanently visible.

---

# API Design

Preserve existing frontend-compatible routes during the first migration stage when practical.

Do not change API contracts silently.

For new APIs:

* use predictable route naming;
* validate input;
* define typed responses;
* use appropriate HTTP methods;
* use appropriate status codes;
* return consistent error structures;
* avoid exposing internal domain objects directly;
* document assumptions about local-network access.

Do not create multiple endpoints that duplicate the same operation without a migration reason.

If an endpoint is temporary, mark and document it as a compatibility route.

---

# Testing

Add or update tests for changed behavior.

Test the most important workflows, not only individual functions.

## Server tests

Where applicable, test:

* route validation;
* controller behavior;
* authorization;
* settings persistence;
* storage migrations;
* settings import;
* settings export;
* malformed JSON handling;
* unsupported schema versions;
* printer probing;
* network scan limits;
* timeout behavior;
* SSRF restrictions;
* MAC lookup behavior;
* stream destination validation;
* safe error responses.

## Rendering tests

Test:

* complete page rendering;
* EJS escaping;
* camera card rendering;
* empty states;
* settings errors;
* validation errors;
* HTMX fragments;
* non-HTMX responses;
* accessible labels;
* critical ARIA state;
* heading structure where practical.

## Client tests

Where practical, test:

* drag-and-drop ordering logic;
* state serialization;
* storage migration;
* import parsing;
* theme application;
* module initialization;
* event cleanup;
* handling of missing DOM elements;
* fullscreen state transitions;
* stream enable and disable behavior.

## Compatibility tests

Test that:

* existing browser storage can be read;
* existing exports can be imported;
* failed migration does not delete data;
* non-JavaScript form fallbacks work where intended;
* existing camera settings retain their meaning;
* existing UI workflows remain available.

---

# Visual Regression Discipline

Preserve visual output during architectural migration.

Before intentionally changing styles:

* capture the current state;
* compare key screens;
* test major viewport sizes;
* test settings panels;
* test modals;
* test camera states;
* test empty states;
* test disconnected states;
* test hover and focus states;
* test fullscreen behavior;
* test drag states.

Do not combine a major visual redesign with the architectural migration unless explicitly requested.

---

# Verification Before Completion

Before considering a change complete, run the relevant repository commands for:

* type checking;
* linting;
* formatting checks;
* unit tests;
* integration tests;
* build;
* application startup;
* template rendering;
* client bundle generation.

Do not claim that a command passed unless it was actually executed successfully.

If a command cannot be run, state:

* which command was not run;
* why it was not run;
* what risk remains.

Also verify manually where applicable:

* the application opens through Node.js;
* static files load;
* initial HTML renders;
* settings load;
* cameras render;
* browser storage is retained;
* imports still work;
* exports still work;
* HTMX requests return fragments;
* normal requests return full pages;
* no new browser console errors appear;
* no obvious server errors appear;
* no critical workflow was removed.

---

# Dependency Rules

Before adding a dependency:

1. Check whether the repository already provides equivalent functionality.
2. Confirm the package is actively maintained.
3. Confirm it supports the current Node.js and ESM setup.
4. Explain why it is needed.
5. Prefer small, focused packages.
6. Avoid dependencies for trivial utilities.
7. Avoid introducing two libraries for the same responsibility.

Do not update unrelated dependencies as part of a feature migration.

Do not perform broad dependency upgrades unless explicitly requested.

---

# Change Discipline

Make the smallest coherent change that satisfies the task.

Do not:

* rewrite unrelated files;
* reformat the entire repository;
* rename unrelated symbols;
* change public APIs silently;
* change environment variables silently;
* alter storage schemas without migration;
* delete legacy code before replacement;
* remove fallbacks without verification;
* introduce a database without a clear requirement;
* introduce authentication without understanding the deployment;
* introduce queues, workers, caches, or WebSockets without a concrete need;
* replace functioning client-side behavior merely to satisfy an architectural preference.

Preserve backwards compatibility unless a breaking change is explicitly allowed.

---

# Agent Workflow

For substantial tasks:

1. Inspect the relevant files.
2. Summarize the current behavior.
3. Identify affected data flows.
4. Provide a brief implementation plan.
5. Make incremental changes.
6. Run relevant verification.
7. Summarize the result.

The implementation plan should explain how old logic maps to:

* routes;
* controllers;
* services;
* schemas;
* view models;
* EJS templates;
* browser TypeScript modules;
* storage.

Do not provide a long plan for trivial fixes.

Do not ask for clarification when the repository already contains the answer.

Ask for clarification only when a missing product decision would materially change the implementation and cannot be resolved safely from existing files.

Otherwise:

* make the safest reasonable assumption;
* state the assumption;
* keep the change reversible.

---

# Completion Report

After substantial work, report:

* what was changed;
* which legacy behavior was preserved;
* which files were added or modified;
* which APIs or storage formats were affected;
* which checks were run;
* which checks passed;
* which checks could not be run;
* remaining compatibility risks;
* remaining security risks;
* suggested next migration stage.

Do not claim the full migration is complete when only one stage was completed.

Clearly distinguish:

* completed work;
* compatibility code still present;
* deferred refactoring;
* unverified behavior.

---

# Definition of Done

A migration task is complete only when:

* the requested behavior works;
* existing relevant behavior remains intact;
* new code is strictly typed;
* untrusted input is validated;
* output is escaped safely;
* local-network operations have bounded security controls;
* templates contain no business logic;
* client-only behavior remains modular;
* storage compatibility is preserved or explicitly migrated;
* relevant tests pass;
* relevant build and type checks pass;
* unresolved risks are documented.

The goal is not merely to move code into Node.js.

The goal is to transform the legacy application into a maintainable Node.js architecture while preserving the product that already exists.

# Additionally

- Remember that the application must be in Russian by default, but you can provide for the possibility of localization through settings.

- Feel free to edit AGENTS.md to track statuses, update the project structure, and take notes on your work for future sessions