import prisma from "../../config/prisma";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

// CREATE USER
export const createUser = async (data: {
  email: string;
  fullName: string;
  password: string;
  username?: string;
  provider?: "local" | "google";
  providerId?: string;
}): Promise<User> => {
  const passwordHash = data.provider === "local" ? await bcrypt.hash(data.password, 12) : "";

  return prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      username: data.username,
      passwordHash,
      provider: data.provider || "local",
      providerId: data.providerId,
    },
  });
};

// VALIDATE USER
export const validateUser = async (email: string, password: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // Only local auth
  if (user.provider !== "local") return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? user : null;
};
