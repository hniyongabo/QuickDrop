"""
Admin analytics and dashboard service.
Executes read-only SQL against the 'quickdrop' schema to assemble
aggregated metrics for the admin dashboard.
"""
from typing import Any, Dict, List
from sqlalchemy import text
from app import db
from app.models.admin_model import Admin


class AdminService:
    """Service layer for admin analytics."""

    @staticmethod
    def get_dashboard(days: int = 7, active_since_hours: int = 24) -> Dict[str, Any]:
        """
        Build the admin dashboard payload.
        
        Args:
            days (int): Rolling window for time-series analytics.
            active_since_hours (int): Window for computing active users.
        
        Returns:
            dict: Dashboard data.
        """

        # General metrics
        total_deliveries = db._scalar(
            text("""
                SELECT COUNT(*)::BIGINT
                FROM quickdrop.shipment
            """),
        )

        successful_deliveries = db._scalar(
            text("""
                SELECT COUNT(*)::BIGINT
                FROM quickdrop.shipment
                WHERE status = 'delivered'
            """),
        )

        active_users = db._scalar(
            text("""
                WITH recent_shipments AS (
                  SELECT s.shipment_id, s.courier_id, s.customer_id
                  FROM quickdrop.shipment s
                  WHERE (s.picked_at IS NOT NULL AND s.picked_at >= NOW() - (:hours || ' hours')::INTERVAL)
                     OR s.status IN ('assigned','picked_up','in_transit')
                ),
                active_customers AS (
                  SELECT cu.user_id
                  FROM quickdrop.customer cu
                  JOIN recent_shipments rs ON rs.customer_id = cu.customer_id
                ),
                active_couriers AS (
                  SELECT co.user_id
                  FROM quickdrop.courier co
                  JOIN recent_shipments rs ON rs.courier_id = co.courier_id
                ),
                online_couriers AS (
                  SELECT user_id FROM quickdrop.courier WHERE online = TRUE
                )
                SELECT COUNT(DISTINCT u.user_id)::BIGINT
                FROM quickdrop."user" u
                WHERE u.user_id IN (
                  SELECT user_id FROM active_customers
                  UNION
                  SELECT user_id FROM active_couriers
                  UNION
                  SELECT user_id FROM online_couriers
                )
            """),
            {"hours": active_since_hours},
        )

        # Analytics
        delivery_stats = db._rows(
            text("""
                SELECT
                  DATE_TRUNC('day', COALESCE(delivered_at, picked_at))::DATE AS day,
                  COUNT(*)::BIGINT AS total,
                  COUNT(*) FILTER (WHERE status = 'delivered')::BIGINT AS delivered
                FROM quickdrop.shipment
                WHERE COALESCE(delivered_at, picked_at, NOW()) >= NOW() - (:days || ' days')::INTERVAL
                GROUP BY 1
                ORDER BY 1
            """),
            {"days": days},
        )

        user_growth = db._rows(
            text("""
                SELECT
                  DATE_TRUNC('day', created_at)::DATE AS day,
                  COUNT(*)::BIGINT AS new_users
                FROM quickdrop."user"
                WHERE created_at >= NOW() - (:days || ' days')::INTERVAL
                GROUP BY 1
                ORDER BY 1
            """),
            {"days": max(days, 30)},
        )

        status_distribution = db._rows(
            text("""
                SELECT status, COUNT(*)::BIGINT AS count
                FROM quickdrop.shipment
                GROUP BY status
                ORDER BY count DESC
            """),
        )

        # Active deliveries list
        active_deliveries = db._rows(
            text("""
                SELECT
                  s.shipment_id,
                  u.username AS courier,
                  s.status
                FROM quickdrop.shipment s
                LEFT JOIN quickdrop.courier c ON c.courier_id = s.courier_id
                LEFT JOIN quickdrop."user" u ON u.user_id = c.user_id
                WHERE s.status NOT IN ('delivered','failed')
                ORDER BY s.picked_at NULLS LAST, s.shipment_id
            """),
        )
        for row in active_deliveries:
            row["shipment_name"] = f"Shipment #{row['shipment_id']}"

        # Couriers tab (today)
        couriers_today = db._rows(
            text("""
                SELECT
                  u.username AS name,
                  c.online AS online,
                  EXISTS (
                    SELECT 1 FROM quickdrop.shipment s
                    WHERE s.courier_id = c.courier_id
                      AND s.status IN ('assigned','picked_up','in_transit')
                      AND (COALESCE(s.picked_at, NOW()))::DATE = CURRENT_DATE
                  ) AS on_task,
                  (
                    SELECT COUNT(*)::BIGINT FROM quickdrop.shipment s
                    WHERE s.courier_id = c.courier_id
                      AND s.status = 'delivered'
                      AND s.delivered_at::DATE = CURRENT_DATE
                  ) AS total_deliveries
                FROM quickdrop.courier c
                JOIN quickdrop."user" u ON u.user_id = c.user_id
                ORDER BY name
            """),
        )

        # Alerts/system status
        postgis_enabled = db._scalar(
            text("""
                SELECT EXISTS (
                  SELECT 1
                  FROM pg_extension
                  WHERE extname = 'postgis'
                )
            """),
        )

        overdue_shipments = db._scalar(
            text("""
                SELECT COUNT(*)::BIGINT
                FROM quickdrop.shipment s
                WHERE s.status IN ('assigned','picked_up','in_transit')
                  AND s.picked_at IS NOT NULL
                  AND NOW() - s.picked_at > INTERVAL '24 hours'
            """),
        )

        return {
            "general": {
                "total_deliveries": int(total_deliveries or 0),
                "active_users": int(active_users or 0),
                "successful_deliveries": int(successful_deliveries or 0),
            },
            "analytics": {
                "delivery_statistics": delivery_stats,
                "user_growth": user_growth,
                "delivery_status_distribution": status_distribution,
            },
            "active_deliveries": active_deliveries,
            "couriers": couriers_today,
            "alerts": {
                "system_status": {
                    "database": "ok",
                    "postgis": bool(postgis_enabled),
                    "overdue_shipments": int(overdue_shipments or 0),
                }
            },
        }


