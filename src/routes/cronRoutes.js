import express from "express";
import { runReminders } from "../controllers/cronController.js";

const router = express.Router();

router.get("/reminders", runReminders);

export default router;
