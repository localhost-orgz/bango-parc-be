import { prisma } from "../config/db.js";

export const getAllReservationTypes = async (search) => {
  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};
  return await prisma.reservationType.findMany({ where });
};

export const createReservationType = async (data) =>
  await prisma.reservationType.create({ data });

export const getReservationTypeById = async (id) =>
  await prisma.reservationType.findUnique({ where: { id } });

export const updateReservationType = async (id, data) =>
  await prisma.reservationType.update({
    where: { id },
    data,
  });

export const deleteReservationType = async (id) =>
  await prisma.reservationType.delete({ where: { id } });
