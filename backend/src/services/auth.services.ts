import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma"; 
import { Role } from "@prisma/client";

// Matching your .env variable exactly
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "superlongrandomaccesssecret";
const JWT_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";

export const registerUser = async (
  email: string,
  password: string,
  role: Role = Role.USER,
  fullName?: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Note: Using 'passwordHash' to match your Prisma Schema
  const user = await prisma.user.create({
    data: { 
      email, 
      passwordHash: hashedPassword, 
      role, 
      fullName,
      username: email.split('@')[0] + Math.floor(Math.random() * 1000) // Quick fix for unique username
    },
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  // Ensure this matches the field name in your Prisma Schema
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid credentials");

  // Signing with 'id' so the controller can find it easily
  const token = jwt.sign(
    { id: user.id, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES }
  );

  return { user, token };
};