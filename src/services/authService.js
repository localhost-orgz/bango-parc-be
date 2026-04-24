import { compare } from "bcrypt";
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";

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
