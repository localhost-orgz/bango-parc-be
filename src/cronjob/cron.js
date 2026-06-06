import cron from "node-cron";
import dayjs from "dayjs";
import "dayjs/locale/id.js";
import { prisma } from "../config/db.js";
import { sendWhatsappNotification } from "../utils/sendWhatsappNotification.js";

dayjs.locale("id");

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const formatCurrency = (amount) =>
  Number(amount).toLocaleString("id-ID");

const formatDateTime = (date) =>
  dayjs(date).format("DD MMMM YYYY HH:mm");

export async function checkAndSendReminders() {
  const now = new Date();

  // Trigger 1: Pengingat DP (6 jam sebelum jatuh tempo)
  const dpWindowStart = new Date(now.getTime() + 5 * HOUR_MS);
  const dpWindowEnd = new Date(now.getTime() + 7 * HOUR_MS);

  const pendingDPs = await prisma.paymentSchedule.findMany({
    where: {
      installmentNumber: 1,
      status: "PENDING",
      reminderSentAt: null,
      dueDate: {
        gte: dpWindowStart,
        lte: dpWindowEnd,
      },
      reservation: {
        status: "WAITING_DP",
      },
    },
    include: {
      reservation: {
        include: {
          customer: {
            select: {
              whatsappNumber: true,
            },
          },
        },
      },
    },
  });

  for (const dp of pendingDPs) {
    const dueDate = formatDateTime(dp.dueDate);
    const msg =
      `Halo, ini adalah pengingat untuk kode booking *${dp.reservation.bookingCode}*. ` +
      `Batas akhir pembayaran DP Anda adalah 6 jam lagi (${dueDate}). ` +
      `Segera lakukan pembayaran sebesar Rp ${formatCurrency(dp.amount)} ` +
      `agar reservasi Anda tidak kedaluwarsa. Terima kasih!`;

    const sent = await sendWhatsappNotification(
      dp.reservation.customer.whatsappNumber,
      msg,
    );

    if (sent) {
      await prisma.paymentSchedule.update({
        where: { id: dp.id },
        data: { reminderSentAt: new Date() },
      });
    }
  }

  // Trigger 2: Pengingat Pelunasan (7 hari sebelum jatuh tempo)
  const settlementWindowStart = new Date(now.getTime() + 6.5 * DAY_MS);
  const settlementWindowEnd = new Date(now.getTime() + 7.5 * DAY_MS);

  const pendingSettlements = await prisma.paymentSchedule.findMany({
    where: {
      installmentNumber: { gt: 1 },
      status: { in: ["PENDING", "PARTIAL"] },
      reminderSentAt: null,
      dueDate: {
        gte: settlementWindowStart,
        lte: settlementWindowEnd,
      },
      reservation: {
        status: { in: ["CONFIRMED", "WAITING_DP"] },
        paymentStatus: { in: ["PARTIAL", "UNPAID"] },
      },
    },
    include: {
      reservation: {
        include: {
          customer: {
            select: {
              whatsappNumber: true,
            },
          },
        },
      },
    },
  });

  for (const schedule of pendingSettlements) {
    const dueDate = formatDateTime(schedule.dueDate);
    const msg =
      `Halo, mengingatkan kembali untuk reservasi *${schedule.reservation.bookingCode}*. ` +
      `Batas akhir pelunasan pembayaran Anda adalah 7 hari lagi, yaitu pada tanggal ${dueDate}. ` +
      `Sisa tagihan yang harus dibayar adalah Rp ${formatCurrency(schedule.amount)}. ` +
      `Silakan lakukan pembayaran sebelum tanggal tersebut. Terima kasih!`;

    const sent = await sendWhatsappNotification(
      schedule.reservation.customer.whatsappNumber,
      msg,
    );

    if (sent) {
      await prisma.paymentSchedule.update({
        where: { id: schedule.id },
        data: { reminderSentAt: new Date() },
      });
    }
  }

  console.log(
    `Reminder selesai: ${pendingDPs.length} DP, ${pendingSettlements.length} pelunasan diproses.`,
  );
}

export function startCronJobs() {
  cron.schedule("0 * * * *", async () => {
    console.log("Menjalankan pengecekan reminder WhatsApp...");
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error("Gagal menjalankan reminder cron:", error);
    }
  });

  console.log("Cron job reminder WhatsApp aktif (setiap jam).");
}
