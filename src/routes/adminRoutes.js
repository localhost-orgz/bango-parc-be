import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminController.login);

export default router;
