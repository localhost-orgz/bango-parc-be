import express from "express";
import { validate } from "../middlewares/validate.js";
import {
  createReservationType,
  deleteReservationType,
  getAllReservationTypes,
  getReservationTypeById,
  updateReservationType,
} from "../controllers/reservationTypeController.js";
import { reservationTypeSchema } from "../schemas/reservationTypeSchema.js";

const router = express.Router();

router.post("/", validate(reservationTypeSchema), createReservationType);
router.get("/", getAllReservationTypes);
router.get("/:id", getReservationTypeById);
router.put("/:id", validate(reservationTypeSchema), updateReservationType);
router.delete("/:id", deleteReservationType);

export default router;
