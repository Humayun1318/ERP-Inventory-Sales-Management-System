# ERP – Inventory & Sales Management System

A modular, TypeScript-first backend for small-to-mid-sized retail and inventory businesses to manage products, customers, sales, and staff access from a single source of truth — with every number on the Sale record (unit price, grand total) computed on the server, never trusted from the client.

## Project Description

This backend powers a role-based Inventory & Sales ERP: staff log in, browse and manage a product catalog, register customers, and record sales that automatically validate stock, reduce inventory, and produce an auditable sale history. It solves the common small-business problem of trusting a cashier's or frontend's arithmetic for a sale total, or letting stock go negative — every sale is created inside a MongoDB transaction that either fully succeeds (stock reduced + sale recorded) or fully rolls back.

**Target users:** small retail/wholesale businesses and their internal teams — Admins (full control), Managers (day-to-day catalog and customer management), and Employees (point-of-sale style operation: view products, look up customers, create sales).

## Core Features

- **Authentication** — Local (email/password, bcrypt-hashed) and Google OAuth 2.0 (via Passport strategies), unified under a single `User` document that tracks linked providers.
- **JWT Authorization** — Stateless access-token verification on every protected route via a shared `checkAuth` middleware.
- **Role-Based Authorization** — Three roles (`ADMIN`, `MANAGER`, `EMPLOYEE`), each scoped to a specific set of permissions enforced per-route.
- **Product Management** — Full CRUD, unique SKU enforcement, stock tracking, and Cloudinary-backed product images.
- **Customer Management** — Full CRUD with unique phone enforcement; Employees get read-only access so they can attach a customer to a sale without being able to alter the customer record.
- **Sales Management** — Multi-product sales with server-computed line totals and grand total, atomic stock deduction, and full sale history with populated references.
- **Dashboard** — Real-time totals (products, customers, sales) and a low-stock report.
- **Search & Pagination** — A single reusable `QueryBuilder` class powers search, filtering, range filtering, sorting, field selection, and pagination across every module.
- **Validation** — Zod schemas validate every mutating request before it reaches the controller.
- **Centralized Error Handling** — A single `AppError` class and global handler produce a consistent error response shape for every failure mode.
- **MongoDB Transactions** — Sale creation and stock reduction are wrapped in one session; any failure mid-loop rolls back everything, including stock already decremented for earlier items in the same request.
- **Direct-to-Cloud Image Upload** — Product images go straight to Cloudinary via `multer-storage-cloudinary`, with no temporary file ever written to local disk.
- **Clean Modular Architecture** — Every module follows an identical 7-file convention (`constants`, `interface`, `model`, `validation`, `service`, `controller`, `route`), making the codebase predictable and easy to extend.

## Technology Stack

| Category | Technology |
|---|---|
| **Backend Runtime** | Node.js, Express 5 |
| **Language** | TypeScript |
| **Database** | MongoDB, Mongoose (ODM) |
| **Authentication** | JSON Web Token (`jsonwebtoken`), Passport.js (`passport-local`, `passport-google-oauth20`), `bcrypt` |
| **Session Support** | `express-session` (Passport OAuth handshake) |
| **Validation** | Zod |
| **Image Upload** | Multer, Cloudinary SDK, `multer-storage-cloudinary` |
| **HTTP Status Codes** | `http-status-codes` |
| **Dev Tools** | `ts-node-dev`, ESLint (`@typescript-eslint`), Prettier, `eslint-config-prettier` |
| **Utilities** | `dotenv`, `cors`, `cookie-parser`, `colors` / `chalk`, `ora` |

## Project Architecture

The project follows a strict **layered, feature-based (modular) architecture**. Every business domain (User, Product, Customer, Sale, Dashboard) lives in its own folder with the same internal shape, so any engineer familiar with one module already knows the shape of every other module.

| Layer | Responsibility |
|---|---|
| **Route** | Wires an HTTP method + path to `checkAuth` (role gate), `validateRequest` (schema gate), and a controller method. Contains zero logic. |
| **Controller** | Receives the request, calls exactly one service method, and sends the response via `sendResponse`. Never touches business rules or the database directly. |
| **Service** | Owns all business logic: existence checks, stock rules, grand-total calculation, transactions. Throws `AppError` on any rule violation. Never formats an HTTP response. |
| **Model** | Mongoose schema, hooks (e.g. password hashing), instance/static methods (e.g. `isSkuTaken`, `isEmailTaken`). |
| **Interface** | TypeScript contracts (`IProduct`, `IProductDocument`, `IProductModel`, create/update DTOs) — keeps service and controller signatures strongly typed. |
| **Validation** | Zod schemas describing exactly what a client is allowed to send. Rejects unknown fields via `.strict()`. |
| **Constants** | Enums, searchable-field lists, and magic numbers (e.g. low-stock threshold) — a single place to change a business constant. |
| **Utils** (where needed) | Cross-cutting helpers a module exposes for *other* modules to consume (e.g. `assertProductExists`, used by Sale's transaction) — avoids duplicating existence-check logic. |

**Why this architecture:** separating "what HTTP looks like" (route/controller) from "what the business allows" (service) from "what the data looks like" (model/interface) means a rule like *"insufficient stock"* lives in exactly one place, is unit-testable in isolation from Express, and can't silently drift between modules.

## Folder Structure

```
src/
├── app/
│   └── modules/
│       ├── user/
│       │   ├── user.constants.ts
│       │   ├── user.interface.ts
│       │   ├── user.model.ts
│       │   ├── user.validation.ts
│       │   ├── user.service.ts
│       │   ├── user.controller.ts
│       │   ├── user.route.ts
│       │   └── user.utils.ts        # validateUserStatus (account-state guard used by checkAuth)
│       ├── product/
│       │   ├── product.constants.ts
│       │   ├── product.interface.ts
│       │   ├── product.model.ts
│       │   ├── product.validation.ts
│       │   ├── product.service.ts
│       │   ├── product.controller.ts
│       │   ├── product.route.ts
│       │   └── product.utils.ts     # assertProductExists, lowStockFilter
│       ├── customer/
│       │   ├── customer.constants.ts
│       │   ├── customer.interface.ts
│       │   ├── customer.model.ts
│       │   ├── customer.validation.ts
│       │   ├── customer.service.ts
│       │   ├── customer.controller.ts
│       │   ├── customer.route.ts
│       │   └── customer.utils.ts    # assertCustomerExists
│       ├── sale/
│       │   ├── sale.constants.ts
│       │   ├── sale.interface.ts
│       │   ├── sale.model.ts
│       │   ├── sale.validation.ts
│       │   ├── sale.service.ts
│       │   ├── sale.controller.ts
│       │   ├── sale.route.ts
│       │   └── sale.utils.ts        # calculateGrandTotal
│       └── dashboard/
│           ├── dashboard.interface.ts
│           ├── dashboard.service.ts
│           ├── dashboard.controller.ts
│           └── dashboard.route.ts   # read-only aggregation module — no model/validation/constants of its own
├── errorHelpers/
│   └── AppError.ts
├── middlewares/
│   ├── checkAuth.ts
│   ├── validateRequest.ts
│   └── globalErrorHandler.ts
├── utils/
│   ├── catchAsync.ts
│   ├── sendResponse.ts
│   ├── getUserIdFromReq.ts
│   └── QueryBuilder.ts
├── config/
│   └── env.ts
├── app.ts
└── server.ts
```

## Database Design

*(See `schema.dbml` — paste directly into [dbdiagram.io](https://dbdiagram.io/d/erpIms-6a4bfb584ac62e474c41160f) for the visual ERD.)*

### User
The core account record. Supports **two login providers** simultaneously through an embedded `auths[]` array (`{ provider: LOCAL | GOOGLE, providerId }`), so a single user can, for example, register locally and later link Google without creating a duplicate account. `role` gates authorization. `isVerified` / `isActive` / `isBlocked` / `isDeleted` are checked on every authenticated request (`validateUserStatus`) so a suspended or soft-deleted account is rejected immediately, even with a valid JWT.

### Product
The inventory catalog. `sku` is unique (case-normalized to uppercase) and is the operational identifier staff search by. `stockQuantity` is the single source of truth for availability — it is only ever mutated by the Sale transaction, never directly by a client request outside the Product update endpoint. `imageUrl` stores the Cloudinary `secure_url` returned at upload time.

### Customer
A simple directory keyed by a unique `phone` number (the natural identifier for walk-in retail). `email` and `address` are optional since not every retail customer provides them.

### Sale
The transactional core of the system. References **all three other models**:
- **Customer** (`customer`, one-to-many: one customer can have many sales) — *why:* sale history and customer purchase tracking.
- **User** (`createdBy`, one-to-many: one staff member can create many sales) — *why:* accountability/audit trail for who processed each transaction.
- **Product** (embedded `products[]` array, each entry referencing one Product) — *why:* a sale is inherently multi-item, so line items are embedded rather than a separate collection, avoiding an extra round-trip to reconstruct a sale's contents.

Each embedded line item stores `unitPrice` as a **snapshot**, not a live reference — so if a product's `sellingPrice` changes next month, historical sales still reflect the price actually charged at the time.

## Business Logic

### Authentication Flow
A client authenticates via one of two Passport strategies:
- **Local** — email + password checked against the bcrypt hash on the `User` document.
- **Google OAuth 2.0** — `passport-google-oauth20` handles the OAuth handshake (`express-session` backs the temporary OAuth state); on success, the Google profile is matched or linked to a `User` via the `auths[]` array.

On successful authentication (either path), a JWT access token is issued. All subsequent requests carry this token in the `Authorization` header.

### Authorization Flow
Every protected route runs `checkAuth(...allowedRoles)`:
1. Extract and verify the JWT.
2. Reload the user from the database (so a role change or block takes effect immediately, not just at next login).
3. Run `validateUserStatus` — rejects if deleted, blocked, inactive, or unverified.
4. Confirm the token's role is in the route's allowed-roles list.
5. Attach the verified payload to `req.user` for downstream handlers (`getUserIdFromReq`).

### Product CRUD
Create/Update/Delete restricted to Admin & Manager. Read access open to Admin, Manager, and Employee (Employees need product visibility to sell). SKU uniqueness is checked before create and before update (excluding the document's own id). Delete is a **soft delete** (`isDeleted: true`) — historical Sales still resolve their embedded product references correctly even after a product is "deleted".

### Customer CRUD
Create/Update/Delete restricted to Admin & Manager. **Read** access (`GET /customers`, `GET /customers/:id`) is additionally granted to Employee — without this, an Employee could never look up or attach a customer while creating a sale, despite having "Create Sales" permission. Employees cannot create, edit, or delete customer records.

### Sales Flow (the core business rule)
On `POST /sales`, inside a single MongoDB transaction:
1. Verify the **Customer** exists (`assertCustomerExists`).
2. For each line item: verify the **Product** exists and isn't deleted (`assertProductExists`), verify `quantity > 0`, verify `stockQuantity >= quantity` — otherwise throw `AppError` with the specific reason (not found / insufficient stock).
3. Capture `unitPrice` from the Product's **current** `sellingPrice` (never accepted from the client).
4. Decrement the Product's `stockQuantity` and save it **inside the transaction session**.
5. Compute `grandTotal` server-side from the captured line items.
6. Create the `Sale` document with `customer`, `products[]`, `grandTotal`, and `createdBy` (from the JWT).
7. Commit. **Any failure at any step aborts the entire transaction** — including stock already decremented for earlier products in the same request — so a sale can never leave inventory in a half-updated state.

### Dashboard Statistics
Four independent read queries run concurrently (`Promise.all`, no shared transaction needed since it's read-only reporting):
- `totalProducts` / `totalCustomers` — `countDocuments({ isDeleted: false })`.
- `totalSales` — `countDocuments()` on Sale (no soft-delete on sales; a sale is a permanent record).
- `lowStockProducts` — Products where `stockQuantity < 5` (the threshold defined once in `PRODUCT_VALIDATION.LOW_STOCK_THRESHOLD`), sorted ascending so the most urgent restocks surface first.

### Search & Pagination
A single generic `QueryBuilder<T>` class is reused by every module's "get all" endpoint: `.search()` (regex `$or` across a module's declared searchable fields), `.filter()` (exact-match query params, excluding reserved keys), `.rangeFilter()` (numeric/date `$gte`/`$lte`, used for price range on Products and date range on Sales), `.sort()`, `.fields()` (field projection), `.paginate()`, and `.getMeta()` (page/limit/total/totalPages).

### Validation & Error Handling
Every mutating route runs a Zod schema through `validateRequest` before the controller executes — `.strict()` schemas reject unexpected fields outright. Every thrown error is an `AppError(statusCode, message)`, caught by `catchAsync` and forwarded to a global error handler that produces one consistent JSON error shape, regardless of whether the root cause was a business rule, a Mongo duplicate-key error, an invalid ObjectId, or an expired JWT.

## Authentication

| Aspect | Detail |
|---|---|
| Strategies | Local (email + password), Google OAuth 2.0 |
| Password storage | bcrypt hash, field marked `select: false` (never returned by default query) |
| Token type | JWT access token, sent as `Authorization: Bearer <token>` |
| Session use | `express-session` used only to support the Passport Google OAuth redirect handshake — not used for authenticating regular API requests, which remain stateless via JWT |
| Multi-provider linking | A `User` can hold both a `LOCAL` and a `GOOGLE` entry in `auths[]`, resolved by email |

## Authorization

| Role | Permissions |
|---|---|
| **Admin** | Full access to every module — user management, products, customers, sales, dashboard |
| **Manager** | Manage Products (CRUD), Manage Customers (CRUD), Create Sales, view Dashboard |
| **Employee** | View Products (read-only), View Customers (read-only — to attach to a sale), Create Sales |

Role is enforced per-route via `checkAuth(...roles)`, and re-validated server-side inside services where privilege escalation must be blocked (e.g. a non-Admin cannot grant themselves the Admin role through the User update endpoint).

## Product Module

- **CRUD**: Create/Update/Delete → Admin & Manager. Read → all authenticated roles.
- **Search**: name, SKU, category (case-insensitive regex via `QueryBuilder.search`).
- **Pagination**: standard `page`/`limit` query params.
- **SKU**: unique, case-normalized to uppercase, checked on both create and update.
- **Stock Management**: `stockQuantity` is only ever decremented through the Sale transaction (aside from direct admin/manager updates); never allowed to go negative.
- **Image**: uploaded directly to Cloudinary via `multer-storage-cloudinary` — see **Image Upload** section.
- **Validation**: Zod — name, SKU, category length bounds; prices and stock must be non-negative.
- **Business rule**: soft delete only — a "deleted" product remains resolvable inside historical Sale records.

## Customer Module

- **CRUD**: Create/Update/Delete → Admin & Manager only.
- **Read**: Admin, Manager, **and Employee** (so Employees can look up a customer to attach to a sale).
- **Uniqueness**: `phone` is the unique identifier, checked on create and update.
- **Search**: name, phone, email.
- **Pagination**: standard `page`/`limit`.
- **Validation**: name/phone required and length-bounded; email/address optional but validated when present.
- **Soft delete**: `isDeleted` flag — customer purchase history in Sale remains intact.

## Sales Module

- **Sale Creation**: single endpoint, multi-product payload (`customer` + `products: [{ product, quantity }]`) — no price fields accepted from the client.
- **Customer Validation**: existence checked inside the transaction before any product logic runs.
- **Product Validation**: each product's existence and non-deleted state confirmed individually.
- **Stock Checking**: `stockQuantity >= quantity` enforced per line item; insufficient stock throws a descriptive `AppError` naming the product and available quantity.
- **Stock Reduction**: applied atomically, within the same session as the Sale document creation.
- **Grand Total Calculation**: `Σ (quantity × unitPrice)` computed server-side — `unitPrice` is the Product's current `sellingPrice` at the moment of sale, never client-supplied.
- **Sale History**: `GET /sales` and `GET /sales/:id` populate `customer`, `createdBy`, and each line item's `product` for a fully readable record without additional client-side lookups.
- **References**: Customer (1), User/`createdBy` (1), Product (many, embedded).
- **MongoDB Transactions & Rollback**: the entire creation flow — customer check, per-product checks, stock decrements, Sale insert — runs inside one `mongoose.startSession()` transaction. Any thrown error triggers `session.abortTransaction()`, undoing every stock change already applied in that request, not just the failing step.

## Dashboard

| Metric | Calculation |
|---|---|
| Total Products | `Product.countDocuments({ isDeleted: false })` |
| Total Customers | `Customer.countDocuments({ isDeleted: false })` |
| Total Sales | `Sale.countDocuments()` |
| Low Stock Products | `Product.find({ isDeleted: false, stockQuantity: { $lt: 5 } })`, sorted ascending by stock |

All four run concurrently via `Promise.all` since they're independent reads with no shared write concern.

## Image Upload

Product images are handled by **Multer** configured with **`multer-storage-cloudinary`** as its storage engine, rather than the traditional disk-storage approach.

**Traditional approach (not used here):** Client → Multer (disk storage) → file saved to server's local filesystem → a separate step later uploads that file to cloud storage → local file cleaned up.

**This project's approach:**

```
Client
  ↓
Express Route
  ↓
Multer Middleware
  ↓
multer-storage-cloudinary  (Multer's storage engine, pointed at Cloudinary)
  ↓
Cloudinary (image uploaded directly to the cloud)
  ↓
Cloudinary returns upload metadata (including the secure URL)
  ↓
That metadata is available on req.file
  ↓
The application extracts the secure URL and stores it in MongoDB (Product.imageUrl)
```

**Why this is beneficial:**
- **Direct Cloud Upload** — the binary goes straight from the request to Cloudinary; Multer never persists it locally first.
- **No Temporary Local Storage** — nothing touches the server's disk, so there's no orphaned-file cleanup problem to manage.
- **Cleaner Architecture** — no separate "upload to cloud" step or job needed after the request completes; it's finished by the time the route handler runs.
- **Lower Server Storage Usage** — the app server's disk footprint stays flat regardless of image volume or size.
- **Better Performance** — no double I/O (write to disk, then read it back to re-upload); one upload path, one network hop.

## API Documentation

> Base path assumed as `/api/v1` — adjust to match your actual mount point in `app.ts`.

### Authentication
*(Implemented outside the modules documented in depth above — update exact paths if they differ in your route file.)*

| Method | Endpoint | Description | Protected | Role |
|---|---|---|---|---|
| POST | `/auth/register` | Register a new local user | No | — |
| POST | `/auth/login` | Local login, issues JWT | No | — |
| GET | `/auth/google` | Begin Google OAuth flow | No | — |
| GET | `/auth/google/callback` | Google OAuth callback, issues JWT | No | — |
| POST | `/auth/logout` | Clear session/token | Yes | Any |

### User
| Method | Endpoint | Description | Protected | Role |
|---|---|---|---|---|
| GET | `/users` | List all users (search, paginate) | Yes | Admin |
| GET | `/users/:id` | Get single user | Yes | Admin, or self |
| PATCH | `/users/:id` | Update user | Yes | Admin, or self (limited fields) |
| DELETE | `/users/:id` | Soft-delete user | Yes | Admin |

### Product
| Method | Endpoint | Description | Protected | Role |
|---|---|---|---|---|
| POST | `/products` | Create product (with image) | Yes | Admin, Manager |
| GET | `/products` | List products (search, filter, paginate) | Yes | Admin, Manager, Employee |
| GET | `/products/:id` | Get single product | Yes | Admin, Manager, Employee |
| PATCH | `/products/:id` | Update product | Yes | Admin, Manager |
| DELETE | `/products/:id` | Soft-delete product | Yes | Admin, Manager |

### Customer
| Method | Endpoint | Description | Protected | Role |
|---|---|---|---|---|
| POST | `/customers` | Create customer | Yes | Admin, Manager |
| GET | `/customers` | List customers (search, paginate) | Yes | Admin, Manager, Employee |
| GET | `/customers/:id` | Get single customer | Yes | Admin, Manager, Employee |
| PATCH | `/customers/:id` | Update customer | Yes | Admin, Manager |
| DELETE | `/customers/:id` | Soft-delete customer | Yes | Admin, Manager |

### Sale
| Method | Endpoint | Description | Protected | Role |
|---|---|---|---|---|
| POST | `/sales` | Create sale (transactional) | Yes | Admin, Manager, Employee |
| GET | `/sales` | List sales (filter, date range, paginate) | Yes | Admin, Manager, Employee |
| GET | `/sales/:id` | Get single sale (populated) | Yes | Admin, Manager, Employee |

### Dashboard
| Method | Endpoint | Description | Protected | Role |
|---|---|---|---|---|
| GET | `/dashboard/summary` | Totals + low stock report | Yes | Admin, Manager |

## Installation Guide

```bash
# 1. Clone the repository
git clone https://github.com/Humayun1318/<repo-name>.git
cd <repo-name>

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then fill in the values described below

# 4. Run in development mode (auto-restart on change)
npm run dev

# 5. Build for production
npm run build

# 6. Start the production build
npm start
```

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_URL=mongodb+srv://<user>:<password>@<cluster>/<db-name>

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_ACCESS_EXPIRES=1d

# Bcrypt
BCRYPT_SALT_ROUND=10

# Session (Passport OAuth handshake)
EXPRESS_SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
FRONTEND_URL=http://localhost:3000
```

## Validation

Every mutating endpoint (`POST`/`PATCH`) is guarded by a Zod schema through the shared `validateRequest` middleware, which runs **before** the controller. Schemas are `.strict()`, so any field not explicitly declared is rejected rather than silently ignored — this catches typos and unexpected client payloads early, before they ever reach business logic. ObjectId parameters (e.g. `product`, `customer` inside a Sale payload) are validated with a dedicated Zod refinement rather than trusted as opaque strings.

## Error Handling

- **`AppError`** — a single custom error class (`statusCode`, `message`) thrown anywhere business logic detects a rule violation (not found, conflict, insufficient stock, forbidden, etc.).
- **`catchAsync`** — wraps every controller so a rejected promise is forwarded to Express's error pipeline instead of crashing the process or hanging the request.
- **Global Error Handler** — the single place that turns any thrown value (an `AppError`, a Mongoose validation error, a duplicate-key `MongoServerError`, a `JsonWebTokenError`/`TokenExpiredError`, or an unexpected exception) into one consistent JSON error shape with an appropriate HTTP status code.
- **Validation Errors** — Zod parsing failures are caught by `validateRequest` and passed to the same global handler, so client-facing error shape stays identical regardless of failure source.

## Security

- **JWT Authentication** — every protected route requires a valid, non-expired access token.
- **Password Hashing** — bcrypt, salted per `BCRYPT_SALT_ROUND`, hashed in a Mongoose `pre('save')` hook so it's impossible to accidentally persist a plaintext password.
- **Protected APIs** — no module's mutating routes are reachable without `checkAuth`.
- **Role Middleware** — `checkAuth(...roles)` enforces the permission table above on every route, re-checked server-side (not just trusted from the JWT claim) for privilege-sensitive fields like `role` on User updates.
- **Input Validation** — Zod `.strict()` schemas on every mutating request reject unexpected or malformed input before it reaches the database layer.

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `ts-node-dev --respawn --transpile-only src/server.ts` | Runs the server in watch mode for development |
| `build` | `tsc` | Compiles TypeScript to `dist/` |
| `start` | `node dist/server.js` | Runs the compiled production build |
| `generateModule` | `ts-node-dev --respawn --transpile-only scripts/generate-module.ts` | Scaffolds a new module following the project's 7-file convention |
| `lint` | `eslint . --ext .ts` | Lints the codebase |
| `lint:fix` | `eslint . --ext .ts --fix` | Lints and auto-fixes fixable issues |
| `format` | `prettier --write .` | Formats the codebase with Prettier |
| `test` | *(not yet configured)* | Placeholder — no test suite implemented yet |

## Future Improvements

- **Redis** — cache dashboard aggregates and frequently-read product lookups.
- **Docker** — containerize the app and its environment for consistent deployment.
- **Swagger / OpenAPI** — auto-generated, always-current API documentation.
- **Unit & Integration Testing** — Jest/Vitest coverage for services (business rules) and route-level integration tests.
- **CI/CD** — automated lint/build/test pipeline on push (GitHub Actions).
- **Structured Logging** — request/error logging (e.g. Winston/Pino) beyond `colors`/`chalk` console output.
- **Refresh Tokens** — short-lived access token + long-lived refresh token rotation, instead of a single long-lived JWT.
- **Rate Limiting** — protect auth and mutation endpoints from abuse.
- **Audit Logs** — a dedicated collection tracking who changed what (especially role changes and stock adjustments), beyond the implicit `createdBy` on Sale.

## Author

**Humayun Kabir**
Backend Developer
GitHub: [github.com/Humayun1318](https://github.com/Humayun1318)
Email: humayunkabir6267@gmail.com