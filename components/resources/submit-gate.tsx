"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { GoogleIcon, LockIcon } from "@hugeicons/core-free-icons"

import { signInWithGoogle } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

function SubmitGate({
  next,
  title,
  description,
}: {
  next: string
  title: string
  description: string
}) {
  const [isPending, setIsPending] = React.useState(false)

  return (
    <Card>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={LockIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              disabled={isPending}
              onClick={async () => {
                setIsPending(true)
                await signInWithGoogle(next)
              }}
            >
              {isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <HugeiconsIcon icon={GoogleIcon} strokeWidth={2} data-icon="inline-start" />
              )}
              Continue with Google
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  )
}

export { SubmitGate }
