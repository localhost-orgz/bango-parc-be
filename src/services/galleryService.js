import { prisma } from "../config/db.js";
import fs from "fs/promises";
import path from "path";

export const addGallery = async (
  areaTypeId,
  filePath,
  mediaType,
  isPrimary,
) => {
  try {
    const gallery = await prisma.gallery.create({
      data: {
        areaTypeId,
        filePath,
        mediaType,
        isPrimary,
      },
    });
    return gallery;
  } catch (error) {
    console.error("Error adding gallery:", error);
    throw error;
  }
};

export const removeFileService = async (id) => {
  try {
    const gallery = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new Error(`Gallery with id ${id} not found`);
    }

    const filePath = path.resolve(
      "uploads/gallery",
      path.basename(gallery.filePath),
    );
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(`File at ${filePath} could not be removed:`, err.message);
    }

    const deletedFile = await prisma.gallery.delete({
      where: { id },
    });
    return deletedFile;
  } catch (error) {
    console.error("Error removing file:", error);
    throw error;
  }
};
