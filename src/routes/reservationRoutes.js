import express from "express";
import {
  cancel,
  getAll,
  makeReservation,
  reschedule,
} from "../controllers/reservationController.js";
import { validate } from "../middlewares/validate.js";
import { reservationSchema } from "../schemas/reservationSchema.js";
import { reservationRescheduleSchema } from "../schemas/reservationRescheduleSchema.js";

const router = express.Router();

router.post("/", validate(reservationSchema), makeReservation);
router.get("/all", getAll);
router.patch(
  "/:reservationId/reschedule",
  validate(reservationRescheduleSchema),
  reschedule,
);
router.patch("/:reservationId/cancel", cancel);

export default router;
