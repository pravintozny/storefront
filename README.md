# storefront

Stdlib-only Python (3.9+) with SQLite. Assumed layout since the repo was empty.

- `migrations/*.sql` forward-only; applied by `storefront.db.migrate`
- `storefront/orders/` models, pricing/tax, service, WSGI API
- `scripts/backfill_orders.py DB_PATH` backfills `legacy_orders` into `orders`/`order_items` (idempotent)
- Tests: `python3 -m unittest discover -s tests`

Money is integer minor units; tax rate in basis points, applied to subtotal minus discount (shipping untaxed).
