import { prisma } from "../config/db.js";

export const getUsers = async (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return await prisma.user.findMany({
    skip,
    take,
    where,
    orderBy,
    select: {
      id: true,
      fullName: true,
      email: true,
      whatsappNumber: true,
      role: true,
    },
  });
};

export const getUserDetail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      customerReservations: {
        orderBy: {
          createdAt: "desc",
        },

        include: {
          reservationType: true,
          areaReservations: {
            include: {
              area: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const reservations = user.customerReservations;

  const totalSpent = reservations.reduce(
    (sum, reservation) => sum + Number(reservation.paidAmount),
    0,
  );

  const planned = reservations.filter(
    (reservation) =>
      reservation.status === "CONFIRMED" || reservation.status === "WAITING_DP",
  ).length;

  const completed = reservations.filter(
    (reservation) => reservation.status === "COMPLETED",
  ).length;

  const cancelled = reservations.filter(
    (reservation) => reservation.status === "CANCELLED",
  ).length;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    whatsappNumber: user.whatsappNumber,
    role: user.role,
    joinedAt: user.createdAt,
    totalSpent,
    statistics: {
      planned,
      completed,
      cancelled,
    },
    reservationHistory: reservations.map((reservation) => ({
      id: reservation.id,
      bookingCode: reservation.bookingCode,
      reservationType: reservation.reservationType.name,
      status: reservation.status,
      eventDate: reservation.startDateTime,
      totalPrice: reservation.totalPrice,
      paidAmount: reservation.paidAmount,
      areas: reservation.areaReservations.map(
        (areaReservation) => areaReservation.area.name,
      ),
    })),
  };
};
