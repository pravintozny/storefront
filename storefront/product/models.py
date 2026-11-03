from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum

CENT = Decimal("0.01")


def money(value) -> Decimal:
    return Decimal(value).quantize(CENT, rounding=ROUND_HALF_UP)


class ProductStatus(str, Enum):
    DRAFT = "draft"
    PLACED = "placed"
    PAID = "paid"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class Customer:
    id: str
    name: str
    email: str = ""


@dataclass(frozen=True)
class ProductLine:
    sku: str
    quantity: int
    unit_price: Decimal

    def __post_init__(self):
        if not self.sku:
            raise ValueError("sku is required")
        if self.quantity <= 0:
            raise ValueError("quantity must be positive")
        object.__setattr__(self, "unit_price", Decimal(self.unit_price))
        if self.unit_price < 0:
            raise ValueError("unit_price must not be negative")

    @property
    def line_total(self) -> Decimal:
        return money(self.unit_price * self.quantity)


@dataclass(frozen=True)
class Pricing:
    """Discounts and shipping. Percent discount applies first, then fixed."""

    discount_percent: Decimal = Decimal("0")
    discount_fixed: Decimal = Decimal("0")
    shipping: Decimal = Decimal("0")

    def __post_init__(self):
        for f in ("discount_percent", "discount_fixed", "shipping"):
            object.__setattr__(self, f, Decimal(getattr(self, f)))
        if not Decimal("0") <= self.discount_percent <= Decimal("100"):
            raise ValueError("discount_percent must be between 0 and 100")
        if self.discount_fixed < 0 or self.shipping < 0:
            raise ValueError("discount_fixed and shipping must not be negative")

    def discount(self, subtotal: Decimal) -> Decimal:
        total = money(subtotal * self.discount_percent / 100) + money(self.discount_fixed)
        return min(total, subtotal)


@dataclass(frozen=True)
class TaxRule:
    """Tax rate in percent, applied to discounted subtotal (and shipping if flagged)."""

    rate_percent: Decimal = Decimal("0")
    apply_to_shipping: bool = False

    def __post_init__(self):
        object.__setattr__(self, "rate_percent", Decimal(self.rate_percent))
        if self.rate_percent < 0:
            raise ValueError("rate_percent must not be negative")

    def tax(self, taxable: Decimal) -> Decimal:
        return money(taxable * self.rate_percent / 100)


@dataclass
class Product:
    number: str
    customer: Customer
    currency: str
    status: ProductStatus = ProductStatus.DRAFT
    placed_at: datetime | None = None
    lines: list[ProductLine] = field(default_factory=list)
    pricing: Pricing = field(default_factory=Pricing)
    tax_rule: TaxRule = field(default_factory=TaxRule)

    def __post_init__(self):
        if not self.number:
            raise ValueError("number is required")
        if len(self.currency) != 3 or not self.currency.isalpha():
            raise ValueError("currency must be a 3-letter code")
        self.currency = self.currency.upper()

    def add_line(self, sku: str, quantity: int, unit_price) -> ProductLine:
        line = ProductLine(sku, quantity, Decimal(unit_price))
        self.lines.append(line)
        return line

    def place(self, when: datetime | None = None) -> None:
        if self.status is not ProductStatus.DRAFT:
            raise ValueError("only draft products can be placed")
        if not self.lines:
            raise ValueError("cannot place a product with no lines")
        self.placed_at = when or datetime.now(timezone.utc)
        self.status = ProductStatus.PLACED

    @property
    def subtotal(self) -> Decimal:
        return money(sum((l.line_total for l in self.lines), Decimal("0")))

    @property
    def discount_total(self) -> Decimal:
        return self.pricing.discount(self.subtotal)

    @property
    def shipping_total(self) -> Decimal:
        return money(self.pricing.shipping)

    @property
    def tax_total(self) -> Decimal:
        taxable = self.subtotal - self.discount_total
        if self.tax_rule.apply_to_shipping:
            taxable += self.shipping_total
        return self.tax_rule.tax(taxable)

    @property
    def total(self) -> Decimal:
        return self.subtotal - self.discount_total + self.shipping_total + self.tax_total
