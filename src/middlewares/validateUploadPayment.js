import { uploadPaymentSchema } from "../schemas/paymentSchema.js";

export const validateUploadPayment = (req, res, next) => {
  try {
    const validated = uploadPaymentSchema.parse({
      body: req.body,
      file: req.file,
    });
    req.body = validated.body;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      errors: error.errors,
    });
  }
};
