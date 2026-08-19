import { AuthIntentHandler } from "@/components/resources/auth-intent-handler"
import { SiteHeaderBar } from "@/components/shared/site-header-bar"
import { MobileAddResourceFab } from "@/components/shared/mobile-add-resource-fab"
import { getCurrentUser } from "@/lib/auth/user"

async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <>
      <AuthIntentHandler user={user} />
      <SiteHeaderBar user={user} />
      <MobileAddResourceFab user={user} />
    </>
  )
}

export { SiteHeader }
