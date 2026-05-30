import {
  getGallery,
  addGallery,
  removeFileService,
} from "../services/galleryService.js";
import { uploadToSupabase } from "../utils/supabaseUpload.js";

export const getImages = async (req, res) => {
  try {
    const { areaId } = req.query;
    const galleries = await getGallery(areaId ? Number(areaId) : null);
    res.status(200).json({
      message: "Gallery images retrieved successfully",
      galleries,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const addImages = async (req, res) => {
  try {
    const { areaId, title, description, isPrimary } = req.body;

    const imageUrl = await uploadToSupabase(req.file, "gallery");

    const gallery = await addGallery(
      Number(areaId),
      title,
      description ?? null,
      imageUrl,
      isPrimary === "true" || isPrimary === true,
    );

    res.status(201).json({
      message: "Gallery image added successfully",
      gallery,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const removeFile = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFile = await removeFileService(Number(id));

    res.status(200).json({
      message: "Gallery image removed successfully",
      deletedFile,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
