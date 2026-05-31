import { prisma } from "../config/db.js";
import { Prisma, ReservationStatus } from "../generated/index.js";

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
    const start = new Date(payload.startDateTime);
    const end = new Date(payload.endDateTime);

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

      // calculate area subtotal
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

      totalAreaPrice += Number(areaSubtotal);
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

    // 4. Generate payment schedule
    const isWedding = reservationType.name.toLowerCase().includes("wedding");

    const schedules = [];

    if (!isWedding) {
      let dp;
      if (totalPrice > 2000000) {
        dp = 1000000;
      } else {
        dp = totalPrice * 0.5;
      }

      schedules.push({
        reservationId: reservation.id,
        installmentNumber: 1,
        amount: dp,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      schedules.push({
        reservationId: reservation.id,
        installmentNumber: 2,
        amount: totalPrice - dp,
        dueDate: new Date(start.getTime() - 3 * 24 * 60 * 60 * 1000),
      });
    } else {
      const totalInstallment = payload.installment ?? 3;
      if (totalInstallment > 3) {
        throw new Error("Maximum installment is 3");
      }

      const bookingDate = new Date();

      // Pelunasan maksimal H-14
      const finalDueDate = new Date(
        reservation.startDateTime.getTime() - 14 * 24 * 60 * 60 * 1000,
      );

      // Event terlalu dekat
      if (bookingDate >= finalDueDate) {
        throw new Error(
          "Wedding reservation must be booked at least 14 days before event",
        );
      }

      // Hitung DP sesuai aturan: >2jt = 1jt, <2jt = 50%
      let dp;
      if (totalPrice > 2000000) {
        dp = 1000000;
      } else {
        dp = totalPrice * 0.5;
      }

      // Tersisa untuk pelunasan setelah DP
      const sisa = totalPrice - dp;

      // Termin 1 → DP (1x24 jam)
      schedules.push({
        reservationId: reservation.id,
        installmentNumber: 1,
        amount: dp,
        dueDate: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      });

      // Jika hanya 1 termin (harusnya ga mungkin tapi jaga-jaga)
      if (totalInstallment === 1) {
        // sudah masuk semua di dp
      } else if (totalInstallment === 2) {
        // Termin 2 → Sisa (pelunasan H-14)
        schedules.push({
          reservationId: reservation.id,
          installmentNumber: 2,
          amount: sisa,
          dueDate: finalDueDate,
        });
      } else {
        // totalInstallment === 3, cicilan tengah & akhir
        // Cicilan tengah: dibagi rata dari sisa, bagi 2 termin
        const tengah = Math.floor(sisa / 2);
        const akhir = sisa - tengah;

        // Termin 2 → Cicilan kedua (tengah periode dari booking sampai H-14)
        const interval = (finalDueDate.getTime() - bookingDate.getTime()) / 2;
        schedules.push({
          reservationId: reservation.id,
          installmentNumber: 2,
          amount: tengah,
          dueDate: new Date(bookingDate.getTime() + interval),
        });
        // Termin 3 (pelunasan H-14)
        schedules.push({
          reservationId: reservation.id,
          installmentNumber: 3,
          amount: akhir,
          dueDate: finalDueDate,
        });
      }
    }

    await tx.paymentSchedule.createMany({
      data: schedules,
    });

    return await tx.reservation.findUnique({
      where: {
        id: reservation.id,
      },
      include: {
        paymentSchedules: true,
        areaReservations: true,
        addonReservations: true,
      },
    });
  });
};

export const getAllReservation = async (startDate, endDate, userId = null) => {
  try {
    const where = {};
    if (startDate && endDate) {
      where.startDateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startDateTime = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.startDateTime = {
        lte: new Date(endDate),
      };
    }
    if (userId) {
      where.customerId = userId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
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
        paymentSchedules: true,
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

export const cancelReservation = async (reservationId, reason) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { paymentSchedules: true },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // 2. Validate status
    const invalidStatuses = [
      ReservationStatus.COMPLETED,
      ReservationStatus.ONGOING,
      ReservationStatus.CANCELLED,
      ReservationStatus.EXPIRED,
    ];

    if (invalidStatuses.includes(reservation.status)) {
      throw new Error(
        `Cannot cancel reservation with status ${reservation.status}`,
      );
    }

    // 3. Update reservation & Payment schedule
    const updatedReservation = await tx.reservation.update({
      where: {
        id: reservation.id,
      },

      data: {
        status: ReservationStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    await tx.paymentSchedule.updateMany({
      where: {
        reservationId: reservation.id,
        status: {
          in: ["PENDING", "PARTIAL"],
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    return updatedReservation;
  });
};

export const editAddonReservation = async () => {};

export const editAreaReservation = async () => {};
