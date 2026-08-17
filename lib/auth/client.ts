import { createClient } from "@/utils/supabase/client"

export async function signInWithGoogle(next: string) {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })
}
