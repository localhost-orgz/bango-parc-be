import { prisma } from "../config/db.js";

export const createArea = async (data) => {
  return await prisma.areaType.create({ data });
};

export const getAllArea = async (search) => {
  const where = search
    ? {
        areaName: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};
  return await prisma.areaType.findMany({ where });
};

export const getAreaById = async (uuid) => {
  return await prisma.areaType.findUnique({ where: { uuid } });
};

export const updateArea = async (uuid, data) => {
  return await prisma.areaType.update({ where: { uuid }, data });
};

export const deleteArea = async (uuid) => {
  return await prisma.areaType.delete({ where: { uuid } });
};
