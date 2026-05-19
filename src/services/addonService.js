import { prisma } from "../config/db.js";

export const getAllAddons = async (search) => {
  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};
  return await prisma.addon.findMany({ where });
};

export const createAddon = async (name, price, description) => {
  return await prisma.addon.create({
    data: {
      name,
      price,
      description,
    },
  });
};

export const getAddonById = async (id) =>
  await prisma.addon.findUnique({
    where: { id },
  });

export const updateAddon = async (id, data) =>
  await prisma.addon.update({
    where: { id },
    data,
  });

export const deleteAddon = async (id) =>
  await prisma.addon.delete({ where: { id } });
