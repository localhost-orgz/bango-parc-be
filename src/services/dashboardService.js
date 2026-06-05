import { prisma } from "../config/db.js";

/**
 * Mengambil 4 info dashboard:
 * 1. Jumlah reservasi bulan ini dan selisih dengan bulan lalu
 * 2. Jumlah pesanan menunggu verifikasi (status WAITING_DP)
 * 3. Revenue bulan ini
 * 4. Tingkat Okupansi bulan ini per hari ini
 */
export const getCardInfo = async (monthParam, yearParam) => {
  // Ambil tanggal hari ini
  const now = new Date();

  // Gunakan monthParam & yearParam jika ada, jika tidak pakai bulan & tahun sekarang
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  // monthParam: 1 (Jan) ... 12 (Des), Date JS: 0 ... 11
  const month =
    monthParam !== undefined && monthParam !== null
      ? parseInt(monthParam) - 1
      : now.getMonth();

  // Awal dan akhir bulan ini (pakai param/bulan aktif)
  const startOfThisMonth = new Date(year, month, 1, 0, 0, 0);
  const endOfThisMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Awal dan akhir bulan lalu (relatif terhadap param/jika ada)
  const monthLast = month - 1 >= 0 ? month - 1 : 11;
  const yearLast = month - 1 >= 0 ? year : year - 1;
  const startOfLastMonth = new Date(yearLast, monthLast, 1, 0, 0, 0);
  const endOfLastMonth = new Date(yearLast, monthLast + 1, 0, 23, 59, 59, 999);

  // 1. Reservasi bulan ini (by param)
  const countThisMonth = await prisma.reservation.count({
    where: {
      startDateTime: {
        gte: startOfThisMonth,
        lte: endOfThisMonth,
      },
    },
  });

  // Reservasi bulan lalu (by param)
  const countLastMonth = await prisma.reservation.count({
    where: {
      startDateTime: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  });

  // 2. Jumlah pesanan waiting verifikasi (WAITING_DP) — tidak di-filter bulan
  const waitingVerification = await prisma.reservation.count({
    where: {
      status: "WAITING_DP",
    },
  });

  // 3. Revenue bulan ini (jumlah totalPrice dari reservation bulan ini — param)
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

  // 4. Tingkat Okupansi bulan ini per hari ini (gunakan param, tapi day/trunc hanya sampai hari ini jika lihat bulan ini)
  // Okupansi = total jam area dipakai / total jam ketersediaan area (bulan ini per hari X)
  // Ambil semua area (jumlah area)
  const allArea = await prisma.area.count();

  // Jika param sama dgn bulan sekarang dan tahun sekarang, ambil hanya sampai hari ini; jika melihat bulan lampau, ambil total hari di bulan itu
  let referenceDate;
  let lastDay;
  if (month === now.getMonth() && year === now.getFullYear()) {
    // bulan berjalan, s/d hari ini
    referenceDate = now;
    lastDay = now.getDate();
  } else {
    // bulan lalu atau bulan manapun, ambil seluruh hari dalam bulan tsb
    const lastDateObj = new Date(year, month + 1, 0);
    referenceDate = lastDateObj;
    lastDay = lastDateObj.getDate();
  }

  // total jam tersedia = allArea * lastDay * 24
  const totalAvailableHours = allArea * lastDay * 24;

  // Ambil semua reservasi di bulan ini (pakai param - dari 1 s/d referenceDate)
  const areaReservations = await prisma.areaReservation.findMany({
    where: {
      reservation: {
        startDateTime: {
          gte: startOfThisMonth,
          lte: referenceDate, // sampai hari yang sesuai
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

  // Hitung total jam dipakai dalam bulan ini s/d hari sesuai reference
  let totalUsedHours = 0;
  for (const ar of areaReservations) {
    const res = ar.reservation;
    // Validasi res start-end hanya di bulan ini s/d hari target (referenceDate)
    let start = res.startDateTime;
    let end = res.endDateTime;
    if (start < startOfThisMonth) start = startOfThisMonth;
    if (end > referenceDate) end = referenceDate;
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
