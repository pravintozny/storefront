"""Pricing and tax. All amounts are integer minor units (cents)."""


def subtotal(items):
    return sum(i.line_total_cents for i in items)


def compute_tax(taxable_cents, rate_bps):
    """Tax on (subtotal - discount); shipping is not taxed. Half-up rounding."""
    return (max(taxable_cents, 0) * rate_bps + 5000) // 10000


def price_order(order):
    """Fill subtotal/tax/total on the order; discount is capped at the subtotal."""
    if order.discount_cents < 0 or order.shipping_cents < 0:
        raise ValueError("discount and shipping must be non-negative")
    order.subtotal_cents = subtotal(order.items)
    order.discount_cents = min(order.discount_cents, order.subtotal_cents)
    taxable = order.subtotal_cents - order.discount_cents
    order.tax_cents = compute_tax(taxable, order.tax_rate_bps)
    order.total_cents = taxable + order.shipping_cents + order.tax_cents
    return order
