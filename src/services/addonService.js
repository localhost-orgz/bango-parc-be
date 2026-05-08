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
  return await prisma.addOn.findMany({ where });
};

export const createAddon = async (name, price, unit) => {
  return await prisma.addOn.create({
    data: {
      name,
      price,
      unit,
    },
  });
};

export const getAddonById = async (uuid) =>
  await prisma.addOn.findUnique({
    where: { uuid },
  });

export const updateAddon = async (uuid, data) =>
  await prisma.addOn.update({
    where: { uuid },
    data,
  });

export const deleteAddon = async (uuid) =>
  await prisma.addOn.delete({ where: { uuid } });
