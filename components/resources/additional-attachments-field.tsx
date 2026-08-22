"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Alert02Icon,
  Delete02Icon,
  Link04Icon,
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
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  deleteUploadedResourceFiles,
  getUploadKind,
  getUploadKindIcon,
  MAX_UPLOAD_BYTES,
  uploadResourceFile,
  UPLOAD_ACCEPT,
  type UploadKind,
  type UploadStatus,
} from "@/lib/resources/storage"
import { formatBytes } from "@/lib/resources/utils"

export type AdditionalAttachmentKind = "link" | UploadKind

export interface AdditionalAttachmentRow {
  id: string
  kind: AdditionalAttachmentKind
  label: string
  /** For "link" rows, the URL. For file rows, the uploaded file's URL — empty while the upload is in flight. */
  url: string
  /** A newly picked file pending/uploading — only set for unsaved file rows. */
  file: File | null
  /** Only meaningful for file rows — link rows stay "done". */
  uploadStatus: UploadStatus
  uploadError: string | null
}

const KIND_LABELS: Record<UploadKind, string> = {
  pdf: "PDF",
  image: "Image",
  xls: "Excel",
  csv: "CSV",
  doc: "Word",
  txt: "Text",
}

function createRowId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `attachment-${Math.random().toString(36).slice(2)}`
}

function kindIcon(kind: AdditionalAttachmentKind) {
  return kind === "link" ? Link04Icon : getUploadKindIcon(kind) ?? Link04Icon
}

function kindLabel(kind: AdditionalAttachmentKind) {
  return kind === "link" ? "Link" : KIND_LABELS[kind]
}

function AdditionalAttachmentsField({
  rows,
  userId,
  errors,
  remainingStorageBytes,
  onChange,
}: {
  rows: AdditionalAttachmentRow[]
  userId: string
  errors?: Record<string, string>
  remainingStorageBytes?: number | null
  onChange: (rows: AdditionalAttachmentRow[]) => void
}) {
  const [expanded, setExpanded] = React.useState(rows.length > 0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const rowsRef = React.useRef(rows)

  React.useEffect(() => {
    rowsRef.current = rows
  }, [rows])

  const updateRow = (id: string, patch: Partial<AdditionalAttachmentRow>) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id: string) => {
    const row = rows.find((candidate) => candidate.id === id)
    if (row?.file && row.url) {
      deleteUploadedResourceFiles([row.url])
    }
    onChange(rows.filter((row) => row.id !== id))
  }

  const addLinkRow = () => {
    setExpanded(true)
    onChange([
      ...rows,
      { id: createRowId(), kind: "link", label: "", url: "", file: null, uploadStatus: "done", uploadError: null },
    ])
  }

  const promptForFile = () => {
    setExpanded(true)
    fileInputRef.current?.click()
  }

  function startUpload(id: string, file: File) {
    uploadResourceFile(userId, file).then((result) => {
      const current = rowsRef.current
      if (!current.some((row) => row.id === id)) {
        if (result.ok) {
          deleteUploadedResourceFiles([result.url])
        }
        return // removed while the upload was in flight
      }
      onChange(
        current.map((row) =>
          row.id === id
            ? result.ok
              ? { ...row, uploadStatus: "done", url: result.url, uploadError: null }
              : { ...row, uploadStatus: "error", uploadError: result.error }
            : row
        )
      )
    })
  }

  const retryRow = (id: string) => {
    const row = rows.find((candidate) => candidate.id === id)
    if (!row?.file) {
      return
    }
    updateRow(id, { uploadStatus: "uploading", uploadError: null })
    startUpload(id, row.file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    event.target.value = ""
    if (!selected) {
      return
    }

    const kind = getUploadKind(selected)
    if (!kind) {
      setFileError("Please choose a PDF, image, spreadsheet, or document file.")
      return
    }
    if (selected.size > MAX_UPLOAD_BYTES) {
      setFileError("Files must be 5 MB or smaller.")
      return
    }
    if (remainingStorageBytes !== null && remainingStorageBytes !== undefined && selected.size > remainingStorageBytes) {
      setFileError(`Only ${formatBytes(remainingStorageBytes)} is left in the shared storage pool.`)
      return
    }
    setFileError(null)
    const id = createRowId()
    onChange([
      ...rows,
      { id, kind, label: selected.name, url: "", file: selected, uploadStatus: "uploading", uploadError: null },
    ])
    startUpload(id, selected)
  }

  if (!expanded && rows.length === 0) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={() => setExpanded(true)}
        className="self-start text-muted-foreground"
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
        Attach something else
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={UPLOAD_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
      />

      {rows.map((row) => {
        if (row.kind === "link") {
          return (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-2xl border border-border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={kindIcon(row.kind)} strokeWidth={2} className="size-3.5" />
                  {kindLabel(row.kind)}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove attachment"
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <Input
                  value={row.label}
                  onChange={(event) => updateRow(row.id, { label: event.target.value })}
                  placeholder="Label (e.g. Slide deck)"
                  aria-label="Attachment label"
                />
                <Input
                  value={row.url}
                  onChange={(event) => updateRow(row.id, { url: event.target.value })}
                  placeholder="https://"
                  aria-invalid={!!errors?.[row.id]}
                  aria-label="Attachment URL"
                />
              </div>
              {errors?.[row.id] && <FieldError>{errors[row.id]}</FieldError>}
            </div>
          )
        }

        const isUploading = row.uploadStatus === "uploading"
        const isUploadError = row.uploadStatus === "error"

        return (
          <Attachment
            key={row.id}
            state={isUploading ? "uploading" : isUploadError ? "error" : "done"}
          >
            <AttachmentMedia>
              {isUploading ? (
                <Spinner />
              ) : (
                <HugeiconsIcon
                  icon={isUploadError ? Alert02Icon : kindIcon(row.kind)}
                  strokeWidth={2}
                />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{row.file?.name ?? row.label}</AttachmentTitle>
              <AttachmentDescription>
                {isUploading
                  ? "Uploading…"
                  : isUploadError
                    ? (row.uploadError ?? "Upload failed — try again.")
                    : kindLabel(row.kind)}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              {isUploadError && (
                <AttachmentAction onClick={() => retryRow(row.id)} aria-label="Retry upload">
                  <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} />
                </AttachmentAction>
              )}
              <AttachmentAction
                onClick={() => removeRow(row.id)}
                aria-label={isUploading ? "Cancel upload" : "Remove attachment"}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        )
      })}

      {fileError && <FieldError>{fileError}</FieldError>}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="lg" onClick={addLinkRow}>
          <HugeiconsIcon icon={Link04Icon} strokeWidth={2} data-icon="inline-start" />
          Link
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={promptForFile}>
          <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} data-icon="inline-start" />
          File
        </Button>
      </div>
    </div>
  )
}

export { AdditionalAttachmentsField }
