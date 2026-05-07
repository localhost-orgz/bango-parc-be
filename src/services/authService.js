import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = process.env.JWT_SECRET || "very-secret";

export const signin = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Email is not verified");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid Email or Password");

  const payload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    whatsappNumber: user.whatsappNumber,
    role: user.role,
    googleId: user.googleId,
    googleAvatar: user.googleAvatar,
    googleToken: user.googleToken,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });

  return { user, token };
};

export const signup = async (data) => {
  const { fullName, email, whatsappNumber, password } = data;

  const isExist = await prisma.user.findUnique({ where: { email } });
  if (isExist) throw new Error("User already exist");

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  return await prisma.user.create({
    data: {
      fullName,
      email,
      whatsappNumber,
      password: hashedPassword,
      verificationToken: token,
      isVerified: false,
    },
  });
};

export const verifyEmailToken = async (token) => {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) throw new Error("Invalid or expired token");

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
    },
  });
};
