import { z } from "zod";

// === AreaType
export const areaSchema = z.object({
  body: z.object({
    areaName: z.string().min(3),
    maxCapPax: z.number().min(1),
    electricPowerWatt: z.number().min(1),
    isWeddingAvailable: z.boolean(),
    areaPricePlans: z
      .array(
        z.object({
          planName: z.string().min(1),
          planDuration: z.number().min(1),
          planPrice: z.number().min(1),
        }),
      )
      .optional(),
  }),
});

// === AreaPricePlan
const baseValidationAreaPricePlan = {
  planName: z.string().min(1),
  planDuration: z.number().min(1),
  planPrice: z.number().min(1),
};

export const createAreaPricePlanSchema = z.object({
  body: z.object({
    areaPricePlans: z.array(z.object(baseValidationAreaPricePlan)),
  }),
});

export const updateAreaPricePlanSchema = z.object({
  body: z.object({
    areaPricePlans: z.array(
      z.object({
        ...baseValidationAreaPricePlan,
        id: z.number(),
      }),
    ),
  }),
});
