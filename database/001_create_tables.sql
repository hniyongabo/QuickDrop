
-- 001_create_tables.sql
-- PostgreSQL migration to create QuickDrop base schema
BEGIN;
CREATE SCHEMA IF NOT EXISTS quickdrop;\nSET search_path TO quickdrop;\nCREATE TABLE IF NOT EXISTS "user" (
    user_id         SERIAL PRIMARY KEY,
    username        VARCHAR(150) NOT NULL UNIQUE,
    role            VARCHAR(50)  NOT NULL,
    address         VARCHAR(150),
    email           VARCHAR(150) NOT NULL UNIQUE,
    phone_number    VARCHAR(25)  NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);\nCREATE TABLE IF NOT EXISTS address (
    address_id      SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES "user"(user_id) ON DELETE CASCADE,
    district        VARCHAR(100),
    city            VARCHAR(100),
    longitude       DECIMAL(9,6),
    latitude        DECIMAL(9,6),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\nCREATE TABLE IF NOT EXISTS courier (
    courier_id      SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    vehicle_plate   VARCHAR(15),
    phone           VARCHAR(25) UNIQUE,
    status          VARCHAR(50) NOT NULL DEFAULT 'inactive',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\nCREATE TABLE IF NOT EXISTS store (
    store_id        SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    type            VARCHAR(150),
    location        VARCHAR(150),
    contact         VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\nCREATE TABLE IF NOT EXISTS product (
    product_id      SERIAL PRIMARY KEY,
    store_id        INTEGER NOT NULL REFERENCES store(store_id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    category        VARCHAR(50),
    price           DECIMAL(9,2) NOT NULL CHECK (price >= 0),
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\nCREATE TABLE IF NOT EXISTS "order" (
    order_id            SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE RESTRICT,
    dropoff_address_id  INTEGER REFERENCES address(address_id) ON DELETE SET NULL,
    pickup_address_id   INTEGER REFERENCES address(address_id) ON DELETE SET NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'created',
    total_amount        DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\nCREATE TABLE IF NOT EXISTS order_item (
    order_item_id   SERIAL PRIMARY KEY,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    order_id        INTEGER NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES product(product_id) ON DELETE RESTRICT,
    unit_price      DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0)
);\nCREATE TABLE IF NOT EXISTS payment (
    payment_id      SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
    method          VARCHAR(50) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    paid_at         TIMESTAMPTZ
);\nCREATE TABLE IF NOT EXISTS shipment (
    shipment_id     SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
    picked_at       TIMESTAMPTZ,
    courier_id      INTEGER REFERENCES courier(courier_id) ON DELETE SET NULL,
    delivered_at    TIMESTAMPTZ,
    status          VARCHAR(50) NOT NULL DEFAULT 'unassigned'
);
COMMIT;
