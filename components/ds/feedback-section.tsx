"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { toast, Toaster } from "@/components/ui/toast"
import { DsExample } from "@/components/ds/ds-section"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Folder01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

function FeedbackSection() {
  return (
    <>
      <DsExample
        title="Alert"
        description="An inline banner for important information."
        contentClassName="flex-col items-stretch"
      >
        <Alert>
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>
            New resources are added to this bank every week.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>
            Check the resource URL and try again.
          </AlertDescription>
        </Alert>
      </DsExample>

      <DsExample title="Progress" description="Displays completion of a task.">
        <Progress value={64} className="w-full max-w-sm flex-col">
          <div className="flex w-full justify-between">
            <ProgressLabel>Profile completeness</ProgressLabel>
            <ProgressValue />
          </div>
        </Progress>
      </DsExample>

      <DsExample
        title="Skeleton"
        description="A placeholder shown while content is loading."
        contentClassName="flex-col items-stretch"
      >
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </DsExample>

      <DsExample title="Spinner" description="Indicates an in-progress action.">
        <Spinner />
        <Spinner className="size-6" />
        <Button disabled>
          <Spinner className="size-4" />
          Loading
        </Button>
      </DsExample>

      <DsExample
        title="Empty"
        description="A placeholder for empty states and zero-data screens."
      >
        <Empty className="w-full max-w-md border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No resources yet</EmptyTitle>
            <EmptyDescription>
              Submit the first resource for this track.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="lg">Submit a resource</Button>
          </EmptyContent>
        </Empty>
      </DsExample>

      <DsExample
        title="Toast"
        description="Brief, non-blocking notifications mounted locally on this page."
      >
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Resource saved",
              description: "Added to your personal bank.",
              type: "success",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Heads up",
              description: "This resource was recently updated.",
              type: "info",
            })
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Slow connection",
              description: "This is taking longer than usual.",
              type: "warning",
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Submission failed",
              description: "Check the file and try again.",
              type: "error",
            })
          }
        >
          Error
        </Button>
        <Toaster />
      </DsExample>
    </>
  )
}

export { FeedbackSection }
