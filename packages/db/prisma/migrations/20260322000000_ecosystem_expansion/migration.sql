-- Migration: Hospitality Ecosystem Expansion
-- Modules: Guest In-Stay, Staff Reputation, Jobs & Talent, Incidents, Lost & Found

-- ── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE "GuestStayStatus" AS ENUM ('ACTIVE', 'CHECKED_OUT', 'CANCELLED');
CREATE TYPE "MessageCategory" AS ENUM ('WELCOME', 'WIFI', 'EVENT', 'DINING', 'UPSELL', 'ALERT', 'SERVICE_UPDATE', 'CHECKOUT_REMINDER');
CREATE TYPE "MenuType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'ALL_DAY', 'ROOM_SERVICE', 'POOLSIDE', 'BAR', 'BRUNCH', 'TASTING', 'SPECIAL');
CREATE TYPE "ServiceRequestType" AS ENUM ('EXTRA_TOWELS', 'HOUSEKEEPING', 'ROOM_CLEANING', 'MINIBAR_REFILL', 'AC_ISSUE', 'TV_INTERNET_ISSUE', 'LUGGAGE_ASSISTANCE', 'WAKE_UP_CALL', 'BABY_CRIB', 'MAINTENANCE', 'OTHER');
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ServicePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "IncidentCategory" AS ENUM ('ROOM_ISSUE', 'SERVICE_FAILURE', 'STAFF_COMPLAINT', 'FACILITY_ISSUE', 'BILLING_DISPUTE', 'NOISE_COMPLAINT', 'SAFETY_CONCERN', 'FOOD_QUALITY', 'OTHER');
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED');
CREATE TYPE "RecoveryOfferType" AS ENUM ('DISCOUNT', 'AMENITY_PASS', 'DINING_CREDIT', 'LATE_CHECKOUT', 'REFUND_NOTE', 'VIP_CREDIT');
CREATE TYPE "RecoveryOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');
CREATE TYPE "LostFoundStatus" AS ENUM ('STORED', 'CLAIMED', 'SHIPPED', 'RETURNED', 'DONATED', 'DISCARDED');
CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'MATCHED', 'COLLECTING', 'SHIPPED', 'RESOLVED', 'CLOSED');
CREATE TYPE "StaffDepartment" AS ENUM ('FRONT_DESK', 'CONCIERGE', 'HOUSEKEEPING', 'DINING', 'ROOM_SERVICE', 'MANAGEMENT', 'MAINTENANCE', 'SPA', 'SECURITY', 'OTHER');
CREATE TYPE "StaffReviewType" AS ENUM ('FRONT_DESK', 'CONCIERGE', 'HOUSEKEEPING', 'DINING', 'ROOM_SERVICE', 'MANAGEMENT');
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');
CREATE TYPE "ConductNoteType" AS ENUM ('RESPECTFUL', 'HELPFUL', 'COMPLAINT', 'DAMAGE_RISK', 'ABUSE', 'SAFETY_ISSUE', 'VIP');
CREATE TYPE "NoteSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "TipType" AS ENUM ('POST_SERVICE', 'POST_STAY', 'THANK_YOU');
CREATE TYPE "TipStatus" AS ENUM ('PENDING', 'SETTLED', 'REFUNDED', 'CANCELLED');
CREATE TYPE "BadgeType" AS ENUM ('GUEST_FAVORITE', 'TOP_CONCIERGE', 'FRONT_DESK_STAR', 'HOUSEKEEPING_APPRECIATED', 'SERVICE_EXCELLENCE', 'FAST_RESPONDER');
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'SEASONAL', 'INTERNSHIP', 'TRAINEE', 'TEMPORARY');
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'MANAGEMENT');
CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'FILLED');
CREATE TYPE "ApplicationType" AS ENUM ('INTERNAL_STAFF', 'OPEN_MARKET', 'INTERNSHIP');
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED');
CREATE TYPE "CareerVisibility" AS ENUM ('PRIVATE', 'PLATFORM_ONLY', 'PUBLIC');

-- ── GUEST STAY SESSIONS ──────────────────────────────────────────────────────

CREATE TABLE "guest_stay_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "room_number" TEXT,
    "status" "GuestStayStatus" NOT NULL DEFAULT 'ACTIVE',
    "welcome_sent_at" TIMESTAMP(3),
    "wifi_sent_at" TIMESTAMP(3),
    "menus_sent_at" TIMESTAMP(3),
    "support_info_sent_at" TIMESTAMP(3),
    "check_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guest_stay_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "guest_stay_sessions_tenant_id_idx" ON "guest_stay_sessions"("tenant_id");
CREATE INDEX "guest_stay_sessions_hotel_id_idx" ON "guest_stay_sessions"("hotel_id");
CREATE INDEX "guest_stay_sessions_booking_id_idx" ON "guest_stay_sessions"("booking_id");
CREATE INDEX "guest_stay_sessions_guest_id_idx" ON "guest_stay_sessions"("guest_id");
CREATE INDEX "guest_stay_sessions_status_idx" ON "guest_stay_sessions"("status");

-- ── HOTEL WIFI CREDENTIALS ───────────────────────────────────────────────────

CREATE TABLE "hotel_wifi_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "network_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "zone" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_wifi_credentials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hotel_wifi_credentials_tenant_id_idx" ON "hotel_wifi_credentials"("tenant_id");
CREATE INDEX "hotel_wifi_credentials_hotel_id_idx" ON "hotel_wifi_credentials"("hotel_id");

-- ── IN-STAY MESSAGES ─────────────────────────────────────────────────────────

CREATE TABLE "in_stay_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "stay_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "category" "MessageCategory" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "channel" TEXT,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "in_stay_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "in_stay_messages_tenant_id_idx" ON "in_stay_messages"("tenant_id");
CREATE INDEX "in_stay_messages_stay_id_idx" ON "in_stay_messages"("stay_id");
CREATE INDEX "in_stay_messages_guest_id_idx" ON "in_stay_messages"("guest_id");

-- ── HOTEL VENUE MENUS ────────────────────────────────────────────────────────

CREATE TABLE "hotel_venue_menus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "venue_ref" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "menu_type" "MenuType" NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_venue_menus_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hotel_venue_menus_tenant_id_idx" ON "hotel_venue_menus"("tenant_id");
CREATE INDEX "hotel_venue_menus_hotel_id_idx" ON "hotel_venue_menus"("hotel_id");
CREATE INDEX "hotel_venue_menus_menu_type_idx" ON "hotel_venue_menus"("menu_type");

-- ── GUEST SERVICE REQUESTS ───────────────────────────────────────────────────

CREATE TABLE "guest_service_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "stay_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "request_ref" TEXT NOT NULL,
    "request_type" "ServiceRequestType" NOT NULL,
    "description" TEXT,
    "room_number" TEXT,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ServicePriority" NOT NULL DEFAULT 'NORMAL',
    "scheduled_for" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guest_service_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "guest_service_requests_request_ref_key" ON "guest_service_requests"("request_ref");
CREATE INDEX "guest_service_requests_tenant_id_idx" ON "guest_service_requests"("tenant_id");
CREATE INDEX "guest_service_requests_hotel_id_idx" ON "guest_service_requests"("hotel_id");
CREATE INDEX "guest_service_requests_stay_id_idx" ON "guest_service_requests"("stay_id");
CREATE INDEX "guest_service_requests_status_idx" ON "guest_service_requests"("status");

-- ── SERVICE TASK ASSIGNMENTS ─────────────────────────────────────────────────

CREATE TABLE "service_task_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "assigned_to" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "note" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_task_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "service_task_assignments_tenant_id_idx" ON "service_task_assignments"("tenant_id");
CREATE INDEX "service_task_assignments_request_id_idx" ON "service_task_assignments"("request_id");

-- ── TASK COMPLETION LOGS ─────────────────────────────────────────────────────

CREATE TABLE "task_completion_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "completed_by" UUID NOT NULL,
    "note" TEXT,
    "guest_rating" INTEGER,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_completion_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "task_completion_logs_tenant_id_idx" ON "task_completion_logs"("tenant_id");
CREATE INDEX "task_completion_logs_request_id_idx" ON "task_completion_logs"("request_id");

-- ── SERVICE INCIDENTS ────────────────────────────────────────────────────────

CREATE TABLE "service_incidents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "guest_id" UUID,
    "booking_id" UUID,
    "stay_id" UUID,
    "incident_ref" TEXT NOT NULL,
    "category" "IncidentCategory" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_team" TEXT,
    "assigned_to_id" UUID,
    "sla_hours" INTEGER,
    "due_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "service_incidents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_incidents_incident_ref_key" ON "service_incidents"("incident_ref");
CREATE INDEX "service_incidents_tenant_id_idx" ON "service_incidents"("tenant_id");
CREATE INDEX "service_incidents_hotel_id_idx" ON "service_incidents"("hotel_id");
CREATE INDEX "service_incidents_status_idx" ON "service_incidents"("status");
CREATE INDEX "service_incidents_severity_idx" ON "service_incidents"("severity");

-- ── SERVICE RESOLUTIONS ──────────────────────────────────────────────────────

CREATE TABLE "service_resolutions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "resolved_by" UUID NOT NULL,
    "resolution" TEXT NOT NULL,
    "guest_confirmed" BOOLEAN,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_resolutions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "service_resolutions_tenant_id_idx" ON "service_resolutions"("tenant_id");
CREATE INDEX "service_resolutions_incident_id_idx" ON "service_resolutions"("incident_id");

-- ── RECOVERY OFFERS ──────────────────────────────────────────────────────────

CREATE TABLE "recovery_offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "offer_type" "RecoveryOfferType" NOT NULL,
    "description" TEXT NOT NULL,
    "value_cents" INTEGER,
    "status" "RecoveryOfferStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "recovery_offers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recovery_offers_tenant_id_idx" ON "recovery_offers"("tenant_id");
CREATE INDEX "recovery_offers_incident_id_idx" ON "recovery_offers"("incident_id");

-- ── RECOVERY ACTION LOGS ─────────────────────────────────────────────────────

CREATE TABLE "recovery_action_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recovery_action_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recovery_action_logs_tenant_id_idx" ON "recovery_action_logs"("tenant_id");
CREATE INDEX "recovery_action_logs_incident_id_idx" ON "recovery_action_logs"("incident_id");

-- ── LOST & FOUND ITEMS ───────────────────────────────────────────────────────

CREATE TABLE "lost_found_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "item_ref" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "found_at" TIMESTAMP(3) NOT NULL,
    "found_location" TEXT,
    "storage_location" TEXT,
    "status" "LostFoundStatus" NOT NULL DEFAULT 'STORED',
    "logged_by_id" UUID NOT NULL,
    "photo" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lost_found_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lost_found_items_item_ref_key" ON "lost_found_items"("item_ref");
CREATE INDEX "lost_found_items_tenant_id_idx" ON "lost_found_items"("tenant_id");
CREATE INDEX "lost_found_items_hotel_id_idx" ON "lost_found_items"("hotel_id");
CREATE INDEX "lost_found_items_status_idx" ON "lost_found_items"("status");

-- ── LOST & FOUND CLAIMS ──────────────────────────────────────────────────────

CREATE TABLE "lost_found_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "item_id" UUID,
    "guest_id" UUID NOT NULL,
    "booking_id" UUID,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "lost_at" TIMESTAMP(3),
    "lost_location" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lost_found_claims_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lost_found_claims_tenant_id_idx" ON "lost_found_claims"("tenant_id");
CREATE INDEX "lost_found_claims_guest_id_idx" ON "lost_found_claims"("guest_id");
CREATE INDEX "lost_found_claims_status_idx" ON "lost_found_claims"("status");

-- ── STAFF PROFILES ───────────────────────────────────────────────────────────

CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "user_id" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" "StaffDepartment" NOT NULL,
    "languages" TEXT[] NOT NULL DEFAULT '{}',
    "years_experience" INTEGER,
    "bio" TEXT,
    "avg_rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tip_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staff_profiles_slug_key" ON "staff_profiles"("slug");
CREATE UNIQUE INDEX "staff_profiles_user_id_key" ON "staff_profiles"("user_id");
CREATE INDEX "staff_profiles_tenant_id_idx" ON "staff_profiles"("tenant_id");
CREATE INDEX "staff_profiles_hotel_id_idx" ON "staff_profiles"("hotel_id");
CREATE INDEX "staff_profiles_department_idx" ON "staff_profiles"("department");

-- ── STAFF GUEST REVIEWS ──────────────────────────────────────────────────────

CREATE TABLE "staff_guest_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "staff_profile_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "booking_id" UUID,
    "review_type" "StaffReviewType" NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "moderation_status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderated_by" UUID,
    "moderated_at" TIMESTAMP(3),
    "is_gratitude_wall" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_guest_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_guest_reviews_tenant_id_idx" ON "staff_guest_reviews"("tenant_id");
CREATE INDEX "staff_guest_reviews_staff_profile_id_idx" ON "staff_guest_reviews"("staff_profile_id");
CREATE INDEX "staff_guest_reviews_guest_id_idx" ON "staff_guest_reviews"("guest_id");
CREATE INDEX "staff_guest_reviews_moderation_status_idx" ON "staff_guest_reviews"("moderation_status");

-- ── STAFF GUEST CONDUCT NOTES ────────────────────────────────────────────────

CREATE TABLE "staff_guest_conduct_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "staff_profile_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "booking_id" UUID,
    "note_type" "ConductNoteType" NOT NULL,
    "severity" "NoteSeverity" NOT NULL DEFAULT 'LOW',
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "staff_guest_conduct_notes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_guest_conduct_notes_tenant_id_idx" ON "staff_guest_conduct_notes"("tenant_id");
CREATE INDEX "staff_guest_conduct_notes_staff_profile_id_idx" ON "staff_guest_conduct_notes"("staff_profile_id");
CREATE INDEX "staff_guest_conduct_notes_guest_id_idx" ON "staff_guest_conduct_notes"("guest_id");

-- ── STAFF TIPS ───────────────────────────────────────────────────────────────

CREATE TABLE "staff_tips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "staff_profile_id" UUID NOT NULL,
    "guest_id" UUID NOT NULL,
    "booking_id" UUID,
    "amount_cents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "tip_type" "TipType" NOT NULL DEFAULT 'POST_STAY',
    "status" "TipStatus" NOT NULL DEFAULT 'PENDING',
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_tips_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_tips_tenant_id_idx" ON "staff_tips"("tenant_id");
CREATE INDEX "staff_tips_staff_profile_id_idx" ON "staff_tips"("staff_profile_id");
CREATE INDEX "staff_tips_guest_id_idx" ON "staff_tips"("guest_id");

-- ── STAFF BADGES ─────────────────────────────────────────────────────────────

CREATE TABLE "staff_badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "staff_profile_id" UUID NOT NULL,
    "badge_type" "BadgeType" NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    CONSTRAINT "staff_badges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_badges_tenant_id_idx" ON "staff_badges"("tenant_id");
CREATE INDEX "staff_badges_staff_profile_id_idx" ON "staff_badges"("staff_profile_id");

-- ── STAFF RECOGNITION LOGS ───────────────────────────────────────────────────

CREATE TABLE "staff_recognition_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "staff_profile_id" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "staff_recognition_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "staff_recognition_logs_tenant_id_idx" ON "staff_recognition_logs"("tenant_id");
CREATE INDEX "staff_recognition_logs_staff_profile_id_idx" ON "staff_recognition_logs"("staff_profile_id");

-- ── GRATITUDE WALL ENTRIES ───────────────────────────────────────────────────

CREATE TABLE "gratitude_wall_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "staff_profile_id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "featured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gratitude_wall_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gratitude_wall_entries_review_id_key" ON "gratitude_wall_entries"("review_id");
CREATE INDEX "gratitude_wall_entries_tenant_id_idx" ON "gratitude_wall_entries"("tenant_id");
CREATE INDEX "gratitude_wall_entries_hotel_id_idx" ON "gratitude_wall_entries"("hotel_id");

-- ── JOB POSTINGS ─────────────────────────────────────────────────────────────

CREATE TABLE "job_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" "StaffDepartment" NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "salary_min_cents" INTEGER,
    "salary_max_cents" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "languages" TEXT[] NOT NULL DEFAULT '{}',
    "experience_level" "ExperienceLevel" NOT NULL DEFAULT 'ENTRY',
    "accommodation_included" BOOLEAN NOT NULL DEFAULT false,
    "meals_included" BOOLEAN NOT NULL DEFAULT false,
    "visa_support" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "JobPostingStatus" NOT NULL DEFAULT 'DRAFT',
    "deadline" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_postings_slug_key" ON "job_postings"("slug");
CREATE INDEX "job_postings_tenant_id_idx" ON "job_postings"("tenant_id");
CREATE INDEX "job_postings_hotel_id_idx" ON "job_postings"("hotel_id");
CREATE INDEX "job_postings_status_idx" ON "job_postings"("status");
CREATE INDEX "job_postings_city_idx" ON "job_postings"("city");
CREATE INDEX "job_postings_country_idx" ON "job_postings"("country");
CREATE INDEX "job_postings_employment_type_idx" ON "job_postings"("employment_type");

-- ── JOB POSTING TAGS / REQUIREMENTS / BENEFITS ───────────────────────────────

CREATE TABLE "job_posting_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "posting_id" UUID NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "job_posting_tags_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_posting_tags_posting_id_idx" ON "job_posting_tags"("posting_id");

CREATE TABLE "job_posting_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "posting_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "job_posting_requirements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_posting_requirements_posting_id_idx" ON "job_posting_requirements"("posting_id");

CREATE TABLE "job_posting_benefits" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "posting_id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "job_posting_benefits_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_posting_benefits_posting_id_idx" ON "job_posting_benefits"("posting_id");

-- ── JOB APPLICATIONS ─────────────────────────────────────────────────────────

CREATE TABLE "job_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "posting_id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "app_type" "ApplicationType" NOT NULL DEFAULT 'OPEN_MARKET',
    "cover_letter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "job_applications_posting_id_applicant_id_key" ON "job_applications"("posting_id", "applicant_id");
CREATE INDEX "job_applications_tenant_id_idx" ON "job_applications"("tenant_id");
CREATE INDEX "job_applications_posting_id_idx" ON "job_applications"("posting_id");
CREATE INDEX "job_applications_applicant_id_idx" ON "job_applications"("applicant_id");
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- ── JOB INTERVIEWS ───────────────────────────────────────────────────────────

CREATE TABLE "job_interviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'video',
    "interviewer_ids" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_interviews_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_interviews_tenant_id_idx" ON "job_interviews"("tenant_id");
CREATE INDEX "job_interviews_application_id_idx" ON "job_interviews"("application_id");

-- ── APPLICATION STATUS HISTORY ───────────────────────────────────────────────

CREATE TABLE "application_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "from_status" "ApplicationStatus" NOT NULL,
    "to_status" "ApplicationStatus" NOT NULL,
    "changed_by" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "application_status_history_tenant_id_idx" ON "application_status_history"("tenant_id");
CREATE INDEX "application_status_history_application_id_idx" ON "application_status_history"("application_id");

-- ── RECRUITER NOTES ──────────────────────────────────────────────────────────

CREATE TABLE "recruiter_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recruiter_notes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "recruiter_notes_tenant_id_idx" ON "recruiter_notes"("tenant_id");
CREATE INDEX "recruiter_notes_application_id_idx" ON "recruiter_notes"("application_id");

-- ── CAREER PASSPORTS ─────────────────────────────────────────────────────────

CREATE TABLE "career_passports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "headline" TEXT,
    "summary" TEXT,
    "visibility" "CareerVisibility" NOT NULL DEFAULT 'PRIVATE',
    "languages" TEXT[] NOT NULL DEFAULT '{}',
    "preferred_cities" TEXT[] NOT NULL DEFAULT '{}',
    "open_to_relocation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "career_passports_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "career_passports_user_id_key" ON "career_passports"("user_id");
CREATE INDEX "career_passports_tenant_id_idx" ON "career_passports"("tenant_id");
CREATE INDEX "career_passports_visibility_idx" ON "career_passports"("visibility");

CREATE TABLE "career_experiences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "passport_id" UUID NOT NULL,
    "hotel_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" "StaffDepartment" NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "career_experiences_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "career_experiences_passport_id_idx" ON "career_experiences"("passport_id");

CREATE TABLE "career_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "passport_id" UUID NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT,
    CONSTRAINT "career_skills_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "career_skills_passport_id_idx" ON "career_skills"("passport_id");

CREATE TABLE "career_certifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "passport_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "issued_at" DATE,
    "expires_at" DATE,
    "credential_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "career_certifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "career_certifications_passport_id_idx" ON "career_certifications"("passport_id");

CREATE TABLE "career_references" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "passport_id" UUID NOT NULL,
    "referee_name" TEXT NOT NULL,
    "referee_role" TEXT,
    "referee_hotel" TEXT,
    "referee_email" TEXT,
    "relationship" TEXT,
    "note" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "career_references_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "career_references_passport_id_idx" ON "career_references"("passport_id");

-- ── TALENT PROFILES ──────────────────────────────────────────────────────────

CREATE TABLE "talent_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "summary" TEXT,
    "education" TEXT,
    "languages" TEXT[] NOT NULL DEFAULT '{}',
    "city_preferences" TEXT[] NOT NULL DEFAULT '{}',
    "needs_accommodation" BOOLEAN NOT NULL DEFAULT false,
    "willing_to_relocate" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "talent_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "talent_profiles_user_id_key" ON "talent_profiles"("user_id");
CREATE INDEX "talent_profiles_tenant_id_idx" ON "talent_profiles"("tenant_id");

CREATE TABLE "talent_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT,
    CONSTRAINT "talent_skills_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "talent_skills_profile_id_idx" ON "talent_skills"("profile_id");

CREATE TABLE "talent_interest_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "talent_interest_tags_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "talent_interest_tags_profile_id_idx" ON "talent_interest_tags"("profile_id");

CREATE TABLE "talent_availability_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "note" TEXT,
    CONSTRAINT "talent_availability_windows_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "talent_availability_windows_profile_id_idx" ON "talent_availability_windows"("profile_id");

CREATE TABLE "talent_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "posting_id" UUID NOT NULL,
    "cover_letter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "talent_applications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "talent_applications_tenant_id_idx" ON "talent_applications"("tenant_id");
CREATE INDEX "talent_applications_profile_id_idx" ON "talent_applications"("profile_id");
CREATE INDEX "talent_applications_posting_id_idx" ON "talent_applications"("posting_id");

-- ── LEARNING & CERTIFICATION ─────────────────────────────────────────────────

CREATE TABLE "learning_tracks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" "StaffDepartment",
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "learning_tracks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "learning_tracks_slug_key" ON "learning_tracks"("slug");
CREATE INDEX "learning_tracks_tenant_id_idx" ON "learning_tracks"("tenant_id");

CREATE TABLE "course_modules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "track_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "duration_min" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "course_modules_track_id_idx" ON "course_modules"("track_id");

CREATE TABLE "staff_course_enrollments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_course_enrollments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "staff_course_enrollments_user_id_track_id_key" ON "staff_course_enrollments"("user_id", "track_id");
CREATE INDEX "staff_course_enrollments_tenant_id_idx" ON "staff_course_enrollments"("tenant_id");
CREATE INDEX "staff_course_enrollments_user_id_idx" ON "staff_course_enrollments"("user_id");

CREATE TABLE "staff_certificates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "cert_ref" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    CONSTRAINT "staff_certificates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "staff_certificates_cert_ref_key" ON "staff_certificates"("cert_ref");
CREATE INDEX "staff_certificates_tenant_id_idx" ON "staff_certificates"("tenant_id");
CREATE INDEX "staff_certificates_user_id_idx" ON "staff_certificates"("user_id");

-- ── SHIFT MARKETPLACE ────────────────────────────────────────────────────────

CREATE TABLE "shift_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "hotel_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "department" "StaffDepartment" NOT NULL,
    "shift_date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "rate_cents" INTEGER,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shift_postings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "shift_postings_tenant_id_idx" ON "shift_postings"("tenant_id");
CREATE INDEX "shift_postings_hotel_id_idx" ON "shift_postings"("hotel_id");
CREATE INDEX "shift_postings_shift_date_idx" ON "shift_postings"("shift_date");

CREATE TABLE "shift_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "claimant_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shift_claims_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "shift_claims_tenant_id_idx" ON "shift_claims"("tenant_id");
CREATE INDEX "shift_claims_shift_id_idx" ON "shift_claims"("shift_id");

-- ── FOREIGN KEYS ─────────────────────────────────────────────────────────────

ALTER TABLE "guest_stay_sessions" ADD CONSTRAINT "guest_stay_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guest_stay_sessions" ADD CONSTRAINT "guest_stay_sessions_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guest_stay_sessions" ADD CONSTRAINT "guest_stay_sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guest_stay_sessions" ADD CONSTRAINT "guest_stay_sessions_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hotel_wifi_credentials" ADD CONSTRAINT "hotel_wifi_credentials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hotel_wifi_credentials" ADD CONSTRAINT "hotel_wifi_credentials_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "in_stay_messages" ADD CONSTRAINT "in_stay_messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "in_stay_messages" ADD CONSTRAINT "in_stay_messages_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "guest_stay_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "hotel_venue_menus" ADD CONSTRAINT "hotel_venue_menus_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hotel_venue_menus" ADD CONSTRAINT "hotel_venue_menus_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "guest_service_requests" ADD CONSTRAINT "guest_service_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guest_service_requests" ADD CONSTRAINT "guest_service_requests_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guest_service_requests" ADD CONSTRAINT "guest_service_requests_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "guest_stay_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "service_task_assignments" ADD CONSTRAINT "service_task_assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_task_assignments" ADD CONSTRAINT "service_task_assignments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "guest_service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "task_completion_logs" ADD CONSTRAINT "task_completion_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "task_completion_logs" ADD CONSTRAINT "task_completion_logs_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "guest_service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "service_incidents" ADD CONSTRAINT "service_incidents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_incidents" ADD CONSTRAINT "service_incidents_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_incidents" ADD CONSTRAINT "service_incidents_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "guest_stay_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "service_resolutions" ADD CONSTRAINT "service_resolutions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_resolutions" ADD CONSTRAINT "service_resolutions_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "service_incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recovery_offers" ADD CONSTRAINT "recovery_offers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recovery_offers" ADD CONSTRAINT "recovery_offers_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "service_incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recovery_action_logs" ADD CONSTRAINT "recovery_action_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recovery_action_logs" ADD CONSTRAINT "recovery_action_logs_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "service_incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lost_found_claims" ADD CONSTRAINT "lost_found_claims_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lost_found_claims" ADD CONSTRAINT "lost_found_claims_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "lost_found_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "staff_guest_reviews" ADD CONSTRAINT "staff_guest_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_guest_reviews" ADD CONSTRAINT "staff_guest_reviews_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff_guest_conduct_notes" ADD CONSTRAINT "staff_guest_conduct_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_guest_conduct_notes" ADD CONSTRAINT "staff_guest_conduct_notes_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff_tips" ADD CONSTRAINT "staff_tips_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_tips" ADD CONSTRAINT "staff_tips_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff_badges" ADD CONSTRAINT "staff_badges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_badges" ADD CONSTRAINT "staff_badges_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff_recognition_logs" ADD CONSTRAINT "staff_recognition_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_recognition_logs" ADD CONSTRAINT "staff_recognition_logs_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gratitude_wall_entries" ADD CONSTRAINT "gratitude_wall_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gratitude_wall_entries" ADD CONSTRAINT "gratitude_wall_entries_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gratitude_wall_entries" ADD CONSTRAINT "gratitude_wall_entries_staff_profile_id_fkey" FOREIGN KEY ("staff_profile_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gratitude_wall_entries" ADD CONSTRAINT "gratitude_wall_entries_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "staff_guest_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "job_posting_tags" ADD CONSTRAINT "job_posting_tags_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_posting_requirements" ADD CONSTRAINT "job_posting_requirements_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_posting_benefits" ADD CONSTRAINT "job_posting_benefits_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_posting_id_fkey" FOREIGN KEY ("posting_id") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "job_interviews" ADD CONSTRAINT "job_interviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "job_interviews" ADD CONSTRAINT "job_interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recruiter_notes" ADD CONSTRAINT "recruiter_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recruiter_notes" ADD CONSTRAINT "recruiter_notes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "career_passports" ADD CONSTRAINT "career_passports_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "career_experiences" ADD CONSTRAINT "career_experiences_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "career_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "career_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_certifications" ADD CONSTRAINT "career_certifications_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "career_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_references" ADD CONSTRAINT "career_references_passport_id_fkey" FOREIGN KEY ("passport_id") REFERENCES "career_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "talent_profiles" ADD CONSTRAINT "talent_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "talent_skills" ADD CONSTRAINT "talent_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "talent_interest_tags" ADD CONSTRAINT "talent_interest_tags_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "talent_availability_windows" ADD CONSTRAINT "talent_availability_windows_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "talent_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "talent_applications" ADD CONSTRAINT "talent_applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "talent_applications" ADD CONSTRAINT "talent_applications_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "talent_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff_course_enrollments" ADD CONSTRAINT "staff_course_enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_course_enrollments" ADD CONSTRAINT "staff_course_enrollments_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "learning_tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_certificates" ADD CONSTRAINT "staff_certificates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "learning_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "shift_postings" ADD CONSTRAINT "shift_postings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shift_postings" ADD CONSTRAINT "shift_postings_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shift_claims" ADD CONSTRAINT "shift_claims_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shift_claims" ADD CONSTRAINT "shift_claims_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shift_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
