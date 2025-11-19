-- QuickDrop Schema (public)

-- Drop objects in dependency order for repeatable dev runs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payment') THEN
        DROP TABLE payment CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='shipment') THEN
        DROP TABLE shipment CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='courier') THEN
        DROP TABLE courier CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='address') THEN
        DROP TABLE address CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='customer') THEN
        DROP TABLE customer CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='admin') THEN
        DROP TABLE admin CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users') THEN
        DROP TABLE "users" CASCADE;
    END IF;
END$$;

-- USER
CREATE TABLE "users" (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(150) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone_number    VARCHAR(25)  NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- CUSTOMER (one-to-one with user)
CREATE TABLE customer (
    customer_id     SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES "users"(user_id) ON DELETE CASCADE
);

-- ADMIN (one-to-one with user)
CREATE TABLE admin (
    admin_id        SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES "users"(user_id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ADDRESS (owned by user)
CREATE TABLE address (
    address_id      SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES "users"(user_id) ON DELETE CASCADE,
    district        VARCHAR(100),
    city            VARCHAR(100),
    longitude       DECIMAL(9,6),
    latitude        DECIMAL(9,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COURIER (one-to-one with user) + live location (PostGIS)
CREATE TABLE courier (
    courier_id      SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES "users"(user_id) ON DELETE CASCADE,
    vehicle_plate   VARCHAR(10),
    online          BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen       TIMESTAMPTZ,
    current_latitude    DECIMAL(9,6),
    current_longitude   DECIMAL(9,6),
    current_address     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- SHIPMENT (links customer and optionally assigned courier)
CREATE TABLE shipment (
    shipment_id     SERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at     TIMESTAMPTZ,
    picked_at       TIMESTAMPTZ,
    courier_id      INTEGER REFERENCES courier(courier_id) ON DELETE SET NULL,
    customer_id     INTEGER REFERENCES customer(customer_id) ON DELETE SET NULL,
    delivered_at    TIMESTAMPTZ,
    pickup_latitude     DECIMAL(9,6),
    pickup_longitude    DECIMAL(9,6),
    pickup_address      TEXT,
    destination_latitude DECIMAL(9,6),
    destination_longitude DECIMAL(9,6),
    destination_address  TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'unassigned',
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- PAYMENT (per shipment)
CREATE TABLE payment (
    payment_id      SERIAL PRIMARY KEY,
    shipment_id     INTEGER NOT NULL REFERENCES shipment(shipment_id) ON DELETE CASCADE,
    method          VARCHAR(150) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_user_role ON "users"(role);
CREATE INDEX IF NOT EXISTS idx_address_user ON address(user_id);
CREATE INDEX IF NOT EXISTS idx_shipment_courier ON shipment(courier_id);
CREATE INDEX IF NOT EXISTS idx_shipment_customer ON shipment(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_shipment ON payment(shipment_id);


