import { z } from "zod";

export const reservationSchema = z.object({
  body: z.object({
    customerId: z.number(),
    reservationTypeId: z.number(),
    startDateTime: z.iso.datetime(),
    endDateTime: z.iso.datetime(),
    installment: z.number().optional(),

    areas: z.array(
      z.object({
        areaId: z.number(),
      }),
    ),

    addons: z
      .array(
        z.object({
          addonId: z.number(),
          qty: z.number().min(1),
        }),
      )
      .optional(),
  }),
});

export const cancelReservationSchema = z.object({
  body: z.object({
    cancellationReason: z.string().min(5, "Reason too short"),
  }),
});
