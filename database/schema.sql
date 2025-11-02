
-- QuickDrop Schema (PostgreSQL)\

CREATE SCHEMA IF NOT EXISTS quickdrop;
SET search_path TO quickdrop;

-- Drop tables in dependency order (for re-runs during dev)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='order_item') THEN
        DROP TABLE quickdrop.order_item CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='payment') THEN
        DROP TABLE quickdrop.payment CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='shipment') THEN
        DROP TABLE quickdrop.shipment CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='"order"') THEN
        DROP TABLE quickdrop."order" CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='product') THEN
        DROP TABLE quickdrop.product CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='store') THEN
        DROP TABLE quickdrop.store CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='address') THEN
        DROP TABLE quickdrop.address CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='courier') THEN
        DROP TABLE quickdrop.courier CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='"user"') THEN
        DROP TABLE quickdrop."user" CASCADE;
    END IF;
END$$;

-- USER
CREATE TABLE quickdrop."user" (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(150) NOT NULL UNIQUE,
    role            VARCHAR(50)  NOT NULL, -- e.g., sender, courier, dispatcher, admin
    address         VARCHAR(150), -- textual, optional (canonical addresses are in address table)
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone_number    VARCHAR(25)  NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ADDRESS
CREATE TABLE quickdrop.address (
    address_id      SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES quickdrop."user"(user_id) ON DELETE CASCADE,
    district        VARCHAR(100),
    city            VARCHAR(100),
    longitude       DECIMAL(9,6),
    latitude        DECIMAL(9,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COURIER
CREATE TABLE quickdrop.courier (
    courier_id      SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    vehicle_plate   VARCHAR(15), -- allow a bit more than 7 for international flexibility
    phone           VARCHAR(25) UNIQUE,
    status          VARCHAR(50) NOT NULL DEFAULT 'inactive', -- e.g., active, inactive, banned, offshift
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STORE
CREATE TABLE quickdrop.store (
    store_id        SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    type            VARCHAR(150), -- e.g., restaurant, pharmacy, grocery
    location        VARCHAR(150),
    contact         VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT
CREATE TABLE quickdrop.product (
    product_id      SERIAL PRIMARY KEY,
    store_id        INTEGER NOT NULL REFERENCES quickdrop.store(store_id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    category        VARCHAR(50),
    price           DECIMAL(9,2) NOT NULL CHECK (price >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER (reserved keyword) -> quoted
CREATE TABLE quickdrop."order" (
    order_id            SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES quickdrop."user"(user_id) ON DELETE RESTRICT,
    dropoff_address_id  INTEGER REFERENCES quickdrop.address(address_id) ON DELETE SET NULL,
    pickup_address_id   INTEGER REFERENCES quickdrop.address(address_id) ON DELETE SET NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'created', -- e.g., created, assigned, picked_up, delivered, cancelled
    total_amount        DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEM
CREATE TABLE quickdrop.order_item (
    order_item_id   SERIAL PRIMARY KEY,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    order_id        INTEGER NOT NULL REFERENCES quickdrop."order"(order_id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES quickdrop.product(product_id) ON DELETE RESTRICT,
    unit_price      DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- PAYMENT
CREATE TABLE quickdrop.payment (
    payment_id      SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES quickdrop."order"(order_id) ON DELETE CASCADE,
    method          VARCHAR(50) NOT NULL, -- e.g., momo, card, cash
    status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
    paid_at         TIMESTAMPTZ
);

-- SHIPMENT
CREATE TABLE quickdrop.shipment (
    shipment_id     SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES quickdrop."order"(order_id) ON DELETE CASCADE,
    picked_at       TIMESTAMPTZ,
    courier_id      INTEGER REFERENCES quickdrop.courier(courier_id) ON DELETE SET NULL,
    delivered_at    TIMESTAMPTZ,
    status          VARCHAR(50) NOT NULL DEFAULT 'unassigned' -- unassigned, assigned, picked_up, in_transit, delivered, failed
);

-- INDEXES (basic)
CREATE INDEX IF NOT EXISTS idx_user_role ON quickdrop."user"(role);
CREATE INDEX IF NOT EXISTS idx_address_user ON quickdrop.address(user_id);
CREATE INDEX IF NOT EXISTS idx_order_user ON quickdrop."order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON quickdrop."order"(status);
CREATE INDEX IF NOT EXISTS idx_payment_order ON quickdrop.payment(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_order ON quickdrop.shipment(order_id);
CREATE INDEX IF NOT EXISTS idx_shipment_courier ON quickdrop.shipment(courier_id);
CREATE INDEX IF NOT EXISTS idx_product_store ON quickdrop.product(store_id);
