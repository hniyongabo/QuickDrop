
-- 002_add_indexes.sql
BEGIN;
SET search_path TO quickdrop;
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
CREATE INDEX IF NOT EXISTS idx_address_user ON address(user_id);
CREATE INDEX IF NOT EXISTS idx_order_user ON "order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_order ON shipment(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_courier ON shipment(courier_id);
CREATE INDEX IF NOT EXISTS idx_product_store ON product(store_id);
COMMIT;
