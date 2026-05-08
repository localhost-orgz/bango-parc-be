import { z } from "zod";

export const areaSchema = z.object({
  body: z.object({
    areaName: z.string().min(3),
    maxCapPax: z.number().min(1),
    electricPowerWatt: z.number().min(1),
    isWeddingAvailable: z.boolean(),
  }),
});
