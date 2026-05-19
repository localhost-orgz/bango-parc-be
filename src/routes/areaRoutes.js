import express from "express";
import { validate } from "../middlewares/validate.js";
import {
  createArea,
  deleteArea,
  getAllArea,
  getAreaById,
  updateArea,
} from "../controllers/areaController.js";
import { areaSchema, updateAreaSchema } from "../schemas/areaSchema.js";

const router = express.Router();

router.post("/", validate(areaSchema), createArea);
router.get("/", getAllArea);
router.get("/:id", getAreaById);
router.put("/:id", validate(updateAreaSchema), updateArea);
router.delete("/:id", deleteArea);

export default router;
