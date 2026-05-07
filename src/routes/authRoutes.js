import express from "express";
import {
  signinUser,
  signupUser,
  verifyUser,
} from "../controllers/authController.js";
import { validate } from "../middlewares/validate.js";
import { signinSchema, signupSchema } from "../schemas/authSchema.js";

const router = express.Router();

router.post("/signin", validate(signinSchema), signinUser);
router.post("/signup", validate(signupSchema), signupUser);
router.get("/verify", verifyUser);

export default router;
