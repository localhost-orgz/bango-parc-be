import { prisma } from "../config/db.js";

const areaInclude = {
  areaFacilities: {
    include: {
      facility: true,
    },
  },
  areaPrices: {
    include: {
      reservationType: true,
    },
  },
};

export const getAllArea = async (search) => {
  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};
  return await prisma.area.findMany({
    where,
    include: areaInclude,
  });
};

export const createArea = async (
  { name, description },
  facilityIds = [],
  areaPrices = [],
) => {
  // handle facility
  if (facilityIds.length > 0) {
    const foundFacilities = await prisma.facility.findMany({
      where: { id: { in: facilityIds } },
      select: { id: true },
    });

    const foundIds = new Set(foundFacilities.map((f) => f.id));
    const missingIds = facilityIds.filter(
      (facilityId) => !foundIds.has(facilityId),
    );

    if (missingIds.length > 0) {
      throw new Error(`Facility IDs not found: ${missingIds.join(", ")}`);
    }
  }

  // handle areaPrices
  if (areaPrices.length > 0) {
    const reservationTypeIds = areaPrices.map((ap) => ap.reservationTypeId);

    const foundReservationTypes = await prisma.reservationType.findMany({
      where: { id: { in: reservationTypeIds } },
      select: { id: true },
    });

    const foundIds = new Set(foundReservationTypes.map((rt) => rt.id));
    const missingIds = reservationTypeIds.filter(
      (reservationTypeId) => !foundIds.has(reservationTypeId),
    );

    if (missingIds.length > 0) {
      throw new Error(
        `ReservationType IDs not found: ${missingIds.join(", ")}`,
      );
    }
  }

  return await prisma.area.create({
    data: {
      name,
      description,
      ...(facilityIds.length > 0 && {
        areaFacilities: {
          create: facilityIds.map((facilityId) => ({ facilityId })),
        },
      }),

      ...(areaPrices.length > 0 && {
        areaPrices: {
          create: areaPrices.map((areaPrice) => ({
            reservationTypeId: areaPrice.reservationTypeId,
            price: areaPrice.price,
          })),
        },
      }),
    },
    include: areaInclude,
  });
};

export const getAreaById = async (id) =>
  await prisma.area.findUnique({
    where: { id },
    include: areaInclude,
  });

export const updateArea = async (id, { name, description }, facilityIds) => {
  const existingArea = await prisma.area.findUnique({ where: { id } });
  if (!existingArea) {
    throw new Error("Area not found");
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;

  if (facilityIds !== undefined) {
    if (facilityIds.length > 0) {
      const foundFacilities = await prisma.facility.findMany({
        where: { id: { in: facilityIds } },
        select: { id: true },
      });

      const foundIds = new Set(foundFacilities.map((f) => f.id));
      const missingIds = facilityIds.filter(
        (facilityId) => !foundIds.has(facilityId),
      );

      if (missingIds.length > 0) {
        throw new Error(`Facility IDs not found: ${missingIds.join(", ")}`);
      }
    }

    data.areaFacilities = {
      deleteMany: {},
      create: facilityIds.map((facilityId) => ({ facilityId })),
    };
  }

  return await prisma.area.update({
    where: { id },
    data,
    include: areaInclude,
  });
};

export const deleteArea = async (id) =>
  await prisma.area.delete({ where: { id } });
