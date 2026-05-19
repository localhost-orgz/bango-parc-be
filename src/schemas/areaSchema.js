import { z } from "zod";

const areaBody = {
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  facilityIds: z.array(z.number().int().positive()).optional(),
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
