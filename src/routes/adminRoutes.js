import express from "express";
import * as adminController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", adminController.login);

export default router;
