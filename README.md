## QuickDrop

Fast, reliable, and secure parcel delivery for Kigali by connecting customers with verified riders via a simple web and mobile-friendly interface.

---

### 1. Project Overview

**Problem**: Many people in Kigali struggle to transport items quickly and safely across the city.

**Solution**: QuickDrop connects customers with verified riders for safe parcel delivery through an easy-to-use web and mobile interface, optimized for speed, adoption, reliability, and security.

**Key Outcomes (KPIs)**
- **Speed**: Low-latency matching and dispatch; quick order-to-pickup times.
- **Adoption**: Straightforward UX and seamless onboarding.
- **Reliability**: Robust location tracking and resilient background processing.
- **Security**: Strong authentication, secure data handling, and operational safeguards.

---

### 2. Implemented Features & Tool Justification

**Current Status (Prototype)**
- Authentication (prototype)
- Initial database schema planning (PostgreSQL + PostGIS)
- System architecture defined (to be containerized with Docker)

**Planned/In-Progress**
- Accurate location tracking using Geohash + PostGIS
- Efficient dispatching using Redis queues and Celery workers
- Pathfinding using A* and Dijkstra for routing optimization
- Web frontend with HTML5, CSS, and Vanilla JS (per requirements)
- FastAPI backend for API endpoints

**Core Algorithms, Data Structures, and APIs**
- **Geospatial indexing**: Geohash + PostGIS spatial indexes for fast nearby-rider queries.
- **Dispatch queue**: Redis as broker/queue; Celery for background task execution and retries.
- **Pathfinding**: A* (heuristic guided) and Dijkstra (optimal shortest path) for routing.
- **Auth**: Standards-based credential storage (bcrypt/argon2), session/JWT strategy (TBD by final spec).

**Tooling Justification**
- **Backend Framework**: Flask
  - Pros: Very fast dev velocity, type hints, automatic OpenAPI docs, great async support.
  - Alternatives: Django REST Framework (slower to prototype, heavier), Express/NestJS (JS/TS ecosystem; less native geospatial focus for Python stack).
- **Task Processing**: Celery + Redis
  - Pros: Mature ecosystem, retries, scheduling, wide community support.
  - Alternatives: RQ/Huey (lighter features), Kafka (overkill for current scale).
- **Database**: PostgreSQL + PostGIS
  - Pros: ACID compliance, rich geospatial capabilities, indexing strategies (GiST/SP-GiST/BRIN).
  - Alternatives: MySQL (weaker geo), MongoDB (flexible but less robust for complex geo + transactions).
- **Frontend**: HTML5, CSS, Vanilla JS
  - Reason: Requirement-constrained; ensures minimal dependencies and easy adoption.
  - Alternatives: React/Next.js (faster UI iteration but not per current requirement).
- **Containerization**: Docker
  - Pros: Parity across dev/stage/prod; reproducible builds; easy local onboarding.

---

### 3. Database and Data Management

**Storage & Retrieval Strategies**
- Spatial data stored in PostGIS `geography` columns; derived `geohash` for fast coarse filtering.
- Nearby searches: coarse filter on geohash prefix, refined by PostGIS functions (e.g., `ST_DWithin`).
- Historical tracking via `LOCATION_PING` time series for auditability.
- Orders use status transitions with timestamps to support SLAs and analytics.

**Indexes**
- GiST index on `RIDER.current_position` and `DELIVERY_ORDER.pickup_point`/`dropoff_point`.
- B-Tree indexes on `DELIVERY_ORDER.status`, `created_at`, and foreign keys.
- Partial indexes for common status queries (e.g., active orders).

**Migrations**
- Recommended: Alembic (Python) for versioned schema changes and repeatable deployments.

**Data Security**
- Password hashing with Argon2 or bcrypt; secrets via environment variables.
- TLS for all in-transit data; limited PII stored with least-privilege access.
- Role-based access (customer/admin), auditable events, and structured logs.

---
**Pattern & Principles**
- Layered services: API (request/response) + workers (asynchronous processing).
- Separation of concerns: auth, dispatching, tracking.
- Scalability: Horizontal scale of FastAPI instances and Celery workers; Redis and Postgres can be scaled vertically then horizontally.
- Observability: structured logs and metrics (recommended: Prometheus/Grafana, OpenTelemetry).

**Scalability Considerations**
- Caching hot reads (nearby riders) in Redis with short TTLs.
- Backpressure via bounded queues; idempotent workers to handle retries.
- Geospatial indexes tuned by workload; periodic vacuum/analyze.

---

### 5. Code Quality and Testing

**Standards**
- Python: type hints, `black` + `isort` + `flake8`/`ruff`, `mypy` for type checking.
- Frontend: semantic HTML, accessible components, responsive layout; no frameworks per requirement.

---

### 6. Technical Challenges and Solutions

1. **Accurate, low-latency nearby rider lookup**
   - Solution: Geohash prefix prefilter + `ST_DWithin` refinement + GiST indexes; cache results.

2. **Reliable dispatch under load**
   - Solution: Celery with Redis for durable queues, retries, and visibility timeouts; idempotent job handlers.

3. **Routing optimization**
   - Solution: Apply A* for heuristic speed; fall back to Dijkstra for exact shortest paths when needed.

4. **Security and data privacy**
   - Solution: Strong password hashing, limited PII, HTTPS, RBAC, and audit logs.

---

### 7. Feedback Integration

- Adopted Vanilla JS frontend per requirement to reduce complexity and ease onboarding.
- Added Docker for environment parity and faster setup.
- Selected PostGIS for robust geospatial needs based on review feedback.

---

### 8. Next Technical Steps

**Milestones**
- M1: Implement auth and basic order flows (create/assign/track).
- M2: Geohash + PostGIS nearby-rider queries; ERD finalized and migrated.
- M3: Celery dispatch pipelines with retries and monitoring.
- M4: Pathfinding (A* first, Dijkstra as fallback) and ETA estimates.
- M5: Frontend polish, accessibility pass, and presentation readiness.

---

### 9. Teamwork & Project Management Report

**Project Management Tools**
- GitHub Projects for task tracking, collaboration, and progress monitoring.

**Team Collaboration**
- Regular stand-ups, design sharing, and PR reviews.
- Version control: feature branches, code reviews, protected main branch.

**Progress Documentation (Add your links as available)**
- Figma designs: add sharable viewer link
- Database schema: link to ERD or SQL migration docs
- Frontend implementation: link to deployment or static preview
- Backend/API: (To Be Done)

