import { prisma } from "../config/db.js";

export const getAllFacility = async (search) => {
  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};
  return await prisma.facility.findMany({ where });
};

export const createFacility = async (facilityData) => {
  return await prisma.facility.create({
    data: facilityData,
  });
};

export const getFacilityById = async (id) =>
  await prisma.facility.findUnique({
    where: { id },
    include: { areaFacilities: true },
  });

export const updateFacility = async (id, data) =>
  await prisma.facility.update({
    where: { id },
    data,
    include: { areaFacilities: true },
  });

export const deleteFacility = async (id) =>
  await prisma.facility.delete({ where: { id } });
