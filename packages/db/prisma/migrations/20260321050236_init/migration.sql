-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'PLATFORM_OPS', 'HOTEL_ADMIN', 'HOTEL_MANAGER', 'FRONT_DESK', 'RESERVATIONS_MANAGER', 'EVENTS_MANAGER', 'BANQUET_MANAGER', 'FB_MANAGER', 'GUEST_RELATIONS', 'OPERATIONS_MANAGER', 'FINANCE_APPROVER', 'GUEST');

-- CreateEnum
CREATE TYPE "HotelStatus" AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('ROOM', 'EVENT', 'DINING', 'NIGHTLIFE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MEETING', 'CONFERENCE', 'WORKSHOP', 'WEDDING', 'GALA_DINNER', 'LAUNCH_EVENT', 'PRIVATE_EVENT', 'CORPORATE_RETREAT', 'BIRTHDAY', 'OTHER');

-- CreateEnum
CREATE TYPE "EventRequestStatus" AS ENUM ('INQUIRY', 'PROPOSAL_SENT', 'NEGOTIATING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BEOStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'FINALIZED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VenueLayoutType" AS ENUM ('THEATER', 'CLASSROOM', 'U_SHAPE', 'BOARDROOM', 'BANQUET_ROUND', 'COCKTAIL', 'HOLLOW_SQUARE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CaseSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'AWAITING_HOTEL', 'AWAITING_GUEST', 'AWAITING_APPROVAL', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "CaseCategory" AS ENUM ('ROOM_CLEANLINESS', 'ROOM_NOT_READY', 'NOISE_COMPLAINT', 'WIFI_ISSUE', 'AC_BROKEN', 'WRONG_ROOM', 'BILLING_ISSUE', 'STAFF_BEHAVIOR', 'SAFETY_CONCERN', 'FOOD_QUALITY', 'EVENT_ISSUE', 'AMENITY_MISSING', 'CHECK_IN_DELAY', 'OTHER');

-- CreateEnum
CREATE TYPE "CompensationType" AS ENUM ('ROOM_UPGRADE', 'LATE_CHECKOUT', 'EARLY_CHECKIN', 'BREAKFAST_INCLUDED', 'PARTIAL_REFUND', 'FULL_REFUND', 'SERVICE_VOUCHER', 'AMENITY_CREDIT', 'EVENT_DISCOUNT', 'FREE_NIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "CompensationStatus" AS ENUM ('PROPOSED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('MATCHMAKING', 'TRUTH_TRANSPARENCY', 'BOOKING_INTEGRITY', 'PRE_STAY_CONCIERGE', 'STAY_SUPPORT', 'RECOVERY_COMPENSATION', 'EVENT_MATCH', 'VENUE_CAPACITY', 'BEO_RUNOFSHOW', 'FB_PLANNING', 'NIGHTLIFE_EXPERIENCE', 'INSIGHT_HOTEL_SUCCESS');

-- CreateEnum
CREATE TYPE "ReviewModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DiningType" AS ENUM ('RESTAURANT', 'ROOM_SERVICE', 'BRUNCH', 'ROOFTOP', 'PRIVATE_DINING', 'GROUP_DINING', 'BUFFET');

-- CreateEnum
CREATE TYPE "NightExperienceType" AS ENUM ('DJ_NIGHT', 'LIVE_MUSIC', 'VIP_LOUNGE', 'COCKTAIL_PARTY', 'THEMED_NIGHT', 'POOL_PARTY', 'COMEDY_SHOW', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "billing_plan" TEXT NOT NULL DEFAULT 'starter',
    "status" "TenantStatus" NOT NULL DEFAULT 'ONBOARDING',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password_hash" TEXT,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "hotel_id" UUID,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_policies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "policy_key" TEXT NOT NULL,
    "policy_value" JSONB NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "star_rating" INTEGER,
    "address" JSONB NOT NULL,
    "contact_info" JSONB NOT NULL DEFAULT '{}',
    "policies" JSONB NOT NULL DEFAULT '{}',
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "verified_fields" JSONB NOT NULL DEFAULT '{}',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "noise_notes" TEXT,
    "wifi_quality" TEXT,
    "status" "HotelStatus" NOT NULL DEFAULT 'DRAFT',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hotel_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL,
    "bed_type" TEXT NOT NULL,
    "size_sqm" DECIMAL(6,2),
    "floor" TEXT,
    "photos" JSONB NOT NULL DEFAULT '[]',
    "features" JSONB NOT NULL DEFAULT '[]',
    "noise_notes" TEXT,
    "accessibility_features" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_inventory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_type_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_count" INTEGER NOT NULL,
    "available_count" INTEGER NOT NULL,
    "blocked_count" INTEGER NOT NULL DEFAULT 0,
    "price_per_night" INTEGER NOT NULL,
    "min_stay" INTEGER NOT NULL DEFAULT 1,
    "restrictions" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "booking_type" "BookingType" NOT NULL,
    "booking_ref" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "check_in" DATE,
    "check_out" DATE,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "child_count" INTEGER NOT NULL DEFAULT 0,
    "subtotal_cents" INTEGER NOT NULL,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "fees_cents" INTEGER NOT NULL DEFAULT 0,
    "discount_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "special_requests" TEXT,
    "internal_notes" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "checked_in_at" TIMESTAMP(3),
    "checked_out_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "item_type" TEXT NOT NULL,
    "reference_id" UUID,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_cents" INTEGER NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hotel_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "floor_level" TEXT,
    "size_square_meters" DECIMAL(8,2),
    "capacities" JSONB NOT NULL DEFAULT '{}',
    "default_layout" "VenueLayoutType",
    "available_layouts" JSONB NOT NULL DEFAULT '[]',
    "features" JSONB NOT NULL DEFAULT '[]',
    "av_equipment" JSONB NOT NULL DEFAULT '[]',
    "catering_options" JSONB NOT NULL DEFAULT '[]',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "rate_per_hour" INTEGER,
    "rate_per_day" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "event_type" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "guest_count" INTEGER NOT NULL,
    "budget_cents" INTEGER,
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "status" "EventRequestStatus" NOT NULL DEFAULT 'INQUIRY',
    "assigned_manager_id" UUID,
    "proposal_sent_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_request_id" UUID NOT NULL,
    "venue_id" UUID NOT NULL,
    "layout" "VenueLayoutType" NOT NULL,
    "setup_time" TEXT,
    "breakdown_time" TEXT,
    "contracted_pax" INTEGER NOT NULL,
    "guaranteed_pax" INTEGER,
    "total_cents" INTEGER NOT NULL,
    "deposit_cents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "event_request_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "BEOStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "run_of_show" JSONB NOT NULL DEFAULT '[]',
    "fb_requirements" JSONB NOT NULL DEFAULT '{}',
    "staffing_plan" JSONB NOT NULL DEFAULT '[]',
    "agent_notes" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dining_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hotel_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "dining_type" "DiningType" NOT NULL,
    "description" TEXT,
    "cuisine" JSONB NOT NULL DEFAULT '[]',
    "open_hours" JSONB NOT NULL DEFAULT '{}',
    "capacity" INTEGER,
    "price_range" TEXT,
    "menu_highlights" JSONB NOT NULL DEFAULT '[]',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dining_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dining_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "dining_experience_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "party_size" INTEGER NOT NULL,
    "special_requests" TEXT,
    "dietary_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dining_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "night_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hotel_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "experience_type" "NightExperienceType" NOT NULL,
    "description" TEXT,
    "date" DATE,
    "start_time" TEXT,
    "end_time" TEXT,
    "price_cents" INTEGER,
    "capacity" INTEGER,
    "min_age" INTEGER,
    "dress_code" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "photos" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "night_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "night_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "night_experience_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "party_size" INTEGER NOT NULL,
    "table_pref" TEXT,
    "special_requests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "night_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "booking_id" UUID,
    "case_ref" TEXT NOT NULL,
    "category" "CaseCategory" NOT NULL,
    "severity" "CaseSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assigned_to_id" UUID,
    "room_number" TEXT,
    "response_deadline" TIMESTAMP(3),
    "resolution_deadline" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "guest_rating" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_timeline" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "case_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_id" UUID,
    "actor_name" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compensation_actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "compensation_type" "CompensationType" NOT NULL,
    "description" TEXT NOT NULL,
    "value_cents" INTEGER,
    "status" "CompensationStatus" NOT NULL DEFAULT 'PROPOSED',
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "approval_id" UUID,
    "executed_at" TIMESTAMP(3),
    "reasoning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compensation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "request_type" TEXT NOT NULL,
    "reference_id" UUID NOT NULL,
    "reference_type" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approver_id" UUID,
    "approver_note" TEXT,
    "decided_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_execution_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "case_id" UUID,
    "session_id" UUID,
    "agent_type" "AgentType" NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "input_payload" JSONB NOT NULL,
    "output_payload" JSONB NOT NULL,
    "decision_summary" TEXT NOT NULL,
    "reasoning" TEXT,
    "confidence_score" DECIMAL(3,2),
    "duration_ms" INTEGER,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orchestration_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "trigger_ref" TEXT NOT NULL,
    "context" JSONB NOT NULL DEFAULT '{}',
    "agents_invoked" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orchestration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "booking_id" UUID,
    "overall_score" INTEGER NOT NULL,
    "scores" JSONB NOT NULL DEFAULT '{}',
    "title" TEXT,
    "text" TEXT,
    "sentiment" TEXT,
    "sentiment_score" DECIMAL(3,2),
    "moderation_status" "ReviewModerationStatus" NOT NULL DEFAULT 'PENDING',
    "hotel_response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_insights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "insight_type" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "is_actionable" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_hotel_id_idx" ON "users"("hotel_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_policies_tenant_id_policy_key_key" ON "tenant_policies"("tenant_id", "policy_key");

-- CreateIndex
CREATE INDEX "hotels_tenant_id_idx" ON "hotels"("tenant_id");

-- CreateIndex
CREATE INDEX "hotels_status_idx" ON "hotels"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_tenant_id_slug_key" ON "hotels"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "room_types_hotel_id_idx" ON "room_types"("hotel_id");

-- CreateIndex
CREATE INDEX "room_types_tenant_id_idx" ON "room_types"("tenant_id");

-- CreateIndex
CREATE INDEX "room_inventory_tenant_id_idx" ON "room_inventory"("tenant_id");

-- CreateIndex
CREATE INDEX "room_inventory_date_idx" ON "room_inventory"("date");

-- CreateIndex
CREATE INDEX "room_inventory_room_type_id_date_idx" ON "room_inventory"("room_type_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "room_inventory_room_type_id_date_key" ON "room_inventory"("room_type_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_ref_key" ON "bookings"("booking_ref");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_idx" ON "bookings"("tenant_id");

-- CreateIndex
CREATE INDEX "bookings_hotel_id_idx" ON "bookings"("hotel_id");

-- CreateIndex
CREATE INDEX "bookings_guest_id_idx" ON "bookings"("guest_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_booking_ref_idx" ON "bookings"("booking_ref");

-- CreateIndex
CREATE INDEX "bookings_check_in_check_out_idx" ON "bookings"("check_in", "check_out");

-- CreateIndex
CREATE INDEX "booking_items_booking_id_idx" ON "booking_items"("booking_id");

-- CreateIndex
CREATE INDEX "booking_items_tenant_id_idx" ON "booking_items"("tenant_id");

-- CreateIndex
CREATE INDEX "venues_hotel_id_idx" ON "venues"("hotel_id");

-- CreateIndex
CREATE INDEX "venues_tenant_id_idx" ON "venues"("tenant_id");

-- CreateIndex
CREATE INDEX "event_requests_tenant_id_idx" ON "event_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "event_requests_hotel_id_idx" ON "event_requests"("hotel_id");

-- CreateIndex
CREATE INDEX "event_requests_status_idx" ON "event_requests"("status");

-- CreateIndex
CREATE INDEX "event_requests_event_date_idx" ON "event_requests"("event_date");

-- CreateIndex
CREATE UNIQUE INDEX "event_bookings_event_request_id_key" ON "event_bookings"("event_request_id");

-- CreateIndex
CREATE INDEX "event_bookings_tenant_id_idx" ON "event_bookings"("tenant_id");

-- CreateIndex
CREATE INDEX "event_bookings_venue_id_idx" ON "event_bookings"("venue_id");

-- CreateIndex
CREATE UNIQUE INDEX "beos_event_request_id_key" ON "beos"("event_request_id");

-- CreateIndex
CREATE INDEX "beos_tenant_id_idx" ON "beos"("tenant_id");

-- CreateIndex
CREATE INDEX "beos_status_idx" ON "beos"("status");

-- CreateIndex
CREATE INDEX "dining_experiences_hotel_id_idx" ON "dining_experiences"("hotel_id");

-- CreateIndex
CREATE INDEX "dining_experiences_tenant_id_idx" ON "dining_experiences"("tenant_id");

-- CreateIndex
CREATE INDEX "dining_reservations_tenant_id_idx" ON "dining_reservations"("tenant_id");

-- CreateIndex
CREATE INDEX "dining_reservations_dining_experience_id_idx" ON "dining_reservations"("dining_experience_id");

-- CreateIndex
CREATE INDEX "dining_reservations_guest_id_idx" ON "dining_reservations"("guest_id");

-- CreateIndex
CREATE INDEX "night_experiences_hotel_id_idx" ON "night_experiences"("hotel_id");

-- CreateIndex
CREATE INDEX "night_experiences_tenant_id_idx" ON "night_experiences"("tenant_id");

-- CreateIndex
CREATE INDEX "night_reservations_tenant_id_idx" ON "night_reservations"("tenant_id");

-- CreateIndex
CREATE INDEX "night_reservations_night_experience_id_idx" ON "night_reservations"("night_experience_id");

-- CreateIndex
CREATE INDEX "night_reservations_guest_id_idx" ON "night_reservations"("guest_id");

-- CreateIndex
CREATE UNIQUE INDEX "support_cases_case_ref_key" ON "support_cases"("case_ref");

-- CreateIndex
CREATE INDEX "support_cases_tenant_id_idx" ON "support_cases"("tenant_id");

-- CreateIndex
CREATE INDEX "support_cases_hotel_id_idx" ON "support_cases"("hotel_id");

-- CreateIndex
CREATE INDEX "support_cases_guest_id_idx" ON "support_cases"("guest_id");

-- CreateIndex
CREATE INDEX "support_cases_status_idx" ON "support_cases"("status");

-- CreateIndex
CREATE INDEX "support_cases_severity_idx" ON "support_cases"("severity");

-- CreateIndex
CREATE INDEX "support_cases_case_ref_idx" ON "support_cases"("case_ref");

-- CreateIndex
CREATE INDEX "case_timeline_case_id_idx" ON "case_timeline"("case_id");

-- CreateIndex
CREATE INDEX "case_timeline_tenant_id_idx" ON "case_timeline"("tenant_id");

-- CreateIndex
CREATE INDEX "compensation_actions_tenant_id_idx" ON "compensation_actions"("tenant_id");

-- CreateIndex
CREATE INDEX "compensation_actions_case_id_idx" ON "compensation_actions"("case_id");

-- CreateIndex
CREATE INDEX "approval_requests_tenant_id_idx" ON "approval_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "approval_requests_status_idx" ON "approval_requests"("status");

-- CreateIndex
CREATE INDEX "agent_execution_logs_tenant_id_idx" ON "agent_execution_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "agent_execution_logs_case_id_idx" ON "agent_execution_logs"("case_id");

-- CreateIndex
CREATE INDEX "agent_execution_logs_agent_type_idx" ON "agent_execution_logs"("agent_type");

-- CreateIndex
CREATE INDEX "agent_execution_logs_created_at_idx" ON "agent_execution_logs"("created_at");

-- CreateIndex
CREATE INDEX "orchestration_sessions_tenant_id_idx" ON "orchestration_sessions"("tenant_id");

-- CreateIndex
CREATE INDEX "orchestration_sessions_trigger_type_trigger_ref_idx" ON "orchestration_sessions"("trigger_type", "trigger_ref");

-- CreateIndex
CREATE INDEX "reviews_tenant_id_idx" ON "reviews"("tenant_id");

-- CreateIndex
CREATE INDEX "reviews_hotel_id_idx" ON "reviews"("hotel_id");

-- CreateIndex
CREATE INDEX "reviews_overall_score_idx" ON "reviews"("overall_score");

-- CreateIndex
CREATE INDEX "hotel_insights_tenant_id_idx" ON "hotel_insights"("tenant_id");

-- CreateIndex
CREATE INDEX "hotel_insights_hotel_id_idx" ON "hotel_insights"("hotel_id");

-- CreateIndex
CREATE INDEX "hotel_insights_insight_type_idx" ON "hotel_insights"("insight_type");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_policies" ADD CONSTRAINT "tenant_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_inventory" ADD CONSTRAINT "room_inventory_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "room_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_requests" ADD CONSTRAINT "event_requests_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_requests" ADD CONSTRAINT "event_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_event_request_id_fkey" FOREIGN KEY ("event_request_id") REFERENCES "event_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beos" ADD CONSTRAINT "beos_event_request_id_fkey" FOREIGN KEY ("event_request_id") REFERENCES "event_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dining_experiences" ADD CONSTRAINT "dining_experiences_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dining_reservations" ADD CONSTRAINT "dining_reservations_dining_experience_id_fkey" FOREIGN KEY ("dining_experience_id") REFERENCES "dining_experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dining_reservations" ADD CONSTRAINT "dining_reservations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "night_experiences" ADD CONSTRAINT "night_experiences_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "night_reservations" ADD CONSTRAINT "night_reservations_night_experience_id_fkey" FOREIGN KEY ("night_experience_id") REFERENCES "night_experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "night_reservations" ADD CONSTRAINT "night_reservations_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_cases" ADD CONSTRAINT "support_cases_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_cases" ADD CONSTRAINT "support_cases_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_cases" ADD CONSTRAINT "support_cases_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_cases" ADD CONSTRAINT "support_cases_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_timeline" ADD CONSTRAINT "case_timeline_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_actions" ADD CONSTRAINT "compensation_actions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compensation_actions" ADD CONSTRAINT "compensation_actions_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "approval_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_execution_logs" ADD CONSTRAINT "agent_execution_logs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_execution_logs" ADD CONSTRAINT "agent_execution_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "orchestration_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_insights" ADD CONSTRAINT "hotel_insights_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
