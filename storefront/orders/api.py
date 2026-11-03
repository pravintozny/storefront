"""Minimal WSGI JSON API.

POST /orders                 create     GET /orders[?customer_id=]   list
GET  /orders/<number>        fetch      PATCH /orders/<number>       {"status": ...}
GET  /products/<id>/orders   orders containing a product
"""
import json
from dataclasses import asdict

from . import service
from .models import Order, OrderItem


def _dump(o):
    d = asdict(o)
    for item, obj in zip(d["items"], o.items):
        item["line_total_cents"] = obj.line_total_cents
    return d


def make_app(conn):
    def app(environ, start_response):
        def reply(code, body):
            data = json.dumps(body).encode()
            start_response(code, [("Content-Type", "application/json"), ("Content-Length", str(len(data)))])
            return [data]

        method, parts = environ["REQUEST_METHOD"], [p for p in environ["PATH_INFO"].split("/") if p]
        qs = dict(p.split("=", 1) for p in environ.get("QUERY_STRING", "").split("&") if "=" in p)
        try:
            body = {}
            if method in ("POST", "PATCH"):
                n = int(environ.get("CONTENT_LENGTH") or 0)
                body = json.loads(environ["wsgi.input"].read(n) or b"{}")
            if parts == ["orders"] and method == "POST":
                items = [OrderItem(sku=i["sku"], quantity=i["quantity"], unit_price_cents=i["unit_price_cents"])
                         for i in body["items"]]
                o = Order(number=body["number"], customer_id=body["customer_id"], currency=body["currency"],
                          placed_at=body["placed_at"], items=items,
                          discount_cents=body.get("discount_cents", 0),
                          shipping_cents=body.get("shipping_cents", 0),
                          tax_rate_bps=body.get("tax_rate_bps", 0))
                return reply("201 Created", _dump(service.create_order(conn, o)))
            if parts == ["orders"] and method == "GET":
                return reply("200 OK", [_dump(o) for o in service.list_orders(conn, qs.get("customer_id"))])
            if len(parts) == 2 and parts[0] == "orders":
                if method == "GET":
                    o = service.get_order(conn, parts[1])
                    return reply("200 OK", _dump(o)) if o else reply("404 Not Found", {"error": "not found"})
                if method == "PATCH":
                    return reply("200 OK", _dump(service.update_status(conn, parts[1], body["status"])))
            if len(parts) == 3 and parts[0] == "products" and parts[2] == "orders" and method == "GET":
                return reply("200 OK", [_dump(o) for o in service.orders_for_product(conn, int(parts[1]))])
            return reply("404 Not Found", {"error": "not found"})
        except (service.OrderError, KeyError, ValueError, TypeError) as e:
            return reply("400 Bad Request", {"error": str(e)})
    return app
