"use client"

import Link from "next/link"

import { AddResourceTrigger } from "@/components/resources/add-resource-trigger"
import { signOutAction } from "@/lib/auth/actions"
import type { AppUser } from "@/lib/auth/user"

const linkClassName = "text-sm font-medium text-foreground"

function MobileAuthNav({ user }: { user: AppUser | null }) {
  return (
    <>
      <AddResourceTrigger user={user}>
        {(onClick, isPending) => (
          <button
            type="button"
            className={`text-left ${linkClassName}`}
            onClick={onClick}
            disabled={isPending}
          >
            Add Resource
          </button>
        )}
      </AddResourceTrigger>

      {user && (
        <>
          <Link href="/my-resources" className={linkClassName}>
            My Resources
          </Link>
          <button
            type="button"
            className={`text-left ${linkClassName}`}
            onClick={() => signOutAction()}
          >
            Sign out
          </button>
        </>
      )}
    </>
  )
}

export { MobileAuthNav }
