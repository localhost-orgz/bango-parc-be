import cron from "node-cron";
import { prisma } from "../config/db.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running Auto-Cancel Check...");

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiredBookings = await prisma.reservation.updateMany({
    where: {
      status: "WAITING_LUNAS",
      venueDate: {
        lte: sevenDaysFromNow,
      },
      fullPaymentProof: null,
    },
    data: {
      status: "CANCELLED",
    },
  });

  console.log(`${expiredBookings.count} booking telah hangus.`);
});
