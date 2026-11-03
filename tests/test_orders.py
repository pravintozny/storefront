import io
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from storefront import db  # noqa: E402
from storefront.orders import api, service  # noqa: E402
from storefront.orders.models import Order, OrderItem  # noqa: E402
from storefront.orders.pricing import compute_tax, price_order  # noqa: E402
import backfill_orders  # noqa: E402


def fresh():
    c = db.connect()
    db.migrate(c)
    c.execute("INSERT INTO products(sku,name,unit_price_cents) VALUES ('A1','Widget',1000)")
    c.commit()
    return c


def mk(**kw):
    d = dict(number="N1", customer_id="c1", currency="USD", placed_at="2026-01-01T00:00:00Z",
             items=[OrderItem("A1", 2, 1000), OrderItem("B2", 1, 500)])
    d.update(kw)
    return Order(**d)


class PricingTests(unittest.TestCase):
    def test_tax_rounding(self):
        self.assertEqual(compute_tax(1050, 825), 87)

    def test_totals(self):
        o = price_order(mk(discount_cents=500, shipping_cents=300, tax_rate_bps=1000))
        self.assertEqual((o.subtotal_cents, o.tax_cents, o.total_cents), (2500, 200, 2500))

    def test_discount_capped(self):
        o = price_order(mk(discount_cents=99999))
        self.assertEqual(o.total_cents, 0)


class ServiceTests(unittest.TestCase):
    def test_create_get_and_product_link(self):
        c = fresh()
        service.create_order(c, mk())
        o = service.get_order(c, "N1")
        self.assertEqual(o.items[0].product_id, 1)
        self.assertIsNone(o.items[1].product_id)
        self.assertEqual(o.items[0].line_total_cents, 2000)
        self.assertEqual([x.number for x in service.orders_for_product(c, 1)], ["N1"])

    def test_duplicate_number_and_validation(self):
        c = fresh()
        service.create_order(c, mk())
        with self.assertRaises(service.OrderError):
            service.create_order(c, mk())
        with self.assertRaises(service.OrderError):
            service.create_order(c, mk(number="N2", items=[]))

    def test_status_transitions(self):
        c = fresh()
        service.create_order(c, mk())
        self.assertEqual(service.update_status(c, "N1", "paid").status, "paid")
        with self.assertRaises(service.OrderError):
            service.update_status(c, "N1", "pending")


class ApiTests(unittest.TestCase):
    def call(self, app, method, path, body=None):
        raw = json.dumps(body).encode() if body is not None else b""
        out = {}
        env = {"REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
               "CONTENT_LENGTH": str(len(raw)), "wsgi.input": io.BytesIO(raw)}
        res = app(env, lambda s, h: out.setdefault("s", s))
        return out["s"], json.loads(b"".join(res))

    def test_flow(self):
        app = api.make_app(fresh())
        s, b = self.call(app, "POST", "/orders", {
            "number": "N9", "customer_id": "c", "currency": "EUR", "placed_at": "2026-02-02",
            "items": [{"sku": "A1", "quantity": 1, "unit_price_cents": 1000}], "tax_rate_bps": 2000})
        self.assertEqual((s, b["total_cents"]), ("201 Created", 1200))
        self.assertEqual(self.call(app, "GET", "/orders/N9")[0], "200 OK")
        self.assertEqual(self.call(app, "GET", "/orders/nope")[0], "404 Not Found")
        self.assertEqual(len(self.call(app, "GET", "/products/1/orders")[1]), 1)
        self.assertEqual(self.call(app, "PATCH", "/orders/N9", {"status": "shipped"})[0], "400 Bad Request")
        self.assertEqual(self.call(app, "POST", "/orders", {})[0], "400 Bad Request")


class BackfillTests(unittest.TestCase):
    def test_backfill_idempotent(self):
        c = fresh()
        c.execute("CREATE TABLE legacy_orders (order_number, status, customer_id, currency, placed_at, sku,"
                  " quantity, unit_price_cents, discount_cents, shipping_cents, tax_cents)")
        rows = [("L1", "complete", "c1", "USD", "2020-01-01", "A1", 2, 1000, 200, 100, 180),
                ("L1", "complete", "c1", "USD", "2020-01-01", "ZZ", 1, 500, 200, 100, 180)]
        c.executemany("INSERT INTO legacy_orders VALUES (?,?,?,?,?,?,?,?,?,?,?)", rows)
        self.assertEqual(backfill_orders.backfill(c), (1, 0))
        self.assertEqual(backfill_orders.backfill(c), (0, 1))
        o = service.get_order(c, "L1")
        self.assertEqual((o.status, o.subtotal_cents, o.total_cents, o.tax_rate_bps), ("delivered", 2500, 2580, 783))
        self.assertEqual(o.items[0].product_id, 1)
        self.assertIsNone(o.items[1].product_id)


if __name__ == "__main__":
    unittest.main()
