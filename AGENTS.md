# AGENTS.md

This file provides system instructions, technical boundaries, and coding standards for AI development agents operating on the Blackmores Australia SAP BTP CAP extension project.

## 1. Project & Reference Architecture

This repository implements an SAP Cloud Application Programming Model (CAP) backend service deployed to the SAP BTP Cloud Foundry runtime.

- **Core Stack:** Node.js (v22 LTS), `@sap/cds` (v8.x), OData V4, and SAP HANA Cloud.
- **Local Persistence:** In-memory SQLite is strictly used for local development and automated tests.
- **Deployment Format:** Multi-Target Application (MTA). Direct `cf push` deployments are strictly prohibited.

### Strict Layering Rule

The project enforces a strict one-way dependency flow: `srv/` imports `db/`; `db/` must never reference `srv/`.

- **`db/` (Domain Model):** Contains entities, aspects, types, and code lists. Files under `db/` must not contain any service definitions, OData annotations, UI annotations, or authorisation annotations.
- **`srv/` (Service Layer):** Contains explicit entity projections, actions, functions, events, custom handlers, and service-specific annotations.

## 2. Directory & Canonical Repository Structure

AI agents must maintain the following canonical layout without variation:

```text
blkm-btp-<domain>/
+- db/
|  +- schema.cds                 # Declarative index (using statements only)
|  +- common.cds                 # Shared aspects, types, and code lists
|  +- <domain>/                  # Domain-specific models (e.g., sales-orders.cds)
|  +- data/                      # Idempotent reference/config CSV data only
+- srv/
|  +- <context>-service.cds      # Clean service definitions and projections
|  +- <context>-service.js       # Manifest file for handler registration only
|  +- handlers/                  # CAP-aware event handler modules
|  +- lib/                       # Pure, framework-agnostic business logic
|  +- external/                  # Imported S/4HANA EDMX and CSN definitions
+- test/
   +- unit/                      # Tests for srv/lib/ (No DB, No HTTP, No CAP runtime)
   +- integration/               # Tests using cds.test (In-memory SQLite, mocked auth)
```

## 3. Mandatory Coding Standards & Conventions

### Naming Conventions

- **Namespaces:** `com.blackmores.<context>` (e.g., `com.blackmores.order`). Reuse packages must use `com.blackmores.common.<topic>`.
- **Entities:** PascalCase and plural (e.g., `SalesOrders`, `Products`).
- **Elements/Fields:** camelCase and singular (e.g., `grossAmount`, `deliveryDate`).
- **Boolean Elements:** Must use a predicate form (e.g., `isBlocked`, `hasAttachments`). Suffixes like `_flag` are prohibited.
- **S/4HANA Fields:** Elements mirrored from S/4HANA must be prefixed with `s4` (e.g., `s4DocumentNumber`).
- **Services:** PascalCase ending with the word `Service` (e.g., `SalesOrderManagementService`).
- **Files:** Lowercase kebab-case (e.g., `sales-order-service.cds`). Service implementation `.js` files must exactly match the base name of their `.cds` file to enable automatic binding.

### Database Querying (cds.ql)

- **No Raw SQL:** All database access must use `cds.ql` fluent syntax (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). String-concatenated native SQL strings are explicitly banned.
- **No Wildcards:** `SELECT *` is prohibited. AI agents must explicitly name target columns to bound payloads and protect against model drift.
- **Mandatory Pagination:** Every unbounded `SELECT` query must explicitly invoke `.limit()`.
- **No Loops (N+1 Anti-Pattern):** Running database selections or remote service requests inside loops or `Array.forEach`/`map` blocks is strictly prohibited. Collect identifiers and execute a single batch read using an `IN` operator.
- **Transaction Context:** Queries must be executed against the request-scoped transaction context (`req.tx` or `srv.tx(req)`), never on a fresh root transaction.

### Custom Logic & Event Handlers

- **Thin Service Manifests:** The primary service `.js` entry file must only register handlers. It must not contain inline business logic.
- **`super.init()` Placement:** The statement `await super.init()` must always be the final line inside the service `init()` function. Custom handlers must be registered _before_ invoking `super.init()` to ensure proper execution sequence relative to generic persistence.
- **External Connections:** Remote services must be initialized once during bootstrap in `init()` (e.g., `this.s4Orders = await cds.connect.to('S4_API_SALES_ORDER_SRV')`) and stored on the service instance. Never trigger `cds.connect.to()` inside a request handler loop.
- **Pure Logic Separation:** Business rules, math calculations, and payload mappings must be written as pure, framework-free functions inside `srv/lib/`. These functions must not access `req`, `cds`, or execute I/O, ensuring they remain fast and unit-testable.
- **Stateless Design:** Module-level mutable variables are strictly prohibited to prevent cross-request data leaks. Services must remain completely stateless.

### Validation & Error Handling

- **Declarative Validation First:** Enforce constraints using native CDS annotations (`@mandatory`, `@assert.unique`, `@assert.range`, `@assert.format`, `@readonly`, `@insertonly`) rather than custom imperative checks.
- **Structured Error Payload:** When returning errors via `req.error()`, you must provide an object containing:
  - `code`: UPPER_SNAKE_CASE unique identifier.
  - `message`: A key corresponding to a property in `srv/_i18n/messages.properties` (never raw English literals).
  - `target`: The specific element field triggering the validation failure.
  - `status`: An accurate HTTP status code (e.g., `400`, `403`, `422`).
- **Data Privacy:** Error responses and log outputs must never expose internal stack traces, system hostnames, SQL text, or unredacted personal identifiable data.

### Authorisation

- **Deny by Default:** Services must be guarded with service-level `@requires: 'authenticated-user'` or explicit roles.
- **Declarative Restriction:** Row-level or instance-based permissions must use `@restrict` annotations with a `where` clause pushed down to the database query layer (e.g., `where: 'salesOrg_code = $user.SalesOrg'`).
- **Imperative Escape Hatch:** Handlers may only evaluate permissions manually when comparing data values against complex user attributes (e.g., variable limit sizes) that `@restrict` cannot process.

### Logging

- **No `console.log`:** Standard output logs are prohibited. Use the structured CAP logging engine: `const log = cds.log('sales-order')`.
- **Structured Format:** Pass structured metadata objects as the first parameter and a concise text header as the second: `log.info({ orderId, correlationId }, 'Message description')`.
- **Correlation:** Every log emission within a request context must carry the `x-correlation-id` header pulled from `req.headers`.

## 4. Operational & Execution Commands

When compiling, linting, testing, or building this application, use the exact scripts mapped in the project configuration:

- **Local Runtime (SQLite):**
  `npm run watch` (Executes `cds watch --profile development`)
- **Static Analysis & Linting:**
  `npm run lint` (Executes `cds-lint . && eslint . --max-warnings 0`)
- **Formatting Assessment:**
  `npm run format:check` (Executes `prettier --check "**/*.{js,json,md,cds}"`)
- **Automated Testing Suite:**
  `npm test` (Executes `jest --coverage --runInBand`)
- **Production Packaging:**
  `npm run build` (Executes `mbt build -p=cf --mtar=blkm-btp-order.mtar`)
