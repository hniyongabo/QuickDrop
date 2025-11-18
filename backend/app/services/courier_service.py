"""
Courier dashboard service.
Fetches the courier's current task and upcoming assigned tasks.
"""
from typing import Any, Dict, List, Optional
from sqlalchemy import text
from app import db


class CourierService:
    """Service layer for courier dashboard data."""

    @staticmethod
    def get_dashboard_for_user(email: str) -> Dict[str, Any]:
        """
        Build the courier dashboard for the authenticated user.
        
        Args:
            email (str): Authenticated user's email (maps to quickdrop.user).
        
        Returns:
            dict: Dashboard payload with current_task and upcoming_tasks.
        """
        # Resolve courier_id from email
        courier_id = db._scalar(
            text("""
                SELECT c.courier_id
                FROM courier c
                JOIN "users" u ON u.user_id = c.user_id
                WHERE u.email = :email
            """),
            {"email": email},
        )

        if not courier_id:
            return {"current_task": None, "upcoming_tasks": []}

        current_task = CourierService._row(
            text("""
                SELECT
                  s.shipment_id,
                  s.status,
                  s.pickup_latitude   AS pickup_lat,
                  s.pickup_longitude  AS pickup_lng,
                  s.pickup_address    AS pickup_address,
                  s.destination_latitude AS destination_lat,
                  s.destination_longitude AS destination_lng,
                  s.destination_address   AS destination_address,
                  s.picked_at,
                  s.delivered_at
                FROM shipment s
                WHERE s.courier_id = :courier_id
                  AND s.status IN ('assigned','picked_up','in_transit')
                ORDER BY s.picked_at NULLS LAST, s.shipment_id
                LIMIT 1
            """),
            {"courier_id": courier_id},
        )

        upcoming_tasks = db._rows(
            text("""
                SELECT
                  s.shipment_id,
                  s.status,
                  s.pickup_latitude   AS pickup_lat,
                  s.pickup_longitude  AS pickup_lng,
                  s.pickup_address    AS pickup_address,
                  s.destination_latitude AS destination_lat,
                  s.destination_longitude AS destination_lng,
                  s.destination_address   AS destination_address
                FROM shipment s
                WHERE s.courier_id = :courier_id
                  AND s.status = 'assigned'
                ORDER BY s.shipment_id DESC
                LIMIT 10
            """),
            {"courier_id": courier_id},
        )

        # Shape "your current task" section
        if current_task:
            current_task_payload = {
                "shipment_id": current_task.get("shipment_id"),
                "status": current_task.get("status"),
                "pickup_from": {
                    "lat": current_task.get("pickup_lat"),
                    "lng": current_task.get("pickup_lng"),
                },
                "pickup_address": current_task.get("pickup_address"),
                "deliver_to": {
                    "lat": current_task.get("destination_lat"),
                    "lng": current_task.get("destination_lng"),
                },
                "destination_address": current_task.get("destination_address"),
                "picked_at": current_task.get("picked_at"),
            }
        else:
            current_task_payload = None

        # Shape upcoming tasks list
        upcoming_payload = [
            {
                "shipment_id": r.get("shipment_id"),
                "status": r.get("status"),
                "pickup_from": {"lat": r.get("pickup_lat"), "lng": r.get("pickup_lng")},
                "pickup_address": r.get("pickup_address"),
                "deliver_to": {"lat": r.get("destination_lat"), "lng": r.get("destination_lng")},
                "destination_address": r.get("destination_address"),
            }
            for r in upcoming_tasks
        ]

        return {
            "current_task": current_task_payload,
            "upcoming_tasks": upcoming_payload,
        }

    @staticmethod
    def _row(stmt, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        result = db.session.execute(stmt, params or {})
        row = result.fetchone()
        if not row:
            return None
        cols = result.keys()
        return dict(zip(cols, row))


