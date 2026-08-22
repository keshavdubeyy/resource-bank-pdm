import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  FileAttachmentIcon,
  FileCheckIcon,
  FileSpreadsheetIcon,
  SystemUpdate01Icon,
} from "@hugeicons/core-free-icons"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Version History | PDM Resource Hub",
  description: "A changelog of product improvements shipped to PDM Resource Hub.",
}

const releases = [
  {
    version: "2026.08.22",
    date: "August 22, 2026",
    status: "Released",
    title: "Expanded resource uploads",
    summary:
      "Resource contributors can now attach spreadsheets and documents alongside PDFs, images, and external links.",
    highlights: [
      "Primary uploads now accept PDF, image, XLS/XLSX, CSV, DOC/DOCX, and TXT files up to 5 MB.",
      "Additional attachments use one file picker with format-aware labels and icons.",
      "Uploaded resources are classified as PDF, Image, Spreadsheet, or Document from the selected file.",
      "Saved resource detail views reuse the same file-type icon system for uploaded links.",
      "Supabase storage bucket settings are captured in a migration for the widened MIME type list.",
    ],
    tags: ["Uploads", "Resources", "Storage"],
  },
]

const releaseNotes = [
  "Supabase storage must include the listed MIME types before new file formats can upload in production.",
  "Future releases should add a new entry here with implementation notes and migration requirements.",
]

function VersionPage() {
  const [latestRelease] = releases

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 lg:px-8">
      <PageHeader
        title="Version History"
        description="A running log of what is being implemented and shipped in PDM Resource Hub."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={SystemUpdate01Icon} strokeWidth={2} className="size-4" />
              Current version
            </CardTitle>
            <CardDescription>{latestRelease.version}</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
              Latest update
            </CardTitle>
            <CardDescription>{latestRelease.date}</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
              Status
            </CardTitle>
            <CardDescription>{latestRelease.status}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        {releases.map((release) => (
          <Card key={release.version}>
            <CardHeader>
              <CardTitle>{release.title}</CardTitle>
              <CardDescription>
                {release.version} / {release.date}
              </CardDescription>
              <CardAction>
                <Badge variant="secondary">{release.status}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <p className="max-w-3xl text-sm text-muted-foreground">{release.summary}</p>

              <div className="flex flex-wrap gap-2">
                {release.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator />

              <ul className="grid gap-3 text-sm sm:grid-cols-2">
                {release.highlights.map((highlight, index) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <HugeiconsIcon
                        icon={
                          index === 0
                            ? FileAttachmentIcon
                            : index === 1 || index === 2
                              ? FileSpreadsheetIcon
                              : FileCheckIcon
                        }
                        strokeWidth={2}
                        className="size-4"
                      />
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-2xl border bg-muted/30 p-5">
        <h2 className="text-base font-medium">Release notes</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {releaseNotes.map((item) => (
            <li key={item} className="flex gap-2">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="mt-0.5 size-4 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default VersionPage
