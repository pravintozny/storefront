import unittest
from datetime import datetime, timezone
from decimal import Decimal as D

from storefront.product import Customer, Pricing, Product, ProductStatus, TaxRule


def make(**kw):
    p = Product("P-1", Customer("c1", "Ada"), "usd", **kw)
    p.add_line("SKU-A", 2, "10.00")
    p.add_line("SKU-B", 1, "5.55")
    return p


class ProductTests(unittest.TestCase):
    def test_base_and_lines(self):
        p = make()
        self.assertEqual(p.currency, "USD")
        self.assertEqual(p.customer.id, "c1")
        self.assertEqual(p.lines[0].line_total, D("20.00"))
        self.assertEqual(p.subtotal, D("25.55"))

    def test_place(self):
        p = make()
        when = datetime(2026, 1, 1, tzinfo=timezone.utc)
        p.place(when)
        self.assertEqual((p.status, p.placed_at), (ProductStatus.PLACED, when))
        with self.assertRaises(ValueError):
            p.place()

    def test_pricing_and_tax(self):
        p = make(pricing=Pricing(discount_percent=10, discount_fixed=1, shipping="4.00"),
                 tax_rule=TaxRule(8, apply_to_shipping=True))
        self.assertEqual(p.discount_total, D("3.56"))
        self.assertEqual(p.tax_total, D("2.08"))
        self.assertEqual(p.total, D("28.07"))

    def test_discount_capped(self):
        p = make(pricing=Pricing(discount_fixed=1000))
        self.assertEqual(p.total, D("0.00"))

    def test_validation(self):
        with self.assertRaises(ValueError):
            Product("", Customer("c", "n"), "USD")
        with self.assertRaises(ValueError):
            make().add_line("X", 0, "1")
        with self.assertRaises(ValueError):
            Product("P", Customer("c", "n"), "USD").place()


if __name__ == "__main__":
    unittest.main()
