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
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  validate(reservationTypeSchema),
  createReservationType,
);
router.get("/", getAllReservationTypes);
router.get("/:id", getReservationTypeById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  validate(reservationTypeSchema),
  updateReservationType,
);
router.delete("/:id", authMiddleware, isAdmin, deleteReservationType);

export default router;
