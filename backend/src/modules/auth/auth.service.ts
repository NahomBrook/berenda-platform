import { add } from "date-fns"
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  saveRefreshToken,
} from "./auth.repository"

import {
  hashPassword,
  comparePassword,
  hashToken,
} from "../../utils/hash"

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt"

const ACCESS_EXPIRES_MINUTES = 15
const REFRESH_EXPIRES_DAYS = 7

interface RegisterInput {
  email: string
  fullName: string
  password: string
  username: string
}

export const registerUser = async (data: RegisterInput) => {
  const { email, fullName, password, username } = data

  const existingEmail = await findUserByEmail(email)
  if (existingEmail) {
    throw new Error("Email already registered")
  }

  const existingUsername = await findUserByUsername(username)
  if (existingUsername) {
    throw new Error("Username already taken")
  }

  const passwordHash = await hashPassword(password)

  const user = await createUser({
    email,
    fullName,
    passwordHash,
    username,
    provider: "local",
  })

  return issueTokens(user.id)
}

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email)

  if (!user || !user.passwordHash) {
    throw new Error("Invalid credentials")
  }

  const validPassword = await comparePassword(password, user.passwordHash)
  if (!validPassword) {
    throw new Error("Invalid credentials")
  }

  return issueTokens(user.id)
}

const issueTokens = async (userId: string) => {
  const accessToken = generateAccessToken({ id: userId })
  const refreshToken = generateRefreshToken({ id: userId })

  const hashedRefreshToken = await hashToken(refreshToken)

  const expiresAt = add(new Date(), { days: REFRESH_EXPIRES_DAYS })

  await saveRefreshToken(userId, hashedRefreshToken, expiresAt)

  return {
    accessToken,
    refreshToken,
  }
}
