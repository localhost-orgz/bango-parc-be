import express from "express";
import {
  cancel,
  getAll,
  getCustomerReservation,
  makeReservation,
  reschedule,
} from "../controllers/reservationController.js";
import { validate } from "../middlewares/validate.js";
import { reservationSchema } from "../schemas/reservationSchema.js";
import { reservationRescheduleSchema } from "../schemas/reservationRescheduleSchema.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, validate(reservationSchema), makeReservation);
router.get("/all", getAll);
router.get("/me", authMiddleware, getCustomerReservation);
router.patch(
  "/:reservationId/reschedule",
  authMiddleware,
  validate(reservationRescheduleSchema),
  reschedule,
);
router.patch("/:reservationId/cancel", authMiddleware, cancel);

export default router;
