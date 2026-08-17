"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Folder01Icon } from "@hugeicons/core-free-icons"

import {
  AdditionalAttachmentsField,
  type AdditionalAttachmentRow,
} from "@/components/resources/additional-attachments-field"
import { FolderPicker } from "@/components/resources/folder-picker"
import {
  PrimaryAttachmentField,
  type AttachmentMode,
} from "@/components/resources/primary-attachment-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { updateResourceAction } from "@/lib/resources/actions"
import { getAllFolders } from "@/lib/resources/folder-actions"
import { getFolderPathLabel } from "@/lib/resources/folder-tree"
import {
  guessUploadKindFromUrl,
  isUploadedResourceFileUrl,
  uploadResourceFile,
  type UploadStatus,
} from "@/lib/resources/storage"
import type { FolderRow, Resource, ResourceLink } from "@/lib/resources/types"
import { isValidUrl, normalizeUrl } from "@/lib/resources/utils"

function createRowId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `attachment-${Math.random().toString(36).slice(2)}`
}

interface FormState {
  title: string
  attachmentMode: AttachmentMode
  primaryUrl: string
  file: File | null
  fileLabel: string | null
  uploadStatus: UploadStatus
  uploadedUrl: string | null
  uploadError: string | null
  folderId: string | null
  whyUseful: string
  additionalAttachments: AdditionalAttachmentRow[]
}

function formFromResource(resource: Resource): FormState {
  const [primary, ...rest] = resource.links
  const primaryIsUpload = Boolean(primary && isUploadedResourceFileUrl(primary.url))
  return {
    title: resource.title,
    attachmentMode: primaryIsUpload ? "upload" : "link",
    primaryUrl: primary?.url ?? "",
    file: null,
    fileLabel: primaryIsUpload ? (primary?.label ?? null) : null,
    uploadStatus: primaryIsUpload ? "done" : "idle",
    uploadedUrl: primaryIsUpload ? (primary?.url ?? null) : null,
    uploadError: null,
    folderId: resource.folderId,
    whyUseful: resource.whyUseful,
    additionalAttachments: rest.map((link) => ({
      id: createRowId(),
      kind: isUploadedResourceFileUrl(link.url) ? guessUploadKindFromUrl(link.url) : "link",
      label: link.label,
      url: link.url,
      file: null,
      uploadStatus: "done",
      uploadError: null,
    })),
  }
}

interface FieldErrors {
  title?: string
  primaryUrl?: string
  attachments?: Record<string, string>
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}

  if (!form.title.trim()) {
    errors.title = "Title is required."
  }

  if (form.attachmentMode === "link") {
    if (!form.primaryUrl.trim()) {
      errors.primaryUrl = "A link to the resource is required."
    } else if (!isValidUrl(form.primaryUrl)) {
      errors.primaryUrl = "Enter a valid URL, e.g. https://example.com."
    }
  } else if (!form.file && !form.fileLabel) {
    errors.primaryUrl = "Choose a file to upload."
  } else if (form.uploadStatus === "uploading") {
    errors.primaryUrl = "Wait for the upload to finish."
  } else if (form.uploadStatus === "error") {
    errors.primaryUrl = form.uploadError ?? "Upload failed — try again."
  }

  const attachmentErrors: Record<string, string> = {}
  for (const row of form.additionalAttachments) {
    if (row.kind === "link" && row.url.trim() && !isValidUrl(row.url)) {
      attachmentErrors[row.id] = "Enter a valid URL."
    }
  }
  if (Object.keys(attachmentErrors).length > 0) {
    errors.attachments = attachmentErrors
  }

  return errors
}

function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

/** Editing happens in the same kind of Sheet as Add Resource, opened directly
 * from a resource's card instead of navigating to a separate page. */
function EditResourceSheet({
  open,
  onOpenChange,
  user,
  resource,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; name: string }
  resource: Resource
}) {
  const router = useRouter()
  const [form, setForm] = React.useState<FormState>(() => formFromResource(resource))
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [folderPickerOpen, setFolderPickerOpen] = React.useState(false)
  const [folders, setFolders] = React.useState<FolderRow[]>([])
  const [foldersLoaded, setFoldersLoaded] = React.useState(false)
  const uploadGenerationRef = React.useRef(0)

  const hasPendingUpload =
    form.uploadStatus === "uploading" ||
    form.additionalAttachments.some((row) => row.uploadStatus === "uploading")

  React.useEffect(() => {
    if (open && !foldersLoaded) {
      getAllFolders().then((data) => {
        setFolders(data)
        setFoldersLoaded(true)
      })
    }
  }, [open, foldersLoaded])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setForm(formFromResource(resource))
      setErrors({})
      setSubmitError(null)
    }
    onOpenChange(nextOpen)
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startPrimaryUpload(file: File) {
    const generation = ++uploadGenerationRef.current
    uploadResourceFile(user.id, file).then((result) => {
      if (uploadGenerationRef.current !== generation) {
        return // file was replaced or removed while this upload was in flight
      }
      setForm((prev) =>
        result.ok
          ? { ...prev, uploadStatus: "done", uploadedUrl: result.url, uploadError: null }
          : { ...prev, uploadStatus: "error", uploadedUrl: null, uploadError: result.error }
      )
    })
  }

  function handleAttachmentModeChange(nextMode: AttachmentMode) {
    setForm((prev) => ({
      ...prev,
      attachmentMode: nextMode,
      primaryUrl:
        nextMode === "link" && isUploadedResourceFileUrl(prev.primaryUrl) ? "" : prev.primaryUrl,
    }))
    setErrors((prev) => ({ ...prev, primaryUrl: undefined }))
  }

  function handlePickFile(file: File) {
    setForm((prev) => ({
      ...prev,
      file,
      fileLabel: file.name,
      uploadStatus: "uploading",
      uploadedUrl: null,
      uploadError: null,
    }))
    setErrors((prev) => ({ ...prev, primaryUrl: undefined }))
    startPrimaryUpload(file)
  }

  function handleRetryUpload() {
    if (!form.file) {
      return
    }
    setForm((prev) => ({ ...prev, uploadStatus: "uploading", uploadedUrl: null, uploadError: null }))
    startPrimaryUpload(form.file)
  }

  function handleRemoveFile() {
    uploadGenerationRef.current++
    setForm((prev) => ({
      ...prev,
      file: null,
      fileLabel: null,
      uploadStatus: "idle",
      uploadedUrl: null,
      uploadError: null,
      primaryUrl: isUploadedResourceFileUrl(prev.primaryUrl) ? "" : prev.primaryUrl,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (hasErrors(validationErrors)) {
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    let primaryLink: ResourceLink

    if (form.attachmentMode === "link") {
      primaryLink = { label: "Visit resource", url: normalizeUrl(form.primaryUrl) }
    } else if (form.file && form.uploadStatus === "done" && form.uploadedUrl) {
      primaryLink = { label: form.file.name, url: form.uploadedUrl }
    } else if (form.file) {
      // Upload still pending or failed — validate() above should have caught this.
      setIsSubmitting(false)
      setSubmitError("Wait for the upload to finish before saving.")
      return
    } else {
      primaryLink = { label: form.fileLabel ?? "View file", url: form.primaryUrl }
    }

    const additionalLinks: ResourceLink[] = []
    for (const row of form.additionalAttachments) {
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

    const result = await updateResourceAction(resource.id, {
      title: form.title.trim(),
      folderId: form.folderId,
      type: resource.type,
      whyUseful: form.whyUseful.trim(),
      links: [primaryLink, ...additionalLinks],
      previewImageUrl:
        form.attachmentMode === "link" && form.primaryUrl.trim() === resource.links[0]?.url
          ? resource.previewImageUrl
          : null,
    })

    setIsSubmitting(false)

    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    handleOpenChange(false)
    router.refresh()
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-[38rem]" side="right">
          <SheetHeader>
            <SheetTitle>Edit Resource</SheetTitle>
            <SheetDescription>Update the details for &quot;{resource.title}&quot;.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FieldGroup>
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

                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="edit-title">Title *</FieldLabel>
                  <Input
                    id="edit-title"
                    value={form.title}
                    aria-invalid={!!errors.title}
                    onChange={(event) => updateField("title", event.target.value)}
                  />
                  {errors.title && <FieldError>{errors.title}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.primaryUrl}>
                  <FieldLabel>Attachment *</FieldLabel>
                  <PrimaryAttachmentField
                    mode={form.attachmentMode}
                    onModeChange={handleAttachmentModeChange}
                    url={form.primaryUrl}
                    onUrlChange={(value) => updateField("primaryUrl", value)}
                    file={form.file}
                    fileLabel={form.fileLabel}
                    uploadStatus={form.uploadStatus}
                    uploadError={form.uploadError}
                    onPickFile={handlePickFile}
                    onRemoveFile={handleRemoveFile}
                    onRetryUpload={handleRetryUpload}
                    error={errors.primaryUrl}
                  />
                </Field>

                <Field>
                  <FieldLabel>Folder</FieldLabel>
                  <div className="flex items-start justify-between gap-2 rounded-2xl border border-dashed border-border px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-start gap-2">
                      <HugeiconsIcon
                        icon={Folder01Icon}
                        strokeWidth={2}
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span className="break-words">{getFolderPathLabel(folders, form.folderId)}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setFolderPickerOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="edit-why-useful">Why is this useful?</FieldLabel>
                  <Textarea
                    id="edit-why-useful"
                    rows={3}
                    value={form.whyUseful}
                    onChange={(event) => updateField("whyUseful", event.target.value)}
                    placeholder="Optional — one sentence."
                  />
                </Field>

                <Field>
                  <FieldTitle>Additional attachments</FieldTitle>
                  <AdditionalAttachmentsField
                    rows={form.additionalAttachments}
                    userId={user.id}
                    errors={errors.attachments}
                    onChange={(rows) => updateField("additionalAttachments", rows)}
                  />
                </Field>

                <Button type="submit" className="w-full" disabled={isSubmitting || hasPendingUpload}>
                  {(isSubmitting || hasPendingUpload) && <Spinner data-icon="inline-start" />}
                  {isSubmitting ? "Saving…" : hasPendingUpload ? "Uploading…" : "Save Changes"}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to...</DialogTitle>
          </DialogHeader>
          {foldersLoaded ? (
            <FolderPicker
              folders={folders}
              onFoldersChange={setFolders}
              value={form.folderId}
              onSelect={(folderId) => {
                updateField("folderId", folderId)
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
    </>
  )
}

export { EditResourceSheet }
