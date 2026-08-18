"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import {
  PrimaryAttachmentField,
  type AttachmentMode,
} from "@/components/resources/primary-attachment-field"
import {
  Combobox,
  ComboboxContent,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { detectFromUrl } from "@/lib/resources/detect"
import {
  deleteUploadedResourceFiles,
  getUploadKind,
  uploadResourceFile,
  type UploadStatus,
} from "@/lib/resources/storage"
import {
  OTHER_RESOURCE_TYPES,
  PROMINENT_RESOURCE_TYPES,
  RESOURCE_TYPES,
  type ResourceType,
} from "@/lib/resources/types"
import { isValidUrl, normalizeUrl } from "@/lib/resources/utils"

export interface AttachmentValue {
  mode: AttachmentMode
  url: string
  file: File | null
  title: string
  detectedType: ResourceType
  hasDetected: boolean
  uploadStatus: UploadStatus
  uploadedUrl: string | null
  uploadError: string | null
}

export const EMPTY_ATTACHMENT: AttachmentValue = {
  mode: "link",
  url: "",
  file: null,
  title: "",
  detectedType: "Article",
  hasDetected: false,
  uploadStatus: "idle",
  uploadedUrl: null,
  uploadError: null,
}

function detectFromFile(file: File): { type: ResourceType; title: string } {
  const kind = getUploadKind(file)
  return { type: kind === "image" ? "Image" : "PDF", title: file.name }
}

/** A link's title can't always be scraped — fall back to something based on
 * the source so the required field is never left blank after detection. */
function fallbackLinkTitle(normalizedUrl: string, sourceLabel: string | null): string {
  if (sourceLabel) {
    return `Resource from ${sourceLabel}`
  }
  try {
    return `Resource from ${new URL(normalizedUrl).hostname}`
  } catch {
    return "Untitled resource"
  }
}

/** Returns an error message if the attachment isn't ready to submit, else null. */
export function validateAttachment(value: AttachmentValue): string | null {
  if (value.mode === "link") {
    if (!value.url.trim() || !isValidUrl(value.url)) {
      return "Enter a valid URL, e.g. https://example.com."
    }
  } else if (!value.file) {
    return "Choose a file to upload."
  } else if (value.uploadStatus === "uploading") {
    return "Wait for the upload to finish."
  } else if (value.uploadStatus === "error") {
    return value.uploadError ?? "Upload failed — try again."
  } else if (value.uploadStatus !== "done" || !value.uploadedUrl) {
    return "Choose a file to upload."
  }
  if (!value.title.trim()) {
    return "Add a title for this resource."
  }
  return null
}

/** Just the attachment input + inline auto-detection — no step framing, no
 * Continue gate. Meant to sit directly inside a single-screen form. */
function AttachmentField({
  value,
  onChange,
  userId,
  error,
  remainingStorageBytes,
}: {
  value: AttachmentValue
  onChange: (patch: Partial<AttachmentValue>) => void
  userId: string
  error?: string | null
  remainingStorageBytes?: number | null
}) {
  const [isDetecting, setIsDetecting] = React.useState(false)
  const [sourceLabel, setSourceLabel] = React.useState<string | null>(null)
  const lastDetectedUrlRef = React.useRef<string | null>(null)
  const uploadGenerationRef = React.useRef(0)
  const [customTypes, setCustomTypes] = React.useState<string[]>([])
  const [typeQuery, setTypeQuery] = React.useState("")

  const isAttachmentInvalid =
    value.mode === "link"
      ? !value.url.trim() || !isValidUrl(value.url)
      : !value.file || value.uploadStatus !== "done" || !value.uploadedUrl
  const attachmentError = error && isAttachmentInvalid ? error : undefined
  // Clears itself the moment a title is typed, rather than waiting on the next submit attempt.
  const titleError = error && !isAttachmentInvalid && !value.title.trim() ? error : undefined

  function startUpload(file: File) {
    const generation = ++uploadGenerationRef.current
    uploadResourceFile(userId, file).then((result) => {
      if (uploadGenerationRef.current !== generation) {
        if (result.ok) {
          deleteUploadedResourceFiles([result.url])
        }
        return // file was replaced or removed while this upload was in flight
      }
      onChange(
        result.ok
          ? { uploadStatus: "done", uploadedUrl: result.url, uploadError: null }
          : { uploadStatus: "error", uploadedUrl: null, uploadError: result.error }
      )
    })
  }

  React.useEffect(() => {
    if (value.mode !== "link" || !isValidUrl(value.url)) {
      return
    }
    const normalized = normalizeUrl(value.url)
    if (normalized === lastDetectedUrlRef.current) {
      return
    }

    const timeout = setTimeout(async () => {
      lastDetectedUrlRef.current = normalized
      setIsDetecting(true)
      try {
        const result = await detectFromUrl(normalized)
        onChange({
          title: result.title?.trim() || fallbackLinkTitle(normalized, result.sourceLabel),
          detectedType: result.type,
          hasDetected: true,
        })
        setSourceLabel(result.sourceLabel)
      } finally {
        setIsDetecting(false)
      }
    }, 600)

    return () => clearTimeout(timeout)
    // onChange intentionally omitted — it's an inline setState wrapper from the
    // parent, not memoized, and re-running this effect on every parent render
    // would restart the debounce on each keystroke elsewhere in the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.mode, value.url])

  function handlePickFile(file: File) {
    const detected = detectFromFile(file)
    setSourceLabel(null)
    lastDetectedUrlRef.current = null
    onChange({
      file,
      title: detected.title,
      detectedType: detected.type,
      hasDetected: true,
      uploadStatus: "uploading",
      uploadedUrl: null,
      uploadError: null,
    })
    startUpload(file)
  }

  function handleRetryUpload() {
    if (!value.file) {
      return
    }
    onChange({ uploadStatus: "uploading", uploadedUrl: null, uploadError: null })
    startUpload(value.file)
  }

  function handleRemoveFile() {
    uploadGenerationRef.current++
    lastDetectedUrlRef.current = null
    if (value.file && value.uploadedUrl) {
      deleteUploadedResourceFiles([value.uploadedUrl])
    }
    onChange({
      file: null,
      title: "",
      detectedType: "Article",
      hasDetected: false,
      uploadStatus: "idle",
      uploadedUrl: null,
      uploadError: null,
    })
  }

  function handleModeChange(mode: AttachmentMode) {
    lastDetectedUrlRef.current = null
    setSourceLabel(null)
    onChange({
      mode,
      title: "",
      detectedType: "Article",
      hasDetected: false,
    })
  }

  const trimmedTypeQuery = typeQuery.trim()
  const normalizedTypeQuery = trimmedTypeQuery.toLowerCase()
  const allTypes = [...RESOURCE_TYPES, ...customTypes]
  // Matching an existing type (any case) always wins over creating a new one —
  // "video" resolves to the real "Video" instead of adding a duplicate.
  const typeMatches = normalizedTypeQuery
    ? allTypes.filter((type) => type.toLowerCase().includes(normalizedTypeQuery))
    : []
  // A substring match always includes an exact match of itself, so this alone
  // covers "no existing value matches at all" — including the exact-match case.
  const canCreateType = trimmedTypeQuery.length > 0 && typeMatches.length === 0
  // Mirrors exactly what's rendered below, so base-ui's own item bookkeeping
  // (keyboard nav, highlight, ARIA count) stays in sync with the visible list.
  const typeComboboxItems = canCreateType ? [trimmedTypeQuery] : trimmedTypeQuery ? typeMatches : allTypes

  function handleTypeChange(nextValue: string | null) {
    if (!nextValue) {
      return
    }
    const trimmed = nextValue.trim()
    if (!trimmed) {
      return
    }
    const existing = allTypes.find((type) => type.toLowerCase() === trimmed.toLowerCase())
    if (existing) {
      onChange({ detectedType: existing })
      return
    }
    setCustomTypes((prev) => [...prev, trimmed])
    onChange({ detectedType: trimmed })
  }

  return (
    <div className="flex flex-col gap-3">
      <PrimaryAttachmentField
        mode={value.mode}
        onModeChange={handleModeChange}
        url={value.url}
        onUrlChange={(url) => onChange({ url })}
        file={value.file}
        fileLabel={null}
        uploadStatus={value.uploadStatus}
        uploadError={value.uploadError}
        onPickFile={handlePickFile}
        onRemoveFile={handleRemoveFile}
        onRetryUpload={handleRetryUpload}
        error={attachmentError}
        remainingStorageBytes={remainingStorageBytes}
      />

      {isDetecting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Detecting…
        </div>
      )}

      {value.hasDetected && !isDetecting && (
        <>
          <Field data-invalid={!!titleError}>
            <FieldLabel htmlFor="detected-title">
              Title <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="detected-title"
              value={value.title}
              aria-invalid={!!titleError}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Give this resource a title"
            />
            {titleError ? (
              <FieldError>{titleError}</FieldError>
            ) : (
              sourceLabel && (
                <FieldDescription className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  {sourceLabel}
                </FieldDescription>
              )
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="detected-type">Type</FieldLabel>
            <Combobox
              items={typeComboboxItems}
              value={value.detectedType}
              onValueChange={handleTypeChange}
              onInputValueChange={setTypeQuery}
              autoHighlight
            >
              <ComboboxInput
                id="detected-type"
                className="w-full"
                placeholder="Select or create a type"
              />
              <ComboboxContent>
                <ComboboxList>
                  {canCreateType ? (
                    <ComboboxItem value={trimmedTypeQuery}>
                      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                      Add &quot;{trimmedTypeQuery}&quot;
                    </ComboboxItem>
                  ) : trimmedTypeQuery ? (
                    typeMatches.map((type) => (
                      <ComboboxItem key={type} value={type}>
                        {type}
                      </ComboboxItem>
                    ))
                  ) : (
                    <>
                      <ComboboxGroup>
                        {PROMINENT_RESOURCE_TYPES.map((type) => (
                          <ComboboxItem key={type} value={type}>
                            {type}
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                      <ComboboxSeparator />
                      <ComboboxGroup>
                        <ComboboxLabel>Other</ComboboxLabel>
                        {OTHER_RESOURCE_TYPES.map((type) => (
                          <ComboboxItem key={type} value={type}>
                            {type}
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                      {customTypes.length > 0 && (
                        <>
                          <ComboboxSeparator />
                          <ComboboxGroup>
                            <ComboboxLabel>Your types</ComboboxLabel>
                            {customTypes.map((type) => (
                              <ComboboxItem key={type} value={type}>
                                {type}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        </>
                      )}
                    </>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </>
      )}
    </div>
  )
}

export { AttachmentField }
