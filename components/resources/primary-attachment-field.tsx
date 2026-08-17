"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Delete02Icon,
  Image01Icon,
  Pdf01Icon,
  Refresh01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUploadKind, MAX_UPLOAD_BYTES, type UploadStatus } from "@/lib/resources/storage"
import { formatBytes } from "@/lib/resources/utils"

export type AttachmentMode = "link" | "upload"

function PrimaryAttachmentField({
  mode,
  onModeChange,
  url,
  onUrlChange,
  file,
  fileLabel,
  uploadStatus,
  uploadError,
  onPickFile,
  onRemoveFile,
  onRetryUpload,
  error,
}: {
  mode: AttachmentMode
  onModeChange: (mode: AttachmentMode) => void
  url: string
  onUrlChange: (url: string) => void
  file: File | null
  fileLabel: string | null
  uploadStatus: UploadStatus
  uploadError?: string | null
  onPickFile: (file: File) => void
  onRemoveFile: () => void
  onRetryUpload: () => void
  error?: string
}) {
  const inputId = React.useId()
  const urlInputRef = React.useRef<HTMLInputElement>(null)
  const focusUrlPendingRef = React.useRef(false)
  const [sizeDialogOpen, setSizeDialogOpen] = React.useState(false)
  const [pickError, setPickError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (focusUrlPendingRef.current && mode === "link") {
      urlInputRef.current?.focus()
      focusUrlPendingRef.current = false
    }
  }, [mode])

  const hasFile = Boolean(file || fileLabel)
  const uploadKind = file ? getUploadKind(file) : null
  const displayName = file?.name ?? fileLabel ?? ""
  const displaySize = file ? formatBytes(file.size) : "Uploaded"
  const isUploading = uploadStatus === "uploading"
  const isUploadError = uploadStatus === "error"
  const attachmentState = !hasFile ? "idle" : isUploading ? "uploading" : isUploadError ? "error" : "done"

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    event.target.value = ""
    if (!selected) {
      return
    }
    if (!getUploadKind(selected)) {
      setPickError("Please choose a PDF or image file.")
      return
    }
    if (selected.size > MAX_UPLOAD_BYTES) {
      setPickError(null)
      setSizeDialogOpen(true)
      return
    }
    setPickError(null)
    onPickFile(selected)
  }

  function handleUseExternalLinkInstead() {
    setSizeDialogOpen(false)
    onModeChange("link")
    focusUrlPendingRef.current = true
  }

  function handleRemoveFile() {
    setPickError(null)
    onRemoveFile()
  }

  function handleModeChange(nextMode: AttachmentMode) {
    setPickError(null)
    onModeChange(nextMode)
  }

  return (
    <div className="flex flex-col gap-2">
      <Tabs value={mode} onValueChange={(value) => handleModeChange(value as AttachmentMode)}>
        <TabsList>
          <TabsTrigger value="link">Add external link</TabsTrigger>
          <TabsTrigger value="upload">Upload PDF / Image</TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="pt-2">
          <Input
            ref={urlInputRef}
            type="text"
            inputMode="url"
            value={url}
            aria-invalid={!!error}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://example.com/guide"
          />
        </TabsContent>

        <TabsContent value="upload" className="pt-2">
          <input
            id={inputId}
            type="file"
            accept="application/pdf,image/*"
            className="sr-only"
            disabled={isUploading}
            onChange={handleFileChange}
          />
          <Attachment state={attachmentState} className="w-full">
            <AttachmentMedia>
              {isUploading ? (
                <Spinner />
              ) : (
                <HugeiconsIcon
                  icon={
                    isUploadError
                      ? Alert02Icon
                      : uploadKind === "image"
                        ? Image01Icon
                        : hasFile
                          ? Pdf01Icon
                          : Upload01Icon
                  }
                  strokeWidth={2}
                />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{hasFile ? displayName : "Choose a file"}</AttachmentTitle>
              <AttachmentDescription>
                {isUploading
                  ? "Uploading…"
                  : isUploadError
                    ? (uploadError ?? "Upload failed — try again.")
                    : hasFile
                      ? displaySize
                      : "PDF or image, up to 5 MB"}
              </AttachmentDescription>
            </AttachmentContent>
            {hasFile ? (
              <AttachmentActions>
                {isUploadError && (
                  <AttachmentAction onClick={onRetryUpload} aria-label="Retry upload">
                    <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} />
                  </AttachmentAction>
                )}
                {!isUploading && (
                  <AttachmentAction
                    render={<label htmlFor={inputId} />}
                    nativeButton={false}
                    aria-label="Replace file"
                  >
                    <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} />
                  </AttachmentAction>
                )}
                <AttachmentAction
                  onClick={handleRemoveFile}
                  aria-label={isUploading ? "Cancel upload" : "Remove file"}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </AttachmentAction>
              </AttachmentActions>
            ) : (
              <AttachmentTrigger render={<label htmlFor={inputId} />} />
            )}
          </Attachment>
        </TabsContent>
      </Tabs>
      {(pickError || error) && <FieldError>{pickError ?? error}</FieldError>}

      <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File too large</DialogTitle>
            <DialogDescription>
              Uploads are limited to 5 MB. For a larger document, upload it to Google
              Drive, Dropbox, OneDrive, or a similar service, then share the link
              instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUseExternalLinkInstead}>Add external link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { PrimaryAttachmentField }
