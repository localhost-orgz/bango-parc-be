import { prisma } from "../config/db.js";

// === AreaType ===
export const getAllArea = async (search) => {
  const where = search
    ? {
        areaName: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};
  return await prisma.areaType.findMany({
    where,
    include: { areaPricePlans: true },
  });
};

export const createArea = async (areaTypeData, areaPricePlanData = []) => {
  return await prisma.areaType.create({
    data: {
      ...areaTypeData,
      areaPricePlans: areaPricePlanData.length
        ? {
            create: areaPricePlanData,
          }
        : undefined,
    },
    include: {
      areaPricePlans: true,
    },
  });
};

export const getAreaById = async (uuid) =>
  await prisma.areaType.findUnique({
    where: { uuid },
    include: { areaPricePlans: true },
  });

export const updateArea = async (uuid, data) =>
  await prisma.areaType.update({
    where: { uuid },
    data,
    include: { areaPricePlans: true },
  });

export const deleteArea = async (uuid) =>
  await prisma.areaType.delete({ where: { uuid } });

// === AreaPricePlan ===
export const createPricePlan = async (areaTypeId, areaPricePlans = []) => {
  const areaType = await getAreaById(areaTypeId);
  const dataToCreate = areaPricePlans.map((plan) => ({
    areaTypeId: areaType.id,
    planName: plan.planName,
    planDuration: plan.planDuration,
    planPrice: plan.planPrice,
  }));

  return await prisma.areaPricePlan.createMany({
    data: dataToCreate,
  });
};

export const getPricePlan = async (areaTypeId) => {
  return await prisma.areaPricePlan.findMany({
    where: { areaTypeId },
  });
};

export const updatePricePlan = async (areaPricePlans = []) => {
  const updatePromises = areaPricePlans.map(async (plan) => {
    const { id, ...updateData } = plan;
    return prisma.areaPricePlan.update({
      where: { id },
      data: updateData,
    });
  });
  return Promise.all(updatePromises);
};

export const deletePricePlan = async (id) => {
  return await prisma.areaPricePlan.delete({
    where: { id },
  });
};
