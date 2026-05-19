import { z } from "zod";

export const reservationTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    durationIntervalHour: z.number().int().positive(),
  }),
});
