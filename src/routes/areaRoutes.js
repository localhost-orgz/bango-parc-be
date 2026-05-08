import express from "express";
import { validate } from "../middlewares/validate.js";
import {
  createArea,
  deleteArea,
  getAllArea,
  getAreaById,
  updateArea,
} from "../controllers/areaController.js";
import { areaSchema } from "../schemas/areaSchema.js";

const router = express.Router();

router.post("/", validate(areaSchema), createArea);
router.get("/", getAllArea);
router.get("/:uuid", getAreaById);
router.put("/:uuid", validate(areaSchema), updateArea);
router.delete("/:uuid", deleteArea);

export default router;
