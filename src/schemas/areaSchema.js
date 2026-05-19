import { z } from "zod";

const areaPriceBody = {
  reservationTypeId: z.number().int().positive().nullable(),
  price: z.number().min(0).nullable(),
};

const areaBody = {
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  facilityIds: z.array(z.number().int().positive()).optional(),
  areaPrices: z.array(z.object(areaPriceBody)).optional(),
};

export const areaSchema = z.object({
  body: z.object(areaBody),
});

export const updateAreaSchema = z.object({
  body: z.object({
    name: areaBody.name.optional(),
    description: areaBody.description,
    facilityIds: areaBody.facilityIds,
  }),
});
