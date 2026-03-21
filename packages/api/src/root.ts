import { router } from "./trpc.js";
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

export const appRouter = router({
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
});

export type AppRouter = typeof appRouter;
