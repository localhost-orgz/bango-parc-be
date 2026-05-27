import express from "express";
import {
  approve,
  getAll,
  reject,
  upload,
} from "../controllers/paymentController.js";
import { validateUploadPayment } from "../middlewares/validateUploadPayment.js";
import { validate } from "../middlewares/validate.js";
import { rejectPaymentSchema } from "../schemas/paymentSchema.js";
import uploadMiddleware from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAll);
router.post(
  "/",
  uploadMiddleware.single("file"),
  validateUploadPayment,
  upload,
);
router.patch("/approve", approve);
router.patch("/reject", validate(rejectPaymentSchema), reject);

export default router;
