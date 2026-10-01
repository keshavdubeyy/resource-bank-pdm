import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const ADMIN_COOKIE = "pdm_admin_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null
}

function sign(password: string): string {
  return createHmac("sha256", password)
    .update("pdm-admin-session")
    .digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function verifyAdminPassword(input: string): boolean {
  const password = getAdminPassword()
  if (!password) return false
  return safeEqual(sign(input), sign(password))
}

export async function createAdminSession() {
  const password = getAdminPassword()
  if (!password) return
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, sign(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete({ name: ADMIN_COOKIE, path: "/admin" })
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = getAdminPassword()
  if (!password) return false
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return !!token && safeEqual(token, sign(password))
}

export function isAdminPasswordConfigured(): boolean {
  return getAdminPassword() !== null
}
