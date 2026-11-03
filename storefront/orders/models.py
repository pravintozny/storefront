from dataclasses import dataclass, field
from typing import List, Optional

STATUSES = ("pending", "paid", "shipped", "delivered", "cancelled", "refunded")


@dataclass
class OrderItem:
    sku: str
    quantity: int
    unit_price_cents: int
    product_id: Optional[int] = None
    id: Optional[int] = None

    @property
    def line_total_cents(self):
        return self.quantity * self.unit_price_cents


@dataclass
class Order:
    number: str
    customer_id: str
    currency: str
    placed_at: str
    status: str = "pending"
    items: List[OrderItem] = field(default_factory=list)
    discount_cents: int = 0
    shipping_cents: int = 0
    tax_rate_bps: int = 0
    subtotal_cents: int = 0
    tax_cents: int = 0
    total_cents: int = 0
    id: Optional[int] = None
