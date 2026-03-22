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

// ── In-Stay Experience ───────────────────────────────────────────
import { guestStayRouter } from "./routers/guestStay.router.js";
import { inStayMessageRouter } from "./routers/inStayMessage.router.js";
import { hotelWifiRouter } from "./routers/hotelWifi.router.js";
import { hotelMenuRouter } from "./routers/hotelMenu.router.js";
import { guestServiceRequestRouter } from "./routers/guestServiceRequest.router.js";
import { incidentRouter } from "./routers/incident.router.js";
import { recoveryRouter } from "./routers/recovery.router.js";
import { lostFoundRouter } from "./routers/lostFound.router.js";

// ── Staff & Reputation ───────────────────────────────────────────
import { staffProfileRouter } from "./routers/staffProfile.router.js";
import { staffReviewRouter } from "./routers/staffReview.router.js";
import { guestConductRouter } from "./routers/guestConduct.router.js";
import { staffTipRouter } from "./routers/staffTip.router.js";
import { staffRecognitionRouter } from "./routers/staffRecognition.router.js";

// ── Jobs & Talent ────────────────────────────────────────────────
import { jobPostingRouter } from "./routers/jobPosting.router.js";
import { jobApplicationRouter } from "./routers/jobApplication.router.js";

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

  // In-Stay Experience
  guestStay: guestStayRouter,
  inStayMessage: inStayMessageRouter,
  hotelWifi: hotelWifiRouter,
  hotelMenu: hotelMenuRouter,
  guestServiceRequest: guestServiceRequestRouter,
  incident: incidentRouter,
  recovery: recoveryRouter,
  lostFound: lostFoundRouter,

  // Staff & Reputation
  staffProfile: staffProfileRouter,
  staffReview: staffReviewRouter,
  guestConduct: guestConductRouter,
  staffTip: staffTipRouter,
  staffRecognition: staffRecognitionRouter,

  // Jobs & Talent
  jobPosting: jobPostingRouter,
  jobApplication: jobApplicationRouter,
});

export type AppRouter = typeof appRouter;
