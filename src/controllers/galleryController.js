import { addGallery, removeFileService } from "../services/galleryService.js";

export const addImages = async (req, res) => {
  try {
    const { areaTypeId, mediaType, isPrimary } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `uploads/gallery/${file.filename}`;

    const gallery = await addGallery(
      Number(areaTypeId),
      filePath,
      mediaType,
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
