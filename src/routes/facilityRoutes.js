import express from "express";
import { validate } from "../middlewares/validate.js";
import {
  createFacility,
  deleteFacility,
  getAllFacility,
  getFacilityById,
  updateFacility,
} from "../controllers/facilityController.js";
import { facilitySchema } from "../schemas/facilitySchema.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  validate(facilitySchema),
  createFacility,
);
router.get("/", getAllFacility);
router.get("/:id", getFacilityById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  validate(facilitySchema),
  updateFacility,
);
router.delete("/:id", authMiddleware, isAdmin, deleteFacility);

export default router;
