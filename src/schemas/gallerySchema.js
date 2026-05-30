import { z } from "zod";

export const gallerySchema = z.object({
  body: z.object({
    areaId: z.coerce.number(),
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    isPrimary: z.coerce.boolean().default(false),
  }),
});
