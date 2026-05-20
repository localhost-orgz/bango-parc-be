import { z } from "zod";
import imageValidator from "./imageValidator.js";

export const uploadPaymentSchema = z.object({
  body: z.object({
    paymentScheduleId: z.coerce.number(),
    amount: z.coerce.number(),
    senderName: z.string(),
  }),
  file: imageValidator({
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5,
  }),
});

export const rejectPaymentSchema = z.object({
  body: z.object({
    paymentProofId: z.number(),
    rejectionReason: z.string(),
  }),
});
