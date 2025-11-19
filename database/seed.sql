-- seeds/seed.sql — demo data for local dev aligned to ERD (public schema)
-- Ensure pgcrypto is available for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
INSERT INTO "users"(username, password, role, email, phone_number)
VALUES
 ('admin',    crypt('password123', gen_salt('bf')), 'ADMIN',    'admin@example.com',    '+250700000000'),
 ('courier1', crypt('password123', gen_salt('bf')), 'COURIER',  'courier1@example.com', '+250700000010'),
 ('alice',    crypt('password123', gen_salt('bf')), 'CUSTOMER', 'alice@example.com',    '+250700000011'),
 ('bob',      crypt('password123', gen_salt('bf')), 'CUSTOMER', 'bob@example.com',      '+250700000012')
ON CONFLICT (username) DO NOTHING;

-- Role-specific tables
INSERT INTO admin(user_id)
SELECT user_id FROM "users" WHERE username='admin'
ON CONFLICT DO NOTHING;

INSERT INTO customer(user_id)
SELECT user_id FROM "users" WHERE username IN ('alice','bob')
ON CONFLICT DO NOTHING;

INSERT INTO courier(user_id, vehicle_plate, online, last_seen, current_latitude, current_longitude, current_address)
SELECT user_id, 'RAB123A', TRUE, NOW(), -1.9700, 30.1100, 'Kigali, Rwanda'
FROM "users" WHERE username='courier1'
ON CONFLICT DO NOTHING;

-- Addresses (owned by users)
INSERT INTO address(user_id, district, city, longitude, latitude)
VALUES
 ((SELECT user_id FROM "users" WHERE username='alice'), 'Gasabo',  'Kigali', 30.099900, -1.944400),
 ((SELECT user_id FROM "users" WHERE username='bob'),   'Kicukiro','Kigali', 30.110000, -1.970000),
 ((SELECT user_id FROM "users" WHERE username='alice'), 'Gasabo',  'Kigali', 30.120000, -1.950000) -- extra address for Alice
ON CONFLICT DO NOTHING;

-- Shipments
-- Shipment 1: assigned and in transit
INSERT INTO shipment(created_at, assigned_at, picked_at, courier_id, customer_id, delivered_at, 
  pickup_latitude, pickup_longitude, pickup_address,
  destination_latitude, destination_longitude, destination_address, status)
VALUES (
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '35 minutes',
  NOW() - INTERVAL '30 minutes',
  (SELECT c.courier_id FROM courier c JOIN "users" u ON u.user_id=c.user_id WHERE u.username='courier1'),
  (SELECT customer_id FROM customer cu JOIN "users" u ON u.user_id=cu.user_id WHERE u.username='alice'),
  NULL,
  -1.9500, 30.1200, 'Remera Bus Park, Kigali',
  -1.9550, 30.1300, 'Kacyiru Health Center, Kigali',
  'in_transit'
);

-- Shipment 2: created and assigned but not picked yet
INSERT INTO shipment(created_at, assigned_at, picked_at, courier_id, customer_id, delivered_at, 
  pickup_latitude, pickup_longitude, pickup_address,
  destination_latitude, destination_longitude, destination_address, status)
VALUES (
  NOW() - INTERVAL '10 minutes',
  NOW() - INTERVAL '5 minutes',
  NULL,
  (SELECT c.courier_id FROM courier c JOIN "users" u ON u.user_id=c.user_id WHERE u.username='courier1'),
  (SELECT customer_id FROM customer cu JOIN "users" u ON u.user_id=cu.user_id WHERE u.username='bob'),
  NULL,
  -1.9600, 30.1350, 'Kimironko Market, Kigali',
  -1.9650, 30.1450, 'Kigali Heights, Kigali',
  'assigned'
);

-- Payments
INSERT INTO payment(shipment_id, method, status, paid_at)
VALUES
 ((SELECT shipment_id FROM shipment ORDER BY shipment_id ASC LIMIT 1), 'momo', 'paid', NOW()),
 ((SELECT shipment_id FROM shipment ORDER BY shipment_id DESC LIMIT 1), 'cash', 'pending', NULL);
