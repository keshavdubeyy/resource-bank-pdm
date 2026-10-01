"use client"

import { useActionState } from "react"

import { adminLoginAction, type AdminLoginState } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialState: AdminLoginState = { error: null }

function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    adminLoginAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        type="password"
        name="password"
        placeholder="Admin password"
        autoComplete="current-password"
        autoFocus
        required
        aria-invalid={state.error ? true : undefined}
      />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Checking..." : "Unlock admin"}
      </Button>
    </form>
  )
}

export { AdminLoginForm }
