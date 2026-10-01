"use server"

import { redirect } from "next/navigation"

import {
  clearAdminSession,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin/auth"

export interface AdminLoginState {
  error: string | null
}

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = formData.get("password")

  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return { error: "Incorrect password." }
  }

  await createAdminSession()
  redirect("/admin")
}

export async function adminLogoutAction() {
  await clearAdminSession()
  redirect("/admin")
}
