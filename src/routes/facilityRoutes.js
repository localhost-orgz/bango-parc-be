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

const router = express.Router();

router.post("/", validate(facilitySchema), createFacility);
router.get("/", getAllFacility);
router.get("/:id", getFacilityById);
router.put("/:id", validate(facilitySchema), updateFacility);
router.delete("/:id", deleteFacility);

export default router;
