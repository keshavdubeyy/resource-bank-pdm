import { AuthIntentHandler } from "@/components/resources/auth-intent-handler"
import { SiteHeaderBar } from "@/components/shared/site-header-bar"
import { MobileAddResourceFab } from "@/components/shared/mobile-add-resource-fab"
import { getCurrentUser } from "@/lib/auth/user"
import { getSupabaseUsage } from "@/lib/usage/supabase-usage"

async function SiteHeader() {
  const user = await getCurrentUser()
  const usage = user ? await getSupabaseUsage() : null

  return (
    <>
      <AuthIntentHandler user={user} />
      <SiteHeaderBar user={user} usage={usage} />
      <MobileAddResourceFab user={user} />
    </>
  )
}

export { SiteHeader }
