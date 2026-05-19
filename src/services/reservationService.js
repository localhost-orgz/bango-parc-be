import { prisma } from "../config/db.js";
import { Prisma } from "../generated/index.js";

export const createReservation = async (payload) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Validate reservation type
    const reservationType = await tx.reservationType.findUnique({
      where: {
        id: payload.reservationTypeId,
      },
    });

    if (!reservationType) {
      throw new Error("Reservation type not found");
    }

    // 2. Calculate Price (areas & addons)
    let totalAreaPrice = 0;
    let totalAddonPrice = 0;

    // --- Area Reservation
    const areaReservation = [];
    for (const item of payload.areas) {
      const areaPrice = await tx.areaPrice.findFirst({
        where: {
          areaId: item.areaId,
          reservationTypeId: item.reservationTypeId,
        },
      });

      if (!areaPrice) {
        throw new Error(`Area ${item.areaId} has no price`);
      }

      totalAreaPrice += Number(areaPrice.price);

      // calculate area subtotal
      const start = new Date(payload.startDateTime);
      const end = new Date(payload.endDateTime);
      const durationInHours =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (durationInHours % reservationType.durationIntervalHour !== 0) {
        throw new Error(
          `Duration must be multiple of ${reservationType.durationIntervalHour} hours`,
        );
      }
      const totalSlots = durationInHours / reservationType.durationIntervalHour;
      const areaSubtotal = new Prisma.Decimal(totalSlots).mul(areaPrice.price);

      areaReservation.push({
        areaId: item.areaId,
        priceSnapshot: areaPrice.price,
        subtotal: areaSubtotal,
      });
    }

    // --- Addon Reservation
    const addonReservation = [];
    if (payload.addons) {
      for (const item of payload.addons) {
        const addon = await tx.addon.findFirst({
          where: {
            id: item.addonId,
          },
        });

        if (!addon) {
          throw new Error(`Addon ${item.addonId} not found`);
        }

        const subtotal = Number(addon.price) * item.qty;
        totalAddonPrice += subtotal;

        addonReservation.push({
          addonId: item.addonId,
          qty: item.qty,
          priceSnapshot: addon.price,
          subtotal,
        });
      }
    }

    const totalPrice = totalAreaPrice + totalAddonPrice;

    // 3. Create Reservation
    const bookingCode = `RSV-${Date.now()}`;
    const reservation = await tx.reservation.create({
      data: {
        bookingCode,
        customerId: payload.customerId,
        reservationTypeId: payload.reservationTypeId,
        startDateTime: new Date(payload.startDateTime),
        endDateTime: new Date(payload.endDateTime),
        totalAreaPrice,
        totalAddonPrice,
        totalPrice,
        remainingBalance: totalPrice,
        areaReservations: {
          create: areaReservation,
        },
        addonReservations: {
          create: addonReservation,
        },
      },
      include: {
        areaReservations: {
          include: {
            area: true,
          },
        },
        addonReservations: {
          include: {
            addon: true,
          },
        },
      },
    });

    return reservation;
  });
};

export const getAllReservation = async () => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            whatsappNumber: true,
            role: true,
            isVerified: true,
            googleAvatar: true,
          },
        },
        reservationType: true,
        areaReservations: {
          include: {
            area: true,
          },
        },
        addonReservations: {
          include: {
            addon: true,
          },
        },
      },
    });
    return reservations;
  } catch (error) {
    throw new Error("Failed to get reservations: " + error.message);
  }
};

export const rescheduleReservation = async (reservationId, payload) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find reservation
    const reservation = await tx.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        reservationType: true,
        areaReservations: true,
      },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // 2. Validate reservation status
    const invalidStatuses = ["COMPLETED", "CANCELLED", "EXPIRED"];

    if (invalidStatuses.includes(reservation.status)) {
      throw new Error("Reservation cannot be rescheduled");
    }

    // 3. Validate duration
    const start = new Date(payload.startDateTime);
    const end = new Date(payload.endDateTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (
      durationHours % reservation.reservationType.durationIntervalHour !==
      0
    ) {
      throw new Error(
        `Duration must be multiple of ${reservation.reservationType.durationIntervalHour} hours`,
      );
    }

    // 4. Validate conflict date
    const areaIds = reservation.areaReservations.map((area) => area.areaId);
    const conflict = await tx.areaReservation.findFirst({
      where: {
        areaId: {
          in: areaIds,
        },

        reservation: {
          id: {
            not: reservation.id,
          },

          status: {
            in: ["WAITING_DP", "CONFIRMED"],
          },

          AND: [
            {
              startDateTime: { lt: end },
            },
            {
              endDateTime: { gt: start },
            },
          ],
        },
      },
    });

    if (conflict) {
      throw new Error("Area already booked");
    }

    // 5. Create reschedule history
    await tx.reservationRescheduleHistory.create({
      data: {
        reservationId: reservation.id,
        oldStartDateTime: reservation.startDateTime,
        oldEndDateTime: reservation.endDateTime,
        newStartDateTime: start,
        newEndDateTime: end,
        reason: payload.reason,
      },
    });

    // 6. Update reservation
    return tx.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        startDateTime: start,
        endDateTime: end,
      },
    });
  });
};

export const editAddonReservation = async () => {};

export const editAreaReservation = async () => {};
