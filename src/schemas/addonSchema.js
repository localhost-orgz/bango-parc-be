import { z } from "zod";

export const addonSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
