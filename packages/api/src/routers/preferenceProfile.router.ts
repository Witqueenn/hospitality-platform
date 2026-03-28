// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const preferenceProfileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userPreferenceProfile.findFirst({
      where: { userId: ctx.session.userId },
    });
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        preferredCheckInFrom: z.string().optional(),
        preferredCheckOutTo: z.string().optional(),
        preferredRoomTemp: z.number().int().optional(),
        preferredBedType: z.string().optional(),
        preferredFloor: z.string().optional(),
        prefersQuietRoom: z.boolean().optional(),
        prefersHighFloor: z.boolean().optional(),
        needsStrongWifi: z.boolean().optional(),
        likesGymAccess: z.boolean().optional(),
        likesSpaAccess: z.boolean().optional(),
        mobilityPreferences: z.record(z.unknown()).optional(),
        dietaryPreferences: z.record(z.unknown()).optional(),
        languagePreferences: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        mobilityPreferences,
        dietaryPreferences,
        languagePreferences,
        tags,
        ...rest
      } = input;
      const jsonFields = {
        ...(mobilityPreferences !== undefined
          ? { mobilityPreferences: mobilityPreferences as any }
          : {}),
        ...(dietaryPreferences !== undefined
          ? { dietaryPreferences: dietaryPreferences as any }
          : {}),
        ...(languagePreferences !== undefined
          ? { languagePreferences: languagePreferences as any }
          : {}),
        ...(tags !== undefined ? { tags: tags as any } : {}),
      };
      return ctx.db.userPreferenceProfile.upsert({
        where: { userId: ctx.session.userId },
        create: {
          tenantId: ctx.session.tenantId,
          userId: ctx.session.userId,
          ...rest,
          ...jsonFields,
        },
        update: { ...rest, ...jsonFields },
      });
    }),

  getTravelProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userTravelProfile.findFirst({
      where: { userId: ctx.session.userId },
    });
  }),

  upsertTravelProfile: protectedProcedure
    .input(
      z.object({
        travelStyle: z.string().optional(),
        typicalStayLength: z.number().int().optional(),
        preferredCities: z.array(z.string()).optional(),
        preferredHotelTags: z.array(z.string()).optional(),
        passportCountry: z.string().optional(),
        needsVisaSupport: z.boolean().optional(),
        arrivalPatterns: z.record(z.unknown()).optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        preferredCities,
        preferredHotelTags,
        arrivalPatterns,
        metadata,
        ...rest
      } = input;
      const jsonFields = {
        ...(preferredCities !== undefined
          ? { preferredCities: preferredCities as any }
          : {}),
        ...(preferredHotelTags !== undefined
          ? { preferredHotelTags: preferredHotelTags as any }
          : {}),
        ...(arrivalPatterns !== undefined
          ? { arrivalPatterns: arrivalPatterns as any }
          : {}),
        ...(metadata !== undefined ? { metadata: metadata as any } : {}),
      };
      return ctx.db.userTravelProfile.upsert({
        where: { userId: ctx.session.userId },
        create: {
          tenantId: ctx.session.tenantId,
          userId: ctx.session.userId,
          ...rest,
          ...jsonFields,
        },
        update: { ...rest, ...jsonFields },
      });
    }),
});
