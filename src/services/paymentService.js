import { prisma } from "../config/db.js";

export const generatePaymentSchedule = async (
  reservationId,
  totalInstallment = 3,
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find Reservation
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { reservationType: true },
    });

    if (!reservation) {
      throw new Error("Reservation not found");
    }

    // 2. Generate schedules
    const total = Number(reservation.totalPrice);

    const schedules = [];

    const isWedding =
      reservation.reservationType.name.toLowerCase() === "wedding";

    if (!isWedding) {
      const dp = total * 0.5;

      schedules.push({
        installmentNumber: 1,
        amount: dp,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      schedules.push({
        installmentNumber: 2,
        amount: total - dp,
        dueDate: new Date(
          reservation.startDateTime.getTime() - 3 * 24 * 60 * 60 * 1000,
        ),
      });
    } else {
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

      const amount = total / totalInstallment;

      // Termin 1 → DP (1x24 jam)
      schedules.push({
        installmentNumber: 1,
        amount,
        dueDate: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      });

      // Jika ada termin tengah
      if (totalInstallment > 2) {
        const availableDuration =
          finalDueDate.getTime() - bookingDate.getTime();

        const interval = availableDuration / (totalInstallment - 1);

        for (let i = 2; i < totalInstallment; i++) {
          schedules.push({
            installmentNumber: i,
            amount,
            dueDate: new Date(bookingDate.getTime() + interval * (i - 1)),
          });
        }
      }

      // Termin terakhir → H-14
      if (totalInstallment > 1) {
        schedules.push({
          installmentNumber: totalInstallment,
          amount,
          dueDate: finalDueDate,
        });
      }
    }

    // 3. Create payment schedule
    await tx.paymentSchedule.createMany({
      data: schedules.map((schedule) => ({
        reservationId: reservation.id,
        ...schedule,
      })),
    });

    return schedules;
  });
};

export const getAllPaymentProof = async () => {
  return prisma.paymentProof.findMany({
    include: {
      paymentSchedule: {
        include: {
          reservation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const uploadPaymentProof = async (
  paymentScheduleId,
  file,
  amount,
  senderName,
) => {
  return prisma.paymentProof.create({
    data: {
      paymentScheduleId,
      amount,
      proofImage: file,
      senderName,
    },
  });
};

export const approvePayment = async (paymentProofId, adminId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find proof
    const proof = await tx.paymentProof.findUnique({
      where: {
        id: paymentProofId,
      },

      include: {
        paymentSchedule: {
          include: {
            reservation: true,
          },
        },
      },
    });

    if (!proof) {
      throw new Error("Proof not found");
    }

    // Validate status
    if (proof.approvalStatus !== "PENDING") {
      throw new Error("Payment proof status must be PENDING to approve.");
    }

    // 2. Update status
    await tx.paymentProof.update({
      where: {
        id: proof.id,
      },

      data: {
        approvalStatus: "APPROVED",
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // 3. Update remaining balance & paymentStatus
    const reservation = proof.paymentSchedule.reservation;

    const newPaid = Number(reservation.paidAmount) + Number(proof.amount);

    const remaining = Number(reservation.totalPrice) - newPaid;

    await tx.reservation.update({
      where: {
        id: reservation.id,
      },

      data: {
        paidAmount: newPaid,
        remainingBalance: remaining,
        status: "CONFIRMED",
        paymentStatus: remaining <= 0 ? "PAID" : "PARTIAL",
      },
    });

    await tx.paymentSchedule.update({
      where: {
        id: proof.paymentScheduleId,
      },

      data: {
        status: remaining <= 0 ? "PAID" : "PARTIAL",
      },
    });

    return true;
  });
};

export const rejectPayment = async (proofId, adminId, rejectionReason) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find payment proof
    const proof = await tx.paymentProof.findUnique({
      where: { id: proofId },
      include: {
        paymentSchedule: {
          include: {
            reservation: true,
          },
        },
      },
    });

    if (!proof) {
      throw new Error("Payment proof not found");
    }

    if (proof.approvalStatus !== "PENDING") {
      throw new Error("Payment proof status must be PENDING to reject.");
    }

    // 2. Update status to REJECTED
    await tx.paymentProof.update({
      where: { id: proof.id },
      data: {
        approvalStatus: "REJECTED",
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: rejectionReason ? rejectionReason : null,
      },
    });

    return true;
  });
};
