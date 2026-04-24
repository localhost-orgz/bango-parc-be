import express from "express";
import * as customerController from "../controllers/customerController.js";

const router = express.Router();

router.post("/register", customerController.register);
router.get("/verify", customerController.verify);
router.post("/login", customerController.login);

export default router;
