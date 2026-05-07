import express from "express";
import {
  signinUser,
  signupUser,
  verifyUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signin", signinUser);
router.post("/signup", signupUser);
router.get("/verify", verifyUser);

export default router;
