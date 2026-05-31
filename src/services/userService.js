import { prisma } from "../config/db.js";

export const getUsers = async (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return await prisma.user.findMany({
    skip,
    take,
    where,
    orderBy,
    select: {
      id: true,
      fullName: true,
      email: true,
      whatsappNumber: true,
      role: true,
    },
  });
};
