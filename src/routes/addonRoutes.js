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
router.get("/:uuid", getAddonById);
router.put("/:uuid", validate(addonSchema), updateAddon);
router.delete("/:uuid", deleteAddon);

export default router;
