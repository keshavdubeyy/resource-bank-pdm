"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, CheckmarkCircle02Icon, Folder01Icon } from "@hugeicons/core-free-icons"

import {
  AdditionalAttachmentsField,
  type AdditionalAttachmentRow,
} from "@/components/resources/additional-attachments-field"
import {
  AttachmentField,
  EMPTY_ATTACHMENT,
  validateAttachment,
  type AttachmentValue,
} from "@/components/resources/attachment-field"
import { FolderPicker } from "@/components/resources/folder-picker"
import { StoragePoolSummary } from "@/components/shared/storage-pool-summary"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel, FieldTitle } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import { createResourceAction } from "@/lib/resources/actions"
import { getAllFolders } from "@/lib/resources/folder-actions"
import { getFolderPathLabel } from "@/lib/resources/folder-tree"
import { deleteUploadedResourceFiles } from "@/lib/resources/storage"
import type { FolderRow, ResourceLink } from "@/lib/resources/types"
import { normalizeUrl } from "@/lib/resources/utils"
import {
  createUsageMetric,
  type SupabaseUsage,
} from "@/lib/usage/usage-metrics"
import { notifySupabaseUsageChanged } from "@/lib/usage/client-events"

/** One screen, not a wizard: folder location, attachment, and an optional note
 * all sit together. Always controlled by the caller — this lets it be opened
 * from anywhere (header, a folder view, a folder row's menu). */
function AddResourceSheet({
  open,
  onOpenChange,
  user,
  initialFolderId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; name: string }
  /** undefined = ask "where should this go" (global add); a value (incl. null for root) pre-fills the folder. */
  initialFolderId?: string | null
}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const isContextual = initialFolderId !== undefined

  const [folders, setFolders] = React.useState<FolderRow[]>([])
  const [foldersLoaded, setFoldersLoaded] = React.useState(false)
  const [folderPickerOpen, setFolderPickerOpen] = React.useState(false)

  const [folderId, setFolderId] = React.useState<string | null>(initialFolderId ?? null)
  const [attachment, setAttachment] = React.useState<AttachmentValue>(EMPTY_ATTACHMENT)
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null)
  const [whyUseful, setWhyUseful] = React.useState("")
  const [additionalAttachments, setAdditionalAttachments] = React.useState<AdditionalAttachmentRow[]>(
    []
  )

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitted, setSubmitted] = React.useState(false)
  const [usage, setUsage] = React.useState<SupabaseUsage | null>(null)
  const [usageLoading, setUsageLoading] = React.useState(false)

  const hasPendingUpload =
    attachment.uploadStatus === "uploading" ||
    additionalAttachments.some((row) => row.uploadStatus === "uploading")
  const locallyPickedUploadBytes =
    (attachment.file?.size ?? 0) +
    additionalAttachments.reduce((total, row) => total + (row.file?.size ?? 0), 0)
  const remainingStorageBytes = usage?.available
    ? Math.max(usage.storage.remainingBytes - locallyPickedUploadBytes, 0)
    : null
  const displayedStorageMetric = usage?.available
    ? createUsageMetric(
        "Storage",
        usage.storage.usedBytes + locallyPickedUploadBytes,
        usage.storage.limitBytes
      )
    : null

  React.useEffect(() => {
    if (open && !foldersLoaded) {
      getAllFolders().then((data) => {
        setFolders(data)
        setFoldersLoaded(true)
      })
    }
  }, [open, foldersLoaded])

  React.useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) {
        setUsageLoading(true)
      }
    }, 0)

    fetch("/api/usage/supabase", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SupabaseUsage | null) => {
        if (!cancelled) {
          setUsage(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsage(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setUsageLoading(false)
        }
      })

    return () => {
      cancelled = true
      window.clearTimeout(loadingTimer)
    }
  }, [open])

  function resetState() {
    setFolderId(initialFolderId ?? null)
    setAttachment(EMPTY_ATTACHMENT)
    setAttachmentError(null)
    setWhyUseful("")
    setAdditionalAttachments([])
    setSubmitError(null)
    setSubmitted(false)
  }

  function cleanupUnsavedUploads() {
    const urls = [
      attachment.file ? attachment.uploadedUrl : null,
      ...additionalAttachments.map((row) => (row.file ? row.url : null)),
    ].filter((url): url is string => Boolean(url))

    if (urls.length > 0) {
      deleteUploadedResourceFiles(urls)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (submitted) {
        router.refresh()
      } else {
        cleanupUnsavedUploads()
      }
      resetState()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const validationError = validateAttachment(attachment)
    setAttachmentError(validationError)
    if (validationError) {
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    let primaryLink: ResourceLink
    if (attachment.mode === "link") {
      primaryLink = { label: "Visit resource", url: normalizeUrl(attachment.url) }
    } else if (attachment.file && attachment.uploadStatus === "done" && attachment.uploadedUrl) {
      primaryLink = { label: attachment.file.name, url: attachment.uploadedUrl }
    } else if (attachment.file) {
      // Upload still pending or failed — validateAttachment() above should have caught this.
      setIsSubmitting(false)
      setSubmitError("Wait for the upload to finish before adding.")
      return
    } else {
      setIsSubmitting(false)
      setSubmitError("Choose a file to upload.")
      return
    }

    const additionalLinks: ResourceLink[] = []
    for (const row of additionalAttachments) {
      if (row.kind === "link") {
        if (!row.url.trim()) {
          continue
        }
        additionalLinks.push({
          label: row.label.trim() || "Additional link",
          url: normalizeUrl(row.url),
        })
        continue
      }
      if (row.uploadStatus !== "done" || !row.url) {
        setIsSubmitting(false)
        setSubmitError(`"${row.label}" hasn't finished uploading yet.`)
        return
      }
      additionalLinks.push({ label: row.label || "Attachment", url: row.url })
    }

    const result = await createResourceAction({
      title: attachment.title.trim(),
      folderId,
      type: attachment.detectedType,
      whyUseful: whyUseful.trim(),
      links: [primaryLink, ...additionalLinks],
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    setSubmitted(true)
    notifySupabaseUsageChanged()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          className={
            isMobile ? "max-h-[92dvh] w-full rounded-t-3xl" : "sm:max-w-[38rem]"
          }
          side={isMobile ? "bottom" : "right"}
        >
          <SheetHeader className={isMobile ? "p-4 pb-3" : undefined}>
            <SheetTitle>Add Resource</SheetTitle>
            <SheetDescription>
              Share a link or file — it appears in the hub right away.
            </SheetDescription>
          </SheetHeader>

          <div
            className={
              isMobile
                ? "flex-1 overflow-y-auto px-4 pb-4"
                : "flex-1 overflow-y-auto px-6 pb-6"
            }
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-10 text-emerald-600 dark:text-emerald-400"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">Resource added</p>
                  <p className="text-sm text-muted-foreground">
                    &quot;{attachment.title}&quot; is ready to browse.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetState}>
                    Add Another
                  </Button>
                  <Button type="button" onClick={() => handleOpenChange(false)}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {submitError && (
                  <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      strokeWidth={2}
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>{submitError}</span>
                  </div>
                )}

                {displayedStorageMetric ? (
                  <StoragePoolSummary metric={displayedStorageMetric} />
                ) : usageLoading ? (
                  <div className="rounded-2xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                    Checking shared storage pool…
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                    Shared storage pool unavailable. Uploads are still limited to 5 MB per file.
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border px-3 py-3 text-sm sm:py-2">
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <HugeiconsIcon
                      icon={Folder01Icon}
                      strokeWidth={2}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 leading-snug">
                      <span className="block sm:inline">
                        {isContextual ? "Adding to:" : "Where should this go?"}
                      </span>{" "}
                      <span className="block break-words sm:inline">
                        {getFolderPathLabel(folders, folderId)}
                      </span>
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="shrink-0"
                    onClick={() => setFolderPickerOpen(true)}
                  >
                    {isContextual ? "Change" : "Choose"}
                  </Button>
                </div>

                <AttachmentField
                  value={attachment}
                  onChange={(patch) => setAttachment((prev) => ({ ...prev, ...patch }))}
                  userId={user.id}
                  error={attachmentError}
                  remainingStorageBytes={remainingStorageBytes}
                />

                <Field>
                  <FieldLabel htmlFor="sheet-why-useful">Why is this useful?</FieldLabel>
                  <Textarea
                    id="sheet-why-useful"
                    rows={3}
                    value={whyUseful}
                    onChange={(event) => setWhyUseful(event.target.value)}
                    placeholder="Optional — one sentence."
                  />
                </Field>

                <Field>
                  <FieldTitle>Additional attachments</FieldTitle>
                  <AdditionalAttachmentsField
                    rows={additionalAttachments}
                    userId={user.id}
                    remainingStorageBytes={remainingStorageBytes}
                    onChange={setAdditionalAttachments}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={isSubmitting || hasPendingUpload}>
                  {(isSubmitting || hasPendingUpload) && <Spinner data-icon="inline-start" />}
                  {isSubmitting ? "Submitting…" : hasPendingUpload ? "Uploading…" : "Add Resource"}
                </Button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {isMobile ? (
        <Sheet open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
          <SheetContent side="bottom" className="max-h-[85dvh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Choose a folder</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {foldersLoaded ? (
                <FolderPicker
                  folders={folders}
                  onFoldersChange={setFolders}
                  value={folderId}
                  onSelect={(id) => {
                    setFolderId(id)
                    setFolderPickerOpen(false)
                  }}
                  listClassName="max-h-[50vh]"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  Loading folders…
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose a folder</DialogTitle>
            </DialogHeader>
            {foldersLoaded ? (
              <FolderPicker
                folders={folders}
                onFoldersChange={setFolders}
                value={folderId}
                onSelect={(id) => {
                  setFolderId(id)
                  setFolderPickerOpen(false)
                }}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Loading folders…
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export { AddResourceSheet }
