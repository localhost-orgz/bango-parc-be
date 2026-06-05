import { prisma } from "../config/db.js";

/**
 * Mengambil 4 info dashboard:
 * 1. Jumlah reservasi bulan ini dan selisih dengan bulan lalu
 * 2. Jumlah pesanan menunggu verifikasi (status WAITING_DP)
 * 3. Revenue bulan ini
 * 4. Tingkat Okupansi bulan ini per hari ini
 */
export const getCardInfo = async (yearParam) => {
  // Ambil tanggal hari ini
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Awal dan akhir bulan ini
  const startOfThisMonth = new Date(year, month, 1, 0, 0, 0);
  const endOfThisMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Awal dan akhir bulan lalu
  const monthLast = month - 1 >= 0 ? month - 1 : 11;
  const yearLast = month - 1 >= 0 ? year : year - 1;
  const startOfLastMonth = new Date(yearLast, monthLast, 1, 0, 0, 0);
  const endOfLastMonth = new Date(yearLast, monthLast + 1, 0, 23, 59, 59, 999);

  // 1. Reservasi bulan ini
  const countThisMonth = await prisma.reservation.count({
    where: {
      startDateTime: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });

  // Reservasi bulan lalu
  const countLastMonth = await prisma.reservation.count({
    where: {
      startDateTime: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  });

  // 2. Jumlah pesanan waiting verifikasi (WAITING_DP)
  const waitingVerification = await prisma.reservation.count({
    where: {
      status: "WAITING_DP",
    },
  });

  // 3. Revenue bulan ini (jumlah totalPrice dari reservation bulan ini)
  const revenueThisMonthRes = await prisma.reservation.aggregate({
    _sum: { totalPrice: true },
    where: {
      startDateTime: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });
  const revenueThisMonth = Number(revenueThisMonthRes._sum.totalPrice) || 0;

  // 4. Tingkat Okupansi bulan ini per hari ini
  // Okupansi = total jam area dipakai / total jam ketersediaan area (bulan ini per hari ini)
  // Asumsi: Setiap hari penuh tersedia untuk tiap area, tiap reservasi (areaReservations) punya startDateTime & endDateTime pada reservasinya
  // Pertama, ambil semua area (jumlah area)
  const allArea = await prisma.area.count();

  // Hitung hari dalam bulan ini s/d hari ini
  const lastDay = now.getDate(); // tanggal ke-N hari ini
  // total jam tersedia = allArea * lastDay * 24
  const totalAvailableHours = allArea * lastDay * 24;

  // Ambil semua reservasi bulan ini (beserta areaReservations) yg sudah/confimed/menunggu_dp
  const areaReservations = await prisma.areaReservation.findMany({
    where: {
      reservation: {
        startDateTime: {
          gte: startOfThisMonth,
          lte: now, // only sampai hari ini!
        },
        status: {
          in: ["WAITING_DP", "CONFIRMED"],
        },
      },
    },
    include: {
      reservation: true,
    },
  });

  // Hitung total jam dipakai dalam bulan ini s/d hari ini
  let totalUsedHours = 0;
  for (const ar of areaReservations) {
    const res = ar.reservation;
    // Validasi res start-end hanya di bulan ini s/d hari ini.
    // Ambil waktu antara res.startDateTime & res.endDateTime,
    // tapi jika di luar range bulan ini/hari ini, di-trim
    let start = res.startDateTime;
    let end = res.endDateTime;
    if (start < startOfThisMonth) start = startOfThisMonth;
    if (end > now) end = now;
    let dur = (end - start) / (1000 * 60 * 60); // jam
    if (dur < 0) dur = 0;
    totalUsedHours += dur;
  }
  // Hindari bagi 0
  const occupancy =
    totalAvailableHours > 0
      ? Math.round((totalUsedHours / totalAvailableHours) * 100)
      : 0;

  // Hitung selisih reservasi (naik/turun)
  const diff = countThisMonth - countLastMonth;

  // 5. Reservasi perbulan (Bar Chart)
  // Ambil jumlah reservasi per bulan untuk 12 bulan terakhir
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Pakai $queryRaw agar bisa group by formatted YYYY-MM.
  let reservationsPerMonthRaw;
  if (yearParam) {
    const startOfYear = new Date(yearParam, 0, 1);
    const endOfYear = new Date(yearParam, 11, 31, 23, 59, 59, 999);
    reservationsPerMonthRaw = await prisma.$queryRaw`
      SELECT to_char("startDateTime", 'YYYY-MM') AS month, COUNT(*) AS count
      FROM "reservations"
      WHERE "startDateTime" >= ${startOfYear} AND "startDateTime" <= ${endOfYear}
      GROUP BY month
      ORDER BY month ASC
    `;
  } else {
    reservationsPerMonthRaw = await prisma.$queryRaw`
      SELECT to_char("startDateTime", 'YYYY-MM') AS month, COUNT(*) AS count
      FROM "reservations"
      WHERE "startDateTime" >= ${twelveMonthsAgo} AND "startDateTime" <= ${now}
      GROUP BY month
      ORDER BY month ASC
    `;
  }

  // Format data menjadi { month: 'YYYY-MM', count: N }
  const reservationsPerMonth = reservationsPerMonthRaw.map((item) => ({
    month: item.month || "", // kolom alias 'month'
    count: Number(item.count),
  }));

  // 6. Reservation Type compare presentation (persentase tiap jenis reservation bulan ini)
  const reservationTypeCompareRaw = await prisma.$queryRaw`
    SELECT rt."name" AS type, COUNT(*)::int AS count
    FROM "reservations" r
    JOIN "reservation_types" rt ON r."reservationTypeId" = rt."id"
    WHERE DATE_TRUNC('month', r."startDateTime"::timestamp) = DATE_TRUNC('month', ${now}::timestamp)
    GROUP BY rt."name"
    ORDER BY rt."name" ASC
  `;
  const typeTotal = reservationTypeCompareRaw.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const reservationTypeCompare = reservationTypeCompareRaw.map((item) => ({
    type: item.type,
    count: item.count,
    percent: typeTotal > 0 ? Math.round((item.count / typeTotal) * 100) : 0,
  }));

  // 7. Jumlah berapa kali pesan tiap area (bulan ini)
  const areaReservationCountRaw = await prisma.$queryRaw`
    SELECT a."name" as area, COUNT(*)::int AS count
    FROM "area_reservations" ar
    JOIN "areas" a ON ar."areaId" = a."id"
    JOIN "reservations" r ON ar."reservationId" = r."id"
    WHERE DATE_TRUNC('month', r."startDateTime"::timestamp) = DATE_TRUNC('month', ${now}::timestamp)
    GROUP BY a."name"
    ORDER BY count DESC
  `;
  const areaReservationCount = areaReservationCountRaw.map((item) => ({
    area: item.area,
    count: item.count,
  }));

  return {
    reservationsThisMonth: countThisMonth,
    diffFromLastMonth: diff,
    waitingVerification: waitingVerification,
    revenueThisMonth: revenueThisMonth,
    occupancyRate: occupancy, // in percent
    reservationsPerMonth,
    reservationTypeCompare,
    areaReservationCount,
  };
};
