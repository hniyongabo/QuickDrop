
-- seeds/seed.sql — lightweight demo data for local dev
SET search_path TO quickdrop;

-- Users
INSERT INTO "user"(username, role, address, email, phone_number)
VALUES
 ('habeeb', 'sender', 'KG 123 St', 'habeeb@example.com', '+250700000001'),
 ('harmony', 'sender', 'KN 10 Ave', 'harmony@example.com', '+250700000002'),
 ('raj', 'dispatcher', 'KN 5 Rd', 'raj@example.com', '+250700000003'),
 ('crispin', 'courier', 'KK 12 St', 'crispin@example.com', '+250700000004');

-- Addresses
INSERT INTO address(user_id, district, city, longitude, latitude)
VALUES
 (1, 'Gasabo', 'Kigali', 30.099900, -1.944400),
 (2, 'Kicukiro', 'Kigali', 30.110000, -1.970000),
 (1, 'Gasabo', 'Kigali', 30.120000, -1.950000); -- extra address for user 1

-- Couriers
INSERT INTO courier(name, vehicle_plate, phone, status)
VALUES
 ('Desire N.', 'RAG123A', '+250788000111', 'active'),
 ('Honette M.', 'RAB456B', '+250788000222', 'active');

-- Stores
INSERT INTO store(name, type, location, contact)
VALUES
 ('Alpha Mart', 'grocery', 'Remera', '+250788111222'),
 ('MediPlus', 'pharmacy', 'Kacyiru', '+250788333444');

-- Products
INSERT INTO product(store_id, name, category, price, stock, image_url)
VALUES
 (1, 'Bottled Water 500ml', 'beverage', 500, 200, NULL),
 (1, 'Bread Loaf', 'bakery', 1200, 80, NULL),
 (2, 'Paracetamol 500mg', 'medicine', 1500, 150, NULL);

-- Orders
INSERT INTO "order"(user_id, dropoff_address_id, pickup_address_id, status, total_amount)
VALUES
 (1, 1, 3, 'created', 2700),
 (2, 2, 3, 'created', 1500);

-- Order Items
INSERT INTO order_item(quantity, order_id, product_id, unit_price)
VALUES
 (2, 1, 1, 500),
 (1, 1, 2, 1200),
 (1, 2, 3, 1500);

-- Payments
INSERT INTO payment(order_id, method, status, paid_at)
VALUES
 (1, 'momo', 'paid', NOW()),
 (2, 'cash', 'pending', NULL);

-- Shipments
INSERT INTO shipment(order_id, picked_at, courier_id, delivered_at, status)
VALUES
 (1, NOW() - INTERVAL '30 minutes', 1, NULL, 'in_transit'),
 (2, NULL, 2, NULL, 'assigned');
