import { router } from "./trpc";

// ── Core ─────────────────────────────────────────────────────────
import { authRouter } from "./routers/auth.router";
import { tenantRouter } from "./routers/tenant.router";
import { hotelRouter } from "./routers/hotel.router";
import {
  roomTypeRouter,
  roomInventoryRouter,
  availabilityRouter,
} from "./routers/roomType.router";
import { bookingRouter } from "./routers/booking.router";
import { venueRouter } from "./routers/venue.router";
import { eventRequestRouter } from "./routers/eventRequest.router";
import { supportCaseRouter } from "./routers/supportCase.router";
import { reviewRouter } from "./routers/review.router";
import { analyticsRouter } from "./routers/analytics.router";
import { notificationRouter } from "./routers/notification.router";
import { diningRouter } from "./routers/dining.router";
import { nightlifeRouter } from "./routers/nightlife.router";

// ── VIP & Personalization ────────────────────────────────────────
import { vipRouter } from "./routers/vip.router";
import { preferenceProfileRouter } from "./routers/preferenceProfile.router";

// ── Amenity Marketplace ──────────────────────────────────────────
import {
  amenityRouter,
  amenityReservationRouter,
} from "./routers/amenity.router";

// ── Tonight Deals / Flash Inventory ─────────────────────────────
import {
  flashInventoryRouter,
  nightUseRouter,
} from "./routers/flashInventory.router";

// ── Trusted Stays ────────────────────────────────────────────────
import { trustedStayRouter } from "./routers/trustedStay.router";

// ── Mobility ─────────────────────────────────────────────────────
import {
  mobilityRouter,
  mobilityReservationRouter,
} from "./routers/mobility.router";

// ── City Guide & Local Experiences ──────────────────────────────
import {
  cityGuideRouter,
  localExperienceRouter,
} from "./routers/cityGuide.router";

// ── Bundle & Cross-Sell ──────────────────────────────────────────
import { bundleRouter } from "./routers/bundle.router";

// ── Platform Finance ─────────────────────────────────────────────
import { partnerRouter, settlementRouter } from "./routers/partner.router";

// ── In-Stay Experience ───────────────────────────────────────────
import { guestStayRouter } from "./routers/guestStay.router";
import { inStayMessageRouter } from "./routers/inStayMessage.router";
import { hotelWifiRouter } from "./routers/hotelWifi.router";
import { hotelMenuRouter } from "./routers/hotelMenu.router";
import { guestServiceRequestRouter } from "./routers/guestServiceRequest.router";
import { incidentRouter } from "./routers/incident.router";
import { recoveryRouter } from "./routers/recovery.router";
import { lostFoundRouter } from "./routers/lostFound.router";

// ── Staff & Reputation ───────────────────────────────────────────
import { staffProfileRouter } from "./routers/staffProfile.router";
import { staffReviewRouter } from "./routers/staffReview.router";
import { guestConductRouter } from "./routers/guestConduct.router";
import { staffTipRouter } from "./routers/staffTip.router";
import { staffRecognitionRouter } from "./routers/staffRecognition.router";

// ── Jobs & Talent ────────────────────────────────────────────────
import { jobPostingRouter } from "./routers/jobPosting.router";
import { jobApplicationRouter } from "./routers/jobApplication.router";

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
