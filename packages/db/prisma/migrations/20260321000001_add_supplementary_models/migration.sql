-- Migration: Add supplementary models for VIP Usage, TrustedStay extras,
-- Mobility extras, City Guide extras, Bundle extras, and Upsell/CrossSell engine

-- ─── I. VIP USAGE LOG ─────────────────────────────────────────────────────

CREATE TABLE "vip_usage_logs" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"        UUID NOT NULL,
    "user_id"          UUID NOT NULL,
    "membership_id"    UUID NOT NULL,
    "benefit_id"       UUID,
    "benefit_code"     TEXT NOT NULL,
    "usage_context"    TEXT NOT NULL,
    "reference_id"     UUID,
    "reference_type"   TEXT,
    "credits_consumed" INTEGER NOT NULL DEFAULT 0,
    "metadata"         JSONB NOT NULL DEFAULT '{}',
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vip_usage_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "vip_usage_logs_tenant_id_user_id_created_at_idx" ON "vip_usage_logs"("tenant_id", "user_id", "created_at");
CREATE INDEX "vip_usage_logs_membership_id_idx" ON "vip_usage_logs"("membership_id");
CREATE INDEX "vip_usage_logs_benefit_code_idx" ON "vip_usage_logs"("benefit_code");
ALTER TABLE "vip_usage_logs" ADD CONSTRAINT "vip_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vip_usage_logs" ADD CONSTRAINT "vip_usage_logs_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "user_vip_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vip_usage_logs" ADD CONSTRAINT "vip_usage_logs_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "vip_benefits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── J. TRUSTED STAY SUPPLEMENTARY ───────────────────────────────────────

CREATE TABLE "trusted_stay_photos" (
    "id"                   UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID NOT NULL,
    "trusted_stay_unit_id" UUID NOT NULL,
    "url"                  TEXT NOT NULL,
    "caption"              TEXT,
    "sort_order"           INTEGER NOT NULL DEFAULT 0,
    "is_verified"          BOOLEAN NOT NULL DEFAULT false,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trusted_stay_photos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trusted_stay_photos_trusted_stay_unit_id_idx" ON "trusted_stay_photos"("trusted_stay_unit_id");
ALTER TABLE "trusted_stay_photos" ADD CONSTRAINT "trusted_stay_photos_trusted_stay_unit_id_fkey" FOREIGN KEY ("trusted_stay_unit_id") REFERENCES "trusted_stay_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "trusted_stay_policies" (
    "id"                   UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID NOT NULL,
    "trusted_stay_unit_id" UUID NOT NULL,
    "policy_type"          TEXT NOT NULL,
    "title"                TEXT NOT NULL,
    "body"                 TEXT NOT NULL,
    "rules"                JSONB NOT NULL DEFAULT '{}',
    "is_active"            BOOLEAN NOT NULL DEFAULT true,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trusted_stay_policies_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trusted_stay_policies_trusted_stay_unit_id_policy_type_idx" ON "trusted_stay_policies"("trusted_stay_unit_id", "policy_type");
ALTER TABLE "trusted_stay_policies" ADD CONSTRAINT "trusted_stay_policies_trusted_stay_unit_id_fkey" FOREIGN KEY ("trusted_stay_unit_id") REFERENCES "trusted_stay_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "trusted_stay_booking_links" (
    "id"                   UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID NOT NULL,
    "trusted_stay_unit_id" UUID NOT NULL,
    "booking_id"           UUID NOT NULL,
    "check_in"             DATE NOT NULL,
    "check_out"            DATE NOT NULL,
    "guest_count"          INTEGER NOT NULL DEFAULT 1,
    "total_cents"          INTEGER NOT NULL DEFAULT 0,
    "currency"             VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status"               TEXT NOT NULL DEFAULT 'confirmed',
    "notes"                TEXT,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trusted_stay_booking_links_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trusted_stay_booking_links_tenant_id_status_idx" ON "trusted_stay_booking_links"("tenant_id", "status");
CREATE INDEX "trusted_stay_booking_links_trusted_stay_unit_id_idx" ON "trusted_stay_booking_links"("trusted_stay_unit_id");
CREATE INDEX "trusted_stay_booking_links_booking_id_idx" ON "trusted_stay_booking_links"("booking_id");
ALTER TABLE "trusted_stay_booking_links" ADD CONSTRAINT "trusted_stay_booking_links_trusted_stay_unit_id_fkey" FOREIGN KEY ("trusted_stay_unit_id") REFERENCES "trusted_stay_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trusted_stay_booking_links" ADD CONSTRAINT "trusted_stay_booking_links_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── K. MOBILITY SUPPLEMENTARY ───────────────────────────────────────────

CREATE TABLE "mobility_vehicle_classes" (
    "id"                    UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"             UUID NOT NULL,
    "mobility_provider_id"  UUID NOT NULL,
    "code"                  TEXT NOT NULL,
    "name"                  TEXT NOT NULL,
    "description"           TEXT,
    "passenger_capacity"    INTEGER NOT NULL DEFAULT 4,
    "baggage_capacity"      INTEGER NOT NULL DEFAULT 2,
    "features"              JSONB NOT NULL DEFAULT '[]',
    "photos"                JSONB NOT NULL DEFAULT '[]',
    "base_price_cents"      INTEGER,
    "currency"              VARCHAR(3) NOT NULL DEFAULT 'USD',
    "is_active"             BOOLEAN NOT NULL DEFAULT true,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mobility_vehicle_classes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mobility_vehicle_classes_tenant_id_mobility_provider_id_code_key" UNIQUE ("tenant_id", "mobility_provider_id", "code")
);
CREATE INDEX "mobility_vehicle_classes_tenant_id_is_active_idx" ON "mobility_vehicle_classes"("tenant_id", "is_active");
ALTER TABLE "mobility_vehicle_classes" ADD CONSTRAINT "mobility_vehicle_classes_mobility_provider_id_fkey" FOREIGN KEY ("mobility_provider_id") REFERENCES "mobility_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "mobility_pricing_rules" (
    "id"                        UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"                 UUID NOT NULL,
    "mobility_product_id"       UUID,
    "mobility_vehicle_class_id" UUID,
    "rule_type"                 TEXT NOT NULL,
    "value"                     DECIMAL(10,4) NOT NULL,
    "currency"                  VARCHAR(3) NOT NULL DEFAULT 'USD',
    "min_distance_km"           DECIMAL(8,2),
    "max_distance_km"           DECIMAL(8,2),
    "valid_from"                TEXT,
    "valid_to"                  TEXT,
    "days_of_week"              JSONB NOT NULL DEFAULT '[]',
    "config"                    JSONB NOT NULL DEFAULT '{}',
    "is_active"                 BOOLEAN NOT NULL DEFAULT true,
    "created_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mobility_pricing_rules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "mobility_pricing_rules_tenant_id_rule_type_is_active_idx" ON "mobility_pricing_rules"("tenant_id", "rule_type", "is_active");
CREATE INDEX "mobility_pricing_rules_mobility_product_id_idx" ON "mobility_pricing_rules"("mobility_product_id");
ALTER TABLE "mobility_pricing_rules" ADD CONSTRAINT "mobility_pricing_rules_mobility_product_id_fkey" FOREIGN KEY ("mobility_product_id") REFERENCES "mobility_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "mobility_pricing_rules" ADD CONSTRAINT "mobility_pricing_rules_mobility_vehicle_class_id_fkey" FOREIGN KEY ("mobility_vehicle_class_id") REFERENCES "mobility_vehicle_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "airport_transfer_zones" (
    "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    UUID NOT NULL,
    "code"         TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "city_code"    TEXT NOT NULL,
    "airport_code" TEXT,
    "description"  TEXT,
    "geo_polygon"  JSONB,
    "is_active"    BOOLEAN NOT NULL DEFAULT true,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "airport_transfer_zones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "airport_transfer_zones_tenant_id_code_key" UNIQUE ("tenant_id", "code")
);
CREATE INDEX "airport_transfer_zones_tenant_id_city_code_is_active_idx" ON "airport_transfer_zones"("tenant_id", "city_code", "is_active");

CREATE TABLE "driver_service_areas" (
    "id"                   UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            UUID NOT NULL,
    "mobility_provider_id" UUID NOT NULL,
    "city_code"            TEXT NOT NULL,
    "area_name"            TEXT NOT NULL,
    "coverage_type"        TEXT NOT NULL DEFAULT 'full',
    "geo_polygon"          JSONB,
    "surcharge_percent"    INTEGER,
    "is_active"            BOOLEAN NOT NULL DEFAULT true,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    CONSTRAINT "driver_service_areas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "driver_service_areas_tenant_id_city_code_is_active_idx" ON "driver_service_areas"("tenant_id", "city_code", "is_active");
CREATE INDEX "driver_service_areas_mobility_provider_id_idx" ON "driver_service_areas"("mobility_provider_id");
ALTER TABLE "driver_service_areas" ADD CONSTRAINT "driver_service_areas_mobility_provider_id_fkey" FOREIGN KEY ("mobility_provider_id") REFERENCES "mobility_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── L. CITY GUIDE SUPPLEMENTARY ─────────────────────────────────────────

CREATE TABLE "local_experience_partners" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"           UUID NOT NULL,
    "local_experience_id" UUID NOT NULL,
    "name"                TEXT NOT NULL,
    "role"                TEXT,
    "contact_info"        JSONB NOT NULL DEFAULT '{}',
    "commission_percent"  INTEGER,
    "is_active"           BOOLEAN NOT NULL DEFAULT true,
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "local_experience_partners_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "local_experience_partners_tenant_id_local_experience_id_idx" ON "local_experience_partners"("tenant_id", "local_experience_id");
ALTER TABLE "local_experience_partners" ADD CONSTRAINT "local_experience_partners_local_experience_id_fkey" FOREIGN KEY ("local_experience_id") REFERENCES "local_experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "guide_persona_variants" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "city_guide_id"  UUID NOT NULL,
    "persona"        TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "intro"          TEXT,
    "highlights"     JSONB NOT NULL DEFAULT '[]',
    "suggested_route" JSONB,
    "is_active"      BOOLEAN NOT NULL DEFAULT true,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guide_persona_variants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "guide_persona_variants_city_guide_id_persona_key" UNIQUE ("city_guide_id", "persona")
);
CREATE INDEX "guide_persona_variants_tenant_id_city_guide_id_persona_idx" ON "guide_persona_variants"("tenant_id", "city_guide_id", "persona");
ALTER TABLE "guide_persona_variants" ADD CONSTRAINT "guide_persona_variants_city_guide_id_fkey" FOREIGN KEY ("city_guide_id") REFERENCES "city_guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── M. BUNDLE SUPPLEMENTARY ─────────────────────────────────────────────

CREATE TABLE "bundle_eligibility_rules" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "bundle_offer_id" UUID NOT NULL,
    "rule_type"      TEXT NOT NULL,
    "operator"       TEXT NOT NULL DEFAULT 'eq',
    "value"          TEXT NOT NULL,
    "is_required"    BOOLEAN NOT NULL DEFAULT true,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bundle_eligibility_rules_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "bundle_eligibility_rules_tenant_id_bundle_offer_id_idx" ON "bundle_eligibility_rules"("tenant_id", "bundle_offer_id");
ALTER TABLE "bundle_eligibility_rules" ADD CONSTRAINT "bundle_eligibility_rules_bundle_offer_id_fkey" FOREIGN KEY ("bundle_offer_id") REFERENCES "bundle_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "bundle_redemptions" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "bundle_offer_id" UUID NOT NULL,
    "booking_id"     UUID,
    "user_id"        UUID NOT NULL,
    "redeemed_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_cents"    INTEGER NOT NULL DEFAULT 0,
    "currency"       VARCHAR(3) NOT NULL DEFAULT 'USD',
    "metadata"       JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "bundle_redemptions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "bundle_redemptions_tenant_id_bundle_offer_id_idx" ON "bundle_redemptions"("tenant_id", "bundle_offer_id");
CREATE INDEX "bundle_redemptions_user_id_idx" ON "bundle_redemptions"("user_id");
CREATE INDEX "bundle_redemptions_booking_id_idx" ON "bundle_redemptions"("booking_id");
ALTER TABLE "bundle_redemptions" ADD CONSTRAINT "bundle_redemptions_bundle_offer_id_fkey" FOREIGN KEY ("bundle_offer_id") REFERENCES "bundle_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bundle_redemptions" ADD CONSTRAINT "bundle_redemptions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bundle_redemptions" ADD CONSTRAINT "bundle_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── N. UPSELL & CROSS-SELL ───────────────────────────────────────────────

CREATE TABLE "upsell_campaigns" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "hotel_id"       UUID,
    "code"           TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "trigger_type"   TEXT NOT NULL,
    "target_module"  TEXT NOT NULL,
    "target_id"      UUID,
    "display_config" JSONB NOT NULL DEFAULT '{}',
    "discount_cents" INTEGER,
    "discount_pct"   INTEGER,
    "priority"       INTEGER NOT NULL DEFAULT 0,
    "starts_at"      TIMESTAMP(3),
    "ends_at"        TIMESTAMP(3),
    "is_active"      BOOLEAN NOT NULL DEFAULT true,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "upsell_campaigns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "upsell_campaigns_tenant_id_code_key" UNIQUE ("tenant_id", "code")
);
CREATE INDEX "upsell_campaigns_tenant_id_trigger_type_is_active_idx" ON "upsell_campaigns"("tenant_id", "trigger_type", "is_active");
CREATE INDEX "upsell_campaigns_hotel_id_idx" ON "upsell_campaigns"("hotel_id");
ALTER TABLE "upsell_campaigns" ADD CONSTRAINT "upsell_campaigns_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "cross_sell_recommendation_logs" (
    "id"                  UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"           UUID NOT NULL,
    "user_id"             UUID NOT NULL,
    "booking_id"          UUID,
    "campaign_id"         UUID,
    "recommended_module"  TEXT NOT NULL,
    "recommended_id"      UUID,
    "score"               DECIMAL(5,4),
    "was_shown"           BOOLEAN NOT NULL DEFAULT false,
    "was_clicked"         BOOLEAN NOT NULL DEFAULT false,
    "was_converted"       BOOLEAN NOT NULL DEFAULT false,
    "context"             JSONB NOT NULL DEFAULT '{}',
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cross_sell_recommendation_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cross_sell_recommendation_logs_tenant_id_user_id_created_at_idx" ON "cross_sell_recommendation_logs"("tenant_id", "user_id", "created_at");
CREATE INDEX "cross_sell_recommendation_logs_booking_id_idx" ON "cross_sell_recommendation_logs"("booking_id");
CREATE INDEX "cross_sell_recommendation_logs_campaign_id_idx" ON "cross_sell_recommendation_logs"("campaign_id");
ALTER TABLE "cross_sell_recommendation_logs" ADD CONSTRAINT "cross_sell_recommendation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cross_sell_recommendation_logs" ADD CONSTRAINT "cross_sell_recommendation_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cross_sell_recommendation_logs" ADD CONSTRAINT "cross_sell_recommendation_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "upsell_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
