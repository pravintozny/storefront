import sqlite3

from .models import STATUSES, Order, OrderItem
from .pricing import price_order

_TRANSITIONS = {
    "pending": {"paid", "cancelled"},
    "paid": {"shipped", "refunded", "cancelled"},
    "shipped": {"delivered", "refunded"},
    "delivered": {"refunded"},
    "cancelled": set(),
    "refunded": set(),
}


class OrderError(ValueError):
    pass


def _validate(order):
    if order.status not in STATUSES:
        raise OrderError("invalid status: %s" % order.status)
    if len(order.currency) != 3:
        raise OrderError("currency must be a 3-letter code")
    if not order.items:
        raise OrderError("order needs at least one item")
    for i in order.items:
        if i.quantity <= 0 or i.unit_price_cents < 0:
            raise OrderError("invalid quantity or price for %s" % i.sku)


def create_order(conn, order, resolve_products=True):
    """Persist an order and its items; prices it first. Links items to products by sku."""
    _validate(order)
    price_order(order)
    try:
        with conn:
            cur = conn.execute(
                "INSERT INTO orders(number,status,customer_id,currency,placed_at,subtotal_cents,"
                "discount_cents,shipping_cents,tax_cents,total_cents,tax_rate_bps) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (order.number, order.status, order.customer_id, order.currency, order.placed_at,
                 order.subtotal_cents, order.discount_cents, order.shipping_cents, order.tax_cents,
                 order.total_cents, order.tax_rate_bps))
            order.id = cur.lastrowid
            for i in order.items:
                if resolve_products and i.product_id is None:
                    row = conn.execute("SELECT id FROM products WHERE sku=?", (i.sku,)).fetchone()
                    i.product_id = row["id"] if row else None
                c = conn.execute(
                    "INSERT INTO order_items(order_id,product_id,sku,quantity,unit_price_cents,line_total_cents)"
                    " VALUES (?,?,?,?,?,?)",
                    (order.id, i.product_id, i.sku, i.quantity, i.unit_price_cents, i.line_total_cents))
                i.id = c.lastrowid
    except sqlite3.IntegrityError as e:
        raise OrderError(str(e))
    return order


def get_order(conn, number):
    r = conn.execute("SELECT * FROM orders WHERE number=?", (number,)).fetchone()
    if not r:
        return None
    items = [OrderItem(sku=x["sku"], quantity=x["quantity"], unit_price_cents=x["unit_price_cents"],
                       product_id=x["product_id"], id=x["id"])
             for x in conn.execute("SELECT * FROM order_items WHERE order_id=? ORDER BY id", (r["id"],))]
    return Order(number=r["number"], customer_id=r["customer_id"], currency=r["currency"],
                 placed_at=r["placed_at"], status=r["status"], items=items,
                 discount_cents=r["discount_cents"], shipping_cents=r["shipping_cents"],
                 tax_rate_bps=r["tax_rate_bps"], subtotal_cents=r["subtotal_cents"],
                 tax_cents=r["tax_cents"], total_cents=r["total_cents"], id=r["id"])


def list_orders(conn, customer_id=None):
    q, a = "SELECT number FROM orders", ()
    if customer_id:
        q, a = q + " WHERE customer_id=?", (customer_id,)
    return [get_order(conn, r["number"]) for r in conn.execute(q + " ORDER BY id", a)]


def orders_for_product(conn, product_id):
    rows = conn.execute("SELECT DISTINCT o.number FROM orders o JOIN order_items i ON i.order_id=o.id "
                        "WHERE i.product_id=? ORDER BY o.id", (product_id,))
    return [get_order(conn, r["number"]) for r in rows]


def update_status(conn, number, new_status):
    o = get_order(conn, number)
    if not o:
        raise OrderError("order not found")
    if new_status not in _TRANSITIONS.get(o.status, set()):
        raise OrderError("cannot move %s -> %s" % (o.status, new_status))
    with conn:
        conn.execute("UPDATE orders SET status=? WHERE number=?", (new_status, number))
    return get_order(conn, number)
