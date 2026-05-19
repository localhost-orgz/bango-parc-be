import { z } from "zod";

export const reservationRescheduleSchema = z.object({
  body: z.object({
    startDateTime: z.iso.datetime(),
    endDateTime: z.iso.datetime(),
    reason: z.string().optional(),
  }),
});
