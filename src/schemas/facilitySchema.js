import { z } from "zod";

export const facilitySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    icon: z.string().min(1),
    value: z.string().min(1),
    isDisplay: z.boolean().optional(),
  }),
});
