"""
Payment service.
Read-only helpers to fetch payments from quickdrop schema.
"""
from typing import Any, Dict, Optional
from sqlalchemy import text
from app import db


class PaymentService:
    """Service layer for payments."""

    @staticmethod
    def get_payment(payment_id: int) -> Optional[Dict[str, Any]]:
        row = PaymentService._row(
            text("""
                SELECT
                  p.payment_id,
                  p.method,
                  p.status,
                  p.paid_at,
                  s.shipment_id
                FROM payment p
                LEFT JOIN shipment s ON s.shipment_id = p.shipment_id
                WHERE p.payment_id = :pid
            """),
            {"pid": payment_id},
        )
        return row

    @staticmethod
    def list_payments(page: int = 1, per_page: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20

        params = {"limit": per_page, "offset": (page - 1) * per_page}
        where = ""
        if status:
            where = "WHERE p.status = :status"
            params["status"] = status

        rows = db._rows(
            text(f"""
                SELECT
                  p.payment_id,
                  p.method,
                  p.status,
                  p.paid_at,
                  p.shipment_id
                FROM payment p
                {where}
                ORDER BY p.payment_id DESC
                LIMIT :limit OFFSET :offset
            """),
            params,
        )
        total = db._scalar(
            text(f"SELECT COUNT(*) FROM payment p {where}"),
            {"status": status} if status else {},
        ) or 0

        return {
            "items": rows,
            "total": int(total),
            "page": page,
            "per_page": per_page,
            "pages": (int(total) + per_page - 1) // per_page if total else 0,
        }

    @staticmethod
    def _row(stmt, params):
        result = db.session.execute(stmt, params or {})
        row = result.fetchone()
        if not row:
            return None
        cols = result.keys()
        return dict(zip(cols, row))


