import express from "express";
import { validate } from "../middlewares/validate.js";
import {
  createArea,
  createAreaPricePlan,
  deleteArea,
  deleteAreaPricePlan,
  getAllArea,
  getAreaById,
  updateArea,
  updateAreaPricePlan,
} from "../controllers/areaController.js";
import {
  areaSchema,
  createAreaPricePlanSchema,
  updateAreaPricePlanSchema,
} from "../schemas/areaSchema.js";

const router = express.Router();

// === AreaType ===
router.post("/", validate(areaSchema), createArea);
router.get("/", getAllArea);
router.get("/:uuid", getAreaById);
router.put("/:uuid", validate(areaSchema), updateArea);
router.delete("/:uuid", deleteArea);

// === AreaPricePlan ===
router.post(
  "/:areaTypeId/price-plan",
  validate(createAreaPricePlanSchema),
  createAreaPricePlan,
);

router.put(
  "/:areaTypeId/price-plan",
  validate(updateAreaPricePlanSchema),
  updateAreaPricePlan,
);

router.delete("/:areaTypeId/price-plan/:id", deleteAreaPricePlan);

export default router;
