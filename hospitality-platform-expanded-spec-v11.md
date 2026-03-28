# Hospitality Experience Orchestration Platform — Claude Code Build Specification (Expanded)

**Document Version:** 8.0  
**Base Document:** Version 2.0 uploaded by user, expanded and integrated with all strategy decisions discussed in chat. fileciteturn1file0  
**Target Runtime:** Local Development  
**Architecture Pattern:** Domain-Driven Modular Monolith  
**Primary Stack:** TypeScript · Next.js 14 (App Router) · PostgreSQL · Prisma · tRPC · Redis · BullMQ

---

## Table of Contents

1. Executive Summary
2. Product Positioning & Business Model
3. Platform Actors, Surfaces, and Service Tiers
4. System Principles & Constraints
5. Technical Architecture
6. Expanded Domain Model & Bounded Contexts
7. Database Expansion Plan
8. API Design & Router Expansion
9. Agentic Manager Orchestration (Expanded)
10. Frontend Architecture & Information Architecture
11. Security, Multi-Tenancy, Trust, and Moderation
12. Revenue Model, Subscriptions, and White-Labeling
13. Roadmap & Phased Build Plan
14. Coding Standards & Conventions
15. File & Folder Structure (Expanded)
16. Claude Code Implementation Instructions
17. v4.0 Additions: Mobility Exchange, Essential Services, and Local Producer Marketplace
18. v5.0 Additions: Operating Backbone, Deep Mobility Exchange, Care Navigation, and Hospitality-Linked Local Commerce
19. v6.0 Additions: Competitive Scale Backbone, Inventory Intelligence, and Platform Moat
20. v7.0 Additions: Product Clarification, Inclusive Hosting, and Experience Moat
21. v8.0 Additions: Governance, Payments, Search Intelligence, and Resilience

---

# 1. Executive Summary

## 1.1 What This Is

A **multi-tenant hospitality operating and marketplace platform** that goes far beyond room booking. It manages the full hospitality lifecycle across accommodation, experiences, support, monetization, talent, trust, and operational intelligence.

The original architecture already defined a strong modular monolith with four core operational systems — **Stay OS**, **Event OS**, **Experience OS**, and **Agentic Manager** — with Next.js, tRPC, Prisma, PostgreSQL, Redis, and BullMQ as the technical backbone. fileciteturn1file0turn1file5 This expanded version preserves that structure and adds the next strategic layers discussed in the conversation.

## 1.2 What the Platform Becomes in v4.0

The platform is no longer only a hospitality orchestration platform for room/event/dining workflows. It becomes a **Hospitality Future OS** with these strategic pillars:

- **Core Booking Platform** — inventory, rooms, reservations, rate logic, same-night and night-use extensions
- **Guest Experience Orchestration** — pre-stay, in-stay, post-stay, city guidance, personalization, wellness, support
- **Hotel Monetization Layer** — amenity marketplace, mobility, bundles, direct offers, inventory rescue, attach-rate growth
- **Trust & Transparency Layer** — verification, moderation, accessibility truth, pet/service-animal clarity, partner trust cards
- **Hospitality Talent OS** — staff reputation, tips, job marketplace, career passport, learning, internships, shift marketplace
- **Host / Home Hosting Layer** — trusted stays, host control center, home readiness, accessibility and pet suitability
- **Operations Intelligence Layer** — forecasts, demand signals, digital twin lite, workforce guidance, service recovery intelligence
- **Essential Services Layer** — pharmacies, hospitals, clinics, veterinary support, emergency guidance, verified local essential access
- **Local Producer Marketplace Layer** — local jam/honey/olive oil/artisan products, regional makers, hotel gifting and traveler discovery across domestic and international markets
- **Commercial & Fulfillment Layer** — contracts, reseller rules, sourcing, handover, disputes, compliance, search/ranking projection
- **Tiered Service Layer** — Standard / Plus / VIP access and benefits across the ecosystem

## 1.3 Core Value Proposition

- **Trust & Transparency** — verified listings, honest photos, disclosed fees, trust cards, accessibility proof, pet/service-animal clarity
- **Full-Lifecycle Orchestration** — discover → book → arrive → stay → recover → review → return
- **Personalized Hospitality at Scale** — “VIP feeling” begins in the standard experience and deepens in Plus/VIP
- **Operational Intelligence** — recurring issue detection, staffing signals, amenity usage, same-night rescue, direct revenue uplift
- **Marketplace Expansion** — amenities, trusted homes, mobility exchange, local experiences, wellness, talent, campus partnerships, essential services, local producers
- **Cross-Border Confidence** — verified health/essential access, pickup/handover clarity, multilingual guidance, international-ready local discovery
- **Human-in-the-Loop AI** — agents recommend, humans approve critical financial and safety actions

---

# 2. Product Positioning & Business Model

## 2.1 Product Positioning

**Core definition:**  
A **multi-tenant hospitality operating and marketplace platform for guests, hotel teams, hotel management, partners, and talent networks**.

**Short positioning:**  
**Core booking platform with experience intelligence, hotel monetization, trust infrastructure, and hospitality talent ecosystem.**

## 2.2 Product Shape

The platform is **not** a single-purpose hotel booking tool. It must support:

- booking and inventory
- in-stay guest experience
- staff and hotel operations
- partner monetization
- workstay / wellness / city guidance
- trusted home hosting
- accessibility and pet/service-animal readiness
- essential services marketplace (pharmacies, hospitals, clinics, veterinary access)
- local producer and artisan marketplace (domestic + international)
- HR, jobs, internships, and staff growth

## 2.3 Revenue Model

Use a **hybrid revenue model**:

### Primary revenue

- **B2B SaaS subscriptions** for hotels / property groups / operators
- **Marketplace commissions** for bookings, amenities, mobility, wellness, local experiences, trusted stays, premium bundles

### Secondary revenue

- **White-label enterprise** for chains, serviced apartment brands, resorts, wellness groups
- **Premium visibility / premium hiring products** in the talent layer

### Internal mode

- **Own-property flagship tenant** supported for first-party operating use and product testing

## 2.4 Critical Product Priority Order

### P0 — Foundation

- auth, RBAC, tenant scope
- hotel/property management
- room inventory and booking core
- pricing, search, booking lifecycle

### P1 — Differentiation

- Guest Memory Cloud
- in-stay guest layer
- same-night / inventory rescue
- trust card + transparency
- amenity / mobility / city companion

### P2 — Ecosystem expansion

- wellness and workstay
- trusted stays
- staff tips and staff reputation
- jobs, internships, career passport

### P3 — Long-term moat

- digital twin lite
- learning hub
- shift marketplace
- deeper AI orchestration
- sustainability intelligence and impact scoring

---

# 3. Platform Actors, Surfaces, and Service Tiers

## 3.1 Platform Actors

The original spec identified Guests, Hotel Staff, Platform Ops, and Super Admin. fileciteturn1file0 The expanded platform serves **all major hospitality actors**, but via separate surfaces:

### A. Guest / Traveler

Uses:

- hotel / trusted stay search
- booking
- amenities, mobility, wellness, local experiences
- city guidance
- in-stay assistant
- support and recovery
- jobs / career / learning (if also a worker)

### B. Hotel Staff

Uses:

- service requests
- support cases
- stay operations
- staff profile and tips
- job / learning / shift tools

### C. Hotel Manager / Owner

Uses:

- property management
- rates, inventory, campaigns
- same-night rescue
- amenity monetization
- ops dashboard and forecasts
- HR / jobs / talent visibility
- trust / verification / recovery oversight

### D. Platform Admin / Platform Ops

Uses:

- tenant controls
- moderation and verification
- trust fabric
- billing and subscription oversight
- white-label configuration
- system analytics

### E. Partners

Uses:

- mobility product management
- local experiences
- trusted stay hosting
- pharmacies / clinics / hospitals / veterinary partners
- local producers / artisan food brands / regional makers
- campus partnerships
- job-related partner operations

## 3.2 Product Surfaces

Implement as separate role-based surfaces:

- **Guest Surface**
- **Hotel Operations Surface**
- **Hotel Management Surface**
- **Hotel HR Surface**
- **Partner Surface**
- **Admin Surface**

## 3.3 Service Tiers

The user explicitly asked whether “VIP feeling” can exist within normal standards. The platform should therefore support a 3-tier service architecture:

### Standard

The baseline quality layer for everyone:

- basic guest memory
- in-stay info and Wi-Fi
- basic city guide
- transparency and trust visibility
- basic workstay filters
- standard jobs portal access

### Plus

The smart enhancement layer:

- deeper personalization
- early visibility to selected offers
- eco rewards
- recovery plans
- split-stay support
- better scenario bundles
- enhanced talent visibility and application tools

### VIP

The priority and exclusive-access layer:

- concierge-depth personalization
- premium wellness/recovery
- curated routes and experiences
- private offers and premium access
- premium career visibility / premium hiring lanes

## 3.4 Tier Infrastructure Requirement

All tier logic must be handled through:

- `MembershipEntitlement`
- `FeatureAccessPolicy`
- optional `VipPlan` / `UserVipMembership`

Tier control must be feature-based, not hardcoded per screen.

---

# 4. System Principles & Constraints

The original architecture principles and hard constraints remain valid and must be preserved. fileciteturn1file18 Add these expanded principles:

## 4.1 Expanded Architecture Principles

- **P9: Multi-Surface Clarity** — each actor sees only the workflows relevant to them
- **P10: Inclusive Design by Data, Not Labels** — accessibility, pets, and service-animal readiness must be modeled as structured data, not vague badges
- **P11: Trust-First Marketplace Expansion** — any new inventory type (homes, staff, partners, amenities) must be verification-aware
- **P12: Tiered Hospitality, Not Elitism** — Standard must feel thoughtful; Plus/VIP deepen access and priority
- **P13: Platform Revenue Visibility** — every monetized module must support attribution, commission, and settlement visibility
- **P14: Operational Neutrality in Incidents** — complaints and staff notes must not assume guilt before review
- **P15: Regulated Service Clarity** — healthcare, pharmacy, insurance, and compliance-sensitive flows must distinguish discovery, information, and regulated action clearly
- **P16: Geography-Aware Marketplace** — local producers, essential services, pickup hubs, and city guidance must be geo-scoped and cross-border ready
- **P17: Modular Expansion Without Rewrite** — all future systems must be additive to the modular monolith

## 4.2 Additional Hard Constraints

- **C8:** Sensitive guest conduct notes are internal-only and never public
- **C9:** Service-animal flows must be separated from normal pet policies
- **C10:** Accessibility claims must support verification/photo-proof workflows where relevant
- **C11:** Every tenant-facing monetization feature must declare tier access and commission behavior
- **C12:** Jobs/talent features must not support discriminatory or irreversible automated exclusion
- **C13:** Healthcare and pharmacy listings must avoid implying medical advice; show verified operational info and emergency disclaimers only
- **C14:** White-label support must not break tenant isolation

---

# 5. Technical Architecture

## 5.1 High-Level Architecture (Expanded)

Keep the original modular monolith with Next.js as client/API shell, tRPC gateway, domain services, agentic manager, Prisma/PostgreSQL, Redis, BullMQ, and shared packages. fileciteturn1file5turn1file7 Extend the architectural view with additional clients and domain modules:

### Client surfaces

- Guest Portal
- Hotel Operations Portal
- Hotel Management Portal
- Hotel HR Portal
- Partner Portal
- Admin / Platform Ops Portal

### Application services to add

- Membership & Feature Entitlement
- Property / Organization Management
- Guest Memory & Personalization
- In-Stay Messaging & Service Requests
- Amenity Marketplace
- Trusted Stays / Home Hosting
- Mobility Exchange & Transfers
- Wellness & Recovery
- City Companion
- Essential Services Marketplace
- Local Producer Marketplace
- Sustainability / Green Stay
- Revenue Rescue & Campaigns
- Commercial Contracts & Reseller Logic
- Fulfillment, Handover, and Disputes
- Insurance, Documents, and Compliance
- Search Projection & Ranking
- Trust Fabric
- Talent Marketplace & Learning

## 5.2 Multi-Property Shape

The platform must remain multi-tenant and become **multi-property / multi-inventory aware**:

Support:

- hotels
- boutique hotels
- resorts
- serviced apartments
- trusted homes / villas
- monthly stay units
- wellness-oriented stays
- mixed inventory where hospitality supply and marketplace services coexist

Model this through a property abstraction layer rather than hardcoding everything into `Hotel`.

## 5.3 Request Flow Additions

### Example: Guest checks in

1. Booking exists and check-in is completed
2. `CHECK_IN_COMPLETED` event emitted
3. `GuestStaySession` created
4. Wi-Fi / menu / event / support info messages generated
5. In-stay guide becomes available in guest UI
6. Smart upsell engine decides whether to offer late checkout, spa, amenity pass, mobility, or local experience
7. Staff-side operational tasks become visible if any preparation is needed

### Example: Guest leaves low rating for staff

1. Review submitted
2. Moderation rule applied
3. If low rating is service-related, create incident or recovery follow-up
4. Staff recognition / score aggregation updated after moderation
5. Guest gratitude wall only surfaces approved positive content

### Example: Trusted home booking with accessibility need

1. User sets accessibility filters
2. Search only returns listings with structured accessibility data
3. Listing shows accessibility proof/photos
4. Pre-arrival guide shows entrance and access details
5. Trust card and host readiness score shown before booking

### Example: Guest books vehicle pickup from airport but return at hotel

1. Guest searches vehicles by pickup hub = airport and return hub = hotel
2. System distinguishes seller, inventory owner, and fulfillment operator
3. If hotel is reseller, commercial rule selects correct revenue split
4. Pickup instructions and return instructions are generated separately
5. Handover proof, insurance options, and eligibility checks attach to reservation

### Example: Guest needs nearby pharmacy / hospital during stay

1. Guest opens Essentials surface from My Stay or City Companion
2. Search ranks verified nearby pharmacies, hospitals, clinics, and veterinary options
3. Emergency-safe routing and availability notes are shown
4. If hotel has preferred partner or concierge assistance, it is surfaced
5. Support handoff can open a case if guest needs help reaching the provider

### Example: Traveler discovers local producers

1. Guest browses Local Market in destination city
2. Platform surfaces verified local producers and artisan products
3. Hotel can bundle selected producers as in-room gifts, welcome packs, or local add-ons
4. Guest can save items, order, or request pickup/delivery depending on fulfillment rule
5. Cross-border locale and language rules determine what is shown internationally

---

# 6. Expanded Domain Model & Bounded Contexts

## 6.1 Preserve Existing Core Contexts

These remain valid and central:

- Auth Context
- Tenant Context
- Hotel Context
- Notification Context
- Stay OS
- Event OS
- Experience OS
- Support & Recovery
- Intelligence
- Agentic Manager fileciteturn1file7turn1file3

## 6.2 New Bounded Contexts to Add

### A. Membership & Entitlements Context

Purpose:

- Standard / Plus / VIP feature gating
- hotel subscription logic
- feature access policies

### B. Organization & Property Context

Purpose:

- support hotel groups, chains, mixed property types
- allow one operator to own/manage multiple properties

### C. Guest Memory Cloud

Purpose:

- preference memory
- behavior history
- intent predictions
- explainable personalization

### D. In-Stay Experience Context

Purpose:

- guest stay session
- Wi-Fi delivery
- digital room guide
- stay messages
- service requests
- lost & found
- issue resolution during stay

### E. Amenity Marketplace Context

Purpose:

- monetize gym, pool, tennis, spa, coworking, beach access
- support daily / monthly / hourly access

### F. Flash Inventory / Same-Night Context

Purpose:

- tonight deals
- night-use offers
- inventory rescue rules
- same-night targeting

### G. Trusted Stays / Home Hosting Context

Purpose:

- trusted daily/monthly homes
- host readiness
- damage/incident workflows
- repeat guest engine

### H. Accessibility & Inclusive Stay Context

Purpose:

- accessibility passport
- feature verification
- service-animal readiness
- pet readiness

### I. Mobility Exchange Context

Purpose:

- airport pickup / return
- hotel pickup / return
- city office and delivery-based vehicle rental
- rental company direct supply
- hotel fleet and hotel resale supply
- hotel on-demand sourcing from partner fleets
- pricing, quotes, inspections, handover, and return flow

### J. WorkStay / Nomad Context

Purpose:

- long stay logic
- work-friendly ranking
- wifi benchmarks
- split-stay planning

### K. Wellness & Recovery Context

Purpose:

- spa/yoga/recovery plans
- jet-lag support
- wellness bundles

### L. City Companion Context

Purpose:

- arrival guides
- neighborhood / safety / cultural guidance
- live city moments
- foreign traveler support

### M. Sustainability / Green Stay Context

Purpose:

- eco metrics
- green score
- local impact partners
- eco rewards

### N. Revenue Rescue & Direct Relationship Context

Purpose:

- direct campaigns
- lifecycle campaigns
- attach-rate insights
- flash bundles

### O. Experience Graph Context

Purpose:

- scenario bundles
- event-driven packages
- micro-itineraries
- experience composition

### P. Trust Fabric Context

Purpose:

- verification cases
- moderation queue
- safety signals
- trust profiles/cards
- resolution history

### Q. Staff Reputation & Service Quality Context

Purpose:

- staff profiles
- staff reviews
- gratitude wall
- internal guest conduct notes
- staff badges and recognition

### R. Talent Marketplace Context

Purpose:

- jobs portal
- career passport
- interviews
- internships
- learning
- shift marketplace
- campus partnerships

### S. Essential Services Marketplace Context

Purpose:

- verified pharmacies, hospitals, clinics, labs, veterinary support
- hotel and guest discovery of essential nearby services
- emergency-aware guidance and support handoff
- regulated-service clarity and verified operating information

### T. Local Producer & Artisan Marketplace Context

Purpose:

- onboard local producers and makers
- support domestic and international regional product discovery
- enable hotel gifting, welcome packs, in-room curation, and traveler orders
- connect sustainability, local impact, and marketplace monetization

### U. Commercial Contracts Context

Purpose:

- provider contracts
- reseller agreements
- sourcing logic
- revenue split and payout rules
- white-label and partner commercial control

### V. Fulfillment & Handover Context

Purpose:

- pickup / return instructions
- order handover checkpoints
- evidence and completion proof
- cross-provider operational fulfillment

### W. Insurance, Documents & Compliance Context

Purpose:

- insurance options and claims
- rental eligibility and liability rules
- document vault and verification
- compliance-aware marketplace operations

### X. Marketplace Search & Ranking Context

Purpose:

- unified entity search projections
- faceted discovery across stays, vehicles, amenities, essentials, producers, and jobs
- explainable ranking and search result reasons

## 6.3 Property Taxonomy

Introduce property types:

- HOTEL
- BOUTIQUE_HOTEL
- RESORT
- SERVICED_APARTMENT
- VILLA
- TRUSTED_HOME
- MONTHLY_STAY_UNIT
- WELLNESS_RETREAT

Also support non-property marketplace entities associated with a destination:

- ESSENTIAL_SERVICE_PROVIDER
- LOCAL_PRODUCER
- MOBILITY_HUB

## 6.4 Domain Events (Expanded)

Keep the original event-driven rule: contexts communicate through events, not direct cross-context DB queries. fileciteturn1file7 Add:

- `GUEST_STAY_STARTED`
- `WIFI_INFO_DELIVERED`
- `SERVICE_REQUEST_CREATED`
- `SERVICE_REQUEST_COMPLETED`
- `STAFF_REVIEW_SUBMITTED`
- `STAFF_TIP_RECEIVED`
- `HOST_INCIDENT_REPORTED`
- `HOME_ACCESSIBILITY_UPDATED`
- `PET_POLICY_UPDATED`
- `WELLNESS_PLAN_GENERATED`
- `CITY_GUIDE_TRIGGERED`
- `FLASH_WINDOW_OPENED`
- `DIRECT_OFFER_REDEEMED`
- `JOB_POSTING_CREATED`
- `JOB_APPLICATION_SUBMITTED`
- `LEARNING_TRACK_COMPLETED`
- `SHIFT_POSTED`
- `VEHICLE_PICKUP_SCHEDULED`
- `VEHICLE_HANDOVER_COMPLETED`
- `FLEET_SOURCING_REQUEST_CREATED`
- `ESSENTIAL_SERVICE_SEARCHED`
- `LOCAL_PRODUCER_ORDER_CREATED`
- `CONTRACT_RULE_APPLIED`

---

# 7. Database Expansion Plan

## 7.1 Preserve Existing Prisma Core

The uploaded schema already defines:

- tenants, users, sessions, tenant policies
- hotels
- room types and room inventory
- bookings and booking items
- venues, event requests, BEO
- dining and nightlife models
- support cases, compensation, approvals
- orchestration sessions and agent logs
- reviews, hotel insights, notifications fileciteturn1file9turn1file8turn1file6

Do **not** rewrite these. Extend them.

## 7.2 New Shared Models

Add:

- `MembershipEntitlement`
- `FeatureAccessPolicy`
- `NotificationTemplate`
- `AutomationRule`
- `AuditEvent`
- `ModerationQueue`

## 7.3 Organization / Property Models

Add:

- `Organization`
- `Property`
- `PropertyGroup`
- `PropertyBrand`
- `PropertyRelationship`
- `WhiteLabelConfig`
- `TenantBrandTheme`
- `CustomDomain`

## 7.4 Guest Memory Models

Add:

- `GuestMemoryProfile`
- `GuestPreferenceSignal`
- `GuestBehaviorEvent`
- `GuestStayPattern`
- `IntentPrediction`
- `OfferDecisionLog`
- `GuestAffinityMap`
- `PreferenceOverrideLog`

## 7.5 In-Stay Models

Add:

- `GuestStaySession`
- `HotelWifiCredential`
- `InStayMessage`
- `HotelVenueMenu`
- `GuestServiceRequest`
- `ServiceTaskAssignment`
- `TaskCompletionLog`
- `LostFoundItem`
- `LostFoundClaim`

## 7.6 Amenity Marketplace Models

Add:

- `AmenityAsset`
- `AmenitySchedule`
- `AmenityPassPlan`
- `AmenityReservation`
- `AmenityReview`

## 7.7 Same-Night / Flash Inventory Models

Add:

- `InventoryFlashWindow`
- `FlashRateSnapshot`
- `NightUsePolicy`
- `InventoryRescueRule`
- `SameNightConversionLog`

## 7.8 Trusted Stays / Host Models

Add:

- `TrustedStayHost`
- `TrustedStayUnit`
- `TrustedStayAvailability`
- `TrustedStayRatePlan`
- `TrustedStayVerification`
- `HostControlCenter`
- `HomeReadinessScore`
- `HouseRuleTemplate`
- `IncidentCase`
- `DamageClaim`
- `RepeatGuestOffer`

## 7.9 Accessibility / Pet / Inclusive Stay Models

Add:

- `AccessibilityPassport`
- `AccessibilityFeature`
- `AccessibilityPhotoVerification`
- `AccessibleArrivalGuide`
- `PetPolicyProfile`
- `PetStayProfile`
- `ServiceAnimalReadiness`
- `PetAmenity`
- `PetFeeRule`
- `InclusiveStayProfile`

## 7.10 Mobility Exchange Models

Add:

- `VehicleProvider`
- `VehicleProviderRole`
- `VehicleFleet`
- `VehicleAsset`
- `VehicleCategory`
- `VehicleAvailabilityCalendar`
- `PickupHub`
- `ReturnHub`
- `PickupWindow`
- `ReturnRule`
- `VehicleRatePlan`
- `VehicleQuote`
- `RentalReservation`
- `RentalAddOn`
- `DriverOption`
- `InsuranceOption`
- `FuelPolicy`
- `MileagePolicy`
- `VehicleHandover`
- `VehicleInspection`
- `VehicleDamageReport`
- `VehicleReturnLog`
- `AirportDeskAssignment`
- `HotelDeskAssignment`
- `HotelMobilityContract`
- `FleetSourcingRequest`
- `SourcingQuote`
- `FleetAllocation`
- `VehicleResaleRule`
- `MobilityRevenueSplit`
- `DriverDocument`
- `LicenseVerification`
- `RentalEligibilityRule`
- `DepositHold`
- `MobilityDisputeCase`
- `VehicleAccessibilityProfile`
- `AccessiblePickupSupport`
- `VehiclePetPolicy`
- `ServiceAnimalTransportRule`
- `PetCleaningRule`

## 7.11 WorkStay Models

Add:

- `WorkStayProfile`
- `LongStayRatePlan`
- `WorkspaceAmenity`
- `WifiBenchmark`
- `NeighborhoodWorkScore`
- `SplitStayPlan`

## 7.12 Wellness Models

Add:

- `WellnessProfile`
- `WellnessProgram`
- `RecoveryPlan`
- `WellnessReservation`
- `JetLagPlan`

## 7.13 City Companion Models

Add:

- `CityCompanionProfile`
- `GuideScenario`
- `ArrivalChecklist`
- `CulturalTip`
- `SafetyRoute`
- `LiveCityMoment`

## 7.14 Sustainability Models

Add:

- `SustainabilityProfile`
- `GreenMetricSnapshot`
- `EcoPractice`
- `EcoRewardLedger`
- `GreenClaimVerification`
- `LocalImpactPartner`

## 7.15 Essential Services Marketplace Models

Add:

- `EssentialServiceProvider`
- `EssentialServiceLocation`
- `ServiceCategory`
- `ServiceAvailabilityWindow`
- `ServiceTrustCard`
- `PharmacyProfile`
- `MedicalProviderProfile`
- `VetProviderProfile`
- `EmergencyAccessRule`
- `SupportReferralLog`

## 7.16 Local Producer Marketplace Models

Add:

- `LocalProducerProfile`
- `ProducerRegion`
- `ProducerCatalogItem`
- `ProducerFulfillmentOption`
- `ProducerOrder`
- `ProducerOrderItem`
- `ProducerStoryAsset`
- `ProducerVerification`
- `InternationalCatalogVisibility`
- `HotelProducerBundle`

## 7.17 Commercial, Fulfillment, Compliance & Search Models

Add:

- `CommercialContract`
- `ContractParty`
- `ContractRateRule`
- `ContractBlackoutWindow`
- `ResellerAgreement`
- `RevenueSplitRule`
- `FulfillmentOrder`
- `FulfillmentCheckpoint`
- `HandoverProof`
- `PickupInstruction`
- `DeliveryInstruction`
- `CompletionEvidence`
- `InsurancePolicy`
- `CoverageRule`
- `LiabilityClaim`
- `DamageAssessment`
- `RefundDecision`
- `DisputeCase`
- `DocumentVaultItem`
- `VerificationDocument`
- `ComplianceRequirement`
- `DocumentReviewLog`
- `SearchFacetConfig`
- `EntitySearchProjection`
- `RankingSignal`
- `SearchResultReason`
- `SupportConversation`
- `SupportParticipant`
- `EscalationRule`

## 7.18 Revenue & Direct Relationship Models

Add:

- `DirectOfferCampaign`
- `GuestLifecycleCampaign`
- `FlashBundle`
- `AttachRateInsight`
- `OfferRedemptionLog`
- `SubscriptionPlan`
- `TenantSubscription`
- `BillingInvoice`
- `UsageMetric`
- `OverageCharge`
- `CommissionRule`
- `SettlementBatch`
- `SettlementLine`
- `PartnerRevenueShare`
- `OfferAttributionLog`

## 7.19 Experience Graph Models

Add:

- `ExperienceComposer`
- `ExperienceNode`
- `ExperienceEdge`
- `ScenarioBundle`
- `MicroItinerary`
- `EventDrivenPackage`

## 7.20 Trust Fabric Models

Add:

- `TrustProfile`
- `VerificationCase`
- `SafetySignal`
- `ResolutionHistory`
- `TrustCardSnapshot`
- `FraudSignal`
- `TrustAuditLog`

## 7.21 Staff Reputation & Talent Models

Add:

- `StaffProfile`
- `StaffGuestReview`
- `StaffGuestConductNote`
- `StaffTip`
- `StaffBadge`
- `StaffRecognitionLog`
- `GratitudeWallEntry`
- `JobPosting`
- `CareerPassport`
- `CareerExperience`
- `CareerSkill`
- `CareerCertification`
- `TalentProfile`
- `JobApplication`
- `JobInterview`
- `LearningTrack`
- `StaffCourseEnrollment`
- `ShiftMarketplace`
- `ShiftClaim`
- `CampusPartner`

## 7.22 Existing Models Requiring Relation Additions

### User

Add optional relations for:

- guest memory
- preference/travel profile
- stay sessions
- amenity reservations
- mobility reservations
- wellness reservations
- staff profile
- staff reviews and tips
- career passport / talent profile / course enrollments

### Hotel

Add optional relations for:

- sustainability
- workstay profile
- wifi credentials
- amenity assets
- flash windows
- mobility products
- local guides / live moments
- trust profile
- staff profiles
- HR / jobs / learning / shifts

### Booking

Add optional relations for:

- guest stay session
- amenity, mobility, wellness, local experience reservations
- direct offers / lifecycle attribution
- service incidents / recovery actions

---

# 8. API Design & Router Expansion

The uploaded architecture already defines a clean tRPC router structure and core router list. fileciteturn1file12turn1file14 Preserve it and add grouped domain routers.

## 8.1 New Router Groups

### Shared / platform

- `membership.router.ts`
- `featureAccess.router.ts`
- `automation.router.ts`
- `audit.router.ts`
- `rbac.router.ts`
- `subscription.router.ts`
- `billing.router.ts`
- `whiteLabel.router.ts`
- `property.router.ts`
- `organization.router.ts`

### Memory / personalization

- `guestMemory.router.ts`
- `guestPreference.router.ts`
- `behaviorEvent.router.ts`
- `intentEngine.router.ts`
- `personalization.router.ts`

### In-stay

- `guestStay.router.ts`
- `inStayMessage.router.ts`
- `hotelWifi.router.ts`
- `hotelMenu.router.ts`
- `guestServiceRequest.router.ts`
- `serviceTask.router.ts`
- `lostFound.router.ts`

### Marketplace / supply

- `amenity.router.ts`
- `amenityPass.router.ts`
- `amenityReservation.router.ts`
- `trustedStay.router.ts`
- `trustedStayAvailability.router.ts`
- `trustedStayVerification.router.ts`
- `vehicleProvider.router.ts`
- `vehicleFleet.router.ts`
- `vehicleAsset.router.ts`
- `pickupHub.router.ts`
- `rentalReservation.router.ts`
- `fleetSourcing.router.ts`
- `hotelMobility.router.ts`
- `wellness.router.ts`
- `wellnessReservation.router.ts`
- `essentialService.router.ts`
- `pharmacy.router.ts`
- `medicalProvider.router.ts`
- `localProducer.router.ts`
- `producerOrder.router.ts`

### Workstay / sustainability / city

- `workstay.router.ts`
- `longStay.router.ts`
- `splitStay.router.ts`
- `sustainability.router.ts`
- `greenScore.router.ts`
- `ecoReward.router.ts`
- `cityCompanion.router.ts`
- `arrivalGuide.router.ts`
- `citySafety.router.ts`
- `liveMoment.router.ts`

### Revenue / offers

- `directOffer.router.ts`
- `lifecycleCampaign.router.ts`
- `attachRate.router.ts`
- `inventoryRescue.router.ts`
- `flashBundle.router.ts`
- `settlement.router.ts`
- `commission.router.ts`
- `commercialContract.router.ts`
- `resellerAgreement.router.ts`
- `revenueSplit.router.ts`

### Experience composition

- `experienceComposer.router.ts`
- `scenarioBundle.router.ts`
- `microItinerary.router.ts`
- `eventPackage.router.ts`

### Trust / moderation / inclusion

- `trust.router.ts`
- `verification.router.ts`
- `moderation.router.ts`
- `safetySignal.router.ts`
- `trustCard.router.ts`
- `accessibility.router.ts`
- `petPolicy.router.ts`
- `serviceAnimal.router.ts`

### Fulfillment / disputes / compliance / search

- `fulfillment.router.ts`
- `handover.router.ts`
- `insurance.router.ts`
- `documentVault.router.ts`
- `compliance.router.ts`
- `dispute.router.ts`
- `searchProjection.router.ts`
- `supportConversation.router.ts`

### Staff / talent

- `staffProfile.router.ts`
- `staffReview.router.ts`
- `guestConduct.router.ts`
- `staffTip.router.ts`
- `staffRecognition.router.ts`
- `jobPosting.router.ts`
- `jobApplication.router.ts`
- `careerPassport.router.ts`
- `learning.router.ts`
- `shift.router.ts`
- `internship.router.ts`
- `campusPartner.router.ts`

## 8.2 API Rules

- all routers must remain tenant-scoped
- role + tier checks must happen in middleware/procedure guards
- public trust and accessibility fields must be explicitly whitelisted
- sensitive notes and conduct data must never leak into guest/public procedures

---

# 9. Agentic Manager Orchestration (Expanded)

The uploaded spec defines the existing orchestrator, pipelines, and 12 specialized agents. fileciteturn1file10turn1file11 Keep those as MVP core.

## 9.1 Preserve Existing Agents

- MATCHMAKING
- TRUTH_TRANSPARENCY
- BOOKING_INTEGRITY
- PRE_STAY_CONCIERGE
- STAY_SUPPORT
- RECOVERY_COMPENSATION
- EVENT_MATCH
- VENUE_CAPACITY
- BEO_RUNOFSHOW
- FB_PLANNING
- NIGHTLIFE_EXPERIENCE
- INSIGHT_HOTEL_SUCCESS

## 9.2 New Future Agents to Add Incrementally

### Guest & marketplace intelligence

- `GUEST_MEMORY_AGENT`
- `IN_STAY_ASSISTANT_AGENT`
- `WORKSTAY_MATCH_AGENT`
- `WELLNESS_RECOVERY_AGENT`
- `CITY_COMPANION_AGENT`
- `AMENITY_UPSELL_AGENT`
- `INVENTORY_RESCUE_AGENT`
- `DIRECT_RELATIONSHIP_AGENT`
- `ESSENTIAL_ACCESS_AGENT`
- `LOCAL_MARKET_AGENT`
- `MOBILITY_EXCHANGE_AGENT`

### Trust & inclusion

- `ACCESSIBILITY_TRUTH_AGENT`
- `PET_READINESS_AGENT`
- `HOST_READINESS_AGENT`
- `TRUST_FABRIC_AGENT`

### Operations & HR

- `OPS_FORECAST_AGENT`
- `SHIFT_DEMAND_AGENT`
- `TALENT_MATCH_AGENT`
- `CAREER_GROWTH_AGENT`
- `CONTRACT_ROUTING_AGENT`
- `FULFILLMENT_COORDINATOR_AGENT`

## 9.3 Expanded Context Builder Inputs

In addition to the original booking/case/event context, shared context should support:

- user tier and entitlements
- guest memory signals
- accessibility needs
- pet or service-animal mode
- workstay / wellness intent
- city / arrival context
- essential-services proximity and operating context
- local producer / regional market context
- trust profile snapshots
- mobility provider / pickup hub context
- talent / learning signals where applicable

## 9.4 New Pipeline Examples

- `checkin.completed` → `IN_STAY_ASSISTANT_AGENT`, `CITY_COMPANION_AGENT`
- `flash.window_opened` → `INVENTORY_RESCUE_AGENT`, `DIRECT_RELATIONSHIP_AGENT`
- `staff.review_submitted` → `INSIGHT_HOTEL_SUCCESS`, optional recovery logic
- `job.application_created` → `TALENT_MATCH_AGENT`
- `workstay.search` → `WORKSTAY_MATCH_AGENT`
- `wellness.intent_detected` → `WELLNESS_RECOVERY_AGENT`
- `accessibility.filter_used` → `ACCESSIBILITY_TRUTH_AGENT`
- `vehicle.search_performed` → `MOBILITY_EXCHANGE_AGENT`
- `essentials.opened` → `ESSENTIAL_ACCESS_AGENT`
- `producer.market_opened` → `LOCAL_MARKET_AGENT`
- `fleet.sourcing_request_created` → `CONTRACT_ROUTING_AGENT`, `FULFILLMENT_COORDINATOR_AGENT`

---

# 10. Frontend Architecture & Information Architecture

The original app already separates guest, hotel, and admin portals and defines public hotel detail and dashboard experiences. fileciteturn1file17turn1file15 Expand this into explicit surfaces.

## 10.1 Top Navigation

- Stays
- Tonight
- Amenities
- Homes
- Mobility
- Essentials
- Local Market
- City Guide
- Wellness
- WorkStay
- VIP
- Careers
- For Hotels

## 10.2 New App Route Structure

### Guest

- `/(guest)/account/preferences`
- `/(guest)/recommendations`
- `/(guest)/stay`
- `/(guest)/stay/wifi`
- `/(guest)/stay/menus`
- `/(guest)/stay/events`
- `/(guest)/stay/support`
- `/(guest)/stay/requests`
- `/(guest)/stay/lost-found`
- `/(guest)/amenities`
- `/(guest)/homes`
- `/(guest)/mobility`
- `/(guest)/mobility/search`
- `/(guest)/mobility/reservations`
- `/(guest)/essentials`
- `/(guest)/health`
- `/(guest)/local-market`
- `/(guest)/local-market/[slug]`
- `/(guest)/workstay`
- `/(guest)/long-stay`
- `/(guest)/split-stay-planner`
- `/(guest)/wellness`
- `/(guest)/recovery-plan`
- `/(guest)/guides/[city]`
- `/(guest)/arrival-guide`
- `/(guest)/eco-rewards`
- `/(guest)/offers`
- `/(guest)/tonight`
- `/(guest)/scenarios`
- `/(guest)/jobs`
- `/(guest)/career-passport`
- `/(guest)/learn`

### Hotel Operations

- `/hotel/operations/stay-messaging`
- `/hotel/operations/service-requests`
- `/hotel/operations/incidents`
- `/hotel/operations/lost-found`
- `/hotel/ops/dashboard`
- `/hotel/ops/forecast`
- `/hotel/ops/housekeeping`
- `/hotel/ops/workforce`

### Hotel Management

- `/hotel/management/properties`
- `/hotel/management/brands`
- `/hotel/management/billing`
- `/hotel/management/subscription`
- `/hotel/management/branding`
- `/hotel/sustainability`
- `/hotel/workstay`
- `/hotel/wellness`
- `/hotel/mobility`
- `/hotel/mobility/providers`
- `/hotel/mobility/pickup-points`
- `/hotel/mobility/contracts`
- `/hotel/mobility/on-demand-requests`
- `/hotel/essentials/partners`
- `/hotel/local-market/bundles`
- `/hotel/revenue/campaigns`
- `/hotel/revenue/attach-rate`
- `/hotel/revenue/inventory-rescue`
- `/hotel/trust`

### Hotel HR

- `/hotel/hr/jobs`
- `/hotel/hr/applications`
- `/hotel/hr/interviews`
- `/hotel/hr/shifts`
- `/hotel/hr/learning`

### Partner

- `/partner/dashboard`
- `/partner/products`
- `/partner/bookings`
- `/partner/trust`
- `/partner/mobility/fleet`
- `/partner/mobility/vehicles`
- `/partner/mobility/pickup-hubs`
- `/partner/mobility/rates`
- `/partner/mobility/contracts`
- `/partner/essentials/profile`
- `/partner/local-market/catalog`
- `/partner/local-market/orders`

### Admin

- `/admin/(admin)/tenants`
- `/admin/(admin)/billing`
- `/admin/(admin)/white-label`
- `/admin/(admin)/moderation`
- `/admin/(admin)/verifications`
- `/admin/(admin)/trust`
- `/admin/(admin)/ops-monitoring`
- `/admin/(admin)/talent`
- `/admin/(admin)/campus-partners`

## 10.3 Homepage Information Architecture

1. Hero with tabbed search: Hotels / Tonight / Amenities / Homes / Mobility / Essentials / Local Market / Experiences
2. Trust strip: verified, transparent, guest-first
3. Two-sided value: Travelers / Hotels / Partners
4. Tonight Deals
5. Amenity Marketplace
6. Trusted Homes
7. Mobility Exchange
8. Essentials (Pharmacy / Hospital / Vet / Emergency)
9. Local Producer Market
10. WorkStay / Long Stay
11. Wellness & Recovery
12. City Guide
13. VIP
14. Careers
15. For Hotels & Partners
16. AI & orchestration section (retain original differentiator)
17. Final CTA

---

# 11. Security, Multi-Tenancy, Trust, and Moderation

The original spec already defines tenant-scoped Prisma middleware and RBAC. fileciteturn1file1 Keep that architecture and expand it.

## 11.1 Expanded Role Model

Add role assignments beyond the original `User.role` enum when needed:

- GUEST
- STAFF
- HOTEL_MANAGER
- HOTEL_OWNER
- TENANT_ADMIN
- PLATFORM_ADMIN
- PARTNER_OPERATOR
- HR_MANAGER

Recommended additive models:

- `UserRoleAssignment`
- `HotelStaffAssignment`
- `PartnerAccountAssignment`
- `RolePermissionOverride`

## 11.2 Sensitive Data Rules

### Internal-only data

- guest conduct notes
- safety signals
- fraud signals
- unresolved trust investigations
- staff/internal incident notes

### Moderated public data

- staff reviews
- gratitude wall
- trust cards
- accessibility proof elements
- certain host quality signals

### User-controlled visibility

- career passport
- learning/certificate visibility
- staff public profile fields

## 11.3 Trust / Inclusion Rules

- no public guest blacklist
- service-animal workflow must be separate from normal pet workflow
- accessibility cannot be represented by a single vague badge only
- listings should support photo/proof verification for critical access claims
- no discriminatory job filtering or irreversible automated rejection

---

# 12. Revenue Model, Subscriptions, and White-Labeling

## 12.1 SaaS Plans

Create hotel-facing subscription plans:

- Hotel Standard
- Hotel Plus
- Hotel Pro / Enterprise

## 12.2 Feature Families by Plan

### Standard

- core booking
- basic transparency
- basic in-stay tools
- basic workstay / city guide / jobs tools

### Plus

- deeper personalization
- advanced revenue campaigns
- eco rewards
- better workstay / wellness / scenarios
- HR enhancements

### VIP / Enterprise / White-label

- custom branding
- premium automation
- deeper analytics
- private offer flows
- premium integrations

## 12.3 White-Label

Use:

- `WhiteLabelConfig`
- `TenantBrandTheme`
- `CustomDomain`
- `FeatureBundleOverride`

White-label is for chains, groups, resorts, wellness brands, and operators that want their own guest-facing brand layer.

---

# 13. Roadmap & Phased Build Plan

The original roadmap covers core platform, agents, and operations in 10 weeks. fileciteturn1file4turn1file13 Preserve that as the base MVP and expand after it.

## Phase 0 — Existing Core MVP

Keep the original base build plan:

- auth, tenant, hotel, room, booking
- support and compensation
- event foundation
- dining/nightlife
- analytics and core agents

## Phase 1 — Guest Experience & Monetization Expansion

- membership entitlement infrastructure
- guest memory cloud
- in-stay guest layer
- amenity marketplace
- tonight deals / night-use
- city companion basics
- revenue rescue basics

## Phase 2 — Trust, Home Hosting, and Inclusion

- trusted stays
- host control center
- home readiness
- trust profiles and verification cases
- accessibility passport
- pet policy / service-animal readiness
- moderation flows

## Phase 3 — WorkStay, Wellness, Sustainability

- workstay filters and profiles
- long-stay rate plans
- wellness programs and recovery plans
- sustainability profiles and green scores
- eco rewards and local impact partners

## Phase 4 — Staff Reputation & Talent

- staff profiles
- staff reviews and tips
- gratitude wall
- jobs marketplace
- career passport
- internships and beginner portal
- learning tracks and shift marketplace

## Phase 5 — Advanced Operations Intelligence

- digital twin lite dashboards
- shift demand suggestions
- advanced attach-rate insights
- event-driven packages and deeper orchestration

---

# 14. Coding Standards & Conventions

The original coding conventions, naming rules, Zod usage, strict TS, error handling, and test strategy remain valid. fileciteturn1file13turn1file19 Add:

- every new domain gets its own folder, router group, and validators
- searchable fields must be explicit columns, not only JSON
- every sensitive workflow writes `AuditEvent`
- every trust/review-related public surface must pass moderation or verification checks
- tier-aware UI must query entitlements, not guess from plan name

---

# 15. File & Folder Structure (Expanded)

Keep the original monorepo layout. fileciteturn1file11turn1file19 Expand packages and route grouping.

```text
apps/
  web/
    src/
      app/
        (guest)/...
        hotel/
          operations/...
          management/...
          hr/...
        partner/...
        admin/(admin)/...
      components/
        stays/
        amenities/
        homes/
        mobility/
        essentials/
        local-market/
        wellness/
        workstay/
        city/
        trust/
        talent/
        staff/
        dashboard/
        shared/

packages/
  db/
  api/
    src/
      routers/
        core/
        memory/
        instay/
        marketplace/
        mobility/
        essentials/
        producers/
        contracts/
        fulfillment/
        compliance/
        search/
        workstay/
        wellness/
        city/
        green/
        revenue/
        experience/
        trust/
        staff/
        talent/
        shared/
  domain/
    src/
      stays/
      events/
      experience/
      support/
      memory/
      instay/
      marketplace/
      mobility/
      essentials/
      producers/
      contracts/
      fulfillment/
      compliance/
      search/
      workstay/
      wellness/
      city/
      green/
      revenue/
      trust/
      talent/
      property/
      membership/
  agents/
  shared/
  ui/
  email/
  queue/
```

---

# 16. Claude Code Implementation Instructions

## 16.1 Global Rules

- additive only, no rewrite
- preserve existing booking core and modular monolith
- preserve tenant isolation
- keep money fields as integer cents
- use JSON only for flexible metadata
- keep all new domains modular and future-proof
- mobile-first on guest side, operational dashboard-first on hotel side

## 16.2 Build Order

### Step 1 — Keep original spec operational

Use the original v2.0 build sequence as the base. fileciteturn1file15

### Step 2 — Add shared infrastructure

- membership entitlement
- feature access policy
- audit events
- moderation queue
- notification templates
- automation rules

### Step 3 — Add organization/property abstraction

- organizations
- properties
- brands
- white-label config

### Step 4 — Add guest memory and in-stay

- guest memory tables and routers
- stay session / Wi-Fi / menus / messages
- service requests / lost & found

### Step 5 — Add monetization extensions

- amenity marketplace
- tonight deals / night-use
- direct offer campaigns
- lifecycle campaigns

### Step 6 — Add trusted stays and inclusive stay layer

- trusted stays / host control center
- accessibility passport
- pet and service-animal readiness
- home readiness score

### Step 7 — Add workstay, wellness, city, sustainability, essentials, and local market

- workstay rate plans and split stay
- wellness programs and recovery plans
- city companion guides and live moments
- sustainability and eco rewards
- essential services marketplace
- local producer marketplace

### Step 8 — Add mobility exchange and commercial infrastructure

- vehicle providers, hubs, and reservations
- hotel resale and on-demand fleet sourcing
- commercial contracts and revenue split rules
- fulfillment, handover, disputes, and compliance

### Step 9 — Add trust fabric

- verification cases
- trust profiles
- trust cards
- safety signals

### Step 10 — Add staff and talent ecosystem

- staff profiles, reviews, tips
- jobs, career passport, learning, internships, shift marketplace

### Step 11 — Add advanced ops intelligence

- operational forecasts
- utilization snapshots
- shift demand suggestions
- attach-rate insights
- search/ranking projections

## 16.3 Output Expectation

For each domain Claude Code must implement:

1. Prisma models / enums
2. tRPC router skeletons
3. guest/hotel/admin page scaffolds
4. minimal CRUD or list/detail flows
5. tier-aware access control
6. moderation / audit logic where relevant
7. seed data and demo fixtures

## 16.4 Final Product Standard

The finished platform should feel like:

- a booking engine
- a guest experience system
- a hotel monetization platform
- a trust and transparency marketplace
- a hospitality talent network
- a cross-border city and essentials companion
- a mobility exchange and local producer marketplace
- a future-ready operating system for modern hospitality

---

# 17. v4.0 Additions: Mobility Exchange, Essential Services, and Local Producer Marketplace

18. v5.0 Additions: Operating Backbone, Deep Mobility Exchange, Care Navigation, and Hospitality-Linked Local Commerce
19. v6.0 Additions: Competitive Scale Backbone, Inventory Intelligence, and Platform Moat

## 17.1 Why These Were Added

The platform now explicitly supports three additional strategic expansion lanes:

- **Mobility Exchange** — a multi-party vehicle rental and transfer marketplace supporting rental companies, hotels, hotel resale, and on-demand sourcing
- **Essential Services Marketplace** — verified discovery of pharmacies, hospitals, clinics, labs, emergency support, and veterinary services
- **Local Producer Marketplace** — verified regional makers and producers, including domestic and international local products that hotels and travelers can discover, gift, or order

These additions strengthen:

- guest confidence during travel
- hotel monetization and concierge value
- destination relevance and local economic participation
- cross-border usability
- trust, compliance, and operational orchestration

## 17.2 Mobility Exchange Key Modeling Rules

The mobility layer is **not** a simple car-rental module. It must distinguish:

- who owns vehicle inventory
- who sells the reservation
- who fulfills pickup/handover
- who operates pickup/return hub
- whether pickup is at airport, hotel, office, or delivery point
- whether a hotel is direct provider, reseller, or on-demand sourcing operator

Supported business models:

1. Rental company direct supply
2. Hotel direct fleet
3. Hotel resale of rental-company inventory
4. Hotel on-demand fleet sourcing
5. Mixed marketplace discovery across both hotel and rental-company supply

## 17.3 Essential Services Marketplace Rules

This marketplace must support **discovery and support**, not imply medical advice.

Key capabilities:

- verified operational info
- geolocated pharmacy/hospital/clinic/vet discovery
- emergency-aware guidance
- hotel concierge and support handoff
- multilingual and cross-border destination support
- trusted listings with transparent hours, location, and contact pathways

## 17.4 Local Producer Marketplace Rules

The local producer layer should support:

- local jam, honey, olive oil, artisan food, wellness products, crafts, and regional goods
- hotel welcome packs and in-room curation
- destination-specific local producer discovery
- cross-border catalog visibility rules
- fulfillment options: pickup, hotel delivery, local courier, bundled gifting
- verification of origin and partner trust

## 17.5 Additional Future-Proofing Ideas

Also preserve architecture space for:

- unified support and dispute center across all marketplace entities
- pricing brain for stays + vehicles + wellness + amenities + local products
- localization and cross-border regulatory overlays
- document and e-signature flows
- partner performance dashboards and SLA visibility

# 18. v5.0 Additions: Operating Backbone, Deep Mobility Exchange, Care Navigation, and Hospitality-Linked Local Commerce

19. v6.0 Additions: Competitive Scale Backbone, Inventory Intelligence, and Platform Moat

## 18.1 Why v5.0 Was Needed

After expanding the product into booking, guest experience, trust, talent, home hosting, mobility, essential services, and local producers, the remaining gaps were no longer feature gaps. They were **operating-system gaps**.

The platform now needs stronger invisible backbone layers so the expanded marketplace can run safely, compliantly, and at scale:

- **Integration OS**
- **Payments, Tax & Refund OS**
- **Privacy & Data Governance OS**
- **Workflow & Events OS**
- **Search & Ranking OS**
- **Supplier Onboarding & Quality Assurance OS**
- **Unified Support & Dispute OS**
- **Localization & Cross-Border OS**
- **Reliability & Observability OS**
- **Deep Mobility Exchange v2**
- **Care Navigation Layer** for essential services
- **Hospitality-Linked Local Commerce Layer** for local producers

These are not optional polishing layers. They are the operating backbone that makes the larger ecosystem trustworthy and manageable.

---

## 18.2 Operating Backbone Additions

### 18.2.1 Integration OS

The platform must define a dedicated integration layer instead of scattering adapters across domains.

This layer should support:

- PMS / CRS integration
- OTA / channel manager synchronization
- payment providers
- KYC / identity providers
- maps / geocoding
- messaging providers
- eSIM / telecom / travel utility feeds
- fiscal / invoicing systems
- airport / flight feeds
- healthcare / pharmacy partner feeds
- mobility partner feeds
- local producer catalog feeds
- white-label tenant specific integrations

**Core models to add**

- `ExternalConnection`
- `IntegrationProvider`
- `IntegrationCredential`
- `SyncJob`
- `SyncCursor`
- `WebhookEndpoint`
- `WebhookDeliveryLog`
- `IntegrationMapping`

**Routers**

- `integration.router.ts`
- `sync.router.ts`
- `webhookAdmin.router.ts`

**Suggested screens**

- `/admin/(admin)/integrations`
- `/admin/(admin)/integrations/[provider]`
- `/hotel/management/integrations`

---

### 18.2.2 Payments, Tax & Refund OS

Marketplace expansion requires a more explicit payment operating model.

This layer must support:

- authorization and capture
- partial and full refunds
- deposit holds
- no-show charges
- damage charges
- chargebacks
- tax rules by jurisdiction
- VAT / city tax / tourism tax
- split payments
- partner payouts
- tip payouts
- hotel vs platform vs partner settlement separation
- multi-currency and cross-border finance flows

**Core models to add**

- `PaymentIntent`
- `PaymentTransaction`
- `RefundRequest`
- `RefundDecision`
- `ChargebackCase`
- `TaxRule`
- `InvoiceLine`
- `DepositHold`
- `PayoutSchedule`

**Routers**

- `payment.router.ts`
- `refund.router.ts`
- `tax.router.ts`
- `chargeback.router.ts`

**Suggested screens**

- `/hotel/management/billing`
- `/hotel/management/refunds`
- `/admin/(admin)/payments`
- `/admin/(admin)/chargebacks`

---

### 18.2.3 Privacy & Data Governance OS

Because the platform now stores personalization, conduct notes, accessibility details, service-animal readiness, and health-adjacent discovery signals, privacy governance must be modeled explicitly.

This layer must support:

- consent capture
- data retention rules
- data export requests
- deletion requests
- sensitive field masking
- inference transparency
- user visibility controls
- privacy-safe explanation for personalization
- auditability of sensitive access

**Core models to add**

- `ConsentRecord`
- `DataRetentionPolicy`
- `DataDeletionRequest`
- `ExportRequest`
- `SensitiveFieldPolicy`
- `InferenceExplanationLog`

**Routers**

- `consent.router.ts`
- `privacy.router.ts`
- `dataExport.router.ts`

**Suggested screens**

- `/(guest)/account/privacy`
- `/admin/(admin)/privacy`
- `/hotel/management/privacy`

---

### 18.2.4 Workflow & Events OS

The product now depends on many cross-domain triggers. Do not leave these as implicit side effects.

Examples:

- booking created → guest memory update
- check-in completed → Wi-Fi + in-stay guide + upsell
- low rating received → incident + recovery workflow
- same-night inventory opened → campaign trigger
- vehicle handover completed → fulfillment completion
- job application created → recruiter workflow
- pharmacy search after midnight → emergency support routing suggestions

**Core models to add**

- `DomainEvent`
- `EventSubscription`
- `WorkflowRun`
- `WorkflowStep`
- `WorkflowFailureLog`
- `IdempotencyKey`

**Routers**

- `workflow.router.ts`
- `eventAdmin.router.ts`

**Suggested screens**

- `/admin/(admin)/workflows`
- `/admin/(admin)/events`

---

### 18.2.5 Search & Ranking OS

Because the platform now includes hotels, homes, vehicles, amenities, essential services, local producers, wellness, and jobs, discovery needs its own brain.

This layer must support:

- entity-specific ranking
- locale-aware ranking
- trust-aware ranking
- accessibility-aware ranking
- tier-aware ranking
- inventory-aware ranking
- cold-start fallback logic
- recommendation reasoning
- “why this result?” support

**Core models to add**

- `SearchDocument`
- `RankingPolicy`
- `RankingExperiment`
- `RecommendationCandidate`
- `SearchExplanation`
- `PersonalizationWeight`

**Routers**

- `search.router.ts`
- `ranking.router.ts`
- `recommendation.router.ts`

**Suggested screens**

- `/admin/(admin)/search`
- `/hotel/management/search-insights`

---

### 18.2.6 Supplier Onboarding & Quality Assurance OS

The platform now supports many supplier types:

- hotels
- trusted stay hosts
- mobility providers
- pharmacies / hospitals / clinics / vets
- local producers
- wellness partners
- experience partners
- campus partners

A shared but configurable onboarding system is required.

**Core models to add**

- `SupplierOnboardingCase`
- `OnboardingChecklist`
- `InspectionReport`
- `CapabilityProfile`
- `ServiceCoverageArea`
- `SlaProfile`

**Routers**

- `supplierOnboarding.router.ts`
- `inspection.router.ts`
- `sla.router.ts`

**Suggested screens**

- `/partner/onboarding`
- `/admin/(admin)/supplier-onboarding`
- `/admin/(admin)/inspections`

---

### 18.2.7 Unified Support & Dispute OS

Support must work across all entities and domains:

- bookings
- homes
- mobility
- wellness
- essential services
- local producers
- staff incidents
- partner fulfillment
- refunds and damage claims

**Core models to add**

- `SupportConversation`
- `SupportQueue`
- `SupportRoutingRule`
- `CompensationGrant`
- `KnowledgeArticle`
- `SupportSlaTimer`

**Routers**

- `support.router.ts`
- `supportQueue.router.ts`
- `knowledgeBase.router.ts`

**Suggested screens**

- `/(guest)/support`
- `/hotel/operations/support`
- `/partner/support`
- `/admin/(admin)/support`

---

### 18.2.8 Localization & Cross-Border OS

The platform is no longer domestic-only in concept. It must support international travelers, international local-producer discovery, multi-language guidance, and different regulatory contexts.

**Core models to add**

- `LocalePack`
- `CurrencyRule`
- `JurisdictionRule`
- `TranslationMemory`
- `CrossBorderNotice`

**Routers**

- `localization.router.ts`
- `currency.router.ts`
- `jurisdiction.router.ts`

**Suggested screens**

- `/admin/(admin)/localization`
- `/admin/(admin)/jurisdictions`

---

### 18.2.9 Reliability & Observability OS

As the ecosystem grows, production reliability must be modeled explicitly.

Track:

- failed syncs
- payout failures
- queue failures
- SLA breaches
- latency spikes
- partner downtime
- fulfillment failures
- suspicious failure patterns

**Core models to add**

- `SystemHealthSnapshot`
- `JobFailureRecord`
- `SlaBreachEvent`
- `LatencyMetric`
- `ReliabilityIncident`

**Routers**

- `observability.router.ts`
- `health.router.ts`
- `slaIncident.router.ts`

**Suggested screens**

- `/admin/(admin)/reliability`
- `/admin/(admin)/system-health`

---

## 18.3 Deep Mobility Exchange v2

Mobility must now be treated as a full marketplace and fulfillment operating system.

### 18.3.1 Supported business models

The mobility layer must support all of the following simultaneously:

1. **Rental company direct supply**
2. **Hotel direct fleet**
3. **Hotel resale of rental-company inventory**
4. **Hotel on-demand sourcing from rental companies**
5. **Mixed marketplace discovery across all mobility supply**

### 18.3.2 Modeling distinctions that must be explicit

For every reservation, quote, and vehicle offer, the system must know:

- who owns the inventory
- who sells the reservation
- who fulfills the handover
- who operates pickup
- who operates return
- where pickup happens
- where return happens
- whether the hotel acts as provider, reseller, sourcing operator, or pickup location

### 18.3.3 Pickup and return hub types

Support hub types and pickup/return modes explicitly:

**Hub types**

- `AIRPORT`
- `HOTEL`
- `CITY_OFFICE`
- `DELIVERY_POINT`

**Pickup / return modes**

- `AIRPORT_COUNTER`
- `AIRPORT_MEET_GREET`
- `HOTEL_DESK`
- `HOTEL_VALET`
- `CITY_OFFICE`
- `DELIVERY_TO_HOTEL`
- `DELIVERY_TO_ADDRESS`

### 18.3.4 Commercial and sourcing cases

The architecture must support:

- hotel-level mobility contracts
- reseller rules
- sourcing requests
- fleet allocation
- revenue split
- white-label mobility presentation for hotel guests
- one provider supplying another under contract

### 18.3.5 Operations and assurance additions

Mobility v2 should also support:

- live vehicle substitution flow
- late arrival protection for delayed flights
- hotel concierge override
- driver document pre-check
- pickup assurance card
- damage inspection and return evidence
- deposit and insurance logic
- pet-friendly and accessibility-ready vehicles

### 18.3.6 Mobility models to add

**Provider and fleet**

- `VehicleProvider`
- `VehicleProviderRole`
- `VehicleFleet`
- `VehicleAsset`
- `VehicleCategory`
- `VehicleAvailabilityCalendar`

**Pickup / return**

- `PickupHub`
- `PickupWindow`
- `ReturnHub`
- `ReturnRule`

**Commercial**

- `HotelMobilityContract`
- `FleetSourcingRequest`
- `FleetAllocation`
- `VehicleResaleRule`
- `MobilityRevenueSplit`

**Pricing / booking**

- `VehicleQuote`
- `VehicleRatePlan`
- `RentalReservation`
- `RentalAddOn`
- `DriverOption`
- `InsuranceOption`
- `FuelPolicy`
- `MileagePolicy`

**Fulfillment**

- `VehicleHandover`
- `VehicleInspection`
- `VehicleDamageReport`
- `VehicleReturnLog`
- `AirportDeskAssignment`
- `HotelDeskAssignment`

**Eligibility / compliance**

- `DriverDocument`
- `LicenseVerification`
- `RentalEligibilityRule`
- `DepositHold`
- `MobilityDisputeCase`

**Accessibility / pets**

- `VehicleAccessibilityProfile`
- `AccessibilityEquipment`
- `AccessiblePickupSupport`
- `VehiclePetPolicy`
- `ServiceAnimalTransportRule`
- `PetCleaningRule`

### 18.3.7 Mobility surfaces

**Guest**

- `/(guest)/mobility`
- `/(guest)/mobility/search`
- `/(guest)/mobility/[vehicleId]`
- `/(guest)/mobility/checkout`
- `/(guest)/mobility/reservations`

**Rental company operators**

- `/partner/mobility/fleet`
- `/partner/mobility/vehicles`
- `/partner/mobility/pickup-hubs`
- `/partner/mobility/rates`
- `/partner/mobility/contracts`
- `/partner/mobility/reservations`

**Hotel mobility console**

- `/hotel/mobility`
- `/hotel/mobility/providers`
- `/hotel/mobility/pickup-points`
- `/hotel/mobility/contracts`
- `/hotel/mobility/offers`
- `/hotel/mobility/on-demand-requests`

---

## 18.4 Essential Services Marketplace → Care Navigation Layer

The essential services domain must evolve from simple listing discovery into **care navigation**.

### 18.4.1 Discovery should support

- nearby pharmacies
- overnight pharmacies
- hospitals
- clinics
- labs
- veterinary support
- emergency support
- healthcare-adjacent travel needs

### 18.4.2 Care navigation should support

- what type of place to go to depending on need
- whether the provider is open now
- whether foreign-language support is available
- whether hotel delivery / medicine delivery is possible
- insurance / payment type notes
- whether transport is needed
- concierge handoff and support linkage

### 18.4.3 Core models to add or deepen

- `EssentialServiceProvider`
- `EssentialServiceType`
- `CareNavigationRule`
- `OpenNowStatusSnapshot`
- `LanguageSupportProfile`
- `InsuranceAcceptanceProfile`
- `EmergencyRoutingGuide`
- `DeliveryCapabilityProfile`

### 18.4.4 Routers

- `essentialServices.router.ts`
- `careNavigation.router.ts`
- `emergencyRouting.router.ts`

### 18.4.5 Screens

- `/(guest)/essential-services`
- `/(guest)/pharmacies`
- `/(guest)/care-navigation`
- `/hotel/concierge/essential-services`

---

## 18.5 Local Producer Marketplace → Hospitality-Linked Local Commerce

The local producer marketplace should not behave like generic e-commerce. It should become **hospitality-linked local commerce**.

### 18.5.1 Supported use cases

- welcome gift packs
- in-room curated baskets
- destination-based local producer discovery
- airport pickup gift bundles
- post-stay reorder flows
- region-specific story pages
- verified origin and authenticity
- B2B hotel sourcing from local producers
- domestic and international regional producer discovery

### 18.5.2 Core models to add or deepen

- `ProducerProfile`
- `ProducerOriginVerification`
- `LocalProduct`
- `ProducerCatalog`
- `HotelGiftBundle`
- `InRoomBasketConfig`
- `ProducerFulfillmentOption`
- `ProducerStoryPage`
- `PostStayReorderLink`
- `B2BSourcingRequest`

### 18.5.3 Routers

- `producer.router.ts`
- `localCommerce.router.ts`
- `giftBundle.router.ts`
- `sourcing.router.ts`

### 18.5.4 Screens

- `/(guest)/local-producers`
- `/(guest)/local-producers/[slug]`
- `/(guest)/gift-bundles`
- `/hotel/commerce/local-producers`
- `/hotel/commerce/gift-bundles`
- `/hotel/commerce/sourcing`

---

## 18.6 Architecture Summary of What Was Still Missing

After v5.0, the architecture should explicitly include all of the following as first-class contexts or shared backbone systems:

- `Integration OS`
- `Payments, Tax & Refund OS`
- `Privacy & Data Governance OS`
- `Workflow & Events OS`
- `Search & Ranking OS`
- `Supplier Onboarding & Quality Assurance OS`
- `Unified Support & Dispute OS`
- `Localization & Cross-Border OS`
- `Reliability & Observability OS`
- `Mobility Exchange v2`
- `Care Navigation Layer`
- `Hospitality-Linked Local Commerce Layer`

These additions move the project from a feature-rich platform design into an architecture that is much more **operationally durable, scalable, and production-realistic**.

---

## 18.7 Claude Code Implementation Note for v5.0

When implementing v5.0 additions:

1. Add the backbone contexts before deeply coupling more marketplace features
2. Keep mobility, essential services, and local commerce modular but connected through shared trust, contracts, fulfillment, and support systems
3. Ensure every new marketplace entity can be:
   - onboarded
   - verified
   - searched
   - fulfilled
   - supported
   - settled
   - audited
4. Keep guest-side flows mobile-first and hotel/partner-side flows operations-first
5. Reuse the existing modular monolith structure and add new router groups rather than collapsing these domains into generic tables

---

# 19. v6.0 Additions: Competitive Scale Backbone, Inventory Intelligence, and Platform Moat

## 19.1 Why These Additions Matter

At this stage, the platform is already much broader than a classic OTA or a classic hotel PMS. It combines marketplace, hotel operations, guest experience, trust, talent, mobility, essential services, and local commerce. The remaining architectural gap is no longer feature breadth; it is **scale backbone, financial discipline, integration depth, and decision governance**.

These v6.0 additions are the systems that make the platform realistically competitive against three major classes of products:

- marketplace competitors (e.g. large OTA and alternative stay marketplaces)
- hotel operating system competitors (e.g. PMS / hotel OS products)
- partner distribution and API network competitors

The purpose of v6.0 is to ensure the platform is not only visionary, but also **operationally durable, financially reconcilable, integration-ready, legally adaptable, and decision-governed**.

---

## 19.2 Canonical Inventory & Availability Engine

### 19.2.1 Problem it solves

The platform now supports many inventory classes:

- hotel rooms
- trusted stays
- amenity slots
- wellness slots
- mobility vehicles
- local experiences
- producer inventory

Without a shared inventory state model, oversell, race conditions, stale availability, and inconsistent reservation holds will occur.

### 19.2.2 New bounded context

- `Inventory & Availability OS`

### 19.2.3 Core models

- `InventoryEntity`
- `AvailabilityUnit`
- `AvailabilityLock`
- `InventoryReservationHold`
- `InventoryStateTransition`
- `AvailabilitySnapshot`
- `InventoryOverbookIncident`

### 19.2.4 Routers

- `inventory.router.ts`
- `availability.router.ts`
- `reservationHold.router.ts`

### 19.2.5 Screens

- `/hotel/inventory`
- `/hotel/inventory/holds`
- `/partner/inventory`
- `/admin/(admin)/inventory-monitoring`

### 19.2.6 Architectural rule

All bookable entities must either:

1. directly use the canonical inventory engine, or
2. publish normalized availability snapshots into it.

---

## 19.3 Pricing Brain / Rules & Experimentation Engine

### 19.3.1 Problem it solves

Pricing now exists across rooms, same-night rescue, night-use, bundles, wellness, mobility, local producer commerce, and premium access. Without a shared pricing system, pricing logic becomes fragmented and impossible to test or explain.

### 19.3.2 New bounded context

- `Pricing Brain OS`

### 19.3.3 Core models

- `PricingRule`
- `PriceDecision`
- `PriceExperiment`
- `BundlePricingPolicy`
- `DynamicMarkupRule`
- `PromotionConstraint`
- `PriceAuditLog`

### 19.3.4 Routers

- `pricing.router.ts`
- `priceExperiment.router.ts`
- `promotion.router.ts`

### 19.3.5 Screens

- `/hotel/revenue/pricing-rules`
- `/hotel/revenue/experiments`
- `/admin/(admin)/pricing-governance`

### 19.3.6 Architectural rule

Every generated price should be explainable through a stored `PriceDecision` object.

---

## 19.4 API Productization Layer

### 19.4.1 Problem it solves

Internal tRPC is not enough if the platform wants to become a partner ecosystem, white-label platform, or external travel/mobility/talent network.

### 19.4.2 New bounded context

- `API Product OS`

### 19.4.3 Core models

- `ApiClient`
- `ApiCredential`
- `ApiScope`
- `ApiUsageLog`
- `PartnerWebhookSubscription`
- `DeveloperApp`
- `ApiRateLimitPolicy`

### 19.4.4 Routers

- `apiClient.router.ts`
- `developerPortal.router.ts`
- `apiUsage.router.ts`

### 19.4.5 Screens

- `/partner/developer`
- `/partner/developer/keys`
- `/admin/(admin)/api-clients`
- `/admin/(admin)/api-usage`

### 19.4.6 Architectural rule

Partner-facing APIs must be productized with scopes, rate limits, webhooks, and lifecycle management.

---

## 19.5 Data Warehouse / BI / Reverse ETL Layer

### 19.5.1 Problem it solves

Operational DBs should not become the only analytics system. The platform now needs cohorting, LTV, attach rate, staff quality, sourcing profitability, ranking feedback, and product analytics.

### 19.5.2 New bounded context

- `Analytics & BI OS`

### 19.5.3 Core models

- `AnalyticsExportJob`
- `SemanticMetric`
- `MetricSnapshot`
- `CohortDefinition`
- `ReverseEtlSync`
- `ReportDefinition`
- `DashboardPreset`

### 19.5.4 Routers

- `analyticsWarehouse.router.ts`
- `reporting.router.ts`
- `cohort.router.ts`

### 19.5.5 Screens

- `/hotel/insights`
- `/hotel/insights/reports`
- `/admin/(admin)/analytics`
- `/admin/(admin)/reverse-etl`

### 19.5.6 Architectural rule

Keep operational truth and analytical truth separated, but synchronized.

---

## 19.6 ML Ops / Decision Governance Layer

### 19.6.1 Problem it solves

Guest memory, recommendations, ops forecasts, trust scores, and talent discovery will all create machine-assisted decisions. Those decisions need auditability, fairness review, versioning, and rollback support.

### 19.6.2 New bounded context

- `Decision Governance OS`

### 19.6.3 Core models

- `ModelRegistry`
- `InferenceRun`
- `FeatureSnapshot`
- `DecisionPolicy`
- `EvaluationReport`
- `BiasReview`
- `ModelRolloutWindow`

### 19.6.4 Routers

- `modelRegistry.router.ts`
- `inference.router.ts`
- `decisionPolicy.router.ts`
- `modelEvaluation.router.ts`

### 19.6.5 Screens

- `/admin/(admin)/models`
- `/admin/(admin)/decision-policies`
- `/admin/(admin)/evaluations`

### 19.6.6 Architectural rule

No high-impact recommendation or score should exist without: model version, inputs, decision policy, and audit visibility.

---

## 19.7 Offline-First Staff App / Ops Mobile Layer

### 19.7.1 Problem it solves

Operational teams often work in motion, with unstable connectivity. Staff tools for tasks, handover, tips, inspections, and recovery need offline resilience.

### 19.7.2 New bounded context

- `Field Operations Mobile OS`

### 19.7.3 Core models

- `DeviceSession`
- `OfflineActionQueue`
- `SyncConflictLog`
- `FieldTaskProof`
- `MobilePushReceipt`
- `QrScanEvent`

### 19.7.4 Routers

- `deviceSession.router.ts`
- `offlineSync.router.ts`
- `fieldOps.router.ts`

### 19.7.5 Screens

- `/hotel/ops/mobile`
- `/hotel/ops/mobile/tasks`
- `/hotel/ops/mobile/handover`

### 19.7.6 Architectural rule

Any critical staff-side operational flow must have an eventual-sync-safe mobile execution path.

---

## 19.8 Legal / Jurisdiction Rules Engine

### 19.8.1 Problem it solves

The platform spans homes, vehicles, healthcare discovery, accessibility, service animals, jobs, and cross-border use cases. Legal and policy rules vary by region, property type, and service type.

### 19.8.2 New bounded context

- `Jurisdiction & Compliance Rules OS`

### 19.8.3 Core models

- `JurisdictionRule`
- `RegulatoryRequirement`
- `LicenseRequirement`
- `ServiceEligibilityRule`
- `CountrySpecificPolicy`
- `ComplianceExceptionCase`

### 19.8.4 Routers

- `jurisdiction.router.ts`
- `complianceRule.router.ts`
- `licenseRule.router.ts`

### 19.8.5 Screens

- `/admin/(admin)/jurisdictions`
- `/admin/(admin)/compliance-rules`
- `/partner/compliance`

### 19.8.6 Architectural rule

Regulated service behavior must be driven by configurable jurisdiction logic, not hardcoded assumptions.

---

## 19.9 Partner Self-Serve Onboarding Studio

### 19.9.1 Problem it solves

The platform now supports many supplier types: hotels, hosts, mobility providers, clinics, pharmacies, local producers, experience partners, and campus partners. Manual onboarding will not scale.

### 19.9.2 New bounded context

- `Partner Onboarding Studio`

### 19.9.3 Core models

- `OnboardingTemplate`
- `OnboardingStepSubmission`
- `PartnerReadinessScore`
- `LaunchChecklist`
- `CapabilityVerification`
- `OnboardingSupportRequest`

### 19.9.4 Routers

- `partnerOnboarding.router.ts`
- `launchChecklist.router.ts`
- `capabilityVerification.router.ts`

### 19.9.5 Screens

- `/partner/onboarding`
- `/partner/onboarding/checklist`
- `/admin/(admin)/partner-onboarding`

### 19.9.6 Architectural rule

Every supplier category must have a self-serve but verification-aware onboarding path.

---

## 19.10 Reconciliation & Ledger OS

### 19.10.1 Problem it solves

Multi-sided revenue is now spread across bookings, mobility, amenities, wellness, local commerce, tips, and premium products. Settlement alone is not enough; a ledger and reconciliation layer is required.

### 19.10.2 New bounded context

- `Ledger & Reconciliation OS`

### 19.10.3 Core models

- `LedgerEntry`
- `AccountBalance`
- `ReconciliationBatch`
- `PayoutReconciliationLine`
- `AdjustmentEntry`
- `LedgerAccount`

### 19.10.4 Routers

- `ledger.router.ts`
- `reconciliation.router.ts`
- `adjustment.router.ts`

### 19.10.5 Screens

- `/hotel/finance/ledger`
- `/partner/finance/ledger`
- `/admin/(admin)/reconciliation`

### 19.10.6 Architectural rule

Every money-moving event should result in explicit ledger entries before reconciliation.

---

## 19.11 Knowledge Graph / Entity Graph

### 19.11.1 Problem it solves

The platform now contains many connected entities: guests, hotels, homes, staff, providers, pickup hubs, experiences, producers, trust signals, and resolutions. A graph layer improves recommendation, investigation, fulfillment logic, and trust reasoning.

### 19.11.2 New bounded context

- `Entity Graph OS`

### 19.11.3 Core models

- `EntityGraphNode`
- `EntityGraphEdge`
- `RelationshipConfidence`
- `GraphInference`
- `GraphAnnotation`

### 19.11.4 Routers

- `entityGraph.router.ts`
- `graphInference.router.ts`

### 19.11.5 Screens

- `/admin/(admin)/entity-graph`
- `/admin/(admin)/relationship-review`

### 19.11.6 Architectural rule

Use the graph layer to enrich reasoning, not to replace source-of-truth domain tables.

---

## 19.12 Deep Mobility Exchange Enhancements

### 19.12.1 Additional required behaviors

The mobility architecture must also support:

- live vehicle substitution if assigned inventory becomes unavailable
- late arrival protection for flight-delay scenarios
- hotel concierge override for guest-facing changes
- driver document pre-check before handover
- pickup assurance card showing:
  - who sold the booking
  - who owns the vehicle
  - who fulfills pickup
  - where pickup happens
  - where return happens
  - what documents are needed
  - what happens if the guest is late

### 19.12.2 New mobility models to add

- `VehicleSubstitutionRule`
- `LateArrivalProtectionRule`
- `DriverPrecheckCase`
- `PickupAssuranceCard`
- `ConciergeMobilityOverride`

### 19.12.3 New routers

- `mobilityPrecheck.router.ts`
- `vehicleSubstitution.router.ts`
- `pickupAssurance.router.ts`

### 19.12.4 New screens

- `/(guest)/mobility/pickup-assurance`
- `/hotel/mobility/overrides`
- `/partner/mobility/prechecks`

---

## 19.13 Care Navigation Deepening

### 19.13.1 Problem it solves

Essential services should not remain a static directory. They should help guests navigate the right service at the right moment.

### 19.13.2 New bounded context

- `Care Navigation OS`

### 19.13.3 Core models

- `CareNavigationRule`
- `ProviderServiceCapability`
- `UrgencyRoutingProfile`
- `LanguageSupportProfile`
- `DeliverySupportOption`

### 19.13.4 Routers

- `careNavigation.router.ts`
- `providerCapability.router.ts`

### 19.13.5 Screens

- `/(guest)/care`
- `/(guest)/care/urgent`
- `/(guest)/care/pharmacy-delivery`

### 19.13.6 Architectural rule

Care-related flows must clearly distinguish informational guidance from regulated medical or pharmacy actions.

---

## 19.14 Hospitality-Linked Local Commerce Deepening

### 19.14.1 Problem it solves

Local producer commerce should support both guest delight and hotel sourcing, not just product listing.

### 19.14.2 Expanded use cases

- in-room gift basket programs
- welcome gifts for VIP / Plus tiers
- producer story surfaces in city companion
- airport / hotel pickup gift add-ons
- post-stay reorder links
- hotel procurement from regional producers

### 19.14.3 New models

- `ProducerProcurementRule`
- `GiftEligibilityRule`
- `ProducerRegionMap`
- `GuestReorderPreference`

### 19.14.4 New routers

- `producerProcurement.router.ts`
- `reorder.router.ts`

### 19.14.5 New screens

- `/hotel/commerce/procurement`
- `/(guest)/local-producers/reorder`

---

## 19.15 Router Groups to Add for v6.0

Add the following router groups under `packages/api/src/routers/`:

```text
inventory/
pricing/
api-product/
analytics/
decision-governance/
field-ops/
jurisdiction/
partner-onboarding/
ledger/
entity-graph/
care-navigation/
```

---

## 19.16 Page Tree Additions for v6.0

```text
(guest)/
  care
  care/urgent
  care/pharmacy-delivery
  mobility/pickup-assurance
  local-producers/reorder

hotel/
  inventory
  inventory/holds
  revenue/pricing-rules
  revenue/experiments
  finance/ledger
  mobility/overrides
  commerce/procurement
  ops/mobile
  ops/mobile/tasks
  ops/mobile/handover

partner/
  developer
  developer/keys
  finance/ledger
  mobility/prechecks
  onboarding
  onboarding/checklist
  inventory

admin/(admin)/
  inventory-monitoring
  pricing-governance
  api-clients
  api-usage
  analytics
  reverse-etl
  models
  decision-policies
  evaluations
  jurisdictions
  compliance-rules
  partner-onboarding
  reconciliation
  entity-graph
  relationship-review
```

---

## 19.17 Architecture Summary of What v6.0 Adds

v6.0 closes the most important competitive and operational gaps by adding:

- canonical inventory and availability control
- centralized pricing decisions and experimentation
- external API productization
- analytics/BI and reverse ETL
- model governance and decision auditability
- offline-capable field operations
- jurisdiction and compliance rules
- scalable self-serve supplier onboarding
- ledger and reconciliation discipline
- entity graph reasoning support
- deeper mobility handover assurance
- care navigation intelligence
- hospitality-linked local commerce extensions

These are the systems that move the platform from “highly ambitious product architecture” toward a **category-defining, execution-ready hospitality ecosystem platform**.

---

## 19.18 Claude Code Implementation Note for v6.0

When implementing v6.0 additions:

1. Build shared backbone layers before deepening more marketplace UI
2. Make inventory, pricing, ledger, and workflow foundational across all bookable/sellable entities
3. Keep all new layers modular and tenant-aware
4. Add audit, entitlement, and policy enforcement to every high-impact domain
5. Prioritize explainability for prices, recommendations, trust scores, and mobility handovers
6. Ensure care navigation, accessibility, service-animal readiness, and jurisdiction logic remain structured and policy-driven
7. Preserve the modular monolith and expand via bounded contexts, router groups, migrations, and scaffolds rather than rewrites

---

# 20. v7.0 Additions: Product Clarification, Inclusive Hosting, and Experience Moat

## 20.1 Why v7.0 Was Needed

By v6.0, the platform had broad feature coverage and strong operating-backbone thinking. The next missing layer was **clarity and lived usability**.

The conversation after v6.0 clarified that the product must now answer four foundational questions more explicitly:

1. **Who exactly uses the platform?**
2. **What accommodation types and operating models are supported?**
3. **What is the real core feature priority versus the differentiation layer?**
4. **How does the business model behave in practice across SaaS, marketplace, and white-label modes?**

At the same time, the product also needs stronger support for:

- home hosts and trusted non-hotel inventory
- accessibility truth and inclusive travel
- pets and service animals
- family travel
- multilingual coordination
- corporate / managed travel
- guarantee and assurance systems
- fraud and risk discipline
- loyalty and context-aware personalization

v7.0 therefore adds the **clarification layer** and the **human-experience moat layer**.

---

## 20.2 Product Clarification Layer

### 20.2.1 Who the Platform Is For

The platform must explicitly operate as a **role-based multi-surface ecosystem**.

Primary actor classes:

- Guests / travelers
- Hotel staff
- Hotel managers / owners
- Platform admins / platform ops
- Partners (mobility, essentials, local producers, experience operators, trusted hosts, campus partners)
- Corporate travel coordinators / company travel managers
- Home hosts / trusted stay operators

This means the platform is **not** a single user app. It is a shared ecosystem with role-restricted surfaces and cross-domain workflows.

### 20.2.2 Multi-Surface Product Map

The following surfaces must now be considered first-class:

- Guest Surface
- Hotel Operations Surface
- Hotel Management Surface
- Hotel HR Surface
- Partner Surface
- Host Surface
- Corporate Travel Surface
- Admin Surface

### 20.2.3 Supported Accommodation Types

The platform must support multi-tenant and multi-property hospitality across:

- hotels
- boutique hotels
- resorts
- serviced apartments
- trusted homes
- villas
- monthly stay units
- wellness retreats
- hybrid property groups that operate multiple formats

Additive modeling rule:

- `Property` becomes the canonical business entity abstraction
- `Hotel` remains valid as an operational specialization where relevant
- homes, villas, and other non-hotel inventory should still plug into shared trust, revenue, and booking flows

### 20.2.4 Core Feature Priority Clarification

The platform must clearly separate:

#### Foundation

- booking core
- inventory and availability
- pricing
- role-aware management and operations

#### Differentiation

- guest memory and personalization
- in-stay orchestration
- same-night and revenue rescue
- amenity / mobility / city companion
- trust and transparency

#### Ecosystem moat

- talent marketplace
- host success and inclusive stay
- loyalty graph
- context engine
- multilingual experience layer
- corporate and managed travel

### 20.2.5 Revenue Model Clarification

The revenue model remains hybrid, but is now clarified operationally:

#### Primary revenue

- B2B SaaS plans for hotels, property groups, operators, and enterprise customers
- marketplace commissions for bookable and sellable entities

#### Secondary revenue

- white-label enterprise deployments
- premium visibility / premium hiring / premium discovery tools
- corporate travel services

#### Internal mode

- own-property flagship tenant for testing and first-party operation

Architectural implication:
Revenue logic must be explicit in contracts, payout, attribution, and access rules rather than implied by UI position alone.

---

## 20.3 Host Success & Home Hosting OS Deepening

### 20.3.1 Problem it solves

Hosts and trusted-stay operators often struggle with:

- guest trust uncertainty
- operational overload
- damage / incident anxiety
- inconsistent listing quality
- unclear house rules
- accessibility mismatch
- pet mismatch
- low repeat guest retention

The platform must therefore treat home hosting as a **managed operating system**, not just a listing feature.

### 20.3.2 New bounded context

- `Host Success OS`

### 20.3.3 Core host-side capabilities

- readiness scoring
- rule standardization
- incident and damage handling
- repeated guest capture
- trust projection
- accessibility and pet readiness management
- service quality analytics for hosts

### 20.3.4 Core models to add or deepen

- `HostControlCenter`
- `HostOperatingPolicy`
- `HomeReadinessScore`
- `HouseRuleTemplate`
- `IncidentCase`
- `DamageClaim`
- `DamageEvidence`
- `RepeatGuestOffer`
- `HostPerformanceSnapshot`
- `HostMessageTemplate`
- `HostCheckinGuide`
- `HostCleaningCycle`
- `HostIssuePattern`

### 20.3.5 Routers

- `hostControl.router.ts`
- `homeReadiness.router.ts`
- `houseRules.router.ts`
- `hostIncident.router.ts`
- `damageClaim.router.ts`
- `repeatGuest.router.ts`

### 20.3.6 Screens

**Host Surface**

- `/host/dashboard`
- `/host/readiness`
- `/host/house-rules`
- `/host/incidents`
- `/host/damage-claims`
- `/host/repeat-guests`
- `/host/accessibility`
- `/host/pet-readiness`

### 20.3.7 Architectural rule

Hosts must never need to represent complex operational truth purely through free text. Rules, readiness, accessibility, pet suitability, and evidence must be structured.

---

## 20.4 Inclusive Stay OS Deepening

### 20.4.1 Problem it solves

“Accessible” is frequently treated as a vague marketing tag, causing booking mismatches and poor experiences.

The platform must instead support **proof-based accessibility**.

### 20.4.2 New bounded context

- `Inclusive Stay OS`

### 20.4.3 Required modeling rule

Accessibility must be captured as structured capability data, not a single boolean field.

### 20.4.4 Core models to add or deepen

- `AccessibilityPassport`
- `AccessibilityFeature`
- `AccessibilityMeasurement`
- `AccessibilityPhotoVerification`
- `AccessibleArrivalGuide`
- `AccessibilitySupportRequest`
- `AccessibilityCompatibilityScore`
- `SensoryProfile`
- `HearingSupportFeature`
- `VisualSupportFeature`

### 20.4.5 Accessibility data examples

Structured fields should include:

- step-free entrance
- doorway width
- ramp availability
- elevator access
- step-free bathroom access
- step-free shower
- shower chair
- grab bars
- bed-side maneuvering clearance
- parking accessibility
- low sensory / low noise suitability
- visual / hearing support features

### 20.4.6 Routers

- `accessibilityPassport.router.ts`
- `accessibilityVerification.router.ts`
- `accessibleArrival.router.ts`
- `inclusiveStay.router.ts`

### 20.4.7 Screens

**Guest**

- `/(guest)/inclusive-stay`
- `/(guest)/accessibility-needs`
- `/(guest)/accessible-arrival`

**Host / Hotel**

- `/host/accessibility`
- `/hotel/trust/accessibility`

### 20.4.8 Architectural rule

Critical accessibility claims must support evidence, moderation, or verification workflows before being surfaced as high-confidence public attributes.

---

## 20.5 Animal Travel & Service Animal Assurance

### 20.5.1 Problem it solves

The product must distinguish clearly between:

- normal pet-friendly stays
- service-animal-ready stays

These are **not** the same policy surface and must not be collapsed into one configuration.

### 20.5.2 New bounded context

- `Animal Travel OS`

### 20.5.3 Core models to add or deepen

- `PetPolicyProfile`
- `PetStayProfile`
- `PetAmenity`
- `PetFeeRule`
- `PetCompatibilityScore`
- `ServiceAnimalReadiness`
- `ServiceAnimalTransportRule`
- `AnimalIncidentCase`
- `PetCleaningRule`
- `NearbyVetSupportLink`

### 20.5.4 Required business rules

- service animals must be modeled separately from pets
- pet fee logic must not be reused for service-animal readiness
- guest-side filters must distinguish “pet-friendly” from “service-animal-ready”
- host-side configuration must make legal/policy constraints visible

### 20.5.5 Routers

- `petPolicy.router.ts`
- `petStay.router.ts`
- `serviceAnimal.router.ts`
- `animalTravel.router.ts`

### 20.5.6 Screens

**Guest**

- `/(guest)/pets`
- `/(guest)/service-animal-support`

**Host / Hotel**

- `/host/pet-readiness`
- `/hotel/trust/service-animals`

### 20.5.7 Architectural rule

The platform must never assume that “pet allowed” equals “service animal supported,” and must never expose misleading simplifications here.

---

## 20.6 Family & Child Travel Layer

### 20.6.1 Problem it solves

Family travelers have materially different needs than solo or business guests. The platform needs a dedicated family suitability model rather than generic copy.

### 20.6.2 New bounded context

- `Family Travel OS`

### 20.6.3 Core models

- `FamilyReadinessProfile`
- `ChildAmenity`
- `BabyEquipmentPolicy`
- `FamilyRoomConfiguration`
- `ChildSafetyFeature`
- `FamilyExperienceBundle`

### 20.6.4 Key features

- crib / baby bed support
- high chair availability
- connecting room support
- stroller-friendly entry
- child-safe property notes
- child-friendly dining / activity support
- family scenario bundles

### 20.6.5 Routers

- `familyTravel.router.ts`
- `childAmenity.router.ts`
- `familyBundle.router.ts`

### 20.6.6 Screens

- `/(guest)/family-travel`
- `/hotel/family`
- `/host/family-readiness`

---

## 20.7 Multilingual Communication & Translation OS

### 20.7.1 Problem it solves

Guests, hosts, hotel teams, drivers, essential-service partners, and local producers may not share a language. Communication friction can destroy otherwise valid experiences.

### 20.7.2 New bounded context

- `Multilingual Communication OS`

### 20.7.3 Core capabilities

- translated support threads
- translated guest-host chat
- translated stay instructions
- multilingual quick replies
- language support badges on providers/partners

### 20.7.4 Core models

- `ConversationThread`
- `ConversationMessage`
- `TranslationRecord`
- `QuickReplyTemplate`
- `LanguageCapabilityProfile`
- `MessageDeliveryReceipt`

### 20.7.5 Routers

- `conversation.router.ts`
- `translation.router.ts`
- `quickReply.router.ts`

### 20.7.6 Screens

- `/(guest)/messages`
- `/host/messages`
- `/hotel/operations/messages`
- `/partner/messages`

### 20.7.7 Architectural rule

Translation should always remain an assistive layer. Original message content must remain preserved for auditability.

---

## 20.8 Corporate & Managed Travel OS

### 20.8.1 Problem it solves

The platform currently supports traveler and property use cases well, but lacks a fully explicit B2B managed-travel layer for companies.

### 20.8.2 New bounded context

- `Corporate Travel OS`

### 20.8.3 Core models

- `CorporateAccount`
- `CorporateTravelerPolicy`
- `CorporateRateAgreement`
- `CorporateInvoiceProfile`
- `ExpenseRoutingRule`
- `TeamBookingRequest`
- `BusinessTravelerProfile`

### 20.8.4 Capabilities

- company travel policies
- invoicing and billing routing
- team or employee booking controls
- corporate-negotiated rates
- workstay and invoicing support
- compliance-safe managed travel experience

### 20.8.5 Routers

- `corporateAccount.router.ts`
- `managedTravel.router.ts`
- `corporateBilling.router.ts`

### 20.8.6 Screens

- `/corporate/dashboard`
- `/corporate/travelers`
- `/corporate/policies`
- `/corporate/invoices`

---

## 20.9 Hospitality Guarantee & Assurance Layer

### 20.9.1 Problem it solves

The platform now spans many trust-sensitive and operationally sensitive flows. Guests, hosts, hotels, and partners need explicit assurance mechanics.

### 20.9.2 New bounded context

- `Guarantee & Assurance OS`

### 20.9.3 Core assurance use cases

- listing mismatch
- accessibility mismatch
- pet suitability mismatch
- same-night failure or last-minute issue
- host incident handling
- damage and dispute handling
- pickup failure or mobility no-show
- unresolved service failure during stay

### 20.9.4 Core models

- `GuaranteePolicy`
- `GuaranteeClaim`
- `AssuranceDecision`
- `RecoveryGrant`
- `CoverageMatrix`
- `ExperienceMismatchCase`

### 20.9.5 Routers

- `guarantee.router.ts`
- `assurance.router.ts`
- `mismatchCase.router.ts`

### 20.9.6 Screens

- `/(guest)/guarantee`
- `/host/assurance`
- `/hotel/trust/guarantee`
- `/admin/(admin)/guarantee-cases`

### 20.9.7 Architectural rule

Assurance workflows must integrate with trust, dispute, refund, and recovery contexts rather than existing as isolated goodwill tools.

---

## 20.10 Fraud, Risk & Reputation Portability

### 20.10.1 Problem it solves

As the ecosystem expands, the platform needs stronger risk awareness without becoming punitive or opaque.

### 20.10.2 New bounded context

- `Fraud & Risk OS`

### 20.10.3 Core models

- `RiskProfile`
- `RiskSignal`
- `FraudReviewCase`
- `ReputationSnapshot`
- `PortableTrustSignal`
- `RiskDecisionLog`
- `ChargebackRiskSignal`

### 20.10.4 Design rule

Reputation portability should support trusted continuity across contexts (guest, host, partner, staff) **without** exposing a simplistic public score that creates harm or bias.

### 20.10.5 Routers

- `risk.router.ts`
- `fraudReview.router.ts`
- `portableTrust.router.ts`

### 20.10.6 Screens

- `/admin/(admin)/risk`
- `/admin/(admin)/fraud-review`
- `/hotel/trust/risk`

---

## 20.11 Loyalty Graph & Context Engine

### 20.11.1 Problem it solves

The platform’s moat is not just memory. It is contextual understanding:

- who the user is
- why they are traveling
- how long they stay
- where they are
- what they need now
- what mode they are in (business, wellness, family, urgent care, nomad, pet, accessibility)

### 20.11.2 New bounded contexts

- `Loyalty Graph OS`
- `Context Engine OS`

### 20.11.3 Core models

- `LoyaltyGraphNode`
- `LoyaltyGraphEdge`
- `BenefitProgressLedger`
- `ContextSession`
- `ContextSignal`
- `ContextMode`
- `ContextDecisionLog`

### 20.11.4 Capabilities

- context-aware recommendations
- benefits based on behavior, not only spend
- different hospitality modes for the same user across different trips
- explainable personalized ranking and package generation

### 20.11.5 Routers

- `loyaltyGraph.router.ts`
- `contextEngine.router.ts`
- `benefitProgress.router.ts`

### 20.11.6 Screens

- `/(guest)/benefits`
- `/(guest)/trip-mode`
- `/hotel/insights/context-modes`
- `/admin/(admin)/context-governance`

### 20.11.7 Architectural rule

Context must be modeled explicitly, not inferred ad hoc in random recommendation code paths.

---

## 20.12 Shared Model Additions for v7.0

Add or deepen the following shared models:

- `UserRoleAssignment`
- `HotelStaffAssignment`
- `PartnerAccountAssignment`
- `RolePermissionOverride`
- `CorporateAccount`
- `CorporateTravelerPolicy`
- `ConversationThread`
- `ConversationMessage`
- `TranslationRecord`
- `GuaranteePolicy`
- `GuaranteeClaim`
- `RiskProfile`
- `RiskSignal`
- `ContextSession`
- `ContextSignal`
- `LoyaltyGraphNode`
- `LoyaltyGraphEdge`

---

## 20.13 Router Groups to Add for v7.0

Add the following router groups under `packages/api/src/routers/`:

```text
host/
inclusive/
animals/
family/
communication/
corporate/
guarantee/
risk/
loyalty/
context/
```

Representative routers:

- `host/hostControl.router.ts`
- `host/homeReadiness.router.ts`
- `inclusive/accessibilityPassport.router.ts`
- `animals/serviceAnimal.router.ts`
- `family/familyTravel.router.ts`
- `communication/conversation.router.ts`
- `corporate/corporateAccount.router.ts`
- `guarantee/guarantee.router.ts`
- `risk/risk.router.ts`
- `loyalty/loyaltyGraph.router.ts`
- `context/contextEngine.router.ts`

---

## 20.14 Page Tree Additions for v7.0

```text
(guest)/
  inclusive-stay
  accessibility-needs
  pets
  service-animal-support
  family-travel
  messages
  guarantee
  benefits
  trip-mode

host/
  dashboard
  readiness
  house-rules
  incidents
  damage-claims
  repeat-guests
  accessibility
  pet-readiness
  family-readiness
  messages
  assurance

corporate/
  dashboard
  travelers
  policies
  invoices

hotel/
  trust/accessibility
  trust/service-animals
  trust/guarantee
  trust/risk
  operations/messages
  insights/context-modes

admin/(admin)/
  guarantee-cases
  risk
  fraud-review
  context-governance
```

---

## 20.15 Build Order for v7.0

### Step 12 — Product clarification and role expansion

- user role assignment
- host surface scaffolding
- corporate surface scaffolding
- surface-aware permissions

### Step 13 — Inclusive hosting and communication

- host success OS
- accessibility passport deepening
- pet/service-animal separation
- multilingual communication
- family travel layer

### Step 14 — Assurance, risk, and managed travel

- guarantee layer
- fraud and risk OS
- corporate travel OS
- portable trust signals

### Step 15 — Loyalty and context moat

- loyalty graph
- context engine
- benefit progress logic
- context-aware guest/hotel insights

---

## 20.16 Architecture Summary of What v7.0 Adds

v7.0 closes the most important product-clarity and human-experience gaps by adding:

- explicit role-based product clarity
- deeper host success and home-hosting operations
- proof-based inclusive stay modeling
- pet-friendly versus service-animal-ready separation
- family travel support
- multilingual communication infrastructure
- managed corporate travel support
- guarantee and assurance systems
- fraud and risk governance
- loyalty graph and explicit context modeling

These additions move the platform from a powerful marketplace and operating system into a much more **human-aware, category-defining hospitality ecosystem with durable product moat**.

---

## 20.17 Claude Code Implementation Note for v7.0

When implementing v7.0 additions:

1. Treat v7.0 as a clarification and moat layer, not a rewrite
2. Reuse v1–v6 domain primitives wherever possible
3. Keep host, accessibility, animals, family, corporate, and communication domains modular but interoperable
4. Ensure guarantee, risk, and context systems write audit trails
5. Preserve structured policy handling for accessibility, service animals, and corporate rules
6. Make loyalty and context explainable and entitlement-aware
7. Continue expanding via bounded contexts, router groups, migrations, and scaffolds rather than generic catch-all tables

---

# 21. v8.0 Additions: Governance, Payments, Search Intelligence, and Resilience

v8.0 adds the **missing core layers** required to make the platform durable at scale. Up to v7.0, the specification already established a strong marketplace, operations, trust, inclusive hosting, corporate, and context-aware guest experience foundation. v8.0 now formalizes the platform backbone needed to operate safely, monetize correctly, rank listings intelligently, support experiments, manage content, and respond to crises.

These additions are not “nice-to-have features.” They are the infrastructure that prevents the product from becoming a fragile collection of disconnected surfaces.

## 21.1 Why v8.0 Is Necessary

Once the platform supports:

- hotels
- trusted homes
- hosts
- partners
- accessibility claims
- pet and service-animal distinctions
- same-night pricing
- wellness and mobility upsells
- staff reviews and tips
- job applications
- corporate travel
- multilingual communication
- trust and moderation

…it starts processing sensitive data, money flows, disputes, operational incidents, and ranking decisions that cannot be handled informally.

v8.0 therefore adds the following platform-critical layers:

1. **Consent, Privacy, and Data Governance**
2. **Identity and Verification Stack**
3. **Payment Orchestration and Settlement Backbone**
4. **Pricing and Merchandising Engine**
5. **Search Quality and Ranking Engine**
6. **Experimentation and Product Analytics Layer**
7. **Content Operations and Localization Layer**
8. **Incident Command and Crisis Mode**
9. **Family Travel OS (expanded)**
10. **Medical and Assisted Travel Layer**
11. **Integration Hub**
12. **Advanced Context Intelligence Expansion**

---

## 21.2 Consent, Privacy, and Data Governance

### Purpose

The platform stores and processes preference memory, behavior data, accessibility information, multilingual conversations, staff feedback, internal conduct notes, and hospitality-workforce records. This requires a first-class governance layer.

### Core Principles

- explicit consent where needed
- field-level sensitivity awareness
- retention rules by data category
- explainable processing
- auditability of access
- minimization for internal risk notes
- user-controlled visibility for public-facing identity layers
- deletion / anonymization workflows

### New Enums

```prisma
enum ConsentCategory {
  MARKETING
  PERSONALIZATION
  ACCESSIBILITY_DISCLOSURE
  SERVICE_ANIMAL_SUPPORT
  STAFF_PROFILE_PUBLICITY
  CAREER_DISCOVERY
  CORPORATE_TRAVEL_PROCESSING
  ANALYTICS
}

enum SensitiveDataClass {
  STANDARD
  RESTRICTED
  SENSITIVE
  INTERNAL_ONLY
}

enum RetentionAction {
  DELETE
  ANONYMIZE
  ARCHIVE
}
```

### New Models

```prisma
model ConsentRecord {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String          @db.Uuid
  userId          String?         @db.Uuid
  consentCategory ConsentCategory
  granted         Boolean
  source          String? // signup, settings, booking, support
  evidence        Json            @default("{}")
  grantedAt       DateTime        @default(now())
  withdrawnAt     DateTime?

  @@index([tenantId, consentCategory, grantedAt])
  @@index([userId])
}

model DataRetentionPolicy {
  id                String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId          String          @db.Uuid
  entityType        String
  retentionDays     Int
  actionAfterExpiry RetentionAction
  policyConfig      Json            @default("{}")
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([tenantId, entityType])
}

model SensitiveFieldPolicy {
  id               String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String             @db.Uuid
  entityType       String
  fieldKey         String
  sensitivityClass SensitiveDataClass
  roleAccess       Json               @default("{}")
  maskingRule      Json               @default("{}")
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@unique([tenantId, entityType, fieldKey])
}

model DataAccessAudit {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String   @db.Uuid
  actorUserId   String?  @db.Uuid
  entityType    String
  entityId      String?  @db.Uuid
  fieldKey      String?
  accessReason  String?
  accessContext String? // support, trust, hr, guest_service
  createdAt     DateTime @default(now())

  @@index([tenantId, entityType, createdAt])
  @@index([actorUserId])
}

model ErasureRequest {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String    @db.Uuid
  userId      String    @db.Uuid
  status      String    @default("requested")
  requestType String // delete, anonymize, export
  scope       Json      @default("{}")
  resolvedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([tenantId, userId, status])
}
```

### Router Additions

- `privacy/consent.router.ts`
- `privacy/dataGovernance.router.ts`
- `privacy/erasure.router.ts`

### UI Surfaces

- `/(guest)/privacy`
- `/(guest)/privacy/consents`
- `/(guest)/privacy/data-requests`
- `/admin/(admin)/privacy`
- `/admin/(admin)/data-governance`

---

## 21.3 Identity and Verification Stack

### Purpose

Trust cannot depend only on ratings and moderation. There must be a structured identity and legitimacy layer for guests, hosts, staff, partners, businesses, and payout recipients.

### Scope

- identity verification for individual actors
- business verification for operators and partners
- property ownership / authority verification for hosts
- payout eligibility verification
- optional badge support tied to trust card generation

### New Models

```prisma
model IdentityVerificationCase {
  id               String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String             @db.Uuid
  userId           String?            @db.Uuid
  entityType       String // guest, host, staff, manager, recruiter
  verificationType String // id, selfie, document, liveness
  status           VerificationStatus @default(PENDING)
  payload          Json               @default("{}")
  reviewedByUserId String?            @db.Uuid
  reviewedAt       DateTime?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@index([tenantId, entityType, status])
  @@index([userId])
}

model BusinessVerificationProfile {
  id                 String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId           String             @db.Uuid
  partnerId          String?            @db.Uuid
  organizationName   String
  legalEntityName    String?
  taxId              String?
  registrationNumber String?
  status             VerificationStatus @default(PENDING)
  evidence           Json               @default("{}")
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([tenantId, status])
  @@index([partnerId])
}

model PropertyOwnershipProof {
  id         String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId   String             @db.Uuid
  propertyId String?            @db.Uuid
  hostId     String?            @db.Uuid
  proofType  String // title, lease, authorization, contract
  status     VerificationStatus @default(PENDING)
  evidence   Json               @default("{}")
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt

  @@index([tenantId, status])
  @@index([propertyId])
  @@index([hostId])
}

model PayoutVerificationState {
  id               String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String             @db.Uuid
  userId           String?            @db.Uuid
  partnerId        String?            @db.Uuid
  payoutEntityType String // host, staff, partner, hotel
  status           VerificationStatus @default(PENDING)
  checks           Json               @default("{}")
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@index([tenantId, payoutEntityType, status])
  @@index([userId])
  @@index([partnerId])
}
```

### Router Additions

- `verification/identity.router.ts`
- `verification/business.router.ts`
- `verification/propertyProof.router.ts`
- `verification/payoutVerification.router.ts`

### UI Surfaces

- `/(guest)/verification`
- `/host/verification`
- `/partner/verification`
- `/admin/(admin)/identity-review`

---

## 21.4 Payment Orchestration and Settlement Backbone

### Purpose

The platform now supports room bookings, amenity passes, wellness services, mobility, local experiences, tips, subscriptions, deposits, refunds, and damage claims. A dedicated payments domain is required.

### Core Capabilities

- payment intent creation
- authorization and capture
- deposit / hold support
- partial refunds
- split settlements
- hotel / host / partner / staff payouts
- tax / fee / commission breakdown
- payout failure handling
- chargeback / dispute reference linkage

### New Enums

```prisma
enum PaymentFlowType {
  BOOKING
  AMENITY
  MOBILITY
  WELLNESS
  EXPERIENCE
  TIP
  SUBSCRIPTION
  DEPOSIT
  DAMAGE_CLAIM
}

enum PayoutStatus {
  PENDING
  READY
  SENT
  FAILED
  CANCELLED
}

enum DepositStatus {
  HELD
  RELEASED
  CLAIMED
  EXPIRED
}
```

### New Models

```prisma
model PaymentIntent {
  id           String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId     String          @db.Uuid
  userId       String?         @db.Uuid
  bookingId    String?         @db.Uuid
  flowType     PaymentFlowType
  amountCents  Int
  currency     String          @default("USD")
  status       String          @default("pending")
  processorRef String?
  metadata     Json            @default("{}")
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([tenantId, flowType, status])
  @@index([userId])
  @@index([bookingId])
}

model RefundCase {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String   @db.Uuid
  paymentIntentId String?  @db.Uuid
  bookingId       String?  @db.Uuid
  amountCents     Int
  currency        String   @default("USD")
  reason          String?
  status          String   @default("requested")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tenantId, status])
  @@index([paymentIntentId])
}

model DepositHold {
  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String        @db.Uuid
  bookingId   String?       @db.Uuid
  userId      String?       @db.Uuid
  amountCents Int
  currency    String        @default("USD")
  status      DepositStatus @default(HELD)
  releaseAt   DateTime?
  claimReason String?
  metadata    Json          @default("{}")
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([tenantId, status, releaseAt])
  @@index([bookingId])
}

model SplitSettlementRule {
  id        String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String          @db.Uuid
  flowType  PaymentFlowType
  ruleName  String
  config    Json            @default("{}")
  isActive  Boolean         @default(true)
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([tenantId, flowType, isActive])
}

model PayoutInstruction {
  id               String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId         String       @db.Uuid
  payoutEntityType String // hotel, host, partner, staff
  payoutEntityId   String?      @db.Uuid
  amountCents      Int
  currency         String       @default("USD")
  status           PayoutStatus @default(PENDING)
  referenceType    String? // tip, booking, settlement, damage
  referenceId      String?      @db.Uuid
  payoutRef        String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([tenantId, payoutEntityType, status])
  @@index([referenceType, referenceId])
}
```

### Router Additions

- `payments/paymentIntent.router.ts`
- `payments/refund.router.ts`
- `payments/deposit.router.ts`
- `payments/payout.router.ts`

### UI Surfaces

- `/(guest)/payments`
- `/(guest)/refunds`
- `/hotel/finance/payments`
- `/hotel/finance/payouts`
- `/admin/(admin)/payments`

---

## 21.5 Pricing and Merchandising Engine

### Purpose

Rate logic is now too broad to live only inside booking inventory. The system needs a reusable pricing engine that works across accommodation, memberships, bundles, same-night rescue, and tiered access.

### Core Capabilities

- rule-based price computation
- tier-aware pricing
- occupancy and date sensitivity
- experiment-aware pricing
- merchandising slots on search and detail pages
- bundle assembly support
- same-night and direct benefit overlays

### New Models

```prisma
model PricingRule {
  id         String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId   String       @db.Uuid
  scopeType  String // hotel, room_type, amenity, bundle
  scopeId    String?      @db.Uuid
  ruleType   String // percent, fixed, threshold, occupancy
  targetTier ServiceTier?
  config     Json         @default("{}")
  priority   Int          @default(0)
  startsAt   DateTime?
  endsAt     DateTime?
  isActive   Boolean      @default(true)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  @@index([tenantId, scopeType, isActive])
}

model PriceExperiment {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String    @db.Uuid
  name          String
  experimentKey String
  scopeType     String
  config        Json      @default("{}")
  startsAt      DateTime?
  endsAt        DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([tenantId, experimentKey])
  @@index([tenantId, isActive])
}

model MerchandisingSlot {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String   @db.Uuid
  slotKey       String // hero_carousel, tonight_highlight, eco_highlight
  scopeType     String?
  scopeId       String?  @db.Uuid
  contentConfig Json     @default("{}")
  rankingRule   Json     @default("{}")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([tenantId, slotKey])
}

model OfferRankingPolicy {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String   @db.Uuid
  policyKey String
  objective String // conversion, revenue, retention, trust
  config    Json     @default("{}")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, policyKey])
}
```

### Router Additions

- `pricing/pricingRule.router.ts`
- `pricing/priceExperiment.router.ts`
- `pricing/merchandising.router.ts`
- `pricing/rankingPolicy.router.ts`

### UI Surfaces

- `/hotel/revenue/pricing`
- `/hotel/revenue/merchandising`
- `/admin/(admin)/pricing`
- `/admin/(admin)/experiments`

---

## 21.6 Search Quality and Ranking Engine

### Purpose

The platform search surface is no longer a simple hotel search. It needs to understand:

- accommodation type
- accessible fit
- pet fit
- service-animal readiness
- workstay relevance
- family fit
- same-night urgency
- wellness intent
- sustainable preference
- trust confidence
- tier entitlements

### Core Capabilities

- query logging
- facet-aware ranking
- listing quality scoring
- explainable ranking signals
- search confidence / fit scoring
- suppression of low-trust or misleading listings
- cold-start support for new but verified inventory

### New Models

```prisma
model SearchQueryLog {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  userId      String?  @db.Uuid
  surface     String // stays, tonight, homes, wellness, jobs
  queryText   String?
  filters     Json     @default("{}")
  resultCount Int?
  createdAt   DateTime @default(now())

  @@index([tenantId, surface, createdAt])
  @@index([userId])
}

model RankingSignal {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  entityType  String
  entityId    String   @db.Uuid
  signalKey   String // trust_score, accessibility_fit, wifi_score
  signalValue Decimal? @db.Decimal(10, 4)
  signalDate  DateTime @db.Date
  metadata    Json     @default("{}")
  createdAt   DateTime @default(now())

  @@index([tenantId, entityType, signalKey, signalDate])
}

model ListingQualityScore {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId       String   @db.Uuid
  entityType     String // hotel, home, amenity, experience
  entityId       String   @db.Uuid
  score          Decimal? @db.Decimal(5, 2)
  scoreBreakdown Json     @default("{}")
  generatedAt    DateTime @default(now())

  @@unique([tenantId, entityType, entityId])
}

model SearchFacetProfile {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String   @db.Uuid
  surface   String
  facetKey  String
  config    Json     @default("{}")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, surface, facetKey])
}

model SearchExplanationLog {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String   @db.Uuid
  userId          String?  @db.Uuid
  entityType      String
  entityId        String?  @db.Uuid
  explanationData Json     @default("{}")
  createdAt       DateTime @default(now())

  @@index([tenantId, entityType, createdAt])
}
```

### Router Additions

- `search/searchQuality.router.ts`
- `search/ranking.router.ts`
- `search/facet.router.ts`
- `search/explanation.router.ts`

### UI Surfaces

- `/(guest)/search-quality`
- `/(guest)/why-this-result`
- `/admin/(admin)/search`
- `/admin/(admin)/ranking-signals`

---

## 21.7 Experimentation and Product Analytics Layer

### Purpose

A platform of this complexity must learn systematically. Conversion, trust, attach-rate, and retention need structured experimentation, not intuition.

### Core Capabilities

- experiment definition
- variant exposure logging
- conversion tracking
- product metric snapshots
- tier-specific performance analysis
- search and pricing experiment support

### New Models

```prisma
model Experiment {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String    @db.Uuid
  experimentKey String
  name          String
  scope         String // search, pricing, homepage, bundle, onboarding
  status        String    @default("draft")
  config        Json      @default("{}")
  startsAt      DateTime?
  endsAt        DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([tenantId, experimentKey])
}

model ExperimentVariant {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  experimentId      String   @db.Uuid
  variantKey        String
  allocationPercent Int      @default(0)
  config            Json     @default("{}")
  createdAt         DateTime @default(now())

  @@index([experimentId])
}

model ExposureLog {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId            String   @db.Uuid
  experimentId        String   @db.Uuid
  experimentVariantId String   @db.Uuid
  userId              String?  @db.Uuid
  sessionKey          String?
  exposedAt           DateTime @default(now())

  @@index([tenantId, exposedAt])
  @@index([userId])
}

model ConversionEvent {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId        String   @db.Uuid
  userId          String?  @db.Uuid
  eventKey        String // booking_created, upgrade_bought, guide_opened
  eventValueCents Int?
  payload         Json     @default("{}")
  occurredAt      DateTime @default(now())

  @@index([tenantId, eventKey, occurredAt])
  @@index([userId])
}

model ProductMetricSnapshot {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId   String   @db.Uuid
  metricKey  String
  metricDate DateTime @db.Date
  value      Decimal? @db.Decimal(14, 4)
  dimensions Json     @default("{}")
  createdAt  DateTime @default(now())

  @@index([tenantId, metricKey, metricDate])
}
```

### Router Additions

- `analytics/experiment.router.ts`
- `analytics/exposure.router.ts`
- `analytics/conversion.router.ts`
- `analytics/productMetrics.router.ts`

### UI Surfaces

- `/admin/(admin)/experiments`
- `/admin/(admin)/metrics`
- `/hotel/insights/experiments`

---

## 21.8 Content Operations and Localization Layer

### Purpose

The platform depends heavily on content:

- city guides
- accessibility explanations
- family travel instructions
- multilingual help
- trust cards
- onboarding and policy content
- wellness and recovery flows
- essential services pages
- local partner narratives

This cannot live only as scattered hardcoded UI text.

### Core Capabilities

- reusable content blocks
- localization
- editorial workflow
- versioning
- persona-specific variants
- preview and publish workflow

### New Models

```prisma
model ContentBlock {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String   @db.Uuid
  contentKey    String
  blockType     String // markdown, richtext, structured_json
  defaultLocale String   @default("en")
  status        String   @default("draft")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([tenantId, contentKey])
}

model LocalizedContentEntry {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contentBlockId String   @db.Uuid
  locale         String
  title          String?
  body           String?  @db.Text
  payload        Json     @default("{}")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([contentBlockId, locale])
}

model GuideTemplate {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  templateKey String
  persona     String?
  structure   Json     @default("{}")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([tenantId, templateKey, persona])
}

model EditorialWorkflow {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId       String    @db.Uuid
  contentBlockId String    @db.Uuid
  status         String    @default("draft")
  reviewerUserId String?   @db.Uuid
  reviewedAt     DateTime?
  notes          String?   @db.Text
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([tenantId, status])
  @@index([contentBlockId])
}
```

### Router Additions

- `content/contentBlock.router.ts`
- `content/localization.router.ts`
- `content/editorial.router.ts`
- `content/guideTemplate.router.ts`

### UI Surfaces

- `/admin/(admin)/content`
- `/admin/(admin)/content/locales`
- `/admin/(admin)/editorial`
- `/hotel/content`

---

## 21.9 Incident Command and Crisis Mode

### Purpose

When the platform scales, some incidents become systemic:

- weather events
- mass transport disruption
- power/water outage
- health emergencies
- safety incidents
- mass cancellations
- wrong campaign deployment
- large-scale accessibility failure or misinformation

The platform needs a structured way to react, notify, triage, and document.

### Core Capabilities

- crisis declaration
- affected booking linking
- mass notifications
- emergency policy overrides
- service continuity notes
- resolution and retrospective logging

### New Models

```prisma
model CrisisEvent {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId   String    @db.Uuid
  title      String
  crisisType String // outage, weather, transport, security, policy
  severity   String // low, medium, high, critical
  status     String    @default("active")
  payload    Json      @default("{}")
  startedAt  DateTime  @default(now())
  endedAt    DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([tenantId, crisisType, status])
}

model AffectedBooking {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String   @db.Uuid
  crisisEventId String   @db.Uuid
  bookingId     String   @db.Uuid
  impactType    String // delay, cancellation, relocation, messaging_only
  payload       Json     @default("{}")
  createdAt     DateTime @default(now())

  @@index([tenantId, crisisEventId])
  @@index([bookingId])
}

model MassNotificationRun {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId       String    @db.Uuid
  crisisEventId  String?   @db.Uuid
  templateCode   String?
  audienceConfig Json      @default("{}")
  status         String    @default("draft")
  sentAt         DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([tenantId, status])
  @@index([crisisEventId])
}

model EmergencyPolicyRule {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId      String   @db.Uuid
  ruleKey       String
  appliesToType String // booking, refund, cancellation, relocation
  config        Json     @default("{}")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([tenantId, ruleKey])
}
```

### Router Additions

- `crisis/crisisEvent.router.ts`
- `crisis/affectedBooking.router.ts`
- `crisis/massNotification.router.ts`
- `crisis/emergencyPolicy.router.ts`

### UI Surfaces

- `/admin/(admin)/crisis`
- `/admin/(admin)/crisis/notifications`
- `/hotel/operations/crisis`
- `/(guest)/service-alerts`

---

## 21.10 Family Travel OS (Expanded)

### Purpose

Family travel should not remain a generic filter. It needs structured suitability, inventory mapping, and pre-arrival guidance.

### New Models

```prisma
model FamilyTravelProfile {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  hotelId     String?  @db.Uuid
  propertyId  String?  @db.Uuid
  familyScore Decimal? @db.Decimal(5, 2)
  features    Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, familyScore])
}

model ChildAmenity {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  hotelId     String?  @db.Uuid
  amenityType String // crib, high_chair, kids_menu, babysitting
  title       String
  config      Json     @default("{}")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, amenityType, isActive])
}

model FamilySafetyFeature {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  propertyId  String?  @db.Uuid
  featureType String // outlet_cover, stair_gate, fenced_pool, balcony_guard
  status      String   @default("available")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, featureType])
}
```

### Router Additions

- `family/familyTravel.router.ts`
- `family/childAmenity.router.ts`
- `family/familySafety.router.ts`

### UI Surfaces

- `/(guest)/family-travel`
- `/host/family-readiness`
- `/hotel/family`

---

## 21.11 Medical and Assisted Travel Layer

### Purpose

The platform already supports accessibility and recovery-oriented thinking. v8.0 formalizes a structured travel layer for guests who need assisted, medical-adjacent, or elder-friendly support.

### Core Use Cases

- recovery stays
- hospital-nearby accommodation
- pharmacy and clinic access
- mobility support
- medical transport partner discovery
- elder-friendly and low-strain accommodation filtering

### New Models

```prisma
model MedicalTravelProfile {
  id           String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId     String         @db.Uuid
  userId       String?        @db.Uuid
  supportNeeds Json           @default("{}")
  visibility   VisibilityMode @default(PRIVATE)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([tenantId, visibility])
  @@index([userId])
}

model AssistedStayFeature {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  propertyId  String?  @db.Uuid
  featureType String // near_hospital, low_step_access, grab_bars, quiet_recovery
  config      Json     @default("{}")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, featureType, isActive])
}

model MedicalTransportPartner {
  id          String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String             @db.Uuid
  city        String
  name        String
  serviceType String // wheelchair_transfer, medical_transfer, assisted_pickup
  trustStatus VerificationStatus @default(PENDING)
  contactInfo Json               @default("{}")
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@index([tenantId, city, trustStatus])
}

model RecoveryStayPlan {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId  String   @db.Uuid
  bookingId String?  @db.Uuid
  userId    String?  @db.Uuid
  planData  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId, bookingId])
}
```

### Router Additions

- `medical/medicalTravel.router.ts`
- `medical/assistedStay.router.ts`
- `medical/medicalTransport.router.ts`
- `medical/recoveryStay.router.ts`

### UI Surfaces

- `/(guest)/assisted-travel`
- `/(guest)/medical-support`
- `/hotel/assisted-stay`
- `/admin/(admin)/medical-partners`

---

## 21.12 Integration Hub

### Purpose

The platform cannot remain isolated if it wants enterprise adoption. It needs a domain for managing inbound and outbound integrations with PMS, channel managers, locks, POS, HR, accounting, CRM, messaging, and support tools.

### New Models

```prisma
model IntegrationProvider {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId     String   @db.Uuid
  providerKey  String
  category     String // pms, crm, lock, pos, hr, messaging, accounting
  title        String
  configSchema Json     @default("{}")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([tenantId, providerKey])
}

model IntegrationConnection {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId              String    @db.Uuid
  integrationProviderId String    @db.Uuid
  scopeType             String // tenant, hotel, property
  scopeId               String?   @db.Uuid
  status                String    @default("inactive")
  credentialsRef        String?
  config                Json      @default("{}")
  lastSyncAt            DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([tenantId, scopeType, status])
}

model SyncJobLog {
  id                      String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId                String    @db.Uuid
  integrationConnectionId String    @db.Uuid
  jobType                 String // import_inventory, push_booking, sync_lock
  status                  String    @default("queued")
  payload                 Json      @default("{}")
  startedAt               DateTime?
  finishedAt              DateTime?
  createdAt               DateTime  @default(now())

  @@index([tenantId, jobType, status])
  @@index([integrationConnectionId])
}

model WebhookDeliveryLog {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId                String   @db.Uuid
  integrationConnectionId String?  @db.Uuid
  eventKey                String
  status                  String   @default("pending")
  responseCode            Int?
  payload                 Json     @default("{}")
  createdAt               DateTime @default(now())

  @@index([tenantId, eventKey, status])
}
```

### Router Additions

- `integrations/provider.router.ts`
- `integrations/connection.router.ts`
- `integrations/sync.router.ts`
- `integrations/webhook.router.ts`

### UI Surfaces

- `/hotel/management/integrations`
- `/admin/(admin)/integrations`
- `/admin/(admin)/webhooks`

---

## 21.13 Advanced Context Intelligence Expansion

### Purpose

v7.0 introduced context as a moat. v8.0 makes it operationally explicit by adding reusable structured context state for ranking, offers, messaging, and service flows.

### Context Formula

**who + why + when + where + duration + constraints + tier + travel mode**

### New Models

```prisma
model ContextSnapshot {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @db.Uuid
  userId      String?  @db.Uuid
  bookingId   String?  @db.Uuid
  contextType String // trip, stay, search_session, support_case
  contextData Json     @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([tenantId, contextType, createdAt])
  @@index([userId])
}

model ContextConstraint {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contextSnapshotId String   @db.Uuid
  constraintType    String // accessibility, pet, family, work, medical, budget
  constraintValue   String?
  metadata          Json     @default("{}")
  createdAt         DateTime @default(now())

  @@index([contextSnapshotId, constraintType])
}

model ContextDecisionLog {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId          String   @db.Uuid
  contextSnapshotId String?  @db.Uuid
  decisionType      String // ranking, upsell, guide, support_priority
  decisionData      Json     @default("{}")
  createdAt         DateTime @default(now())

  @@index([tenantId, decisionType, createdAt])
  @@index([contextSnapshotId])
}
```

### Router Additions

- `context/contextSnapshot.router.ts`
- `context/contextConstraint.router.ts`
- `context/contextDecision.router.ts`

### UI Surfaces

- `/(guest)/trip-mode`
- `/hotel/insights/context-modes`
- `/admin/(admin)/context-governance`

---

## 21.14 Shared Router Additions for v8.0

```text
privacy/
  consent.router.ts
  dataGovernance.router.ts
  erasure.router.ts

verification/
  identity.router.ts
  business.router.ts
  propertyProof.router.ts
  payoutVerification.router.ts

payments/
  paymentIntent.router.ts
  refund.router.ts
  deposit.router.ts
  payout.router.ts

pricing/
  pricingRule.router.ts
  priceExperiment.router.ts
  merchandising.router.ts
  rankingPolicy.router.ts

search/
  searchQuality.router.ts
  ranking.router.ts
  facet.router.ts
  explanation.router.ts

analytics/
  experiment.router.ts
  exposure.router.ts
  conversion.router.ts
  productMetrics.router.ts

content/
  contentBlock.router.ts
  localization.router.ts
  editorial.router.ts
  guideTemplate.router.ts

crisis/
  crisisEvent.router.ts
  affectedBooking.router.ts
  massNotification.router.ts
  emergencyPolicy.router.ts

family/
  familyTravel.router.ts
  childAmenity.router.ts
  familySafety.router.ts

medical/
  medicalTravel.router.ts
  assistedStay.router.ts
  medicalTransport.router.ts
  recoveryStay.router.ts

integrations/
  provider.router.ts
  connection.router.ts
  sync.router.ts
  webhook.router.ts

context/
  contextSnapshot.router.ts
  contextConstraint.router.ts
  contextDecision.router.ts
```

---

## 21.15 Page Tree Additions for v8.0

```text
(guest)/
  privacy
  privacy/consents
  privacy/data-requests
  payments
  refunds
  search-quality
  why-this-result
  family-travel
  assisted-travel
  medical-support
  service-alerts

host/
  verification

hotel/
  finance/payments
  finance/payouts
  revenue/pricing
  revenue/merchandising
  family
  assisted-stay
  management/integrations

admin/(admin)/
  privacy
  data-governance
  identity-review
  payments
  pricing
  experiments
  metrics
  content
  editorial
  crisis
  crisis/notifications
  integrations
  webhooks
  medical-partners
  search
  ranking-signals
```

---

## 21.16 Build Order for v8.0

### Step 16 — Governance and identity

- consent record model
- sensitive field policies
- identity verification cases
- business/property/payout verification

### Step 17 — Payments and pricing backbone

- payment intent domain
- deposits and refunds
- payout instructions
- pricing rules
- merchandising slots
- ranking policies for offers

### Step 18 — Search, analytics, and content

- search logs
- listing quality scoring
- ranking signals
- experiments and exposures
- content block / localization / editorial workflow

### Step 19 — Resilience and assisted categories

- crisis event command layer
- family travel OS expansion
- medical and assisted travel
- advanced context snapshots

### Step 20 — Integration and enterprise scale

- provider definitions
- integration connections
- sync job logs
- webhook delivery logs
- enterprise admin surfaces

---

## 21.17 Architecture Summary of What v8.0 Adds

v8.0 turns the platform from a very ambitious hospitality product into a **governable, monetizable, searchable, experiment-driven, and resilient system**.

It adds:

- explicit privacy and data governance
- real identity and payout verification layers
- dedicated payment orchestration
- pricing and merchandising separation
- search and ranking intelligence
- experimentation and metrics
- content operations and localization
- crisis response infrastructure
- structured family and assisted travel support
- enterprise integration readiness
- operationalized context intelligence

These additions reduce platform fragility, strengthen compliance posture, improve explainability, and create the conditions for much safer scaling.

---

## 21.18 Claude Code Implementation Note for v8.0

When implementing v8.0 additions:

1. Treat governance, payment, pricing, search, analytics, and crisis as shared infrastructure domains
2. Keep family and medical modules user-facing, but connect them to trust, context, and search
3. Do not collapse privacy and verification into generic metadata
4. Make search and ranking explainable where possible
5. Ensure payment and payout flows write audit events
6. Ensure moderation, privacy, trust, and crisis systems interoperate
7. Preserve modular bounded contexts and additive migrations
8. Continue using role-based surfaces and tier-based access across all new domains

---

# 22. v9.0 Additions: Platform Intelligence OS and Guarantee & Assurance Infrastructure

v9.0 expands the platform beyond product breadth and into **platform judgment, explainability, operational intelligence, and explicit assurance**.

The core principle is:

- **Trust** means users believe the platform is reliable
- **Guarantee** means users know exactly what happens when reality breaks
- **Intelligence** means the platform can choose, prioritize, explain, escalate, and recover with context

This section formalizes two major system families:

1. **Platform Intelligence OS**
2. **Guarantee & Assurance OS**

These systems should be implemented as cross-cutting, shared infrastructure and not as ad hoc feature logic inside isolated modules.

---

## 22.1 Platform Intelligence OS — Overview

Platform Intelligence OS is the platform-wide reasoning and prioritization layer.

Its job is not merely to “recommend” products. It must:

- interpret user and operational context
- decide which action is appropriate
- evaluate confidence and risk
- explain why a decision was made
- trigger human review when required
- detect poor outcomes and learn from them
- optimize revenue without violating trust or fairness
- orchestrate support, recovery, and fallback flows under uncertainty

This layer should sit above:

- search and ranking
- pricing and merchandising
- guest memory and personalization
- trust and moderation
- support and dispute systems
- operations dashboards
- revenue rescue and campaign systems

---

## 22.2 Context Engine OS

The platform already includes rich user, property, trust, and booking signals. v9.0 introduces a unified **Context Engine** so the system can reason using situational context rather than static profile assumptions.

### Decision Formula

Every major decision should resolve against a context model that includes:

- who the user is
- why they are traveling
- where they are going
- when the interaction happens
- how long the stay lasts
- what constraints exist
- what service tier applies
- what risks or sensitivities are active

### Example Context Factors

- business traveler vs family traveler
- accessible travel need
- service animal present
- late-night arrival
- first time in city
- long-stay / nomad behavior
- high disruption risk due to weather / logistics / local events
- hotel-level operational overload

### Database Models

- `ContextFrame`
- `ContextSignal`
- `ContextPolicy`
- `ContextSnapshot`
- `ContextResolutionLog`
- `ContextOverride`
- `SensitiveContextConsent`
- `ContextConflict`
- `ContextPriorityRule`
- `ContextFallbackTemplate`

### Router Names

- `context.router.ts`
- `contextPolicy.router.ts`
- `contextSnapshot.router.ts`
- `contextResolution.router.ts`
- `contextOverride.router.ts`

### UI Flows

Guest:

- `/(guest)/why-this-result`
- `/(guest)/why-this-offer`
- `/(guest)/travel-context`

Hotel / Management:

- `/hotel/management/context-insights`
- `/hotel/management/context-overrides`

Admin:

- `/admin/(admin)/context-policies`
- `/admin/(admin)/context-audit`

### Implementation Rules

- Do not infer sensitive needs beyond allowed consent boundaries
- Allow explicit user override when inferred context is wrong
- Keep a log of which context frame produced which decision
- Use context snapshots in search, support, pricing, and recovery flows

---

## 22.3 Decision Intelligence & Explainability OS

A mature platform must explain important automated or semi-automated decisions.

### Decisions That Must Be Explainable

- ranking a hotel or trusted stay higher or lower
- showing or suppressing an offer
- flagging a listing for risk
- triggering a recovery workflow
- generating an upgrade suggestion
- choosing a fallback option in a disruption event
- selecting a partner or mobility provider
- escalating a support case

### Database Models

- `DecisionRequest`
- `DecisionOutcome`
- `DecisionReason`
- `DecisionGuardrail`
- `HumanApprovalTask`
- `DecisionRollback`
- `DecisionAppeal`
- `DecisionVersion`
- `DecisionConfidenceBand`
- `DecisionSurfaceLog`

### Router Names

- `decision.router.ts`
- `decisionAudit.router.ts`
- `decisionExplain.router.ts`
- `approvalTask.router.ts`
- `decisionAppeal.router.ts`

### UI Flows

Admin:

- `/admin/(admin)/decisions`
- `/admin/(admin)/decision-policies`
- `/admin/(admin)/decision-appeals`

Hotel:

- `/hotel/management/decision-log`
- `/hotel/revenue/decision-explanations`

Guest:

- `/(guest)/why-this-result`
- `/(guest)/why-this-package`

### Guardrail Principles

- high-impact trust and financial decisions require explanation traces
- critical edge-case decisions must support rollback
- human approval should be inserted where confidence is low or risk is high
- decisions should distinguish between: recommendation, enforcement, escalation, and suppression

---

## 22.4 Trust & Quality Intelligence OS

Trust Fabric provides moderation and verification infrastructure. v9.0 adds a **Quality Intelligence layer** that continuously measures reliability, claim truthfulness, fulfillment quality, and recovery effectiveness.

### Questions This Layer Answers

- which listings are over-claiming accessibility or pet suitability?
- which hosts have rising incident density?
- which mobility partners have reliable acceptance but poor fulfillment?
- which staff profiles are well-rated but under-discovered?
- which local experiences get clicks but poor actual satisfaction?
- which properties repeatedly trigger recovery claims?

### Database Models

- `EntityQualityScore`
- `ClaimTruthSignal`
- `ReliabilitySnapshot`
- `FailurePattern`
- `ComplaintCluster`
- `RecoveryEffectivenessMetric`
- `FulfillmentScore`
- `DisputeDensityMetric`
- `TrustDecaySignal`
- `QualityRecoveryAction`

### Router Names

- `quality.router.ts`
- `reliability.router.ts`
- `claimTruth.router.ts`
- `fulfillmentQuality.router.ts`
- `complaintCluster.router.ts`

### UI Flows

Hotel:

- `/hotel/trust/quality`
- `/hotel/trust/reliability`

Partner:

- `/partner/trust/reliability`
- `/partner/trust/quality`

Admin:

- `/admin/(admin)/quality-monitoring`
- `/admin/(admin)/claim-truth`

### Design Rule

Avoid one-dimensional public scores. Quality should be multi-axis:

- listing truthfulness
- fulfillment reliability
- support responsiveness
- recovery performance
- policy clarity
- trust maturity

---

## 22.5 Search Intent & Outcome Intelligence

Search quality should be judged not only by relevance but by **successful resolution of user intent**.

### What This Layer Tracks

- what the user was actually trying to find
- whether the search produced a result set
- whether the result set matched their underlying need
- which search journeys ended in booking, bounce, support, or abandonment
- which specialized intents fail most often: accessibility, family, pet, workstay, wellness, tonight deals

### Database Models

- `SearchSession`
- `SearchIntent`
- `SearchOutcome`
- `ZeroResultIncident`
- `SearchFacetUsage`
- `RankingAdjustmentLog`
- `SearchResolutionPath`
- `SearchFrictionSignal`
- `QueryRewriteSuggestion`
- `ResultTrustSuppression`

### Router Names

- `searchIntent.router.ts`
- `searchOutcome.router.ts`
- `rankingInsight.router.ts`
- `searchZeroResult.router.ts`
- `queryAssist.router.ts`

### UI Flows

Admin:

- `/admin/(admin)/search`
- `/admin/(admin)/ranking-explanations`
- `/admin/(admin)/zero-results`

Hotel:

- `/hotel/management/search-insights`

### Design Rule

The platform must learn from failed searches and route those learnings into:

- facet design
- ranking weights
- content quality improvements
- trust suppression rules
- better fallback suggestions

---

## 22.6 Revenue Opportunity Intelligence

Revenue rescue and attach-rate insight already exist. v9.0 adds an explicit opportunity-detection layer.

### What It Should Identify

- upgrade likelihood
- bundle likelihood
- amenity monetization opportunities
- under-monetized assets
- repeat guest win-back probability
- long-stay conversion opportunities
- partner underperformance causing revenue leakage

### Database Models

- `RevenueOpportunity`
- `AttachOpportunity`
- `UpgradeLikelihood`
- `ChurnRisk`
- `ReturnProbability`
- `UndermonetizedAsset`
- `OfferFatigueSignal`
- `RevenueLeakAlert`
- `YieldOpportunityWindow`
- `RecoveryUpsellLink`

### Router Names

- `revenueOpportunity.router.ts`
- `upgradeSignal.router.ts`
- `churnInsight.router.ts`
- `yieldOpportunity.router.ts`
- `repeatGuest.router.ts`

### UI Flows

Hotel:

- `/hotel/revenue/opportunities`
- `/hotel/revenue/upgrade-signals`
- `/hotel/revenue/retention`

Partner:

- `/partner/revenue/opportunities`

Admin:

- `/admin/(admin)/growth-signals`

### Design Rule

All revenue opportunities must be evaluated against:

- trust constraints
- guest context
- service tier eligibility
- operational feasibility
- guarantee exposure

---

## 22.7 Support & SLA Intelligence

The platform already contains support and dispute structures. v9.0 introduces intelligent triage, SLA risk prediction, and escalation orchestration.

### What It Does

- predicts which cases will breach SLA
- detects high-risk support clusters
- recommends playbooks
- escalates issues with trust, financial, or accessibility implications faster
- routes cases to the right team the first time

### Database Models

- `SupportTriageDecision`
- `EscalationRiskSignal`
- `SlaBreachPrediction`
- `SupportPlaybook`
- `EscalationRun`
- `SupportResolutionPattern`
- `CaseComplexitySignal`
- `PriorityOverrideLog`
- `DisruptionCareQueue`
- `SlaPolicyProfile`

### Router Names

- `supportIntelligence.router.ts`
- `slaPrediction.router.ts`
- `escalation.router.ts`
- `supportPlaybook.router.ts`

### UI Flows

Hotel:

- `/hotel/operations/support-queue`
- `/hotel/operations/escalations`

Partner:

- `/partner/support`
- `/partner/support/escalations`

Admin:

- `/admin/(admin)/sla-monitoring`
- `/admin/(admin)/support-triage`

### Design Rule

Support intelligence should recommend—not silently suppress. Human operators must remain able to override urgency, route, and remedy.

---

## 22.8 Experimentation & Policy Intelligence

Many platform decisions should be launched as controlled experiments rather than hard-coded defaults.

### Areas To Experiment Safely

- ranking explanations
- package and bundle presentation
- guarantee messaging placement
- pet / accessibility disclosure UX
- same-night rescue placement
- support escalation triggers
- trust card layout and prominence

### Database Models

- `PolicyExperiment`
- `ExperimentExposure`
- `ConversionOutcome`
- `PolicyWinner`
- `RollbackTrigger`
- `ExperimentEligibilityRule`
- `MetricGuardrail`
- `ExperimentDecisionLog`

### Router Names

- `policyExperiment.router.ts`
- `conversion.router.ts`
- `guardrailMetric.router.ts`

### UI Flows

Admin:

- `/admin/(admin)/experiments`
- `/admin/(admin)/policy-tests`

Hotel:

- `/hotel/revenue/experiments`
- `/hotel/management/product-tests`

### Design Rule

Experiments should be disabled automatically if they degrade:

- trust signals
- support load
- cancellation rates
- accessibility clarity
- dispute density

---

## 22.9 Guarantee & Assurance OS — Overview

Guarantee & Assurance OS makes platform promises concrete.

This layer defines:

- what the platform guarantees
- who is covered
- under what conditions
- what recovery paths exist
- who funds remediation
- what evidence is needed
- how fast claims are resolved

The platform should expose guarantee rules in a readable, operational way rather than burying them in generic policy copy.

---

## 22.10 Hospitality Guarantee Program

A top-level guarantee framework should span all key categories:

- hotel bookings
- trusted homes and villas
- accessibility-fit promises
- pet-fit and service animal clarity
- mobility and arrival services
- wellness / amenity fulfillment
- local experience fulfillment

### Database Models

- `GuaranteeProgram`
- `GuaranteePolicy`
- `GuaranteeClaim`
- `GuaranteeDecision`
- `GuaranteePayout`
- `GuaranteeFundingRule`
- `GuaranteeCoverageScope`
- `GuaranteeEligibilityRule`
- `GuaranteeEscalationCase`
- `GuaranteeCommunicationLog`

### Router Names

- `guarantee.router.ts`
- `guaranteeClaim.router.ts`
- `guaranteePolicy.router.ts`
- `guaranteeDecision.router.ts`

### UI Flows

Guest:

- `/(guest)/guarantee`
- `/(guest)/guarantee/claim`
- `/(guest)/guarantee/status`

Hotel / Partner:

- `/hotel/trust/guarantees`
- `/partner/trust/guarantees`

Admin:

- `/admin/(admin)/guarantee-ops`
- `/admin/(admin)/guarantee-funding`

### Design Rule

Each guarantee should define:

- covered event types
- exclusions
- proof requirements
- response SLA
- fallback path
- reimbursement or replacement rules

---

## 22.11 Booking Integrity Guarantee

This subsystem addresses booking correctness and booking survival.

### Coverage Examples

- room sold but unavailable
- listing active but inaccessible
- self check-in failed
- inventory sync mismatch
- trusted stay handoff failure
- room category mismatch

### Database Models

- `BookingIntegrityCheck`
- `InventoryMismatchCase`
- `CheckInFailureCase`
- `RebookingOption`
- `IntegrityRecoveryPlan`
- `InventoryTruthSnapshot`
- `SupplierFulfillmentException`
- `CheckInAccessTokenState`

### Router Names

- `bookingIntegrity.router.ts`
- `rebooking.router.ts`
- `integrityCheck.router.ts`

### UI Flows

Guest:

- `/(guest)/booking-protection`
- `/(guest)/arrival/help`

Hotel:

- `/hotel/ops/integrity`
- `/hotel/ops/checkin-failures`

Admin:

- `/admin/(admin)/integrity-incidents`

### Recovery Sequence

1. detect integrity failure
2. validate evidence automatically where possible
3. generate alternative inventory or stay path
4. define compensation / credit / refund path
5. keep guest informed in real time

---

## 22.12 Accessibility Truth Guarantee

Accessibility claims require stronger proof and stronger remediation than normal listing mismatches.

### Coverage Examples

- step-free entry claim false
- doorway width insufficient
- accessible bathroom claim false
- service access blocked on arrival
- arrival support missing for pre-declared accessibility need

### Database Models

- `AccessibilityClaim`
- `AccessibilityEvidence`
- `AccessibilityMismatchCase`
- `AccessibleAlternativeOption`
- `AccessibleArrivalAssurance`
- `AccessibilityFulfillmentLog`
- `AccessibilityDisclosureSnapshot`
- `AccessibleSupportRequest`

### Router Names

- `accessibilityGuarantee.router.ts`
- `accessibilityEvidence.router.ts`
- `accessibleArrival.router.ts`

### UI Flows

Guest:

- `/(guest)/accessibility/claim`
- `/(guest)/accessible-arrival`

Hotel:

- `/hotel/trust/accessibility-proof`
- `/hotel/ops/accessible-arrivals`

Admin:

- `/admin/(admin)/accessibility-review`
- `/admin/(admin)/accessible-recovery`

### Design Rule

Accessibility mismatches must receive faster triage than generic dissatisfaction cases.

---

## 22.13 Pet Fit & Service Animal Assurance

The platform must distinguish between:

- regular pets
- service animals
- listings with explicit pet suitability
- listings with only basic pet tolerance

### Coverage Examples

- pet-friendly claim operationally false
- pet fee misapplied
- service animal incorrectly blocked
- safety hazard for animal not disclosed
- cleaning/deposit rule conflict

### Database Models

- `PetFitProfile`
- `ServiceAnimalAssuranceRule`
- `PetMismatchCase`
- `PetSuitabilityEvidence`
- `PetDamageResolution`
- `PetDisclosureSnapshot`
- `AnimalAccessException`
- `PetReadinessChecklist`

### Router Names

- `petAssurance.router.ts`
- `serviceAnimal.router.ts`
- `petEvidence.router.ts`

### UI Flows

Guest:

- `/(guest)/pet-fit`
- `/(guest)/service-animal-support`

Hotel / Host:

- `/hotel/trust/pet-policies`
- `/partner/host/pet-readiness`

Admin:

- `/admin/(admin)/service-animal-policy`

### Design Rule

Service animal support must be treated as a specialized compliance and care flow, not merely another pet rule.

---

## 22.14 Host Protection Shield

Hosts and trusted-home operators need confidence that the platform can protect them from avoidable or unresolved loss.

### Coverage Areas

- damage incidents
- rule violations
- delayed checkout consequences
- missing item disputes
- deposit disputes
- severe cleanliness recovery costs
- guest-caused disruption with evidence

### Database Models

- `HostProtectionPolicy`
- `DamageIncident`
- `DamageEstimate`
- `EvidenceBundle`
- `DepositDecision`
- `ResolutionPath`
- `HostProtectionEligibility`
- `DamageAppeal`
- `DamageSettlementLog`

### Router Names

- `hostProtection.router.ts`
- `damageClaim.router.ts`
- `depositDecision.router.ts`
- `damageAppeal.router.ts`

### UI Flows

Host / Trusted Stay Operator:

- `/partner/host/protection`
- `/partner/host/incidents`
- `/partner/host/damage-claims`

Admin:

- `/admin/(admin)/damage-resolution`
- `/admin/(admin)/host-protection`

### Design Rule

Host protection must require structured evidence and clear timelines while avoiding a hostile experience for trustworthy guests.

---

## 22.15 Arrival Assurance OS

Arrival is one of the highest-risk moments in hospitality, especially for:

- late-night arrivals
- first-time visitors
- accessibility-sensitive travel
- family travel with children
- service animal travel
- self check-in stays
- mobility-linked arrivals

### Database Models

- `ArrivalPlan`
- `ArrivalRiskSignal`
- `FallbackInstructionSet`
- `ArrivalCheckpoint`
- `ArrivalIncident`
- `ArrivalReadinessStatus`
- `ArrivalSupportAssignment`
- `ArrivalCommsRun`

### Router Names

- `arrivalAssurance.router.ts`
- `arrivalIncident.router.ts`
- `arrivalPlan.router.ts`

### UI Flows

Guest:

- `/(guest)/arrival`
- `/(guest)/arrival/help`
- `/(guest)/arrival/checkpoints`

Hotel / Host:

- `/hotel/operations/arrivals`
- `/partner/host/arrivals`

Partner:

- `/partner/mobility/prechecks`

### Design Rule

Arrival assurance should pre-check critical conditions before the guest is already on the way.

---

## 22.16 Partner Reliability & SLA Assurance

Partner ecosystems create fulfillment risk. This module formalizes service guarantees for third-party providers.

### Partner Types Covered

- mobility
- pharmacy / clinic / care support
- wellness providers
- local experiences
- essential services
- producer / commerce partners
- staffing and training partners

### Database Models

- `PartnerSlaProfile`
- `SlaBreachEvent`
- `ReliabilityWindow`
- `EscalationPolicy`
- `PartnerPenaltyRule`
- `PartnerRecoveryObligation`
- `PartnerDowntimeNotice`
- `FulfillmentBreachCluster`

### Router Names

- `partnerReliability.router.ts`
- `sla.router.ts`
- `partnerEscalation.router.ts`
- `partnerPenalty.router.ts`

### UI Flows

Partner:

- `/partner/performance`
- `/partner/sla`

Hotel:

- `/hotel/partners/reliability`

Admin:

- `/admin/(admin)/partner-sla`
- `/admin/(admin)/partner-breaches`

### Design Rule

Partner reliability should be evaluated using:

- response time
- acceptance rate
- fulfillment completion rate
- claim volume
- recovery success
- support quality

---

## 22.17 Crisis & Mass Recovery OS

Large-scale failure modes require a dedicated operating mode.

### Examples

- weather disruption
- transport shutdown
- regional service outage
- mass overbooking
- fraud incident cluster
- health / safety event
- partner network outage
- system-level campaign mistake

### Database Models

- `CrisisEvent`
- `AffectedReservationSet`
- `MassRecoveryPlan`
- `EmergencyCommunicationRun`
- `ManualOverrideDecision`
- `CrisisCommandRole`
- `RecoveryPriorityBucket`
- `EmergencyBenefitGrant`
- `DisruptionTravelWindow`

### Router Names

- `crisis.router.ts`
- `massRecovery.router.ts`
- `emergencyComms.router.ts`
- `manualOverride.router.ts`

### UI Flows

Guest:

- `/(guest)/travel-alerts`
- `/(guest)/disruption-help`

Hotel:

- `/hotel/ops/crisis`
- `/hotel/ops/mass-recovery`

Admin:

- `/admin/(admin)/crisis`
- `/admin/(admin)/crisis/notifications`
- `/admin/(admin)/disruption-ops`

### Design Rule

Crisis mode should be able to temporarily override or suspend:

- normal ranking
- normal offer logic
- campaign automation
- non-essential upsells
- low-priority support routing

---

## 22.18 Assurance Copy, Truth Disclosure, and UX Standards

Guarantee infrastructure is only valuable if users can understand it.

### New Supporting Models

- `AssuranceCopyTemplate`
- `TruthDisclosureTemplate`
- `PolicySummaryCard`
- `RenderedPolicySnapshot`
- `ClaimInstructionTemplate`

### Purpose

- turn legal/policy logic into understandable interface copy
- make accessibility and pet disclosures specific rather than vague
- explain what is guaranteed and what is not
- keep snapshots of what policy text was shown at the time of booking or claim

### Router Names

- `assuranceCopy.router.ts`
- `policyCard.router.ts`

### UI Flows

- `/(guest)/policy-summary`
- `/(guest)/trust/disclosure`
- `/admin/(admin)/assurance-content`

---

## 22.19 Guarantee Funding, Exposure, and Reserve Logic

Guarantee programs require explicit financial governance.

### Database Models

- `GuaranteeReservePool`
- `ClaimFundingSource`
- `ExposureCapRule`
- `ReserveAdjustment`
- `CoverageBudgetWindow`
- `GuaranteeLossMetric`

### Router Names

- `guaranteeFunding.router.ts`
- `exposure.router.ts`
- `reservePool.router.ts`

### UI Flows

Admin:

- `/admin/(admin)/guarantee-funding`
- `/admin/(admin)/guarantee-exposure`

### Design Rule

The platform must be able to answer:

- who pays for this claim?
- what cap applies?
- which reserve pool is affected?
- is the issue partner-funded, host-funded, hotel-funded, or platform-funded?

---

## 22.20 Replay, Forensics, and Evidence OS

Disputes, appeals, and failures should be reconstructable.

### Database Models

- `JourneyReplay`
- `ForensicEvent`
- `RenderedPolicySnapshot`
- `EvidenceTimeline`
- `DecisionReplayFrame`
- `NotificationProofLog`
- `AccessProofLog`

### Router Names

- `forensics.router.ts`
- `journeyReplay.router.ts`
- `evidenceTimeline.router.ts`

### UI Flows

Admin:

- `/admin/(admin)/forensics`
- `/admin/(admin)/journey-replay`

Hotel / Partner:

- `/hotel/trust/evidence`
- `/partner/trust/evidence`

### Design Rule

The system should be able to replay key moments for:

- guarantee claims
- booking integrity failures
- accessibility disputes
- support escalations
- payout and deposit conflicts

---

## 22.21 Trust Contract Layer

Partners, hosts, hotels, and service providers should be governed by explicit operational obligations.

### Database Models

- `TrustContract`
- `ContractObligation`
- `BreachRecord`
- `RemediationCommitment`
- `ContractComplianceSnapshot`

### Router Names

- `trustContract.router.ts`
- `contractCompliance.router.ts`
- `breachRecord.router.ts`

### UI Flows

Partner / Hotel:

- `/partner/contracts`
- `/hotel/contracts`

Admin:

- `/admin/(admin)/contracts`
- `/admin/(admin)/contract-breaches`

### Design Rule

This should function as an operational trust layer, not only a legal artifact.

---

## 22.22 Safety Routing Layer

Some travelers and journeys need special routing and protection logic.

### Protected Scenarios

- solo late-night traveler
- wheelchair user or mobility-limited traveler
- family with small children
- traveler with service animal
- first-time international arrival
- medically assisted stay
- crisis/disruption-affected traveler

### Database Models

- `SafetyRoutingRule`
- `UrgentSupportPath`
- `ProtectedTravelerMode`
- `PriorityTravelFlag`
- `SensitiveArrivalSupportPlan`

### Router Names

- `safetyRouting.router.ts`
- `protectedMode.router.ts`
- `urgentSupport.router.ts`

### UI Flows

Guest:

- `/(guest)/safe-arrival`
- `/(guest)/urgent-help`

Hotel / Admin:

- `/hotel/operations/protected-travelers`
- `/admin/(admin)/safety-routing`

### Design Rule

Protected routing should increase care and support—not reduce user agency.

---

## 22.23 Service Tiers for Intelligence and Assurance

### Standard

Includes:

- baseline trust visibility
- basic booking integrity checks
- standard support and guarantee claim entry
- accessible and pet disclosure visibility
- basic arrival help
- standard recovery routing

### Plus

Includes:

- enhanced context-aware routing
- faster claim handling in selected categories
- improved rebooking and alternative suggestions
- stronger partner reliability filters
- deeper explainability on why results and offers were chosen

### VIP

Includes:

- priority recovery lane
- curated alternative options during disruption
- high-touch arrival assurance
- premium context-aware support routing
- private offer protection and personalized recovery flows
- dedicated handling for complex multi-constraint journeys

---

## 22.24 Router Tree Additions for v9.0

```text
intelligence/
  context.router.ts
  contextPolicy.router.ts
  contextSnapshot.router.ts
  contextResolution.router.ts
  decision.router.ts
  decisionAudit.router.ts
  decisionExplain.router.ts
  approvalTask.router.ts
  quality.router.ts
  reliability.router.ts
  claimTruth.router.ts
  searchIntent.router.ts
  searchOutcome.router.ts
  rankingInsight.router.ts
  revenueOpportunity.router.ts
  upgradeSignal.router.ts
  supportIntelligence.router.ts
  slaPrediction.router.ts
  escalation.router.ts
  policyExperiment.router.ts
  conversion.router.ts

assurance/
  guarantee.router.ts
  guaranteeClaim.router.ts
  guaranteePolicy.router.ts
  guaranteeDecision.router.ts
  bookingIntegrity.router.ts
  rebooking.router.ts
  accessibilityGuarantee.router.ts
  accessibilityEvidence.router.ts
  petAssurance.router.ts
  serviceAnimal.router.ts
  hostProtection.router.ts
  damageClaim.router.ts
  depositDecision.router.ts
  arrivalAssurance.router.ts
  arrivalIncident.router.ts
  partnerReliability.router.ts
  sla.router.ts
  crisis.router.ts
  massRecovery.router.ts
  emergencyComms.router.ts
  guaranteeFunding.router.ts
  exposure.router.ts
  forensics.router.ts
  journeyReplay.router.ts
  trustContract.router.ts
  contractCompliance.router.ts
  safetyRouting.router.ts
```

---

## 22.25 Page Tree Additions for v9.0

```text
(guest)/
  why-this-result
  why-this-offer
  travel-context
  guarantee
  guarantee/claim
  guarantee/status
  booking-protection
  arrival
  arrival/help
  arrival/checkpoints
  accessibility/claim
  accessible-arrival
  pet-fit
  service-animal-support
  policy-summary
  trust/disclosure
  travel-alerts
  disruption-help
  safe-arrival
  urgent-help

hotel/
  management/context-insights
  management/context-overrides
  management/decision-log
  trust/quality
  trust/reliability
  trust/guarantees
  trust/accessibility-proof
  trust/pet-policies
  ops/integrity
  ops/checkin-failures
  operations/arrivals
  operations/accessible-arrivals
  operations/support-queue
  operations/escalations
  ops/crisis
  ops/mass-recovery
  revenue/opportunities
  revenue/upgrade-signals
  revenue/retention
  contracts

partner/
  trust/reliability
  trust/quality
  trust/guarantees
  host/protection
  host/incidents
  host/damage-claims
  host/pet-readiness
  host/arrivals
  performance
  sla
  support
  support/escalations
  contracts

admin/(admin)/
  context-policies
  context-audit
  decisions
  decision-policies
  decision-appeals
  quality-monitoring
  claim-truth
  search
  ranking-explanations
  zero-results
  growth-signals
  sla-monitoring
  support-triage
  guarantee-ops
  guarantee-funding
  guarantee-exposure
  integrity-incidents
  accessibility-review
  accessible-recovery
  service-animal-policy
  damage-resolution
  host-protection
  partner-sla
  partner-breaches
  crisis
  crisis/notifications
  disruption-ops
  assurance-content
  forensics
  journey-replay
  contracts
  contract-breaches
  safety-routing
```

---

## 22.26 Build Order for v9.0

### Step 21 — Context and explainability foundation

- context frame / signal / snapshot tables
- decision request / outcome / reason tables
- basic explanation surfaces for search and offers
- admin review and override flows

### Step 22 — Quality, search, and support intelligence

- entity quality scoring
- claim truth and reliability snapshots
- search session / outcome tracking
- SLA prediction and support triage
- escalation policy flows

### Step 23 — Guarantee backbone

- guarantee program / policy / claim / decision models
- guarantee funding and exposure logic
- guarantee communication templates

### Step 24 — Category-specific assurance

- booking integrity guarantee
- accessibility truth guarantee
- pet fit and service animal assurance
- host protection shield
- arrival assurance

### Step 25 — Partner and crisis assurance

- partner SLA and reliability assurance
- crisis event and mass recovery mode
- emergency communication runs
- manual override controls

### Step 26 — Replay and contract governance

- journey replay and forensic event logs
- trust contract models
- breach and remediation workflows
- safety routing rules and protected traveler modes

---

## 22.27 Architecture Summary of What v9.0 Adds

v9.0 transforms the platform from a feature-rich hospitality system into a **decision-capable, explanation-capable, and assurance-backed platform**.

It adds:

- context-aware decisioning
- platform-wide explainability
- quality and reliability intelligence
- search outcome learning
- revenue opportunity detection with guardrails
- SLA-aware support routing
- explicit guarantee programs
- booking, accessibility, pet, host, arrival, and partner assurance
- crisis and mass recovery operations
- forensic replay and contract enforcement
- protected traveler routing

These additions create a real moat because they do not merely increase feature count; they increase:

- user trust
- host confidence
- hotel confidence
- partner accountability
- recovery quality
- explainability
- enterprise readiness
- resilience under failure

---

## 22.28 Claude Code Implementation Note for v9.0

When implementing v9.0 additions:

1. Treat intelligence and assurance as shared infrastructure domains, not isolated feature logic
2. Keep context, decisioning, trust, support, and guarantee logs auditable and replayable
3. Ensure high-risk and low-confidence decisions can route to human approval
4. Use explicit policy and funding models for guarantees; avoid hand-wavy claim handling
5. Separate trust, guarantee, and legal/contract concerns but keep them interoperable
6. Make crisis mode able to suspend normal ranking and automation behaviors safely
7. Preserve service-tier access logic, but do not reduce Standard users below a trustworthy baseline
8. Keep all additions additive, modular, and relation-safe within the current monorepo architecture

---

# 23.0 Platform Safety, Policy Control, and Operating Confidence Expansion (v10)

This chapter extends v9 by focusing on the final missing backbone layers required for a large-scale hospitality platform to evolve safely.

At this stage, the platform already includes booking, trust, intelligence, assurance, operations, talent, inclusion, and monetization systems. What remains is the infrastructure that ensures the platform can:

- change safely
- explain operational rules clearly
- unify fragmented incidents into one operating view
- preserve evidence correctly
- measure trust in a decomposed way
- evaluate model quality over time
- benchmark tenant performance fairly
- operationalize playbooks
- monitor tenant health
- govern communication reliability and abuse

These systems are not “nice to have.” They are the layers that allow a platform with many actors, many surfaces, and many automated decisions to remain stable, governable, and enterprise-ready.

---

## 23.1 Release Safety OS

### Goal

Create a release and rollout control system that makes product evolution safe across tenants, modules, and policy-sensitive workflows.

### Why this matters

The platform now contains booking, pricing, guarantee, trust, ranking, support, payout, and policy logic. A small release issue can affect:

- pricing integrity
- ranking behavior
- tenant-specific feature access
- guarantee obligations
- trust and moderation flows
- partner operations
- accessibility or service-animal handling

Release Safety OS ensures features can be launched, restricted, monitored, disabled, and rolled back safely.

### Core capabilities

- feature flagging by tenant, property type, geography, and service tier
- staged rollout by percentage or cohort
- kill switches for critical domains
- migration risk checks before deployment
- post-release anomaly detection hooks
- safe rollback execution logs
- dependency-aware rollout policies

### Database tables

- `FeatureFlag`
- `TenantFeatureRollout`
- `RolloutCohort`
- `KillSwitch`
- `SafeRollbackRun`
- `ReleaseGuard`
- `MigrationRiskCheck`
- `ReleaseImpactSignal`

### Router names

- `releaseSafety.router.ts`
- `featureFlag.router.ts`
- `rollout.router.ts`
- `killSwitch.router.ts`
- `rollback.router.ts`

### Screen flows

#### Admin side

- `/admin/(admin)/release-control`
- `/admin/(admin)/feature-flags`
- `/admin/(admin)/rollouts`
- `/admin/(admin)/kill-switches`
- `/admin/(admin)/rollback-history`

#### Tenant / hotel management side

- `/hotel/management/features`
- `/hotel/management/releases`

### Key rules

- pricing, guarantee, trust, payout, and support-critical features must be kill-switchable
- rollout history must be auditable
- high-risk schema or policy changes should require preflight checks
- tenant-specific rollouts must never silently override global legal or safety rules

---

## 23.2 Policy Studio / Rules Console

### Goal

Provide a unified control plane for platform rules, eligibility policies, entitlement logic, guarantee triggers, and operational fallback behavior.

### Why this matters

The platform now contains many policies:

- service tier entitlements
- guarantee eligibility
- accessibility mismatch handling
- service animal handling
- host protection thresholds
- pricing and rescue logic
- partner SLA actions
- recovery offer limits
- crisis behavior overrides

Without a policy studio, these rules become scattered, hard to audit, and hard to evolve.

### Core capabilities

- create and version rule sets
- simulate policy outcomes before activation
- detect rule conflicts
- assign approval steps to sensitive policies
- bind policies to tenant, geography, property type, and service tier
- define fallback rules for low-confidence or high-risk cases

### Database tables

- `PolicySet`
- `PolicyVersion`
- `PolicyBinding`
- `PolicySimulation`
- `PolicyApproval`
- `RuleConflictCheck`
- `FallbackRule`
- `PolicyActivationLog`

### Router names

- `policyStudio.router.ts`
- `policyVersion.router.ts`
- `policySimulation.router.ts`
- `policyApproval.router.ts`
- `fallbackRule.router.ts`

### Screen flows

#### Admin side

- `/admin/(admin)/policies`
- `/admin/(admin)/policies/[id]`
- `/admin/(admin)/policy-simulations`
- `/admin/(admin)/policy-approvals`

#### Hotel / tenant side

- `/hotel/management/policies`
- `/hotel/management/policies/preview`

### Key rules

- sensitive rules should require versioning and approval
- policy evaluation must generate explainable outputs when used in user-facing or financial flows
- simulations must be available before activation for trust, guarantee, pricing, and payout-related rules

---

## 23.3 Unified Case Management OS

### Goal

Unify support cases, guarantee claims, trust incidents, damage incidents, accessibility mismatches, pet-policy conflicts, recovery flows, and moderation-linked issues into a common case backbone.

### Why this matters

Today, one real-world problem can touch many modules. Example:

- guest arrives
- accessibility claim fails
- booking needs rebooking
- support team opens a ticket
- guarantee claim is filed
- a recovery offer is issued
- trust review is triggered

Without a unified case model, operations become fragmented.

### Core capabilities

- create one master case record per real-world issue
- link multiple domain records into one case
- maintain a single timeline
- assign owners and escalation paths
- attach guarantee, payout, trust, support, and evidence records
- resolve via reusable playbooks

### Database tables

- `CaseRecord`
- `CaseLink`
- `CaseTimelineEvent`
- `CaseOwnerAssignment`
- `CaseEscalation`
- `CaseResolutionTemplate`
- `CaseParticipant`
- `CaseOutcome`

### Router names

- `case.router.ts`
- `caseEscalation.router.ts`
- `caseTimeline.router.ts`
- `caseResolution.router.ts`

### Screen flows

#### Admin / operations side

- `/admin/(admin)/cases`
- `/admin/(admin)/cases/[id]`
- `/admin/(admin)/case-escalations`

#### Hotel side

- `/hotel/operations/cases`
- `/hotel/operations/cases/[id]`

#### Partner side

- `/partner/cases`

### Key rules

- every high-severity incident should be linkable to one master case
- support, guarantee, and trust modules should not duplicate timelines
- sensitive case visibility should be role-based and domain-aware

---

## 23.4 Evidence Vault

### Goal

Create a secure evidence management layer for disputes, guarantee claims, verification, moderation, accessibility proof, pet-fit proof, damage claims, and operational forensics.

### Why this matters

Trust and assurance systems are only as strong as their evidence handling.

The platform now needs to store and govern:

- photos
- documents
- chat excerpts
- policy snapshots
- handover proof
- accessibility measurements
- damage proof
- verification files
- pickup/dropoff proof
- moderation evidence

### Core capabilities

- evidence item storage and classification
- evidence bundling by case or entity
- role-based access grants
- redaction support
- evidence retention policy enforcement
- chain-of-custody logging

### Database tables

- `EvidenceItem`
- `EvidenceBundle`
- `EvidenceBundleLink`
- `EvidenceAccessGrant`
- `EvidenceRetentionRule`
- `EvidenceChainLog`
- `EvidenceRedaction`
- `EvidenceReview`

### Router names

- `evidence.router.ts`
- `evidenceBundle.router.ts`
- `evidenceAccess.router.ts`
- `evidenceReview.router.ts`

### Screen flows

#### Admin side

- `/admin/(admin)/evidence`
- `/admin/(admin)/evidence/[bundleId]`

#### Hotel / partner side

- `/hotel/operations/evidence`
- `/partner/evidence`

### Key rules

- sensitive evidence must have explicit access grants
- evidence related to legal, safety, or identity verification should be retention-controlled
- case systems, guarantee systems, and trust systems should reference evidence via shared bundle links

---

## 23.5 Trust Score Decomposition OS

### Goal

Replace single-number trust thinking with transparent multi-dimensional trust measurement.

### Why this matters

Trust should not be a black box. A single score hides too much and can create unfair incentives.

### Trust dimensions can include

- listing truthfulness
- fulfillment reliability
- support responsiveness
- accessibility confidence
- pet-fit confidence
- dispute resolution quality
- cancellation discipline
- payout reliability
- staff/service quality
- partner SLA performance

### Database tables

- `TrustDimensionScore`
- `TrustScoreWeight`
- `TrustExplanation`
- `TrustScoreDrift`
- `TrustDimensionSnapshot`

### Router names

- `trustDecomposition.router.ts`
- `trustExplanation.router.ts`
- `trustWeights.router.ts`

### Screen flows

#### Guest side

- `/(guest)/trust/[entitySlug]/details`

#### Hotel / partner side

- `/hotel/trust/score-breakdown`
- `/partner/trust/breakdown`

#### Admin side

- `/admin/(admin)/trust-model`
- `/admin/(admin)/trust-score-drift`

### Key rules

- public trust should be displayed with dimension explanations where feasible
- internal trust may include additional dimensions not exposed publicly
- trust-score changes should be traceable to events, outcomes, or policy updates

---

## 23.6 Model Evaluation & Drift OS

### Goal

Continuously evaluate platform intelligence models and decision systems to ensure they remain useful, fair, and stable over time.

### Why this matters

The platform now depends on many model-like systems:

- ranking
- recommendation
- forecast
- upgrade likelihood
- churn risk
- SLA prediction
- trust scoring
- guarantee routing
- fraud/safety signaling

These systems can drift, decay, or overfit.

### Core capabilities

- model/version registry
- evaluation runs
- quality metrics by tenant/cohort/domain
- drift alerting
- false positive and false negative review queues
- human correction logging

### Database tables

- `ModelVersion`
- `EvaluationRun`
- `PredictionOutcome`
- `DriftAlert`
- `FalsePositiveReview`
- `HumanCorrectionLog`
- `EvaluationMetricSnapshot`

### Router names

- `modelEval.router.ts`
- `drift.router.ts`
- `predictionReview.router.ts`

### Screen flows

- `/admin/(admin)/models`
- `/admin/(admin)/models/[id]`
- `/admin/(admin)/drift-alerts`
- `/admin/(admin)/prediction-review`

### Key rules

- high-impact automated decision systems should be measurable over time
- false-positive-heavy systems should be routed for review
- models affecting trust, guarantees, payouts, or access should have drift monitoring from day one

---

## 23.7 Benchmarking & Peer Intelligence OS

### Goal

Allow hotels, hosts, and partners to understand their relative performance against relevant peer groups.

### Why this matters

Raw metrics are useful, but comparative context is what drives action.

### Example benchmark categories

- same-night conversion
- attach-rate by module
- support response time
- recovery closure speed
- accessibility completion quality
- pet-friendly booking performance
- wellness conversion
- workstay conversion
- partner SLA success

### Database tables

- `BenchmarkCohort`
- `PeerMetricSnapshot`
- `CohortAssignment`
- `PerformancePercentile`
- `BenchmarkExplanation`

### Router names

- `benchmark.router.ts`
- `peerInsight.router.ts`
- `cohort.router.ts`

### Screen flows

- `/hotel/management/benchmarking`
- `/partner/performance/benchmarking`
- `/admin/(admin)/cohorts`

### Key rules

- benchmarks must compare like with like
- small-sample cohorts should be threshold-protected
- public-facing comparisons should be avoided unless intentionally productized later

---

## 23.8 Knowledge & Playbook OS

### Goal

Turn operational knowledge into reusable response logic for support, recovery, verification, trust, crisis, and hospitality operations.

### Why this matters

A platform at this scale should not rely on tribal knowledge.

### Example playbooks

- late-night arrival failure
- accessibility mismatch response
- service animal policy conflict
- host damage claim handling
- mobility pickup failure fallback
- guarantee claim triage
- lost & found escalation

### Database tables

- `OperationalPlaybook`
- `PlaybookStep`
- `PlaybookTrigger`
- `ResolvedCasePattern`
- `SuggestedAction`
- `PlaybookExecutionLog`

### Router names

- `playbook.router.ts`
- `playbookExecution.router.ts`
- `suggestedAction.router.ts`

### Screen flows

- `/admin/(admin)/playbooks`
- `/hotel/operations/playbooks`
- `/hotel/operations/suggested-actions`

### Key rules

- playbooks should be attachable to cases, incidents, guarantees, and trust flows
- recommended actions should never override legal or safety policies
- playbook usage should feed case outcome learning

---

## 23.9 Tenant Health OS

### Goal

Measure tenant health, onboarding completeness, product activation, churn risk, and expansion opportunities.

### Why this matters

The platform is also a B2B SaaS ecosystem. Tenant health matters just as much as booking volume.

### Key signals

- onboarding completion
- feature activation depth
- support burden
- trust risk frequency
- quality score health
- billing or payout friction
- integration stability
- usage breadth across modules
- churn risk and expansion potential

### Database tables

- `TenantHealthScore`
- `TenantRiskSignal`
- `OnboardingCompletion`
- `ActivationMilestone`
- `ExpansionOpportunity`
- `UsageBreadthSnapshot`

### Router names

- `tenantHealth.router.ts`
- `tenantRisk.router.ts`
- `activation.router.ts`
- `expansion.router.ts`

### Screen flows

#### Internal / success teams

- `/admin/(admin)/tenant-health`
- `/admin/(admin)/tenant-health/[tenantId]`

#### Tenant side

- `/hotel/management/health`
- `/hotel/management/activation`

### Key rules

- health should be decomposed, not only one number
- low-quality activation should be distinguishable from low usage
- health logic should inform onboarding, support, and account growth workflows

---

## 23.10 Communications Trust Layer

### Goal

Govern platform messaging, translation, critical notices, abuse controls, and communication reliability.

### Why this matters

Communication is now central to:

- guest-host interactions
- guest-staff interactions
- translated support
- policy acknowledgement
- guarantee communications
- recovery offers
- operational instructions

### Core capabilities

- conversation threading
- machine-assisted translation tracking
- critical notice receipt tracking
- abusive messaging detection and escalation
- communication policy enforcement

### Database tables

- `ConversationThread`
- `ConversationParticipant`
- `MessageTranslation`
- `CriticalNoticeReceipt`
- `AbuseFlag`
- `CommunicationPolicy`
- `CommunicationModerationLog`

### Router names

- `conversation.router.ts`
- `translation.router.ts`
- `criticalNotice.router.ts`
- `abuseModeration.router.ts`

### Screen flows

- `/(guest)/messages`
- `/hotel/operations/messages`
- `/admin/(admin)/communications`
- `/admin/(admin)/abuse-flags`

### Key rules

- policy-critical messages should support receipt state
- translated messages should preserve original text and translated version
- abusive communications should be escalatable without making the rest of the support history unusable

---

## 23.11 Recommended Priority Order for v10

### Immediate additions

- Release Safety OS
- Policy Studio / Rules Console
- Unified Case Management OS
- Evidence Vault

### Next additions

- Trust Score Decomposition OS
- Model Evaluation & Drift OS
- Knowledge & Playbook OS
- Tenant Health OS

### Later additions

- Benchmarking & Peer Intelligence OS
- Communications Trust Layer

This order ensures the platform first becomes safe to operate, then measurable, then optimizable.

---

## 23.12 Architecture Summary of What v10 Adds

v10 adds the final backbone layers needed for operating confidence.

It introduces:

- release and rollout safety
- unified policy control
- shared case management
- evidence governance
- decomposed trust scoring
- model evaluation and drift monitoring
- peer benchmarking
- reusable operational playbooks
- tenant health monitoring
- communication trust controls

These additions improve:

- product safety
- operational continuity
- enterprise readiness
- platform explainability
- support efficiency
- dispute quality
- governance maturity
- release confidence
- tenant success visibility

---

## 23.13 Claude Code Implementation Note for v10

When implementing v10 additions:

1. Treat release safety, policy, case management, and evidence as cross-domain infrastructure
2. Make v10 interoperable with existing trust, guarantee, support, pricing, and moderation systems
3. Ensure case and evidence models can link to existing incidents, guarantees, disputes, verifications, and support tickets
4. Do not collapse all trust logic into one score; use decomposed dimensions
5. Add evaluation and drift infrastructure before relying on intelligence systems in critical workflows
6. Ensure communication systems preserve original content, translated content, and notice receipt status
7. Keep all additions additive and relation-safe within the current monorepo
8. Preserve service-tier access logic while keeping baseline trust and safety protections available to all users

---

## 24. Curated In-Room Commerce OS

### 24.1 Why this layer matters

Traditional minibars are often static, low-trust, poorly merchandised, and operationally inefficient.

A future-ready hospitality platform should treat in-room commerce as a configurable, personalized, and revenue-generating layer rather than a fixed inventory shelf.

This module turns minibar into:

- a guest personalization surface
- a package and bundle component
- a context-aware upsell channel
- an operationally trackable micro-commerce stream

This should work for hotels first and later for trusted homes, wellness stays, long-stay properties, and premium serviced apartments where appropriate.

---

### 24.2 Core product goals

The Curated In-Room Commerce OS should allow:

- guests to customize minibar or in-room packs before arrival or during stay
- hotels to define reusable minibar pack templates
- packs to be bundled into Standard / Plus / VIP services
- contextual pack recommendations based on stay purpose
- real-time restock and consumption tracking
- room-service-adjacent ordering with operational visibility
- merchandising experiments to improve attach rate and margin

This layer should support both revenue and delight.

---

### 24.3 Supported pack types

Initial pack taxonomy should support:

- Classic Minibar Pack
- Healthy / Wellness Pack
- Non-Alcoholic Pack
- Premium Bar Pack
- Romantic / Celebration Pack
- Workstay Energy Pack
- Family Snack Pack
- Local Taste Pack
- Vegan / Special Diet Pack
- Sleep / Recovery Pack
- Arrival Refresh Pack

These should be extensible.

---

### 24.4 Key guest experiences

Guest-side flows should support:

- pre-arrival minibar selection
- in-stay minibar browsing
- pack upgrade suggestion
- one-tap restock request
- item-level add/remove personalization
- allergy / dietary / alcohol preference awareness
- tier-aware pack availability
- billing transparency before confirmation

Guests should clearly know:

- what is included
- what is complimentary
- what is chargeable
- what is refillable
- what belongs to a bundle or tier entitlement

---

### 24.5 Key hotel experiences

Hotel-side flows should support:

- minibar pack configuration
- item pricing and supplier mapping
- pack-to-room-type assignment
- pack-to-tier assignment
- pre-arrival preparation queue
- room-level refill / restock workflow
- revenue reporting and attach-rate insight
- stockout handling and substitutions
- rule-based eligibility by stay context

Hotels should be able to differentiate minibar strategy by:

- property type
- room type
- guest tier
- arrival window
- celebration / wellness / workstay context

---

### 24.6 Database models

Add the following models:

- `MinibarProfile`
- `MinibarPack`
- `MinibarItem`
- `MinibarPackItem`
- `MinibarPreference`
- `MinibarOrder`
- `MinibarConsumptionEvent`
- `MinibarRestockRequest`
- `RoomMinibarAssignment`
- `MinibarExperiment`
- `MinibarSubstitutionRule`
- `MinibarStockSnapshot`

#### Purpose of core models

- `MinibarProfile`: room/property minibar configuration
- `MinibarPack`: reusable themed pack definition
- `MinibarItem`: sellable item catalog
- `MinibarPackItem`: pack-item mapping with quantity and inclusion rules
- `MinibarPreference`: guest preference record
- `MinibarOrder`: confirmed minibar or in-room pack order
- `MinibarConsumptionEvent`: item consumption / removal / billing event
- `MinibarRestockRequest`: refill flow and task generation
- `RoomMinibarAssignment`: room-level preparation state
- `MinibarExperiment`: merchandising A/B tests

---

### 24.7 Router additions

Add:

- `minibar.router.ts`
- `minibarPack.router.ts`
- `minibarOrder.router.ts`
- `minibarConsumption.router.ts`
- `minibarRestock.router.ts`
- `minibarExperiment.router.ts`

---

### 24.8 Screen flows

#### Guest side

- `/(guest)/stay/minibar`
- `/(guest)/stay/minibar/customize`
- `/(guest)/stay/minibar/order-history`

#### Hotel side

- `/hotel/operations/minibar`
- `/hotel/operations/minibar/restock`
- `/hotel/revenue/minibar-packs`
- `/hotel/revenue/minibar-insights`

#### Admin side

- `/admin/(admin)/minibar-catalog`
- `/admin/(admin)/minibar-experiments`

---

### 24.9 Tier architecture

#### Standard

- basic in-room selection visibility
- simple add-on ordering
- entry-level minibar packs

#### Plus

- discounted or included curated packs
- one-time complimentary refill in selected plans
- smarter recommendations

#### VIP

- premium curated minibar prepared before arrival
- context-aware exclusive packs
- celebration / wellness / workstay premium pack access
- selected complimentary premium inclusions depending on policy

---

### 24.10 Safety and policy rules

The module should support:

- alcohol policy and jurisdiction restrictions
- age-gated purchase logic where legally required
- allergy and dietary warning labels
- transparent billing before confirmation
- optional hotel-level disablement by room type or geography
- substitution logic when an item is unavailable

Do not assume minibar means alcohol.
It should be modeled as configurable in-room commerce.

---

### 24.11 Intelligence layer hooks

Curated In-Room Commerce OS should integrate with:

- Guest Memory Cloud
- WorkStay / Nomad OS
- Wellness & Recovery OS
- Revenue Rescue & Direct Relationship Engine
- Experimentation & Product Analytics

Example contextual recommendations:

- late arrival -> Arrival Refresh Pack
- business traveler -> Workstay Energy Pack
- wellness guest -> Recovery Pack
- family stay -> Family Snack Pack
- romantic stay -> Celebration Pack

---

### 24.12 Why it strengthens the platform

This layer improves:

- in-stay monetization
- personalization depth
- bundle quality
- revenue per occupied room
- guest delight through intentional room preparation
- differentiation from generic booking platforms

---

## 25. Social Hospitality & Venue Check-in OS

### 25.1 Why this layer matters

Hospitality is not only about sleeping and transacting.
For many guests, especially solo travelers, business travelers, digital nomads, and event-driven visitors, social comfort and safe serendipity are part of the stay value.

This module creates an opt-in, consent-first, venue-bound social layer that helps guests connect in safe hospitality contexts.

This should not be built as a dating feature.
It should be built as a trust-aware social hospitality feature.

---

### 25.2 Product principle

This module must be:

- fully opt-in
- venue-bound
- privacy-preserving
- consent-based
- safety-moderated
- configurable by hotel and venue

The first version should prioritize:

- group lounge style visibility
- event-night participation
- networking and conversation modes
- lightweight temporary interactions

Direct one-to-one matching should only come after strong safety controls exist.

---

### 25.3 Core use cases

Support use cases such as:

- bar social check-in
- lobby networking mode
- rooftop social mode
- event-night introductions
- language exchange circle
- solo traveler conversation mode
- business networking mode
- women-only or group-only social sessions
- city companion meetup mode
- coworking social mode

---

### 25.4 Guest-side experience model

A guest should be able to:

- opt into social mode
- choose a visibility mode
- choose interaction purpose
- select interest tags
- join a venue social session
- see approximate active presence count
- participate in shared venue chat or group lounge
- request or accept a mutual match only if allowed by policy
- leave instantly
- block or report any participant

A guest should not be forced into discoverability.
Defaults should be private and off.

---

### 25.5 Venue-bound identity design

To reduce risk, the first versions should support:

- first-name only or nickname mode
- no room number exposure
- no exact stay dates visible to others
- no personal phone/email exposure
- time-limited presence state
- venue-only visibility instead of hotel-wide visibility

This module should never expose sensitive stay information.

---

### 25.6 Safety architecture

Safety is mandatory.
The module should support:

- consent-first activation
- session-bound visibility
- one-tap block/report
- venue-level moderation controls
- abusive interaction escalation
- quiet leave / invisibility mode
- category-limited participation (e.g. business-only, women-only, group-only)
- temporary conversations that can expire automatically
- guest safety routing if a report is severe

This module must integrate with:

- Communications Trust Layer
- Trust Fabric
- Safety Routing Layer
- Unified Case Management OS

---

### 25.7 Database models

Add the following models:

- `SocialProfile`
- `SocialInterestTag`
- `SocialCheckIn`
- `VenueSocialSession`
- `VenuePresence`
- `MatchPreference`
- `SocialMatch`
- `SocialConversation`
- `ConversationParticipant`
- `SocialBlock`
- `SocialReport`
- `SocialSafetyReview`
- `SocialModePolicy`
- `EphemeralConversationRule`

#### Core responsibilities

- `SocialProfile`: user social preferences and visibility defaults
- `SocialCheckIn`: explicit opt-in presence record
- `VenueSocialSession`: bar/lobby/rooftop or event-based shared social context
- `VenuePresence`: session-level participation state
- `MatchPreference`: user-approved interaction constraints
- `SocialMatch`: mutual or system-assisted social connection
- `SocialConversation`: venue or direct chat container
- `SocialBlock` / `SocialReport`: safety controls
- `SocialModePolicy`: configurable hotel rules

---

### 25.8 Router additions

Add:

- `social.router.ts`
- `socialProfile.router.ts`
- `venueCheckIn.router.ts`
- `socialMatch.router.ts`
- `socialConversation.router.ts`
- `socialSafety.router.ts`
- `socialPolicy.router.ts`

---

### 25.9 Screen flows

#### Guest side

- `/(guest)/social`
- `/(guest)/social/bar`
- `/(guest)/social/lounge`
- `/(guest)/social/matches`
- `/(guest)/social/settings`
- `/(guest)/social/reports`

#### Hotel side

- `/hotel/social/venue-dashboard`
- `/hotel/social/sessions`
- `/hotel/social/moderation`
- `/hotel/social/settings`

#### Admin side

- `/admin/(admin)/social-safety`
- `/admin/(admin)/social-policy`

---

### 25.10 Rollout strategy

The safest rollout path is:

#### Phase 1

- venue check-in
- group lounge mode
- event-based social participation
- shared interest tags
- no direct matching required

#### Phase 2

- mutual opt-in matching
- temporary direct conversations
- category-specific modes

#### Phase 3

- business traveler circles
- women-safe verified circles
- recurring city-based social communities
- VIP curated social nights

---

### 25.11 Tier architecture

#### Standard

- join venue social lounge if enabled
- use basic interest tags
- participate in shared venue chat where allowed

#### Plus

- enhanced filtering and session discovery
- earlier visibility for selected social events
- better networking and matching preferences

#### VIP

- curated social sessions
- premium social events and hosted circles
- priority access to limited-capacity networking sessions
- contextual concierge suggestions for meaningful meetups

---

### 25.12 Hotel controls

Hotels should be able to configure:

- which venues support social mode
- what session types are enabled
- whether direct matching is allowed
- moderation sensitivity level
- social hours
- group-only vs mutual match modes
- identity display rules
- who can join specific venue sessions

This keeps the module brand-safe and property-appropriate.

---

### 25.13 Intelligence integrations

This module should integrate with:

- Guest Memory Cloud
- City Companion OS
- WorkStay / Nomad OS
- Experience Graph
- Communications Trust Layer
- Trust Fabric

Possible intelligent suggestions:

- solo traveler on first night -> group social welcome session
- business traveler during conference week -> networking lounge
- workstay guest -> coworking social circle
- event-driven visitor -> themed bar meetup

---

### 25.14 Key constraints and guardrails

Do not frame this system as a dating product.
Do not expose location or stay details beyond explicit venue presence.
Do not allow silent opt-in.
Do not auto-open direct messages without consent.
Do not ignore reporting and moderation.

The product value should be:

- safe social comfort
- light networking
- hospitality-driven connection
- better solo and business stay experience

---

### 25.15 Why it strengthens the platform

This layer improves:

- social stickiness
- unique stay differentiation
- solo traveler appeal
- business traveler utility
- event-night venue activation
- hotel brand personality
- premium hospitality positioning

It can become a signature differentiator when built safely.

---

## 25.16 Recommended Implementation Order for v11

### Immediate additions

- Curated In-Room Commerce OS core models and pack flows
- venue social check-in and group lounge foundations
- safety and consent controls for social mode

### Next additions

- minibar experiments and pack optimization
- mutual social matching
- tier-aware curated minibar bundles
- venue moderation dashboards

### Later additions

- premium curated social sessions
- city-level recurring circles
- advanced in-room commerce personalization
- social intelligence ranking and hosted event design

---

## 25.17 Architecture Summary of What v11 Adds

v11 expands the platform in two distinct but complementary ways.

It introduces:

- configurable in-room commerce and minibar personalization
- pack-based minibar merchandising and refill workflows
- tier-aware bundle inclusion for minibar experiences
- consent-first venue social participation
- bar / lobby / rooftop check-in based social presence
- safe venue-bound networking and conversation controls
- moderation and policy support for hotel-led social hospitality

These additions improve:

- in-stay revenue density
- room personalization
- guest delight and convenience
- social differentiation for the hospitality brand
- solo and business traveler experience
- premium experiential positioning

---

## 25.18 Claude Code Implementation Note for v11

When implementing v11 additions:

1. Treat Curated In-Room Commerce OS as a revenue and personalization layer, not a static minibar table
2. Model minibar as configurable in-room commerce with packs, items, orders, consumption events, and restock workflows
3. Ensure minibar packs can connect to tiers, bundles, recovery offers, and stay context
4. Treat Social Hospitality & Venue Check-in OS as consent-first, venue-bound, and safety-led
5. Launch social features with group lounge and venue participation before deep one-to-one matching
6. Integrate social safety with existing trust, moderation, support, and communications infrastructure
7. Keep both domains additive and modular within the monorepo
8. Preserve baseline privacy defaults and explicit opt-in requirements across all social interactions
