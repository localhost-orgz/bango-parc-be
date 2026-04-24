import express from "express";
import { prisma } from "./src/config/db.js";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/admin", async (req, res) => {
  const admins = await prisma.customer.findMany();
  res.json(admins);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;
