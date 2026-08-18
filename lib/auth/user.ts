import { cookies } from "next/headers"
import type { AuthUser } from "@supabase/supabase-js"

import { createClient } from "@/utils/supabase/server"

export interface AppUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
}

export function toAppUser(user: AuthUser): AppUser {
  const meta = user.user_metadata ?? {}
  const name =
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    user.email ||
    "Anonymous"
  const avatarUrl =
    (meta.avatar_url as string | undefined) ||
    (meta.picture as string | undefined) ||
    null

  return { id: user.id, name, email: user.email ?? null, avatarUrl }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? toAppUser(user) : null
}
