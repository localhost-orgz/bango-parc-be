import { z } from "zod";

export const gallerySchema = z.object({
  body: z.object({
    areaTypeId: z.coerce.number(),
    file: z.any(),
    mediaType: z.enum(["PHOTO", "TOUR360"]),
    isPrimary: z.coerce.boolean().default(false),
  }),
});
