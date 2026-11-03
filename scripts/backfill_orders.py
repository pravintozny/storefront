"""Backfill historical orders from a legacy flat table into orders/order_items.

Expects a source table `legacy_orders` with columns:
  order_number, status, customer_id, currency, placed_at, sku, quantity,
  unit_price_cents, discount_cents, shipping_cents, tax_cents
(one row per line; order-level amounts repeated on each line).
Idempotent: orders whose number already exists are skipped. Historical totals
are preserved as recorded (tax_cents is copied, not recomputed).

Usage: python3 scripts/backfill_orders.py DB_PATH
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from storefront import db  # noqa: E402

STATUS_MAP = {"complete": "delivered", "completed": "delivered", "canceled": "cancelled"}


def backfill(conn):
    migrated = skipped = 0
    numbers = [r[0] for r in conn.execute("SELECT DISTINCT order_number FROM legacy_orders ORDER BY order_number")]
    for num in numbers:
        if conn.execute("SELECT 1 FROM orders WHERE number=?", (num,)).fetchone():
            skipped += 1
            continue
        lines = conn.execute("SELECT * FROM legacy_orders WHERE order_number=? ORDER BY rowid", (num,)).fetchall()
        h = lines[0]
        status = STATUS_MAP.get(h["status"], h["status"])
        sub = sum(l["quantity"] * l["unit_price_cents"] for l in lines)
        disc = min(h["discount_cents"] or 0, sub)
        ship, tax = h["shipping_cents"] or 0, h["tax_cents"] or 0
        taxable = sub - disc
        bps = round(tax * 10000 / taxable) if taxable else 0
        with conn:
            cur = conn.execute(
                "INSERT INTO orders(number,status,customer_id,currency,placed_at,subtotal_cents,discount_cents,"
                "shipping_cents,tax_cents,total_cents,tax_rate_bps) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (num, status, h["customer_id"], h["currency"], h["placed_at"], sub, disc, ship, tax,
                 taxable + ship + tax, bps))
            for l in lines:
                p = conn.execute("SELECT id FROM products WHERE sku=?", (l["sku"],)).fetchone()
                conn.execute(
                    "INSERT INTO order_items(order_id,product_id,sku,quantity,unit_price_cents,line_total_cents)"
                    " VALUES (?,?,?,?,?,?)",
                    (cur.lastrowid, p["id"] if p else None, l["sku"], l["quantity"], l["unit_price_cents"],
                     l["quantity"] * l["unit_price_cents"]))
        migrated += 1
    return migrated, skipped


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    c = db.connect(sys.argv[1])
    db.migrate(c)
    m, s = backfill(c)
    print("migrated=%d skipped=%d" % (m, s))
