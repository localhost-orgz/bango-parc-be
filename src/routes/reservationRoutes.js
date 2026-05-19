import express from "express";
import { makeReservation } from "../controllers/reservationController.js";
import { validate } from "../middlewares/validate.js";
import { reservationSchema } from "../schemas/reservationSchema.js";

const router = express.Router();

router.post("/", validate(reservationSchema), makeReservation);

export default router;
