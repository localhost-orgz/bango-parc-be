import "dotenv/config";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";
import { Decimal } from "@prisma/client/runtime/client";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

async function main() {
  // === User Seed
  // await prisma.user.create({
  //   data: {
  //     fullName: "Admin Bango Parc",
  //     email: "bangoparc@gmail.com",
  //     password: await bcrypt.hash("BangoParc0", 10),
  //     whatsappNumber: "081234567890",
  //     role: "ADMIN",
  //     isVerified: true,
  //   },
  // });

  const dummyCustomers = [];
  for (let i = 0; i < 15; i++) {
    const data = {
      fullName: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      password: await bcrypt.hash(`Password${i + 1}`, 10),
      whatsappNumber: `081200000${(i + 1).toString().padStart(2, "0")}`,
      role: "CUSTOMER",
      isVerified: true,
    };
    dummyCustomers.push(data);
  }

  const createdCustomers = [];
  for (const data of dummyCustomers) {
    const customer = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        password: data.password,
        whatsappNumber: data.whatsappNumber,
        role: data.role,
        isVerified: data.isVerified,
      },
      create: data,
    });
    createdCustomers.push(customer);
  }

  // === Rezervasion Seed
  const reservations = [];

  // Generate random values for the dummy data
  for (let i = 0; i < 15; i++) {
    // Random date helpers
    const start = new Date();
    start.setDate(start.getDate() + Math.floor(Math.random() * 60) - 30);
    start.setHours(Math.floor(Math.random() * 8) + 8); // 8 AM - 15 PM
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + Math.floor(Math.random() * 3) + 1);

    reservations.push({
      bookingCode: `BKP${(10000 + i).toString()}`,
      customerId: createdCustomers[i].id,
      reservationTypeId: i % 2 === 0 ? 1 : 3,

      startDateTime: start,
      endDateTime: end,
      totalAreaPrice: new Decimal(100000 + i * 25000),
      totalAddonPrice: new Decimal(5000 * (i % 5)),
      totalPrice: new Decimal(105000 + i * 25000),
      paidAmount: new Decimal(50000 + i * 10000),
      remainingBalance: new Decimal(55000 + i * 15000),
      status: [
        "WAITING_DP",
        "CONFIRMED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ][i % 6],
      paymentStatus: ["UNPAID", "PARTIAL", "PAID", "OVERDUE"][i % 4],

      cancellationReason: i % 4 === 3 ? `Alasan batal ${i}` : null,
      cancelledAt: i % 4 === 3 ? new Date() : null,
    });
  }

  for (const data of reservations) {
    await prisma.reservation.create({ data });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
