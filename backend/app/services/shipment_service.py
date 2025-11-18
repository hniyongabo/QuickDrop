"""
Shipment tracking service.
Returns payload required by TrackOrder.html.
"""
from typing import Any, Dict, Optional
from sqlalchemy import text
from app import db


class ShipmentService:
    """Service layer for shipment tracking."""

    @staticmethod
    def get_tracking(shipment_id: int) -> Optional[Dict[str, Any]]:
        row = ShipmentService._row(
            text("""
                SELECT
                  s.shipment_id,
                  s.status,
                  s.created_at,
                  s.assigned_at,
                  s.picked_at,
                  s.delivered_at,
                  s.pickup_address,
                  s.destination_address,
                  cu.username AS customer_name,
                  co.username AS courier_name
                FROM shipment s
                LEFT JOIN customer c ON c.customer_id = s.customer_id
                LEFT JOIN "users" cu ON cu.user_id = c.user_id
                LEFT JOIN courier cr ON cr.courier_id = s.courier_id
                LEFT JOIN "users" co ON co.user_id = cr.user_id
                WHERE s.shipment_id = :sid
            """),
            {"sid": shipment_id},
        )
        if not row:
            return None

        status = row.get("status")
        eta_minutes = ShipmentService._estimate_eta_minutes(
            status=status,
            picked_at=row.get("picked_at"),
        )
        status_human = ShipmentService._status_human(status)

        return {
            "shipment_id": row.get("shipment_id"),
            "status": status,
            "status_human": status_human,
            "eta_minutes": eta_minutes,
            "courier": row.get("courier_name"),
            "pickup": row.get("pickup_address"),
            "delivery_to": f"{row.get('customer_name') or ''}".strip(),
            "delivery_address": row.get("destination_address"),
            "timeline": {
                "order_placed_at": row.get("created_at"),
                "courier_assigned_at": row.get("assigned_at"),
                "at_pickup_at": row.get("picked_at"),
                "delivered_at": row.get("delivered_at"),
            },
        }

    @staticmethod
    def _status_human(status: str) -> str:
        mapping = {
            "unassigned": "Awaiting assignment",
            "assigned": "En route to pickup",
            "picked_up": "Picked up",
            "in_transit": "In transit",
            "delivered": "Delivered",
            "failed": "Delivery failed",
        }
        return mapping.get(status, status)

    @staticmethod
    def _estimate_eta_minutes(status: str, picked_at) -> Optional[int]:
        # Very simple heuristics for demo; replace with routing later.
        if status == "assigned":
            return 5
        if status in ("picked_up", "in_transit"):
            return 15
        return None

    @staticmethod
    def _row(stmt, params):
        result = db.session.execute(stmt, params or {})
        row = result.fetchone()
        if not row:
            return None
        cols = result.keys()
        return dict(zip(cols, row))


    @staticmethod
    def list_shipments(page: int = 1, per_page: int = 20, status: Optional[str] = None):
        """
        List shipments with simple pagination and optional status filter.
        """
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20

        params = {"limit": per_page, "offset": (page - 1) * per_page}
        status_clause = ""
        if status:
            status_clause = "WHERE s.status = :status"
            params["status"] = status

        rows = db._rows(
            text(f"""
                SELECT
                  s.shipment_id,
                  s.status,
                  s.created_at,
                  s.assigned_at,
                  s.picked_at,
                  s.delivered_at,
                  s.pickup_address,
                  s.destination_address,
                  cu.username AS customer_name,
                  co.username AS courier_name
                FROM shipment s
                LEFT JOIN customer c ON c.customer_id = s.customer_id
                LEFT JOIN "users" cu ON cu.user_id = c.user_id
                LEFT JOIN courier cr ON cr.courier_id = s.courier_id
                LEFT JOIN "users" co ON co.user_id = cr.user_id
                {status_clause}
                ORDER BY s.shipment_id DESC
                LIMIT :limit OFFSET :offset
            """),
            params,
        )

        total = db._scalar(
            text(f"""
                SELECT COUNT(*)
                FROM shipment s
                {status_clause}
            """),
            {"status": status} if status else {},
        ) or 0

        return {
            "items": rows,
            "total": int(total),
            "page": page,
            "per_page": per_page,
            "pages": (int(total) + per_page - 1) // per_page if total else 0,
        }



