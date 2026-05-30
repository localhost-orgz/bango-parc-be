import express from "express";
import { validate } from "../middlewares/validate.js";
import { addonSchema } from "../schemas/addonSchema.js";
import {
  createAddon,
  deleteAddon,
  getAddonById,
  getAllAddons,
  updateAddon,
} from "../controllers/addonController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isAdmin, validate(addonSchema), createAddon);
router.get("/", getAllAddons);
router.get("/:id", getAddonById);
router.put("/:id", authMiddleware, isAdmin, validate(addonSchema), updateAddon);
router.delete("/:id", authMiddleware, isAdmin, deleteAddon);

export default router;
