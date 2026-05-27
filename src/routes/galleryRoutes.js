import express from "express";
import { validate } from "../middlewares/validate.js";
import { gallerySchema } from "../schemas/gallerySchema.js";
import {
  getImages,
  addImages,
  removeFile,
} from "../controllers/galleryController.js";
import uploadMiddleware from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getImages);

router.post(
  "/",
  uploadMiddleware.single("file"),
  validate(gallerySchema),
  addImages,
);
router.delete("/:id", removeFile);

export default router;
