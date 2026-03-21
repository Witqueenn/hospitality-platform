# Hospitality Experience Orchestration Platform — Claude Code Build Specification

> **Document Version:** 2.0
> **Target Runtime:** Local Development
> **Architecture Pattern:** Domain-Driven Modular Monolith
> **Primary Stack:** TypeScript · Next.js 14 (App Router) · PostgreSQL · Prisma · tRPC · Redis · BullMQ

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Principles & Constraints](#2-system-principles--constraints)
3. [Technical Architecture](#3-technical-architecture)
4. [Domain Model & Bounded Contexts](#4-domain-model--bounded-contexts)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [Agentic Manager Orchestration](#7-agentic-manager-orchestration)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Security & Multi-Tenancy](#9-security--multi-tenancy)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [MVP Roadmap & Build Plan](#11-mvp-roadmap--build-plan)
12. [Coding Standards & Conventions](#12-coding-standards--conventions)
13. [File & Folder Structure](#13-file--folder-structure)
14. [Step-by-Step Build Instructions](#14-step-by-step-build-instructions)

---

## 1. Executive Summary

### 1.1 What This Is

A **multi-tenant hospitality orchestration platform** that goes far beyond room booking. It manages the full hospitality lifecycle across four operational systems:

| System              | Scope                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| **Stay OS**         | Accommodation — rooms, check-in/out, complaints, recovery                 |
| **Event OS**        | Meetings, conferences, weddings, galas, BEO generation                    |
| **Experience OS**   | Dining, nightlife, curated social experiences                             |
| **Agentic Manager** | Central AI orchestration — intent routing, agent coordination, escalation |

### 1.2 Who It Serves

| Actor            | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| **Guest**        | Books rooms/events/dining, reports issues, receives recovery |
| **Hotel Staff**  | Manages inventory, events, complaints, operations            |
| **Platform Ops** | Monitors quality, handles escalations, verifies hotels       |
| **Super Admin**  | Controls tenants, policies, pricing, agent behavior          |

### 1.3 Core Value Proposition

- **Trust & Transparency:** Verified listings, honest photos, disclosed fees
- **Full-Lifecycle Orchestration:** Pre-booking → stay → post-stay across all service lines
- **Agentic Intelligence:** 12 specialized agents coordinated by a central manager
- **Human-in-the-Loop:** Critical decisions require human approval
- **Operational Intelligence:** Recurring issue detection, sentiment trends, revenue analytics

---

## 2. System Principles & Constraints

### 2.1 Architecture Principles

```
P1: Domain Isolation        — Each bounded context owns its data and logic
P2: Tenant Isolation        — All queries scoped by tenant_id; no cross-tenant data leakage
P3: Audit Everything        — Every agent decision, approval, compensation logged immutably
P4: Explainability          — Every agent recommendation includes human-readable reasoning
P5: Idempotent Operations   — All state mutations must be safely retryable
P6: Event-Driven Internals  — Domain events connect bounded contexts; no direct cross-domain DB calls
P7: Schema-First API        — tRPC routers define the contract; frontend auto-generates types
P8: Progressive Enhancement — MVP first, extend without rewrite
```

### 2.2 Hard Constraints

```
C1: PostgreSQL single database with schema-level domain separation (no microservices for MVP)
C2: All monetary values stored as integer cents (no floating point)
C3: All timestamps in UTC; display timezone resolved client-side
C4: All PII encrypted at rest (AES-256-GCM via application-level encryption)
C5: No agent may approve its own financial recommendation (human-in-the-loop required)
C6: Maximum 3-second API response time for any user-facing endpoint
C7: All file uploads go through pre-signed URLs (no direct server upload)
```

### 2.3 Technology Stack

| Layer                | Technology                           | Rationale                                    |
| -------------------- | ------------------------------------ | -------------------------------------------- |
| **Runtime**          | Node.js 20+                          | TypeScript ecosystem, fast iteration         |
| **Framework**        | Next.js 14 (App Router)              | SSR, API routes, middleware, layouts         |
| **API Layer**        | tRPC v11                             | End-to-end type safety, no codegen           |
| **ORM**              | Prisma 5                             | Type-safe queries, migrations, introspection |
| **Database**         | PostgreSQL 16                        | JSONB, row-level security capable, mature    |
| **Cache / Queue**    | Redis 7 + BullMQ                     | Job queues, caching, pub/sub                 |
| **Auth**             | NextAuth.js v5 + custom RBAC         | Multi-provider, session management           |
| **File Storage**     | Local FS (MVP) → S3-compatible       | Pre-signed upload/download                   |
| **Email**            | Nodemailer (local) → SES/Resend      | Transactional emails                         |
| **Real-time**        | Server-Sent Events (MVP) → WebSocket | Live notifications, case updates             |
| **UI Framework**     | React 18 + Tailwind CSS + shadcn/ui  | Rapid, consistent, accessible UI             |
| **State Management** | TanStack Query (via tRPC) + Zustand  | Server state + local UI state                |
| **Charts**           | Recharts                             | Dashboard analytics                          |
| **Validation**       | Zod                                  | Shared between client and server             |
| **Testing**          | Vitest + Playwright                  | Unit/integration + E2E                       |
| **Monorepo**         | Turborepo                            | Build caching, task orchestration            |

---

## 3. Technical Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Guest Portal │  │ Hotel Portal │  │ Admin / Ops Dashboard    │  │
│  │ (Next.js)    │  │ (Next.js)    │  │ (Next.js)                │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                        │                │
│         └────────────┬────┴────────────────────────┘                │
│                      │                                              │
│              ┌───────▼────────┐                                     │
│              │   API Gateway  │  ← tRPC + NextAuth middleware       │
│              │   (Next.js)    │                                     │
│              └───────┬────────┘                                     │
└──────────────────────┼──────────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────────────┐
│                      │        APPLICATION LAYER                     │
│         ┌────────────▼────────────┐                                 │
│         │    Agentic Manager      │  ← Intent classification,       │
│         │    (Orchestrator)       │    agent routing, escalation     │
│         └────┬───┬───┬───┬───┬───┘                                  │
│              │   │   │   │   │                                      │
│    ┌─────┬──┘   │   │   │   └──┬─────┐                             │
│    ▼     ▼      ▼   ▼   ▼     ▼     ▼                              │
│  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐                       │
│  │MMA ││TTA ││BIA ││SSA ││RCA ││EMA ││... │  ← 12 Specialized     │
│  │    ││    ││    ││    ││    ││    ││    │    Agents               │
│  └──┬─┘└──┬─┘└──┬─┘└──┬─┘└──┬─┘└──┬─┘└──┬─┘                      │
│     └──┬───┴──┬──┴──┬──┴──┬──┴──┬──┴──┬──┘                        │
│        │      │     │     │     │     │                             │
│  ┌─────▼──────▼─────▼─────▼─────▼─────▼──────────────────────────┐ │
│  │              DOMAIN SERVICE LAYER                              │ │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌───────────────────┐  │ │
│  │  │ Stay OS │ │Event OS │ │Experience│ │  Support/Recovery  │  │ │
│  │  │         │ │         │ │   OS     │ │                    │  │ │
│  │  └────┬────┘ └────┬────┘ └────┬─────┘ └────────┬──────────┘  │ │
│  └───────┼───────────┼───────────┼────────────────┼──────────────┘ │
│          │           │           │                │                 │
│  ┌───────▼───────────▼───────────▼────────────────▼──────────────┐ │
│  │              INFRASTRUCTURE LAYER                              │ │
│  │  ┌──────────┐ ┌───────┐ ┌────────┐ ┌────────┐ ┌───────────┐  │ │
│  │  │ Prisma   │ │ Redis │ │BullMQ  │ │ Event  │ │ File      │  │ │
│  │  │ (PG)     │ │ Cache │ │ Queues │ │ Bus    │ │ Storage   │  │ │
│  │  └──────────┘ └───────┘ └────────┘ └────────┘ └───────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Monorepo Structure

```
apps/
  web/                    ← Next.js application (all portals)
packages/
  db/                     ← Prisma schema, client, migrations, seeds
  api/                    ← tRPC routers, procedures, middleware
  domain/                 ← Pure domain logic (no framework deps)
  agents/                 ← Agentic Manager + all 12 agents
  shared/                 ← Types, constants, utils, validators (Zod)
  ui/                     ← Shared UI components (shadcn/ui based)
  email/                  ← Email templates and sender
  queue/                  ← BullMQ workers and job definitions
tooling/
  eslint-config/
  tsconfig/
  prettier-config/
```

### 3.3 Request Flow (Example: Guest Reports Issue)

```
1. Guest submits issue via UI form
2. Next.js API route → tRPC mutation: supportCase.create
3. Middleware validates: auth, tenant scope, rate limit
4. Domain service creates SupportCase record (status: OPEN)
5. Domain event emitted: SUPPORT_CASE_CREATED
6. Agentic Manager receives event
7. Intent classified: "in-stay complaint — room cleanliness"
8. Manager invokes StaySupportAgent
9. Agent analyzes: severity, guest history, hotel policies
10. Agent produces recommendation: "Immediate room re-clean + amenity credit"
11. If compensation > threshold → route to human approval queue
12. Notification sent to hotel staff (SSE push)
13. Hotel staff approves/modifies → case updated
14. Guest notified of resolution
15. AgentExecutionLog written (immutable)
16. InsightAgent processes root cause asynchronously (BullMQ job)
```

---

## 4. Domain Model & Bounded Contexts

### 4.1 Bounded Context Map

```
┌────────────────────────────────────────────────────────────────┐
│                       PLATFORM CORE                            │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Auth   │  │ Tenant  │  │  Hotel   │  │  Notification  │  │
│  │ Context │  │ Context │  │ Context  │  │   Context      │  │
│  └─────────┘  └─────────┘  └──────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────────┘
       │              │             │               │
       ▼              ▼             ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│                     OPERATIONAL SYSTEMS                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  STAY OS                                                    │ │
│  │  • RoomType, RoomInventory, Booking, CheckIn, CheckOut      │ │
│  │  • StayPreferences, RoomAssignment                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  EVENT OS                                                   │ │
│  │  • Venue, EventRequest, EventBooking, BEO                   │ │
│  │  • RunOfShow, EventStaffing, EventIssue                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  EXPERIENCE OS                                              │ │
│  │  • DiningExperience, DiningReservation, Menu                │ │
│  │  • NightExperience, NightReservation, Package               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  SUPPORT & RECOVERY                                         │ │
│  │  • SupportCase, CaseTimeline, CompensationAction            │ │
│  │  • EscalationRule, SLADefinition, SLATracking               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  INTELLIGENCE                                               │ │
│  │  • Review, ReviewScore, SentimentAnalysis                   │ │
│  │  • RecurringIssue, HotelInsight, PerformanceMetric          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AGENTIC MANAGER                                            │ │
│  │  • AgentRegistry, AgentExecutionLog, IntentClassification   │ │
│  │  • OrchestrationSession, EscalationQueue, ApprovalRequest   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Domain Events (Inter-Context Communication)

Domain events are the **only** way bounded contexts communicate. No context may directly query another's database tables.

```typescript
// packages/domain/events/index.ts

// Stay OS Events
BOOKING_CREATED           → triggers: PreStayConciergeAgent, NotificationService
BOOKING_CANCELLED         → triggers: InsightAgent, RefundService
CHECK_IN_COMPLETED        → triggers: StaySupportAgent (monitoring mode)
CHECK_OUT_COMPLETED       → triggers: ReviewService, InsightAgent

// Event OS Events
EVENT_REQUEST_SUBMITTED   → triggers: EventMatchAgent, VenueCapacityAgent
EVENT_CONFIRMED           → triggers: BEOAgent, FBPlanningAgent, NotificationService
EVENT_COMPLETED           → triggers: InsightAgent, ReviewService

// Experience OS Events
DINING_RESERVED           → triggers: FBPlanningAgent, NotificationService
NIGHT_EXPERIENCE_BOOKED   → triggers: NightlifeAgent, NotificationService

// Support Events
SUPPORT_CASE_CREATED      → triggers: AgenticManager (routes to appropriate agent)
COMPENSATION_PROPOSED     → triggers: ApprovalService (if above threshold)
COMPENSATION_APPROVED     → triggers: ExecutionService, NotificationService
CASE_RESOLVED             → triggers: InsightAgent, ReviewService

// Agent Events
AGENT_EXECUTION_COMPLETED → triggers: AgentLogService
ESCALATION_TRIGGERED      → triggers: HumanApprovalQueue
```

---

## 5. Database Schema

### 5.1 Schema Design Principles

```
- Every table has: id (UUID), created_at, updated_at
- Every tenant-scoped table has: tenant_id (UUID, NOT NULL, indexed)
- Soft deletes via deleted_at column where business requires it
- JSONB for flexible/extensible fields (policies, features, metadata)
- Enums defined at database level for type safety
- Composite indexes for common query patterns
- All monetary fields: INTEGER (cents)
```

### 5.2 Complete Prisma Schema

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, pg_trgm]
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum TenantStatus {
  ACTIVE
  SUSPENDED
  ONBOARDING
}

enum UserRole {
  SUPER_ADMIN
  PLATFORM_OPS
  HOTEL_ADMIN
  HOTEL_MANAGER
  FRONT_DESK
  RESERVATIONS_MANAGER
  EVENTS_MANAGER
  BANQUET_MANAGER
  FB_MANAGER
  GUEST_RELATIONS
  OPERATIONS_MANAGER
  FINANCE_APPROVER
  GUEST
}

enum HotelStatus {
  DRAFT
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  ARCHIVED
}

enum BookingType {
  ROOM
  EVENT
  DINING
  NIGHTLIFE
  BUNDLE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  PARTIALLY_REFUNDED
  REFUNDED
  FAILED
}

enum EventType {
  MEETING
  CONFERENCE
  WORKSHOP
  WEDDING
  GALA_DINNER
  LAUNCH_EVENT
  PRIVATE_EVENT
  CORPORATE_RETREAT
  BIRTHDAY
  OTHER
}

enum EventRequestStatus {
  INQUIRY
  PROPOSAL_SENT
  NEGOTIATING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum BEOStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REVISION_REQUESTED
  FINALIZED
  ARCHIVED
}

enum VenueLayoutType {
  THEATER
  CLASSROOM
  U_SHAPE
  BOARDROOM
  BANQUET_ROUND
  COCKTAIL
  HOLLOW_SQUARE
  CUSTOM
}

enum CaseSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum CaseStatus {
  OPEN
  IN_PROGRESS
  AWAITING_HOTEL
  AWAITING_GUEST
  AWAITING_APPROVAL
  RESOLVED
  CLOSED
  ESCALATED
}

enum CaseCategory {
  ROOM_CLEANLINESS
  ROOM_NOT_READY
  NOISE_COMPLAINT
  WIFI_ISSUE
  AC_BROKEN
  WRONG_ROOM
  BILLING_ISSUE
  STAFF_BEHAVIOR
  SAFETY_CONCERN
  FOOD_QUALITY
  EVENT_ISSUE
  AMENITY_MISSING
  CHECK_IN_DELAY
  OTHER
}

enum CompensationType {
  ROOM_UPGRADE
  LATE_CHECKOUT
  EARLY_CHECKIN
  BREAKFAST_INCLUDED
  PARTIAL_REFUND
  FULL_REFUND
  SERVICE_VOUCHER
  AMENITY_CREDIT
  EVENT_DISCOUNT
  FREE_NIGHT
  OTHER
}

enum CompensationStatus {
  PROPOSED
  PENDING_APPROVAL
  APPROVED
  REJECTED
  EXECUTED
  EXPIRED
}

enum AgentType {
  MATCHMAKING
  TRUTH_TRANSPARENCY
  BOOKING_INTEGRITY
  PRE_STAY_CONCIERGE
  STAY_SUPPORT
  RECOVERY_COMPENSATION
  EVENT_MATCH
  VENUE_CAPACITY
  BEO_RUNOFSHOW
  FB_PLANNING
  NIGHTLIFE_EXPERIENCE
  INSIGHT_HOTEL_SUCCESS
}

enum ReviewModerationStatus {
  PENDING
  APPROVED
  FLAGGED
  REJECTED
}

enum DiningType {
  RESTAURANT
  ROOM_SERVICE
  BRUNCH
  ROOFTOP
  PRIVATE_DINING
  GROUP_DINING
  BUFFET
}

enum NightExperienceType {
  DJ_NIGHT
  LIVE_MUSIC
  VIP_LOUNGE
  COCKTAIL_PARTY
  THEMED_NIGHT
  POOL_PARTY
  COMEDY_SHOW
  OTHER
}

enum NotificationType {
  EMAIL
  SMS
  PUSH
  IN_APP
}

enum NotificationStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
}

// ─────────────────────────────────────────────
// PLATFORM CORE
// ─────────────────────────────────────────────

model Tenant {
  id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  slug        String       @unique
  billingPlan String       @default("starter")
  status      TenantStatus @default(ONBOARDING)
  settings    Json         @default("{}")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  hotels   Hotel[]
  users    User[]
  policies TenantPolicy[]

  @@map("tenants")
}

model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String    @map("tenant_id") @db.Uuid
  email         String
  emailVerified DateTime? @map("email_verified")
  passwordHash  String?   @map("password_hash")
  name          String
  avatarUrl     String?   @map("avatar_url")
  phone         String?
  role          UserRole  @default(GUEST)
  hotelId       String?   @map("hotel_id") @db.Uuid
  preferences   Json      @default("{}")
  isActive      Boolean   @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  tenant               Tenant              @relation(fields: [tenantId], references: [id])
  hotel                Hotel?              @relation(fields: [hotelId], references: [id])
  bookings             Booking[]
  supportCasesAsGuest  SupportCase[]       @relation("GuestCases")
  supportCasesAssigned SupportCase[]       @relation("AssignedCases")
  reviews              Review[]
  eventRequests        EventRequest[]
  approvals            ApprovalRequest[]   @relation("Approver")
  sessions             Session[]
  diningReservations   DiningReservation[]
  nightReservations    NightReservation[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@index([hotelId])
  @@index([role])
  @@map("users")
}

model Session {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

model TenantPolicy {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  policyKey   String   @map("policy_key")
  policyValue Json     @map("policy_value")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, policyKey])
  @@map("tenant_policies")
}

// ─────────────────────────────────────────────
// HOTEL CONTEXT
// ─────────────────────────────────────────────

model Hotel {
  id               String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String      @map("tenant_id") @db.Uuid
  name             String
  slug             String
  description      String?     @db.Text
  shortDescription String?     @map("short_description")
  starRating       Int?        @map("star_rating")
  address          Json // { street, city, state, country, postalCode, lat, lng }
  contactInfo      Json        @default("{}") @map("contact_info")
  policies         Json        @default("{}") // { checkIn, checkOut, cancellation, children, pets, smoking }
  amenities        Json        @default("[]") // ["pool", "spa", "gym", "parking", ...]
  tags             Json        @default("[]") // ["family-friendly", "business", "romantic", ...]
  verifiedFields   Json        @default("{}") @map("verified_fields")
  photos           Json        @default("[]") // [{ url, caption, category, verifiedAt }]
  noiseNotes       String?     @map("noise_notes") @db.Text
  wifiQuality      String?     @map("wifi_quality") // "excellent" | "good" | "fair" | "poor"
  status           HotelStatus @default(DRAFT)
  timezone         String      @default("UTC")
  currency         String      @default("USD") @db.VarChar(3)
  createdAt        DateTime    @default(now()) @map("created_at")
  updatedAt        DateTime    @updatedAt @map("updated_at")

  tenant            Tenant             @relation(fields: [tenantId], references: [id])
  staff             User[]
  roomTypes         RoomType[]
  venues            Venue[]
  diningExperiences DiningExperience[]
  nightExperiences  NightExperience[]
  bookings          Booking[]
  eventRequests     EventRequest[]
  supportCases      SupportCase[]
  reviews           Review[]
  hotelInsights     HotelInsight[]

  @@unique([tenantId, slug])
  @@index([tenantId])
  @@index([status])
  @@map("hotels")
}

// ─────────────────────────────────────────────
// STAY OS
// ─────────────────────────────────────────────

model RoomType {
  id                    String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  hotelId               String   @map("hotel_id") @db.Uuid
  tenantId              String   @map("tenant_id") @db.Uuid
  name                  String
  description           String?  @db.Text
  capacity              Int
  bedType               String   @map("bed_type") // "king", "queen", "twin", "double", "suite"
  sizeSqm               Decimal? @map("size_sqm") @db.Decimal(6, 2)
  floor                 String?
  photos                Json     @default("[]")
  features              Json     @default("[]") // ["balcony", "sea-view", "minibar", ...]
  noiseNotes            String?  @map("noise_notes") @db.Text
  accessibilityFeatures Json     @default("[]") @map("accessibility_features")
  isActive              Boolean  @default(true) @map("is_active")
  sortOrder             Int      @default(0) @map("sort_order")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  hotel        Hotel           @relation(fields: [hotelId], references: [id])
  inventory    RoomInventory[]
  bookingItems BookingItem[]

  @@index([hotelId])
  @@index([tenantId])
  @@map("room_types")
}

model RoomInventory {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  roomTypeId     String   @map("room_type_id") @db.Uuid
  tenantId       String   @map("tenant_id") @db.Uuid
  date           DateTime @db.Date
  totalCount     Int      @map("total_count")
  availableCount Int      @map("available_count")
  blockedCount   Int      @default(0) @map("blocked_count")
  pricePerNight  Int      @map("price_per_night") // cents
  minStay        Int      @default(1) @map("min_stay")
  restrictions   Json     @default("{}") // { closedToArrival, closedToDeparture, ... }
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  roomType RoomType @relation(fields: [roomTypeId], references: [id])

  @@unique([roomTypeId, date])
  @@index([tenantId])
  @@index([date])
  @@index([roomTypeId, date])
  @@map("room_inventory")
}

// ─────────────────────────────────────────────
// BOOKING (Cross-Domain)
// ─────────────────────────────────────────────

model Booking {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String        @map("tenant_id") @db.Uuid
  hotelId         String        @map("hotel_id") @db.Uuid
  guestId         String        @map("guest_id") @db.Uuid
  bookingType     BookingType
  bookingRef      String        @unique @map("booking_ref") // Human-readable: HEO-2024-XXXXX
  status          BookingStatus @default(PENDING)
  checkIn         DateTime?     @map("check_in") @db.Date
  checkOut        DateTime?     @map("check_out") @db.Date
  guestCount      Int           @default(1) @map("guest_count")
  childCount      Int           @default(0) @map("child_count")
  subtotalCents   Int           @map("subtotal_cents")
  taxCents        Int           @default(0) @map("tax_cents")
  totalCents      Int           @map("total_cents")
  currency        String        @default("USD") @db.VarChar(3)
  paymentStatus   PaymentStatus @default(PENDING) @map("payment_status")
  specialRequests String?       @map("special_requests") @db.Text
  internalNotes   String?       @map("internal_notes") @db.Text
  metadata        Json          @default("{}")
  cancelledAt     DateTime?     @map("cancelled_at")
  cancelReason    String?       @map("cancel_reason")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  hotel        Hotel         @relation(fields: [hotelId], references: [id])
  guest        User          @relation(fields: [guestId], references: [id])
  items        BookingItem[]
  supportCases SupportCase[]
  reviews      Review[]

  @@index([tenantId])
  @@index([hotelId])
  @@index([guestId])
  @@index([status])
  @@index([bookingRef])
  @@index([checkIn, checkOut])
  @@map("bookings")
}

model BookingItem {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  bookingId      String    @map("booking_id") @db.Uuid
  tenantId       String    @map("tenant_id") @db.Uuid
  itemType       String    @map("item_type") // "room", "venue", "dining", "nightlife", "addon"
  referenceId    String    @map("reference_id") @db.Uuid // FK to the source entity
  referenceName  String    @map("reference_name") // Denormalized name
  quantity       Int       @default(1)
  unitPriceCents Int       @map("unit_price_cents")
  totalCents     Int       @map("total_cents")
  dateStart      DateTime? @map("date_start")
  dateEnd        DateTime? @map("date_end")
  details        Json      @default("{}")
  createdAt      DateTime  @default(now()) @map("created_at")

  booking  Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  roomType RoomType? @relation(fields: [referenceId], references: [id])

  @@index([bookingId])
  @@index([tenantId])
  @@map("booking_items")
}

// ─────────────────────────────────────────────
// EVENT OS
// ─────────────────────────────────────────────

model Venue {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  hotelId          String   @map("hotel_id") @db.Uuid
  tenantId         String   @map("tenant_id") @db.Uuid
  name             String
  description      String?  @db.Text
  type             String // "ballroom", "meeting_room", "conference_hall", "garden", "rooftop", "terrace"
  maxCapacity      Int      @map("max_capacity")
  layouts          Json     @default("[]") // [{ type: VenueLayoutType, capacity: number, diagram?: string }]
  sizeSqm          Decimal? @map("size_sqm") @db.Decimal(8, 2)
  floor            String?
  avFeatures       Json     @default("[]") @map("av_features")
  photos           Json     @default("[]")
  noiseLevel       String?  @map("noise_level") // "quiet", "moderate", "loud"
  operatingHours   Json     @default("{}") @map("operating_hours")
  basePricePerHour Int?     @map("base_price_per_hour") // cents
  basePricePerDay  Int?     @map("base_price_per_day") // cents
  isActive         Boolean  @default(true) @map("is_active")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  hotel         Hotel          @relation(fields: [hotelId], references: [id])
  eventRequests EventRequest[]

  @@index([hotelId])
  @@index([tenantId])
  @@map("venues")
}

model EventRequest {
  id                 String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId           String             @map("tenant_id") @db.Uuid
  hotelId            String             @map("hotel_id") @db.Uuid
  organizerId        String             @map("organizer_id") @db.Uuid
  venueId            String?            @map("venue_id") @db.Uuid
  eventType          EventType          @map("event_type")
  name               String
  description        String?            @db.Text
  attendeeCount      Int                @map("attendee_count")
  requestedDate      DateTime           @map("requested_date") @db.Date
  requestedStartTime String?            @map("requested_start_time")
  requestedEndTime   String?            @map("requested_end_time")
  duration           Int? // minutes
  budgetMinCents     Int?               @map("budget_min_cents")
  budgetMaxCents     Int?               @map("budget_max_cents")
  layoutPreference   VenueLayoutType?   @map("layout_preference")
  avRequirements     Json               @default("[]") @map("av_requirements")
  cateringNeeded     Boolean            @default(false) @map("catering_needed")
  status             EventRequestStatus @default(INQUIRY)
  notes              String?            @db.Text
  metadata           Json               @default("{}")
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")

  hotel     Hotel  @relation(fields: [hotelId], references: [id])
  organizer User   @relation(fields: [organizerId], references: [id])
  venue     Venue? @relation(fields: [venueId], references: [id])
  beos      BEO[]

  @@index([tenantId])
  @@index([hotelId])
  @@index([status])
  @@map("event_requests")
}

model BEO {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String    @map("tenant_id") @db.Uuid
  eventRequestId  String    @map("event_request_id") @db.Uuid
  version         Int       @default(1)
  status          BEOStatus @default(DRAFT)
  operationalPlan Json      @map("operational_plan") // Setup/teardown instructions
  menuPlan        Json      @default("{}") @map("menu_plan")
  staffingPlan    Json      @default("{}") @map("staffing_plan")
  avPlan          Json      @default("{}") @map("av_plan")
  timeline        Json      @default("[]") // [{ time, action, responsible, notes }]
  estimatedCost   Int?      @map("estimated_cost") // cents
  approvedBy      String?   @map("approved_by") @db.Uuid
  approvedAt      DateTime? @map("approved_at")
  notes           String?   @db.Text
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  eventRequest EventRequest @relation(fields: [eventRequestId], references: [id])

  @@index([tenantId])
  @@index([eventRequestId])
  @@map("beos")
}

// ─────────────────────────────────────────────
// EXPERIENCE OS
// ─────────────────────────────────────────────

model DiningExperience {
  id             String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  hotelId        String     @map("hotel_id") @db.Uuid
  tenantId       String     @map("tenant_id") @db.Uuid
  name           String
  type           DiningType
  description    String?    @db.Text
  capacity       Int
  photos         Json       @default("[]")
  menuRefs       Json       @default("[]") @map("menu_refs") // [{ name, url, type }]
  pricingModel   Json       @default("{}") @map("pricing_model") // { type: "a_la_carte" | "fixed" | "per_person", basePriceCents }
  operatingHours Json       @default("{}") @map("operating_hours")
  dressCode      String?    @map("dress_code")
  isActive       Boolean    @default(true) @map("is_active")
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")

  hotel        Hotel               @relation(fields: [hotelId], references: [id])
  reservations DiningReservation[]

  @@index([hotelId])
  @@index([tenantId])
  @@map("dining_experiences")
}

model DiningReservation {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId            String   @map("tenant_id") @db.Uuid
  diningExperienceId  String   @map("dining_experience_id") @db.Uuid
  guestId             String   @map("guest_id") @db.Uuid
  reservationDate     DateTime @map("reservation_date") @db.Date
  reservationTime     String   @map("reservation_time") // "19:30"
  partySize           Int      @map("party_size")
  specialRequests     String?  @map("special_requests") @db.Text
  dietaryRestrictions Json     @default("[]") @map("dietary_restrictions")
  status              String   @default("confirmed") // "confirmed", "cancelled", "completed", "no_show"
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  diningExperience DiningExperience @relation(fields: [diningExperienceId], references: [id])
  guest            User             @relation(fields: [guestId], references: [id])

  @@index([tenantId])
  @@index([diningExperienceId, reservationDate])
  @@map("dining_reservations")
}

model NightExperience {
  id             String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  hotelId        String              @map("hotel_id") @db.Uuid
  tenantId       String              @map("tenant_id") @db.Uuid
  name           String
  type           NightExperienceType
  description    String?             @db.Text
  schedule       Json                @default("{}") // { dayOfWeek: [...], startTime, endTime }
  capacity       Int
  ageRestriction Int?                @map("age_restriction")
  dressCode      String?             @map("dress_code")
  pricingModel   Json                @default("{}") @map("pricing_model")
  photos         Json                @default("[]")
  isActive       Boolean             @default(true) @map("is_active")
  createdAt      DateTime            @default(now()) @map("created_at")
  updatedAt      DateTime            @updatedAt @map("updated_at")

  hotel        Hotel              @relation(fields: [hotelId], references: [id])
  reservations NightReservation[]

  @@index([hotelId])
  @@index([tenantId])
  @@map("night_experiences")
}

model NightReservation {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId          String   @map("tenant_id") @db.Uuid
  nightExperienceId String   @map("night_experience_id") @db.Uuid
  guestId           String   @map("guest_id") @db.Uuid
  reservationDate   DateTime @map("reservation_date") @db.Date
  partySize         Int      @map("party_size")
  vipAccess         Boolean  @default(false) @map("vip_access")
  packageType       String?  @map("package_type")
  totalCents        Int      @map("total_cents")
  status            String   @default("confirmed")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  nightExperience NightExperience @relation(fields: [nightExperienceId], references: [id])
  guest           User            @relation(fields: [guestId], references: [id])

  @@index([tenantId])
  @@map("night_reservations")
}

// ─────────────────────────────────────────────
// SUPPORT & RECOVERY
// ─────────────────────────────────────────────

model SupportCase {
  id           String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId     String       @map("tenant_id") @db.Uuid
  hotelId      String       @map("hotel_id") @db.Uuid
  guestId      String       @map("guest_id") @db.Uuid
  bookingId    String?      @map("booking_id") @db.Uuid
  caseRef      String       @unique @map("case_ref") // HEO-CASE-XXXXX
  category     CaseCategory
  severity     CaseSeverity @default(MEDIUM)
  status       CaseStatus   @default(OPEN)
  subject      String
  description  String       @db.Text
  assignedToId String?      @map("assigned_to_id") @db.Uuid
  resolvedAt   DateTime?    @map("resolved_at")
  resolution   String?      @db.Text
  slaDeadline  DateTime?    @map("sla_deadline")
  slaBreach    Boolean      @default(false) @map("sla_breach")
  metadata     Json         @default("{}")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  hotel         Hotel                @relation(fields: [hotelId], references: [id])
  guest         User                 @relation("GuestCases", fields: [guestId], references: [id])
  assignedTo    User?                @relation("AssignedCases", fields: [assignedToId], references: [id])
  booking       Booking?             @relation(fields: [bookingId], references: [id])
  timeline      CaseTimelineEntry[]
  compensations CompensationAction[]
  agentLogs     AgentExecutionLog[]

  @@index([tenantId])
  @@index([hotelId])
  @@index([guestId])
  @@index([status])
  @@index([severity])
  @@index([slaDeadline])
  @@map("support_cases")
}

model CaseTimelineEntry {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId     String   @map("case_id") @db.Uuid
  tenantId   String   @map("tenant_id") @db.Uuid
  actorType  String   @map("actor_type") // "guest", "staff", "agent", "system"
  actorId    String?  @map("actor_id")
  actorName  String?  @map("actor_name")
  action     String // "message", "status_change", "assignment", "escalation", "agent_recommendation", "note"
  content    String   @db.Text
  metadata   Json     @default("{}")
  isInternal Boolean  @default(false) @map("is_internal")
  createdAt  DateTime @default(now()) @map("created_at")

  supportCase SupportCase @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
  @@index([tenantId])
  @@map("case_timeline")
}

model CompensationAction {
  id               String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String             @map("tenant_id") @db.Uuid
  caseId           String             @map("case_id") @db.Uuid
  compensationType CompensationType   @map("compensation_type")
  description      String
  valueCents       Int?               @map("value_cents")
  status           CompensationStatus @default(PROPOSED)
  requiresApproval Boolean            @default(false) @map("requires_approval")
  approvalId       String?            @map("approval_id") @db.Uuid
  executedAt       DateTime?          @map("executed_at")
  reasoning        String?            @db.Text // Agent's explanation
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  supportCase SupportCase      @relation(fields: [caseId], references: [id])
  approval    ApprovalRequest? @relation(fields: [approvalId], references: [id])

  @@index([tenantId])
  @@index([caseId])
  @@map("compensation_actions")
}

model ApprovalRequest {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String    @map("tenant_id") @db.Uuid
  requestType   String    @map("request_type") // "compensation", "refund", "upgrade", "pricing_override", "event_exception"
  referenceId   String    @map("reference_id") @db.Uuid
  referenceType String    @map("reference_type") // "compensation_action", "booking", "event_request"
  requestedBy   String    @map("requested_by") // "agent:recovery" | "staff:uuid"
  summary       String    @db.Text
  details       Json      @default("{}")
  status        String    @default("pending") // "pending", "approved", "rejected", "expired"
  approverId    String?   @map("approver_id") @db.Uuid
  approverNote  String?   @map("approver_note") @db.Text
  decidedAt     DateTime? @map("decided_at")
  expiresAt     DateTime? @map("expires_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  approver      User?                @relation("Approver", fields: [approverId], references: [id])
  compensations CompensationAction[]

  @@index([tenantId])
  @@index([status])
  @@map("approval_requests")
}

// ─────────────────────────────────────────────
// AGENTIC MANAGER
// ─────────────────────────────────────────────

model AgentExecutionLog {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String    @map("tenant_id") @db.Uuid
  caseId          String?   @map("case_id") @db.Uuid
  sessionId       String?   @map("session_id") @db.Uuid
  agentType       AgentType @map("agent_type")
  triggerEvent    String    @map("trigger_event")
  inputPayload    Json      @map("input_payload")
  outputPayload   Json      @map("output_payload")
  decisionSummary String    @map("decision_summary") @db.Text
  reasoning       String?   @db.Text
  confidenceScore Decimal?  @map("confidence_score") @db.Decimal(3, 2)
  durationMs      Int?      @map("duration_ms")
  escalated       Boolean   @default(false)
  createdAt       DateTime  @default(now()) @map("created_at")

  supportCase SupportCase?          @relation(fields: [caseId], references: [id])
  session     OrchestrationSession? @relation(fields: [sessionId], references: [id])

  @@index([tenantId])
  @@index([caseId])
  @@index([agentType])
  @@index([createdAt])
  @@map("agent_execution_logs")
}

model OrchestrationSession {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String    @map("tenant_id") @db.Uuid
  triggerType   String    @map("trigger_type") // "booking_flow", "support_case", "event_inquiry", ...
  triggerRef    String    @map("trigger_ref") // reference ID
  context       Json      @default("{}") // accumulated shared context
  agentsInvoked Json      @default("[]") @map("agents_invoked") // [{ agent, timestamp, result }]
  status        String    @default("active") // "active", "completed", "failed", "suspended"
  completedAt   DateTime? @map("completed_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  agentLogs AgentExecutionLog[]

  @@index([tenantId])
  @@index([triggerType, triggerRef])
  @@map("orchestration_sessions")
}

// ─────────────────────────────────────────────
// INTELLIGENCE
// ─────────────────────────────────────────────

model Review {
  id               String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String                 @map("tenant_id") @db.Uuid
  hotelId          String                 @map("hotel_id") @db.Uuid
  guestId          String                 @map("guest_id") @db.Uuid
  bookingId        String?                @map("booking_id") @db.Uuid
  overallScore     Int                    @map("overall_score") // 1-10
  scores           Json                   @default("{}") // { cleanliness, staff, wifi, dining, noise, roomAccuracy, eventService }
  title            String?
  text             String?                @db.Text
  sentiment        String? // "positive", "neutral", "negative"
  sentimentScore   Decimal?               @map("sentiment_score") @db.Decimal(3, 2) // -1.0 to 1.0
  moderationStatus ReviewModerationStatus @default(PENDING) @map("moderation_status")
  hotelResponse    String?                @map("hotel_response") @db.Text
  respondedAt      DateTime?              @map("responded_at")
  createdAt        DateTime               @default(now()) @map("created_at")
  updatedAt        DateTime               @updatedAt @map("updated_at")

  hotel   Hotel    @relation(fields: [hotelId], references: [id])
  guest   User     @relation(fields: [guestId], references: [id])
  booking Booking? @relation(fields: [bookingId], references: [id])

  @@index([tenantId])
  @@index([hotelId])
  @@index([overallScore])
  @@map("reviews")
}

model HotelInsight {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId       String    @map("tenant_id") @db.Uuid
  hotelId        String    @map("hotel_id") @db.Uuid
  insightType    String    @map("insight_type") // "recurring_issue", "sentiment_trend", "operational_alert", "revenue_opportunity"
  category       String?
  title          String
  description    String    @db.Text
  severity       String? // "info", "warning", "critical"
  data           Json      @default("{}")
  isActionable   Boolean   @default(false) @map("is_actionable")
  acknowledgedAt DateTime? @map("acknowledged_at")
  createdAt      DateTime  @default(now()) @map("created_at")

  hotel Hotel @relation(fields: [hotelId], references: [id])

  @@index([tenantId])
  @@index([hotelId])
  @@index([insightType])
  @@map("hotel_insights")
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

model Notification {
  id          String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String             @map("tenant_id") @db.Uuid
  recipientId String             @map("recipient_id") @db.Uuid
  type        NotificationType
  channel     String // "booking", "support", "event", "system", "review"
  subject     String
  body        String             @db.Text
  metadata    Json               @default("{}")
  status      NotificationStatus @default(PENDING)
  sentAt      DateTime?          @map("sent_at")
  readAt      DateTime?          @map("read_at")
  createdAt   DateTime           @default(now()) @map("created_at")

  @@index([tenantId])
  @@index([recipientId])
  @@index([status])
  @@map("notifications")
}
```

---

## 6. API Design

### 6.1 tRPC Router Organization

```
packages/api/src/
├── root.ts                          ← merges all routers
├── trpc.ts                          ← base tRPC setup, context, middleware
├── middleware/
│   ├── auth.ts                      ← requireAuth, requireRole
│   ├── tenantScope.ts               ← injects tenantId into every query
│   ├── rateLimit.ts
│   └── audit.ts                     ← logs mutations
└── routers/
    ├── auth.router.ts
    ├── tenant.router.ts
    ├── hotel.router.ts
    ├── roomType.router.ts
    ├── roomInventory.router.ts
    ├── booking.router.ts
    ├── venue.router.ts
    ├── eventRequest.router.ts
    ├── beo.router.ts
    ├── dining.router.ts
    ├── nightlife.router.ts
    ├── supportCase.router.ts
    ├── compensation.router.ts
    ├── approval.router.ts
    ├── review.router.ts
    ├── notification.router.ts
    ├── analytics.router.ts
    └── agent.router.ts
```

### 6.2 Complete API Endpoint Map

Each router exposes procedures. Below is the exhaustive list:

#### Auth Router

```
auth.register              POST   Register new user (guest or hotel staff)
auth.login                 POST   Email/password login
auth.logout                POST   Invalidate session
auth.me                    GET    Current user profile
auth.updateProfile         PATCH  Update name, phone, avatar, preferences
auth.changePassword        POST   Change password
auth.forgotPassword        POST   Initiate password reset
auth.resetPassword         POST   Complete password reset
auth.verifyEmail           POST   Verify email with token
```

#### Tenant Router (Super Admin)

```
tenant.list                GET    List all tenants
tenant.getById             GET    Get tenant details
tenant.create              POST   Create new tenant
tenant.update              PATCH  Update tenant settings/plan
tenant.suspend             POST   Suspend tenant
tenant.activate            POST   Activate tenant
tenant.getPolicy           GET    Get specific policy
tenant.upsertPolicy        POST   Create or update policy
tenant.listPolicies        GET    List all policies for tenant
```

#### Hotel Router

```
hotel.search               GET    Search hotels (guest-facing, filterable)
hotel.getBySlug            GET    Get hotel public page
hotel.getById              GET    Get hotel full details (staff)
hotel.create               POST   Create hotel (admin)
hotel.update               PATCH  Update hotel details
hotel.updatePhotos         PATCH  Add/remove/reorder photos
hotel.updatePolicies       PATCH  Update hotel policies
hotel.updateAmenities      PATCH  Update amenities
hotel.updateStatus         POST   Change hotel status
hotel.getDashboard         GET    Hotel dashboard aggregations
hotel.getStaff             GET    List hotel staff
hotel.inviteStaff          POST   Invite staff member
hotel.removeStaff          POST   Remove staff member
```

#### RoomType Router

```
roomType.list              GET    List room types for hotel
roomType.getById           GET    Get room type details
roomType.create            POST   Create room type
roomType.update            PATCH  Update room type
roomType.delete            DELETE Soft delete room type
roomType.reorder           PATCH  Update sort order
```

#### Room Inventory Router

```
roomInventory.getRange     GET    Get inventory for date range
roomInventory.update       PATCH  Update single day
roomInventory.bulkUpdate   PATCH  Update date range (price, count, restrictions)
roomInventory.getAvailability GET Check availability across room types
```

#### Booking Router

```
booking.search             GET    Search bookings (filtered)
booking.getById            GET    Get booking details
booking.getByRef           GET    Get booking by reference code
booking.create             POST   Create new booking
booking.confirm            POST   Confirm pending booking
booking.cancel             POST   Cancel booking
booking.checkIn            POST   Mark as checked in
booking.checkOut           POST   Mark as checked out
booking.markNoShow         POST   Mark as no-show
booking.addItem            POST   Add item to booking
booking.removeItem         DELETE Remove item from booking
booking.updateNotes        PATCH  Update internal/special notes
booking.getGuestBookings   GET    Get all bookings for current guest
```

#### Venue Router

```
venue.list                 GET    List venues for hotel
venue.getById              GET    Get venue details
venue.create               POST   Create venue
venue.update               PATCH  Update venue
venue.delete               DELETE Soft delete venue
venue.checkAvailability    GET    Check venue availability for date/time
```

#### Event Request Router

```
eventRequest.list          GET    List event requests (filtered)
eventRequest.getById       GET    Get event request details
eventRequest.create        POST   Submit event inquiry
eventRequest.update        PATCH  Update event request
eventRequest.updateStatus  POST   Change status (approve, reject, etc.)
eventRequest.addNote       POST   Add internal note
eventRequest.getForGuest   GET    Get current user's event requests
```

#### BEO Router

```
beo.getByEventRequest      GET    Get BEOs for event request
beo.create                 POST   Generate BEO (may invoke BEO Agent)
beo.update                 PATCH  Update BEO
beo.approve                POST   Approve BEO
beo.requestRevision        POST   Request BEO revision
beo.finalize               POST   Finalize BEO
```

#### Dining Router

```
dining.listExperiences     GET    List dining experiences for hotel
dining.getExperience       GET    Get dining experience details
dining.createExperience    POST   Create dining experience
dining.updateExperience    PATCH  Update dining experience
dining.listReservations    GET    List reservations (filtered)
dining.createReservation   POST   Create dining reservation
dining.cancelReservation   POST   Cancel reservation
dining.completeReservation POST   Mark as completed
```

#### Nightlife Router

```
nightlife.listExperiences  GET    List night experiences for hotel
nightlife.getExperience    GET    Get experience details
nightlife.createExperience POST   Create night experience
nightlife.updateExperience PATCH  Update night experience
nightlife.listReservations GET    List reservations (filtered)
nightlife.createReservation POST  Create night reservation
nightlife.cancelReservation POST  Cancel reservation
```

#### Support Case Router

```
supportCase.list           GET    List cases (filtered by status, severity, hotel)
supportCase.getById        GET    Get case with timeline
supportCase.create         POST   Create new support case
supportCase.updateStatus   POST   Change case status
supportCase.assign         POST   Assign case to staff
supportCase.addMessage     POST   Add guest/staff message to timeline
supportCase.addInternalNote POST  Add internal note
supportCase.resolve        POST   Resolve case
supportCase.escalate       POST   Escalate case
supportCase.getGuestCases  GET    Get current guest's cases
```

#### Compensation Router

```
compensation.listByCase    GET    List compensations for case
compensation.propose       POST   Propose compensation (usually by agent)
compensation.approve       POST   Approve compensation
compensation.reject        POST   Reject compensation
compensation.execute       POST   Execute approved compensation
```

#### Approval Router

```
approval.listPending       GET    List pending approvals (for approver)
approval.getById           GET    Get approval details
approval.approve           POST   Approve request
approval.reject            POST   Reject request
approval.getHistory        GET    Approval history (filtered)
```

#### Review Router

```
review.listByHotel         GET    List reviews for hotel (public)
review.getById             GET    Get review details
review.create              POST   Submit review
review.moderate            POST   Approve/flag/reject review
review.respond             POST   Hotel response to review
review.getGuestReviews     GET    Current guest's reviews
```

#### Notification Router

```
notification.list          GET    List user's notifications
notification.markRead      POST   Mark notification as read
notification.markAllRead   POST   Mark all as read
notification.getUnreadCount GET   Count unread notifications
```

#### Analytics Router

```
analytics.hotelOverview    GET    Key metrics for hotel dashboard
analytics.occupancy        GET    Occupancy rates over time
analytics.revenue          GET    Revenue breakdown
analytics.supportMetrics   GET    Support case metrics (volume, resolution time, SLA)
analytics.eventMetrics     GET    Event pipeline and profitability
analytics.reviewSentiment  GET    Review sentiment trends
analytics.recurringIssues  GET    Top recurring issue categories
analytics.platformOverview GET    Platform-wide metrics (super admin)
```

#### Agent Router

```
agent.invokeMatchmaking    POST   Trigger matchmaking agent
agent.invokeTruth          POST   Trigger truth verification
agent.invokeBookingCheck   POST   Trigger booking integrity check
agent.getExecutionLog      GET    Get agent execution details
agent.listExecutionLogs    GET    List agent logs (filtered)
agent.getSessionContext    GET    Get orchestration session context
```

---

## 7. Agentic Manager Orchestration

### 7.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENTIC MANAGER                           │
│                                                              │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │ Intent Classifier │───▶│    Orchestration Engine       │  │
│  │                   │    │                               │  │
│  │ Classifies:       │    │ 1. Creates session            │  │
│  │ • domain          │    │ 2. Loads shared context        │  │
│  │ • intent          │    │ 3. Selects agent pipeline      │  │
│  │ • urgency         │    │ 4. Executes agents in order    │  │
│  │ • entities        │    │ 5. Aggregates results          │  │
│  └──────────────────┘    │ 6. Applies business rules      │  │
│                           │ 7. Routes escalations          │  │
│                           │ 8. Stores execution log        │  │
│                           └───────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 SHARED CONTEXT STORE                   │   │
│  │                                                       │   │
│  │  • Guest profile & history                            │   │
│  │  • Hotel profile & policies                           │   │
│  │  • Active booking details                             │   │
│  │  • Case history & open cases                          │   │
│  │  • Compensation history                               │   │
│  │  • Agent decision history                             │   │
│  │  • Approval states                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              BUSINESS RULES ENGINE                    │   │
│  │                                                       │   │
│  │  Rules loaded from: TenantPolicy + HotelPolicy        │   │
│  │                                                       │   │
│  │  • Refund thresholds                                  │   │
│  │  • Upgrade approval limits                            │   │
│  │  • SLA definitions by severity                        │   │
│  │  • Event cancellation windows                         │   │
│  │  • Compensation caps                                  │   │
│  │  • Auto-approval thresholds                           │   │
│  │  • Escalation triggers                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ESCALATION MANAGER                       │   │
│  │                                                       │   │
│  │  Triggers:                                            │   │
│  │  • Compensation above threshold                       │   │
│  │  • Safety/legal incident                              │   │
│  │  • VIP guest                                          │   │
│  │  • Agent confidence < 0.6                             │   │
│  │  • SLA breach imminent                                │   │
│  │  • Multiple failed resolution attempts                │   │
│  │                                                       │   │
│  │  Actions:                                             │   │
│  │  • Create ApprovalRequest                             │   │
│  │  • Notify responsible staff via SSE + email           │   │
│  │  • Pause agent pipeline                               │   │
│  │  • Set escalation deadline                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Agent Interface Contract

Every agent implements this interface:

```typescript
// packages/agents/src/types.ts

interface AgentContext {
  tenantId: string;
  sessionId: string;
  guest?: GuestProfile;
  hotel?: HotelProfile;
  booking?: BookingDetails;
  case?: SupportCaseDetails;
  eventRequest?: EventRequestDetails;
  policies: PolicyMap;
  history: {
    previousCases: SupportCaseSummary[];
    compensationHistory: CompensationSummary[];
    bookingHistory: BookingSummary[];
    agentDecisions: AgentDecisionSummary[];
  };
}

interface AgentInput {
  context: AgentContext;
  triggerEvent: string;
  payload: Record<string, unknown>;
}

interface AgentOutput {
  agentType: AgentType;
  decision: string;
  reasoning: string;
  confidence: number; // 0.0 - 1.0
  actions: AgentAction[];
  escalate: boolean;
  escalationReason?: string;
  metadata?: Record<string, unknown>;
}

interface AgentAction {
  type: string; // "recommend_compensation", "update_case_status", "send_notification", etc.
  payload: Record<string, unknown>;
  requiresApproval: boolean;
  priority: "immediate" | "normal" | "low";
}

interface Agent {
  type: AgentType;
  name: string;
  description: string;
  execute(input: AgentInput): Promise<AgentOutput>;
}
```

### 7.3 Agent Pipeline Definitions

```typescript
// packages/agents/src/pipelines.ts

const PIPELINES: Record<string, AgentType[]> = {
  // Accommodation booking flow
  "booking.search": ["MATCHMAKING", "TRUTH_TRANSPARENCY"],
  "booking.create": ["BOOKING_INTEGRITY"],
  "booking.confirmed": ["PRE_STAY_CONCIERGE"],
  "booking.checkedIn": [
    "STAY_SUPPORT", // monitoring mode
  ],

  // Support flow
  "support.case_created": ["STAY_SUPPORT", "RECOVERY_COMPENSATION"],

  // Event flow
  "event.inquiry": ["EVENT_MATCH", "VENUE_CAPACITY"],
  "event.confirmed": ["BEO_RUNOFSHOW", "FB_PLANNING"],

  // Analytics (async, via BullMQ)
  "analytics.case_resolved": ["INSIGHT_HOTEL_SUCCESS"],
  "analytics.review_submitted": ["INSIGHT_HOTEL_SUCCESS"],
};
```

### 7.4 Orchestration Flow (Pseudocode)

```typescript
// packages/agents/src/orchestrator.ts

async function orchestrate(
  triggerEvent: string,
  payload: any,
  tenantId: string,
) {
  // 1. Create orchestration session
  const session = await createSession(triggerEvent, payload, tenantId);

  // 2. Build shared context
  const context = await buildContext(tenantId, payload);

  // 3. Load policies
  const policies = await loadPolicies(tenantId, context.hotel?.id);

  // 4. Determine pipeline
  const pipeline = PIPELINES[triggerEvent];
  if (!pipeline) return; // no agents needed

  // 5. Execute agents sequentially
  const results: AgentOutput[] = [];
  for (const agentType of pipeline) {
    const agent = getAgent(agentType);
    const input: AgentInput = {
      context: { ...context, policies, history: await loadHistory(context) },
      triggerEvent,
      payload: { ...payload, previousAgentResults: results },
    };

    const output = await agent.execute(input);

    // 6. Log execution (immutable)
    await logExecution(session.id, agentType, input, output);

    // 7. Check escalation
    if (output.escalate || output.confidence < 0.6) {
      await escalate(session.id, output);
      break; // pause pipeline
    }

    // 8. Execute auto-approvable actions
    for (const action of output.actions) {
      if (!action.requiresApproval) {
        await executeAction(action);
      } else {
        await createApprovalRequest(action, session.id);
      }
    }

    results.push(output);
  }

  // 9. Complete session
  await completeSession(session.id, results);
}
```

### 7.5 Each Agent — Detailed Specification

#### Agent 1: Matchmaking Agent

```
Type:     MATCHMAKING
Trigger:  booking.search
Purpose:  Rank hotels/rooms based on guest profile fit

Input:
  - Guest preferences (budget, travel purpose, party composition)
  - Search filters (destination, dates, guest count)
  - Guest history (previous bookings, reviews, complaints)

Logic:
  1. Score each hotel on preference match (0-100)
  2. Weight factors: price fit (25%), amenity match (20%), review sentiment (20%),
     location (15%), past experience (10%), transparency score (10%)
  3. Penalize: hotels with recurring issues matching guest sensitivity
     (e.g., noise-sensitive guest + noise complaints hotel)
  4. Boost: hotels where guest had positive past experience

Output:
  - Ranked list with scores
  - Per-hotel explanation: "Why this hotel fits"
  - Warnings: "This hotel has reported Wi-Fi issues"
```

#### Agent 2: Truth & Transparency Agent

```
Type:     TRUTH_TRANSPARENCY
Trigger:  booking.search (after matchmaking), hotel.verify (admin)
Purpose:  Validate listing accuracy

Checks:
  - Photo freshness: warn if photos > 12 months old
  - Fee disclosure: flag undisclosed resort fees, parking charges
  - Room size claims vs category standards
  - Amenity availability vs listed amenities
  - Recent review contradictions (listing says "quiet" but reviews say "noisy")
  - Policy completeness: check all required fields are filled
  - Wi-Fi quality claim vs review mentions

Output:
  - Transparency score (0-100)
  - List of verified fields
  - List of flags/warnings
  - Suggested disclosures for hotel
```

#### Agent 3: Booking Integrity Agent

```
Type:     BOOKING_INTEGRITY
Trigger:  booking.create
Purpose:  Prevent booking failures

Checks:
  - Real-time availability (race condition check)
  - Price consistency (vs what was shown)
  - Overbooking risk (if available_count <= 2, flag)
  - Payment validity
  - Guest history: check for no-show pattern (>2 no-shows → flag)
  - Date logic: check-out > check-in, min stay met
  - Bundle consistency: all items available on same dates

Output:
  - Proceed / Block / Flag decision
  - Risk flags with explanations
  - Suggested alternatives if blocked
```

#### Agent 4: Pre-Stay Concierge Agent

```
Type:     PRE_STAY_CONCIERGE
Trigger:  booking.confirmed (24-72h before check-in)
Purpose:  Pre-arrival preparation

Actions:
  - Send check-in instructions
  - Confirm special requests (baby bed, extra pillows, dietary)
  - Offer early check-in if available
  - Suggest add-ons: dining reservation, spa, airport transfer
  - Confirm event preparations if applicable
  - Send local area recommendations

Output:
  - Pre-arrival message template
  - Confirmed/pending special requests list
  - Upsell recommendations
```

#### Agent 5: Stay Support Agent

```
Type:     STAY_SUPPORT
Trigger:  support.case_created (during stay)
Purpose:  Classify and recommend immediate actions

Logic:
  1. Classify issue: category + severity (using case description + guest history)
  2. Check if issue is recurring for this room/hotel
  3. Determine SLA based on severity:
     - CRITICAL: 15 min response, 1h resolution
     - HIGH:     30 min response, 4h resolution
     - MEDIUM:   2h response, 24h resolution
     - LOW:      24h response, 72h resolution
  4. Recommend immediate action based on category:
     - Room not ready → offer lounge access + ETA
     - Cleanliness → dispatch housekeeping + amenity credit
     - Noise → offer room move
     - Wi-Fi → dispatch IT + provide mobile hotspot info
     - AC broken → offer portable unit + room change

Output:
  - Classification result
  - SLA deadline
  - Recommended actions (with approval flags)
  - Notification targets (which staff roles)
```

#### Agent 6: Recovery & Compensation Agent

```
Type:     RECOVERY_COMPENSATION
Trigger:  After STAY_SUPPORT (if compensation appropriate)
Purpose:  Fair, consistent service recovery

Logic:
  1. Assess impact: severity × duration × guest profile
  2. Check guest compensation history (avoid gaming)
  3. Check hotel's compensation budget/policy
  4. Calculate proportional compensation:
     - Low impact: amenity credit ($10-25)
     - Medium: breakfast inclusion / late checkout
     - High: room upgrade / partial refund (10-30%)
     - Critical: full night comp / full refund
  5. If value > tenant threshold → requiresApproval = true
  6. Compare with similar past cases for consistency

Output:
  - Proposed compensation type + value
  - Reasoning (human-readable)
  - Approval requirement flag
  - Fairness score vs similar cases
```

#### Agents 7-12: Follow Same Pattern

_(Event Match, Venue Capacity, BEO/Run-of-Show, F&B Planning, Nightlife, Insight — each follows the Agent interface with domain-specific logic as defined in the original specification)_

---

## 8. Frontend Architecture

### 8.1 Application Structure

The Next.js app serves three portals via route groups:

```
apps/web/src/
├── app/
│   ├── (guest)/                     ← Guest portal
│   │   ├── layout.tsx
│   │   ├── page.tsx                 ← Landing / search
│   │   ├── search/
│   │   │   └── page.tsx             ← Search results
│   │   ├── hotel/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         ← Hotel detail page
│   │   │       ├── rooms/
│   │   │       ├── events/
│   │   │       ├── dining/
│   │   │       └── nightlife/
│   │   ├── booking/
│   │   │   ├── [id]/page.tsx        ← Booking detail
│   │   │   └── new/page.tsx         ← Booking creation flow
│   │   ├── my/
│   │   │   ├── bookings/page.tsx    ← My bookings
│   │   │   ├── events/page.tsx      ← My event requests
│   │   │   ├── cases/page.tsx       ← My support cases
│   │   │   ├── reviews/page.tsx     ← My reviews
│   │   │   └── profile/page.tsx     ← Profile settings
│   │   └── support/
│   │       ├── new/page.tsx         ← Create support case
│   │       └── [id]/page.tsx        ← Case detail + chat
│   │
│   ├── (hotel)/                     ← Hotel staff portal
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx       ← Main dashboard
│   │   ├── rooms/
│   │   │   ├── types/page.tsx       ← Room type management
│   │   │   └── inventory/page.tsx   ← Inventory calendar
│   │   ├── bookings/
│   │   │   ├── page.tsx             ← Booking list
│   │   │   └── [id]/page.tsx        ← Booking detail
│   │   ├── events/
│   │   │   ├── page.tsx             ← Event request pipeline
│   │   │   ├── [id]/page.tsx        ← Event detail
│   │   │   └── beo/[id]/page.tsx    ← BEO detail/edit
│   │   ├── venues/
│   │   │   └── page.tsx             ← Venue management
│   │   ├── dining/
│   │   │   ├── page.tsx             ← Dining management
│   │   │   └── reservations/page.tsx
│   │   ├── nightlife/
│   │   │   └── page.tsx
│   │   ├── support/
│   │   │   ├── page.tsx             ← Case queue
│   │   │   └── [id]/page.tsx        ← Case resolution view
│   │   ├── approvals/
│   │   │   └── page.tsx             ← Pending approvals
│   │   ├── reviews/
│   │   │   └── page.tsx             ← Review management
│   │   ├── analytics/
│   │   │   └── page.tsx             ← Hotel analytics
│   │   └── settings/
│   │       ├── hotel/page.tsx       ← Hotel profile
│   │       ├── staff/page.tsx       ← Staff management
│   │       └── policies/page.tsx    ← Hotel policies
│   │
│   ├── (admin)/                     ← Platform admin portal
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── tenants/page.tsx
│   │   ├── hotels/page.tsx
│   │   ├── users/page.tsx
│   │   ├── cases/page.tsx           ← Platform-wide case oversight
│   │   ├── agents/
│   │   │   ├── logs/page.tsx        ← Agent execution logs
│   │   │   └── config/page.tsx      ← Agent policies
│   │   ├── analytics/page.tsx
│   │   └── policies/page.tsx
│   │
│   ├── (auth)/                      ← Auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts     ← tRPC handler
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── sse/route.ts             ← Server-Sent Events
│   │   └── upload/presign/route.ts  ← Pre-signed upload URLs
│   │
│   ├── layout.tsx                   ← Root layout
│   └── not-found.tsx
│
├── components/
│   ├── ui/                          ← shadcn/ui components
│   ├── layouts/
│   │   ├── GuestLayout.tsx
│   │   ├── HotelLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── Sidebar.tsx
│   ├── hotel/
│   │   ├── HotelCard.tsx
│   │   ├── HotelSearchFilters.tsx
│   │   ├── RoomTypeCard.tsx
│   │   ├── VenueCard.tsx
│   │   ├── TransparencyBadge.tsx
│   │   └── PoliciesDisplay.tsx
│   ├── booking/
│   │   ├── BookingForm.tsx
│   │   ├── BookingCard.tsx
│   │   ├── BookingSummary.tsx
│   │   ├── BundleBuilder.tsx
│   │   └── PriceBreakdown.tsx
│   ├── events/
│   │   ├── EventRequestForm.tsx
│   │   ├── EventPipeline.tsx
│   │   ├── BEOViewer.tsx
│   │   └── RunOfShowTimeline.tsx
│   ├── support/
│   │   ├── CaseList.tsx
│   │   ├── CaseTimeline.tsx
│   │   ├── CaseChat.tsx
│   │   ├── CompensationCard.tsx
│   │   └── SeverityBadge.tsx
│   ├── dashboard/
│   │   ├── OccupancyChart.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── CaseMetrics.tsx
│   │   ├── EventPipelineWidget.tsx
│   │   ├── RecurringIssuesWidget.tsx
│   │   └── SLATracker.tsx
│   ├── agents/
│   │   ├── AgentRecommendation.tsx
│   │   ├── AgentLogViewer.tsx
│   │   └── EscalationBanner.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── SearchInput.tsx
│       ├── DateRangePicker.tsx
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       ├── LoadingState.tsx
│       ├── ConfirmDialog.tsx
│       └── NotificationBell.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useTenant.ts
│   ├── useSSE.ts
│   ├── useDebounce.ts
│   └── usePermission.ts
│
├── lib/
│   ├── trpc.ts                      ← tRPC client setup
│   ├── auth.ts                      ← NextAuth config
│   ├── permissions.ts               ← RBAC helper
│   ├── formatters.ts                ← Currency, date, etc.
│   └── constants.ts
│
├── stores/
│   ├── uiStore.ts                   ← Zustand: sidebar, modals, theme
│   └── notificationStore.ts         ← Zustand: notification state
│
└── styles/
    └── globals.css                  ← Tailwind config + custom vars
```

### 8.2 Key UI Components & Pages

#### Guest Portal — Hotel Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  Hotel Name ★★★★☆  (4.2)   Verified ✓                  │
│  City, Country                                          │
├─────────────────────────────────────────────────────────┤
│  [Photo Gallery — verified badge on photos]             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┬──────────┬────────┬──────────┬──────────┐ │
│  │  Rooms  │  Events  │ Dining │Nightlife │ Reviews  │ │
│  └─────────┴──────────┴────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────────────┤
│  TRANSPARENCY PANEL                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Wi-Fi: Good │  │ Noise: Low   │  │ Hidden Fees:  │ │
│  │ (verified)  │  │ (verified)   │  │ None          │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
│                                                         │
│  Check-in: 15:00  |  Check-out: 11:00  |  Cancel: 48h │
│  Children: Allowed |  Pets: No          |  Parking: €15│
├─────────────────────────────────────────────────────────┤
│  ROOMS (tab active)                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Deluxe King  |  32m²  |  King bed  |  Sea view  │   │
│  │ €189/night   |  [Book Now]                      │   │
│  │ ⚠ Near elevator — occasional noise reported     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Junior Suite  |  45m²  |  King + sofa  |  City  │   │
│  │ €289/night   |  [Book Now]                      │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  AI RECOMMENDATION                                      │
│  "Based on your preference for quiet rooms and          │
│   strong Wi-Fi, we recommend the Junior Suite on        │
│   higher floors. This hotel scores 92/100 for your      │
│   business travel profile."                             │
│                                   — Matchmaking Agent   │
└─────────────────────────────────────────────────────────┘
```

#### Hotel Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  HOTEL DASHBOARD           Today: Mar 19, 2026                  │
├──────────────────┬──────────────────┬───────────────────────────┤
│  Occupancy Today │  Revenue (MTD)   │  Open Cases               │
│      78%         │    €142,300      │     7 (2 critical)        │
│  ▲ 5% vs last wk │  ▲ 12% vs LY    │     ▼ 3 vs last week     │
├──────────────────┴──────────────────┴───────────────────────────┤
│                                                                  │
│  ┌─ UPCOMING EVENTS ─────────────────────────────────────────┐  │
│  │ Mar 21  Corporate Workshop    Ballroom A   45 pax  ✓ BEO  │  │
│  │ Mar 23  Wedding Reception     Grand Hall   180 pax ⚠ BEO  │  │
│  │ Mar 25  Product Launch        Terrace      80 pax  ✗ BEO  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ CRITICAL CASES ──────────────────────────────────────────┐  │
│  │ 🔴 Room 412 — AC broken since yesterday                   │  │
│  │    Agent recommends: room change + amenity credit €25     │  │
│  │    [Approve] [Modify] [Escalate]                          │  │
│  │                                                            │  │
│  │ 🔴 Conf Room B — AV projector malfunction (event in 2h)  │  │
│  │    Agent recommends: dispatch tech + backup projector     │  │
│  │    [Approve] [View Details]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ RECURRING ISSUES ────────────────────────────────────────┐  │
│  │ ⚠ Wi-Fi complaints: 12 this month (rooms 301-312)        │  │
│  │ ⚠ Noise complaints: 8 this month (rooms near bar)        │  │
│  │ ℹ Breakfast wait times: increasing trend                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─ OCCUPANCY (14 days) ─────────────────────────────────────┐  │
│  │  █ █ █ █ █ █ █ █ █ █ █ █ █ █                             │  │
│  │  78 82 85 90 92 88 75 70 85 88 91 95 80 72               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Security & Multi-Tenancy

### 9.1 Multi-Tenancy Implementation

```typescript
// Every tRPC procedure uses this middleware:

const tenantScope = middleware(async ({ ctx, next }) => {
  const tenantId = ctx.session?.user?.tenantId;
  if (!tenantId) throw new TRPCError({ code: "UNAUTHORIZED" });

  // Inject tenantId into all Prisma queries via Prisma Client Extensions
  const scopedDb = ctx.db.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Auto-inject where: { tenantId } for reads
          // Auto-inject data: { tenantId } for writes
          // This ensures NO cross-tenant data leakage
          if (args.where) args.where.tenantId = tenantId;
          if (args.data) args.data.tenantId = tenantId;
          return query(args);
        },
      },
    },
  });

  return next({ ctx: { ...ctx, db: scopedDb, tenantId } });
});
```

### 9.2 RBAC Permission Matrix

```typescript
// packages/shared/src/permissions.ts

const PERMISSIONS = {
  // Booking
  "booking:create": [
    "GUEST",
    "FRONT_DESK",
    "RESERVATIONS_MANAGER",
    "HOTEL_ADMIN",
  ],
  "booking:read": [
    "GUEST",
    "FRONT_DESK",
    "RESERVATIONS_MANAGER",
    "HOTEL_ADMIN",
    "HOTEL_MANAGER",
  ],
  "booking:update": ["FRONT_DESK", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "booking:cancel": ["GUEST", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "booking:checkin": ["FRONT_DESK", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "booking:checkout": ["FRONT_DESK", "RESERVATIONS_MANAGER", "HOTEL_ADMIN"],

  // Support
  "case:create": ["GUEST", "FRONT_DESK", "GUEST_RELATIONS", "HOTEL_ADMIN"],
  "case:assign": ["GUEST_RELATIONS", "OPERATIONS_MANAGER", "HOTEL_ADMIN"],
  "case:resolve": [
    "FRONT_DESK",
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "HOTEL_ADMIN",
  ],
  "case:escalate": [
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "HOTEL_ADMIN",
    "PLATFORM_OPS",
  ],

  // Compensation
  "compensation:propose": ["AGENT"], // Only agents propose
  "compensation:approve": [
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "FINANCE_APPROVER",
    "HOTEL_ADMIN",
  ],
  "compensation:execute": [
    "GUEST_RELATIONS",
    "OPERATIONS_MANAGER",
    "HOTEL_ADMIN",
  ],

  // Events
  "event:create": ["GUEST", "EVENTS_MANAGER", "HOTEL_ADMIN"],
  "event:manage": ["EVENTS_MANAGER", "BANQUET_MANAGER", "HOTEL_ADMIN"],
  "beo:manage": [
    "EVENTS_MANAGER",
    "BANQUET_MANAGER",
    "FB_MANAGER",
    "HOTEL_ADMIN",
  ],

  // Hotel Management
  "hotel:manage": ["HOTEL_ADMIN"],
  "hotel:verify": ["PLATFORM_OPS", "SUPER_ADMIN"],
  "inventory:manage": ["RESERVATIONS_MANAGER", "HOTEL_ADMIN"],
  "venue:manage": ["EVENTS_MANAGER", "HOTEL_ADMIN"],
  "dining:manage": ["FB_MANAGER", "HOTEL_ADMIN"],
  "staff:manage": ["HOTEL_ADMIN"],

  // Analytics
  "analytics:hotel": ["HOTEL_MANAGER", "OPERATIONS_MANAGER", "HOTEL_ADMIN"],
  "analytics:platform": ["PLATFORM_OPS", "SUPER_ADMIN"],

  // Admin
  "tenant:manage": ["SUPER_ADMIN"],
  "agent:configure": ["SUPER_ADMIN", "PLATFORM_OPS"],
  "agent:logs": ["HOTEL_ADMIN", "PLATFORM_OPS", "SUPER_ADMIN"],
} as const;
```

### 9.3 Data Encryption

```typescript
// PII fields encrypted at application level
const ENCRYPTED_FIELDS = {
  User: ["email", "phone", "passwordHash"],
  Booking: ["specialRequests"],
  SupportCase: ["description"],
};

// Implementation via Prisma middleware or client extension
// Encrypt on write, decrypt on read
// Key management: environment variable for MVP, KMS for production
```

---

## 10. Infrastructure & DevOps

### 10.1 Local Development Setup

```yaml
# docker-compose.yml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: hospitality_platform
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

volumes:
  pgdata:
```

### 10.2 Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/hospitality_platform"
REDIS_URL="redis://localhost:6379"  # no credentials

# Auth
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="http://localhost:3000"

# Encryption
ENCRYPTION_KEY="32-byte-hex-key-here"

# Email (local MailHog)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_FROM="noreply@hospitality.local"

# File Storage (local for MVP)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Agent Configuration
AGENT_CONFIDENCE_THRESHOLD="0.6"
COMPENSATION_AUTO_APPROVE_MAX_CENTS="2500" # $25
REFUND_APPROVAL_THRESHOLD_CENTS="10000"    # $100
SLA_CRITICAL_RESPONSE_MINUTES="15"
SLA_HIGH_RESPONSE_MINUTES="30"
SLA_MEDIUM_RESPONSE_MINUTES="120"
SLA_LOW_RESPONSE_MINUTES="1440"
```

### 10.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_DB: test, POSTGRES_USER: test, POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:migrate
      - run: pnpm test
```

---

## 11. MVP Roadmap & Build Plan

### Phase 1: Foundation (Weeks 1-4)

```
Week 1: Project Setup
  ├── Initialize Turborepo monorepo
  ├── Configure TypeScript, ESLint, Prettier
  ├── Setup Docker Compose (Postgres, Redis, MailHog)
  ├── Initialize Prisma with core schema (Tenant, User, Hotel, Session)
  ├── Setup NextAuth with email/password
  ├── Setup tRPC with auth + tenant middleware
  ├── Create base layouts (Guest, Hotel, Admin)
  └── Deploy shadcn/ui component library

Week 2: Hotel & Room Management
  ├── Hotel CRUD (create, edit, photos, policies, amenities)
  ├── Hotel listing page (public)
  ├── Hotel detail page with transparency panel
  ├── RoomType CRUD
  ├── Room inventory calendar (date range pricing/availability)
  ├── Hotel dashboard skeleton
  └── Staff invitation flow

Week 3: Booking Flow
  ├── Hotel search with filters
  ├── Availability checker
  ├── Booking creation flow (room selection → summary → confirm)
  ├── Booking management (guest: view, cancel)
  ├── Booking management (hotel: view, check-in, check-out, no-show)
  ├── Booking reference generator
  └── Booking confirmation email

Week 4: Support & Case Management
  ├── Support case creation (guest-facing form)
  ├── Case queue (hotel staff view with filters)
  ├── Case timeline / chat interface
  ├── Case assignment and status management
  ├── Compensation proposal + approval flow
  ├── SLA tracking and deadline display
  └── Notification system (in-app + email)
```

### Phase 2: Agentic Layer (Weeks 5-7)

```
Week 5: Agentic Manager Foundation
  ├── Agent interface and registry
  ├── Orchestration session management
  ├── Shared context builder
  ├── Business rules engine (policy loader)
  ├── Agent execution logging
  ├── Implement: Matchmaking Agent (rule-based scoring)
  └── Implement: Truth & Transparency Agent (field validation)

Week 6: Booking & Support Agents
  ├── Implement: Booking Integrity Agent
  ├── Implement: Stay Support Agent (classification + SLA)
  ├── Implement: Recovery & Compensation Agent
  ├── Wire agents into booking flow
  ├── Wire agents into support flow
  ├── Agent recommendation UI (hotel dashboard)
  └── Escalation queue and approval UI

Week 7: Event System Foundation
  ├── Venue CRUD
  ├── Event request submission (guest/organizer)
  ├── Event request pipeline (hotel staff)
  ├── Event Match Agent (basic matching)
  ├── Venue Capacity Agent (availability + layout check)
  ├── Simple dining experience listing + reservation
  └── Meeting room booking flow
```

### Phase 3: Operations & Intelligence (Weeks 8-10)

```
Week 8: BEO & F&B
  ├── BEO generation (template-based with agent assistance)
  ├── BEO approval workflow
  ├── Run-of-show timeline editor
  ├── F&B Planning Agent (menu suggestion engine)
  ├── Menu management
  └── Dietary restriction handling

Week 9: Analytics & Intelligence
  ├── Hotel analytics dashboard
  ├── Occupancy charts
  ├── Revenue breakdown
  ├── Support case metrics
  ├── Recurring issue detection (Insight Agent)
  ├── Review submission + moderation flow
  ├── Review sentiment analysis (basic)
  └── Platform admin overview dashboard

Week 10: Polish & Nightlife
  ├── Nightlife experience listing + reservation
  ├── Bundle booking (room + event, room + dining)
  ├── Pre-stay concierge automation
  ├── SSE real-time notifications
  ├── Error handling & edge cases
  ├── Seed data for demo
  └── End-to-end testing
```

---

## 12. Coding Standards & Conventions

### 12.1 TypeScript

```typescript
// STRICT mode always
// tsconfig.json: "strict": true

// Use Zod for all input validation
const createBookingInput = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  guestCount: z.number().int().min(1).max(20),
  childCount: z.number().int().min(0).default(0),
  specialRequests: z.string().max(2000).optional(),
});

// Type inference from Zod
type CreateBookingInput = z.infer<typeof createBookingInput>;
```

### 12.2 Naming Conventions

```
Files:           camelCase.ts (services), PascalCase.tsx (components)
Components:      PascalCase — BookingCard, CaseTimeline
tRPC routers:    camelCase — booking.router.ts
tRPC procedures: camelCase — booking.getById, booking.create
Database tables: snake_case — support_cases, booking_items
Database columns: snake_case (mapped from camelCase via Prisma @map)
Enums:           PascalCase values — BookingStatus.CONFIRMED
Constants:       UPPER_SNAKE — MAX_FILE_SIZE
CSS:             Tailwind utility classes (no custom CSS except globals)
```

### 12.3 Error Handling

```typescript
// Use tRPC error codes consistently
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Booking not found",
  cause: { bookingId },
});

// Domain errors as typed results
type Result<T> = { ok: true; data: T } | { ok: false; error: DomainError };

class DomainError {
  constructor(
    public code: string,
    public message: string,
    public metadata?: Record<string, unknown>,
  ) {}
}
```

### 12.4 Testing Strategy

```
Unit Tests (Vitest):
  - Domain logic (agents, business rules, validators)
  - Utility functions
  - Coverage target: 80%+ for domain package

Integration Tests (Vitest + test DB):
  - tRPC procedures
  - Agent orchestration flows
  - Database operations

E2E Tests (Playwright):
  - Booking flow
  - Support case flow
  - Hotel onboarding
  - Event request flow
```

---

## 13. File & Folder Structure

```
hospitality-platform/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/              (Next.js App Router — see §8.1)
│       │   ├── components/       (React components — see §8.1)
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── stores/
│       │   └── styles/
│       ├── public/
│       │   ├── images/
│       │   └── fonts/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/
│   │   ├── prisma/
│   │   │   ├── schema.prisma     (see §5.2)
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── client.ts         (Prisma client singleton)
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── root.ts           (merged router)
│   │   │   ├── trpc.ts           (tRPC init, context, middleware)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── tenantScope.ts
│   │   │   │   ├── rateLimit.ts
│   │   │   │   └── audit.ts
│   │   │   └── routers/          (see §6.2)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── domain/
│   │   ├── src/
│   │   │   ├── stay/
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── inventory.service.ts
│   │   │   │   └── availability.service.ts
│   │   │   ├── events/
│   │   │   │   ├── eventRequest.service.ts
│   │   │   │   ├── venue.service.ts
│   │   │   │   └── beo.service.ts
│   │   │   ├── experience/
│   │   │   │   ├── dining.service.ts
│   │   │   │   └── nightlife.service.ts
│   │   │   ├── support/
│   │   │   │   ├── case.service.ts
│   │   │   │   ├── compensation.service.ts
│   │   │   │   ├── sla.service.ts
│   │   │   │   └── escalation.service.ts
│   │   │   ├── intelligence/
│   │   │   │   ├── review.service.ts
│   │   │   │   ├── insight.service.ts
│   │   │   │   └── analytics.service.ts
│   │   │   ├── notification/
│   │   │   │   └── notification.service.ts
│   │   │   └── events/
│   │   │       └── domainEvents.ts   (event bus)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── agents/
│   │   ├── src/
│   │   │   ├── types.ts           (Agent interface — see §7.2)
│   │   │   ├── registry.ts        (agent registry)
│   │   │   ├── orchestrator.ts    (main orchestration engine)
│   │   │   ├── contextBuilder.ts  (shared context builder)
│   │   │   ├── policyEngine.ts    (business rules loader)
│   │   │   ├── escalationManager.ts
│   │   │   ├── pipelines.ts       (see §7.3)
│   │   │   └── agents/
│   │   │       ├── matchmaking.agent.ts
│   │   │       ├── truthTransparency.agent.ts
│   │   │       ├── bookingIntegrity.agent.ts
│   │   │       ├── preStayConcierge.agent.ts
│   │   │       ├── staySupport.agent.ts
│   │   │       ├── recoveryCompensation.agent.ts
│   │   │       ├── eventMatch.agent.ts
│   │   │       ├── venueCapacity.agent.ts
│   │   │       ├── beoRunOfShow.agent.ts
│   │   │       ├── fbPlanning.agent.ts
│   │   │       ├── nightlifeExperience.agent.ts
│   │   │       └── insightHotelSuccess.agent.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/             (shared TypeScript types)
│   │   │   ├── validators/        (Zod schemas)
│   │   │   ├── constants.ts
│   │   │   ├── permissions.ts     (RBAC matrix — see §9.2)
│   │   │   ├── formatters.ts
│   │   │   └── errors.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/
│   │   ├── src/
│   │   │   └── components/        (shared UI components)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── email/
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   │   ├── bookingConfirmation.tsx
│   │   │   │   ├── supportCaseUpdate.tsx
│   │   │   │   ├── approvalRequest.tsx
│   │   │   │   ├── reviewRequest.tsx
│   │   │   │   └── welcome.tsx
│   │   │   └── sender.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── queue/
│       ├── src/
│       │   ├── workers/
│       │   │   ├── agentWorker.ts
│       │   │   ├── notificationWorker.ts
│       │   │   ├── insightWorker.ts
│       │   │   └── slaCheckWorker.ts
│       │   ├── jobs.ts             (job type definitions)
│       │   └── connection.ts       (Redis/BullMQ setup)
│       ├── tsconfig.json
│       └── package.json
│
├── tooling/
│   ├── eslint-config/
│   │   └── base.js
│   ├── tsconfig/
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── library.json
│   └── prettier-config/
│       └── index.js
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.local
├── .env.example
├── .gitignore
└── README.md
```

---

## 14. Step-by-Step Build Instructions

These are the exact commands and steps for Claude Code to execute:

### Step 1: Initialize Monorepo

```bash
mkdir hospitality-platform && cd hospitality-platform
pnpm init
# Create pnpm-workspace.yaml
# Create turbo.json
# Create root package.json scripts
# Create tooling configs (eslint, tsconfig, prettier)
```

### Step 2: Create Database Package

```bash
mkdir -p packages/db
cd packages/db
pnpm init
pnpm add prisma @prisma/client
pnpm add -D typescript
npx prisma init
# Paste the complete Prisma schema from §5.2
# Create client.ts singleton
npx prisma migrate dev --name init
```

### Step 3: Create Shared Package

```bash
mkdir -p packages/shared/src
# Create types, validators (Zod schemas), constants, permissions, formatters
```

### Step 4: Create API Package

```bash
mkdir -p packages/api/src
pnpm add @trpc/server zod
# Create trpc.ts (init, context, middleware)
# Create middleware/ (auth, tenantScope, audit)
# Create routers/ (start with auth, hotel, roomType, booking)
# Create root.ts (merge routers)
```

### Step 5: Create Next.js App

```bash
cd apps
pnpm create next-app web --typescript --tailwind --app --src-dir
cd web
pnpm add @trpc/client @trpc/react-query @tanstack/react-query zustand
pnpm add next-auth@beta
# Install shadcn/ui
npx shadcn-ui@latest init
# Add core components: button, input, card, table, dialog, dropdown, badge, tabs, toast
```

### Step 6: Create Agent Package

```bash
mkdir -p packages/agents/src/agents
# Create types.ts, registry.ts, orchestrator.ts
# Create contextBuilder.ts, policyEngine.ts, escalationManager.ts
# Create pipelines.ts
# Implement agents one by one (start with matchmaking, staySupport, recovery)
```

### Step 7: Create Queue Package

```bash
mkdir -p packages/queue/src/workers
pnpm add bullmq ioredis
# Create connection.ts, jobs.ts
# Create workers (agent, notification, insight, slaCheck)
```

### Step 8: Implement Guest Portal

```
Implement in order:
1. Landing page with search
2. Search results page
3. Hotel detail page (with transparency panel)
4. Booking creation flow
5. My bookings page
6. Support case creation
7. Case detail / chat page
```

### Step 9: Implement Hotel Portal

```
Implement in order:
1. Dashboard with widgets
2. Room type management
3. Inventory calendar
4. Booking list + detail
5. Support case queue
6. Case resolution view
7. Approval queue
8. Venue management
9. Event request pipeline
```

### Step 10: Implement Admin Portal

```
Implement in order:
1. Platform overview dashboard
2. Tenant management
3. Hotel verification
4. Platform-wide case oversight
5. Agent execution log viewer
6. Analytics views
```

### Step 11: Seed Data

```bash
# Create comprehensive seed script:
# - 1 tenant
# - 3 hotels with varied profiles
# - 10+ room types
# - 5+ venues
# - Dining + nightlife experiences
# - 20+ bookings in various statuses
# - 10+ support cases
# - Agent execution logs
# - Reviews
npx prisma db seed
```

### Step 12: Testing

```bash
pnpm add -D vitest @testing-library/react playwright
# Write unit tests for domain services
# Write integration tests for tRPC routers
# Write E2E tests for critical flows
```

---

> **End of Specification**
>
> This document is designed to be consumed by Claude Code as a complete build reference.
> Every section is self-contained and cross-referenced.
> Follow the MVP roadmap phases in order.
> Prioritize working software over documentation.
> Ship incrementally — each week should produce a demoable state.
