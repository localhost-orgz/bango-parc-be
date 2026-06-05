import express from "express";
import { getDashboardInfo } from "../controllers/dashboardController.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getDashboardInfo);

export default router;
