import { router } from "./trpc.js";

// ── Core ─────────────────────────────────────────────────────────
import { authRouter } from "./routers/auth.router.js";
import { tenantRouter } from "./routers/tenant.router.js";
import { hotelRouter } from "./routers/hotel.router.js";
import {
  roomTypeRouter,
  roomInventoryRouter,
  availabilityRouter,
} from "./routers/roomType.router.js";
import { bookingRouter } from "./routers/booking.router.js";
import { venueRouter } from "./routers/venue.router.js";
import { eventRequestRouter } from "./routers/eventRequest.router.js";
import { supportCaseRouter } from "./routers/supportCase.router.js";
import { reviewRouter } from "./routers/review.router.js";
import { analyticsRouter } from "./routers/analytics.router.js";
import { notificationRouter } from "./routers/notification.router.js";
import { diningRouter } from "./routers/dining.router.js";
import { nightlifeRouter } from "./routers/nightlife.router.js";

// ── VIP & Personalization ────────────────────────────────────────
import { vipRouter } from "./routers/vip.router.js";
import { preferenceProfileRouter } from "./routers/preferenceProfile.router.js";

// ── Amenity Marketplace ──────────────────────────────────────────
import {
  amenityRouter,
  amenityReservationRouter,
} from "./routers/amenity.router.js";

// ── Tonight Deals / Flash Inventory ─────────────────────────────
import {
  flashInventoryRouter,
  nightUseRouter,
} from "./routers/flashInventory.router.js";

// ── Trusted Stays ────────────────────────────────────────────────
import { trustedStayRouter } from "./routers/trustedStay.router.js";

// ── Mobility ─────────────────────────────────────────────────────
import {
  mobilityRouter,
  mobilityReservationRouter,
} from "./routers/mobility.router.js";

// ── City Guide & Local Experiences ──────────────────────────────
import {
  cityGuideRouter,
  localExperienceRouter,
} from "./routers/cityGuide.router.js";

// ── Bundle & Cross-Sell ──────────────────────────────────────────
import { bundleRouter } from "./routers/bundle.router.js";

// ── Platform Finance ─────────────────────────────────────────────
import { partnerRouter, settlementRouter } from "./routers/partner.router.js";

export const appRouter = router({
  // Core
  auth: authRouter,
  tenant: tenantRouter,
  hotel: hotelRouter,
  roomType: roomTypeRouter,
  roomInventory: roomInventoryRouter,
  availability: availabilityRouter,
  booking: bookingRouter,
  venue: venueRouter,
  eventRequest: eventRequestRouter,
  supportCase: supportCaseRouter,
  review: reviewRouter,
  analytics: analyticsRouter,
  notification: notificationRouter,
  dining: diningRouter,
  nightlife: nightlifeRouter,

  // VIP & Personalization
  vip: vipRouter,
  preferenceProfile: preferenceProfileRouter,

  // Amenity Marketplace
  amenity: amenityRouter,
  amenityReservation: amenityReservationRouter,

  // Tonight Deals / Flash Inventory
  flashInventory: flashInventoryRouter,
  nightUse: nightUseRouter,

  // Trusted Stays
  trustedStay: trustedStayRouter,

  // Mobility
  mobility: mobilityRouter,
  mobilityReservation: mobilityReservationRouter,

  // City Guide & Local Experiences
  cityGuide: cityGuideRouter,
  localExperience: localExperienceRouter,

  // Bundle & Cross-Sell
  bundle: bundleRouter,

  // Platform Finance
  partner: partnerRouter,
  settlement: settlementRouter,
});

export type AppRouter = typeof appRouter;
