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

const router = express.Router();

router.post("/", validate(addonSchema), createAddon);
router.get("/", getAllAddons);
router.get("/:id", getAddonById);
router.put("/:id", validate(addonSchema), updateAddon);
router.delete("/:id", deleteAddon);

export default router;
