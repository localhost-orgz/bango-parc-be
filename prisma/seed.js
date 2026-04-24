import "dotenv/config";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

async function main() {
  await prisma.admin.upsert({
    where: { email: "bangoparc@gmail.com" },
    update: {},
    create: {
      email: "bangoparc@gmail.com",
      name: "Bango Parc",
      password: await bcrypt.hash("bangoparc_", 10),
    },
  });

  await prisma.customer.upsert({
    where: { email: "alex@gmail.com" },
    update: {},
    create: {
      email: "alex@gmail.com",
      name: "Alex",
      phone: "08123456789",
    },
  });
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
