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
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, validate(areaSchema), createArea);
router.get("/", getAllArea);
router.get("/:id", getAreaById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  validate(updateAreaSchema),
  updateArea,
);
router.delete("/:id", authMiddleware, isAdmin, deleteArea);

export default router;
