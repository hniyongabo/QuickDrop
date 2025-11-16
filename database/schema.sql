-- QuickDrop Schema (PostgreSQL)

CREATE SCHEMA IF NOT EXISTS quickdrop;
SET search_path TO quickdrop;

-- Drop objects in dependency order for repeatable dev runs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='payment') THEN
        DROP TABLE quickdrop.payment CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='shipment') THEN
        DROP TABLE quickdrop.shipment CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='product') THEN
        DROP TABLE quickdrop.product CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='store') THEN
        DROP TABLE quickdrop.store CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='courier') THEN
        DROP TABLE quickdrop.courier CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='address') THEN
        DROP TABLE quickdrop.address CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='customer') THEN
        DROP TABLE quickdrop.customer CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='admin') THEN
        DROP TABLE quickdrop.admin CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='quickdrop' AND table_name='"user"') THEN
        DROP TABLE quickdrop."user" CASCADE;
    END IF;
END$$;

-- Drop types after dependents
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
               WHERE n.nspname='quickdrop' AND t.typname='payment_status') THEN
        DROP TYPE quickdrop.payment_status;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
               WHERE n.nspname='quickdrop' AND t.typname='shipment_status') THEN
        DROP TYPE quickdrop.shipment_status;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
               WHERE n.nspname='quickdrop' AND t.typname='user_role') THEN
        DROP TYPE quickdrop.user_role;
    END IF;
END$$;

-- Enums aligned to ERD
CREATE TYPE quickdrop.user_role AS ENUM ('CUSTOMER', 'COURIER', 'ADMIN');
CREATE TYPE quickdrop.shipment_status AS ENUM ('unassigned', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed');
CREATE TYPE quickdrop.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- USER
CREATE TABLE quickdrop."user" (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(150) NOT NULL,
    role            quickdrop.user_role NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone_number    VARCHAR(25)  NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- CUSTOMER (one-to-one with user)
CREATE TABLE quickdrop.customer (
    customer_id     SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES quickdrop."user"(user_id) ON DELETE CASCADE
);

-- ADMIN (one-to-one with user)
CREATE TABLE quickdrop.admin (
    admin_id        SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES quickdrop."user"(user_id) ON DELETE CASCADE
);

-- ADDRESS (owned by user)
CREATE TABLE quickdrop.address (
    address_id      SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES quickdrop."user"(user_id) ON DELETE CASCADE,
    district        VARCHAR(100),
    city            VARCHAR(100),
    longitude       DECIMAL(9,6),
    latitude        DECIMAL(9,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COURIER (one-to-one with user) + live location (PostGIS)
CREATE TABLE quickdrop.courier (
    courier_id      SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES quickdrop."user"(user_id) ON DELETE CASCADE,
    vehicle_plate   VARCHAR(10),
    online          BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen       TIMESTAMPTZ,
    current_latitude    DECIMAL(9,6),
    current_longitude   DECIMAL(9,6),
    current_address     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SHIPMENT (links customer and optionally assigned courier)
CREATE TABLE quickdrop.shipment (
    shipment_id     SERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at     TIMESTAMPTZ,
    picked_at       TIMESTAMPTZ,
    courier_id      INTEGER REFERENCES quickdrop.courier(courier_id) ON DELETE SET NULL,
    customer_id     INTEGER REFERENCES quickdrop.customer(customer_id) ON DELETE SET NULL,
    delivered_at    TIMESTAMPTZ,
    pickup_latitude     DECIMAL(9,6),
    pickup_longitude    DECIMAL(9,6),
    pickup_address      TEXT,
    destination_latitude DECIMAL(9,6),
    destination_longitude DECIMAL(9,6),
    destination_address  TEXT,
    status          quickdrop.shipment_status NOT NULL DEFAULT 'unassigned'
);

-- PAYMENT (per shipment)
CREATE TABLE quickdrop.payment (
    payment_id      SERIAL PRIMARY KEY,
    shipment_id     INTEGER NOT NULL REFERENCES quickdrop.shipment(shipment_id) ON DELETE CASCADE,
    method          VARCHAR(150) NOT NULL,
    status          quickdrop.payment_status NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_user_role ON quickdrop."user"(role);
CREATE INDEX IF NOT EXISTS idx_address_user ON quickdrop.address(user_id);
CREATE INDEX IF NOT EXISTS idx_shipment_courier ON quickdrop.shipment(courier_id);
CREATE INDEX IF NOT EXISTS idx_shipment_customer ON quickdrop.shipment(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_shipment ON quickdrop.payment(shipment_id);


