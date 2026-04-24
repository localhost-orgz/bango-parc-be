import { hash, compare } from "bcrypt";
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = process.env.JWT_SECRET || "very-secret";

export const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) throw new Error("Admin not found");

  const isPasswordValid = await compare(password, admin.password);
  if (!isPasswordValid) throw new Error("Invalid Email or Password");

  const payload = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });

  return { admin, token };
};

export const registerCustomer = async (data) => {
  const { name, email, phone, password } = data;

  const isExist = await prisma.customer.findUnique({ where: { email } });
  if (isExist) throw new Error("User already exist");

  const hashedPassword = await hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  return await prisma.customer.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      verificationToken: token,
      isVerified: false,
    },
  });
};

export const loginCustomer = async (email, password) => {
  const customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!customer) throw new Error("Customer not found");

  const isPasswordValid = await compare(password, customer.password);
  if (!isPasswordValid) throw new Error("Invalid Email or Password");

  if (!customer.isVerified) throw new Error("Email is not verified");

  const payload = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });

  return { customer, token };
};

export const verifyEmailToken = async (token) => {
  const customer = await prisma.customer.findUnique({
    where: { verificationToken: token },
  });

  if (!customer) throw new Error("Invalid or expired token");

  return await prisma.customer.update({
    where: { id: customer.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });
};
