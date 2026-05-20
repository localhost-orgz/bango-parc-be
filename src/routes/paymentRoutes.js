import express from "express";
import {
  approve,
  getAll,
  reject,
  upload,
} from "../controllers/paymentController.js";
import { createUploadMiddleware } from "../middlewares/upload.js";
import { validateUploadPayment } from "../middlewares/validateUploadPayment.js";
import { validate } from "../middlewares/validate.js";
import { rejectPaymentSchema } from "../schemas/paymentSchema.js";

const router = express.Router();
const uploadFile = createUploadMiddleware("uploads/payment");

router.get("/", getAll);
router.post("/", uploadFile.single("file"), validateUploadPayment, upload);
router.patch("/approve", approve);
router.patch("/reject", validate(rejectPaymentSchema), reject);

export default router;
