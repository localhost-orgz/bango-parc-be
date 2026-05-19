import { z } from "zod";

const reservationAddonSchema = z.object({
  id: z.number(),
  quantity: z.number(),
});

export const reservationSchema = z.object({
  body: z.object({
    customerUuid: z.string(),
    areaPricePlanId: z.number(),
    eventType: z.enum(["REGULER", "WEDDING"]),
    duration: z.number(),
    paxCount: z.number(),
    eventDate: z.string(),
    startTime: z.string(),
    addonIds: z.array(reservationAddonSchema).optional(),
  }),
});
