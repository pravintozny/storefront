import unittest
from datetime import datetime
from decimal import Decimal

from storefront.ecommerce import EcommerceOrder, EcommerceOrderLine


class EcommerceTests(unittest.TestCase):
    def test_line_total(self):
        line = EcommerceOrderLine("SKU-1", 3, Decimal("2.50"))
        self.assertEqual(line.line_total, Decimal("7.50"))

    def test_invalid_line(self):
        with self.assertRaises(ValueError):
            EcommerceOrderLine("SKU-1", 0, Decimal("1"))
        with self.assertRaises(ValueError):
            EcommerceOrderLine("", 1, Decimal("1"))

    def test_order_to_dict(self):
        o = EcommerceOrder("E-1", "placed", "cust-1", "USD",
                           datetime(2026, 1, 1, 12, 0),
                           [EcommerceOrderLine("SKU-1", 2, Decimal("5"))])
        d = o.to_dict()
        self.assertEqual(d["number"], "E-1")
        self.assertEqual(d["placed_at"], "2026-01-01T12:00:00")
        self.assertEqual(d["lines"][0]["line_total"], "10")

    def test_order_requires_base_info(self):
        with self.assertRaises(ValueError):
            EcommerceOrder("", "placed", "c", "USD", datetime.now())


if __name__ == "__main__":
    unittest.main()
