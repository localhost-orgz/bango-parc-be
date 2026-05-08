import { z } from "zod";

export const addonSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    price: z.number().min(1),
    unit: z.string().min(1),
  }),
});
