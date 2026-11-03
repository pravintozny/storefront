"""Ecommerce models.

Scope: base info (number, status, customer, currency, placed-at) and SKU
line details (SKU, quantity, unit price, line total).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal


@dataclass(frozen=True)
class EcommerceOrderLine:
    sku: str
    quantity: int
    unit_price: Decimal

    def __post_init__(self) -> None:
        if not self.sku:
            raise ValueError("sku is required")
        if self.quantity <= 0:
            raise ValueError("quantity must be positive")
        if self.unit_price < 0:
            raise ValueError("unit_price must not be negative")

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass
class EcommerceOrder:
    number: str
    status: str
    customer: str
    currency: str
    placed_at: datetime
    lines: list[EcommerceOrderLine] = field(default_factory=list)

    def __post_init__(self) -> None:
        for name in ("number", "status", "customer", "currency"):
            if not getattr(self, name):
                raise ValueError(f"{name} is required")

    def to_dict(self) -> dict:
        return {
            "number": self.number,
            "status": self.status,
            "customer": self.customer,
            "currency": self.currency,
            "placed_at": self.placed_at.isoformat(),
            "lines": [
                {
                    "sku": l.sku,
                    "quantity": l.quantity,
                    "unit_price": str(l.unit_price),
                    "line_total": str(l.line_total),
                }
                for l in self.lines
            ],
        }
