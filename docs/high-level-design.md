# Storefront — High-Level Design

_Status: draft · Based on analysis of the repository as of 2026-11-20_

## 1. Scope and a note on repository state

`main` currently contains only the `LICENSE` (single "Initial commit"). All
code lives on **unmerged, independent feature branches**, each created from the
empty `main`, with overlapping/conflicting layouts. This document describes the
system as implied by those branches and proposes how they converge. Branch
names below are `origin/feat/...` (shortened).

| Branch | Layer | Content |
|---|---|---|
| `build-the-order-module-in-pravintozny-st` | Backend | Python/SQLite order service, WSGI API, migrations, backfill script, tests |
| `build-the-product-module-in-pravintozny` | Backend | Decimal-based domain model (`Product`, despite modelling an order), pricing/tax |
| `build-the-ecommerce-module-in-pravintozn` | Backend | Minimal `EcommerceOrder` / line model with `to_dict` |
| `store-management-component` | Frontend | Angular store CRUD (signals, in-memory) |
| `owner-management` | Frontend | Angular owner CRUD (in-memory) |
| `customer-base-angular-component` | Frontend | Angular customer list (mock data) |
| `stock-basic-angular-component` | Frontend | Angular stock view (mock) — under `web/` |
| `angular-product-detail` | Frontend | Angular product detail (mock) — under `web/` |
| `add-order-fields-include-order-base-info` | Frontend | Angular order detail (mock) — under `web/` |

## 2. Goals

A storefront back-office for retail operations: manage stores, owners,
customers, products/stock, and orders, with correct money handling and a
controlled order lifecycle.

## 3. Architecture overview

```
 Angular SPA (standalone components, signals, router)
   stores | owners | customers | stock | product detail | order detail
        │   (today: in-memory services / mock data)
        ▼   JSON over HTTP  (not yet wired)
 Python WSGI API (stdlib only)         storefront/orders/api.py
        ▼
 Service layer (validation, state machine)   orders/service.py
        ├── Pricing/tax (pure functions)     orders/pricing.py
        ▼
 SQLite via sqlite3 + forward-only SQL migrations   db.py, migrations/
```

Two largely independent tiers:

- **Backend** — Python 3.9+, standard library only, SQLite. No framework.
- **Frontend** — Angular 22 (standalone components, `signal`-based state,
  RxJS 7.8 available), TypeScript, Prettier/EditorConfig.

**The frontend is not connected to the backend**: all Angular services hold
hard-coded or in-memory data.

## 4. Backend design

### 4.1 Modules
- `db.py` — `connect()` (row factory, `PRAGMA foreign_keys=ON`) and `migrate()`,
  which applies `migrations/*.sql` in filename order, recording each in
  `schema_migrations`. Forward-only; no rollback.
- `orders/models.py` — `Order`, `OrderItem` dataclasses; `STATUSES`.
- `orders/pricing.py` — pure pricing: subtotal → discount (capped at subtotal)
  → tax → total.
- `orders/service.py` — validation, persistence, queries, status transitions.
- `orders/api.py` — hand-routed WSGI JSON app (`make_app(conn)`).
- `scripts/backfill_orders.py` — idempotent copy of `legacy_orders` into
  `orders`/`order_items`.

### 4.2 Data model (SQLite)
- `products(id, sku UNIQUE, name, unit_price_cents ≥ 0)`
- `orders(id, number UNIQUE, status CHECK, customer_id, currency CHAR(3),
  placed_at, subtotal/discount/shipping/tax/total_cents, tax_rate_bps)`;
  index on `customer_id`.
- `order_items(id, order_id → orders ON DELETE CASCADE, product_id → products
  (nullable), sku, quantity > 0, unit_price_cents ≥ 0, line_total_cents)`;
  indexes on `order_id`, `product_id`.

Items snapshot `sku` and unit price at order time; `product_id` is a soft link
resolved by SKU on creation (null if no match).
`customer_id` is a free-text value — there is no customers table in the backend.

### 4.3 Money and tax rules
- All money is integer minor units (cents); tax rate in basis points.
- Tax = half-up rounding on (subtotal − discount); shipping is untaxed.
- Totals are computed server-side on create and persisted.
- _Divergence:_ the `product`/`ecommerce` branches use `Decimal` and, in
  `product`, percent+fixed discounts and optional taxed shipping. These
  conflict with the integer-cents convention and must be reconciled.

### 4.4 Order lifecycle
```
pending → paid | cancelled
paid → shipped | refunded | cancelled
shipped → delivered | refunded
delivered → refunded
cancelled, refunded: terminal
```
Enforced in `service.update_status`. (The frontend order type omits
`refunded`; the `product` branch uses a different status set — see §7.)

### 4.5 HTTP API
| Method | Path | Purpose |
|---|---|---|
| POST | `/orders` | Create (priced server-side), 201 |
| GET | `/orders[?customer_id=]` | List |
| GET | `/orders/<number>` | Fetch; 404 if missing |
| PATCH | `/orders/<number>` | `{"status": …}` transition |
| GET | `/products/<id>/orders` | Orders containing a product |

Errors (`OrderError`, `KeyError`, `ValueError`, `TypeError`) map to
`400 {"error": …}`.

## 5. Frontend design

- Standalone Angular app; each feature is a component folder
  (`stores/`, `owners/`, `customers/`, `stock/`, `product-detail/`,
  `order-detail/`) with `.ts/.html/.css/.spec.ts`.
- State: `StoreService` uses `signal` + readonly view with add/update/remove;
  other features use static mock arrays (`*.mock.ts`, `MOCK_CUSTOMERS`).
- Routing: `app.routes.ts` (stock route redirects from `/`); other branches
  register a single feature each.
- Domain types: `Store`, `Owner`, `Customer` (`active|inactive|pending`),
  `Order`/`OrderLine` with `lineTotal`/`orderSubtotal` helpers (floating-point
  money, rounded to 2 dp).
- Layout inconsistency: some branches put the app at repo root, others under
  `web/`.

## 6. Cross-cutting concerns

- **Testing:** backend `unittest` (`python3 -m unittest discover -s tests`);
  frontend Angular specs per component.
- **Transactions:** order create wraps order + items in one transaction;
  integrity errors surface as `OrderError`.
- **Security:** no authentication/authorization, CORS, or rate limiting; the
  API's hand-rolled query parsing doesn't URL-decode. Must be addressed before
  exposure beyond a trusted network.
- **Observability/config:** none (no logging, config, or deployment assets).
- **CI/CD:** none present.

## 7. Known gaps and risks

1. `main` is empty; nine branches diverge with conflicting layouts
   (`storefront/` vs `storefront/product|ecommerce|orders`; app root vs `web/`).
2. Three competing backend order models (cents vs `Decimal`; different status
   vocabularies; `Product` class that really represents an order).
3. Frontend money is `number` (float) vs backend integer cents.
4. Frontend/back-end contract mismatch (field names: `orderNumber` vs `number`,
   `customerName` vs `customer_id`, `refunded` status).
5. No customer/store/owner/stock persistence in the backend.
6. No auth, CI, or deployment.
7. Backend `migrate` runs scripts non-atomically per file (`executescript`
   commits implicitly).

## 8. Proposed convergence roadmap

1. Pick the order branch (integer cents, state machine, migrations) as the
   backend baseline; retire the `product`/`ecommerce` duplicates.
2. Standardise layout: `backend/` (or `storefront/`) and `web/`.
3. Add backend tables/endpoints for customers, stores, owners, stock; replace
   Angular mocks with an `HttpClient` data layer behind the existing services.
4. Share one API contract (OpenAPI) and align status enums and money format.
5. Add auth, input validation hardening, CI (unit tests + Angular build), and
   containerised deployment.
