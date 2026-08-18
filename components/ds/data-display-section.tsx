"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DsExample } from "@/components/ds/ds-section"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  Doc01Icon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons"

const submissions = [
  { title: "APM Case Guide", track: "APM", status: "Published" },
  { title: "Growth Metrics Cheat Sheet", track: "Growth PM", status: "In review" },
  { title: "System Design Primer", track: "Technical PM", status: "Published" },
]

function DataDisplaySection() {
  return (
    <>
      <DsExample title="Card" description="A container for grouped content and actions.">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>APM Case Interview Guide</CardTitle>
            <CardDescription>
              A comprehensive walkthrough of case frameworks.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">New</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Covers estimation, product design, and strategy cases with
              worked examples.
            </p>
          </CardContent>
          <CardFooter className="gap-2 border-t">
            <Button size="lg">Read guide</Button>
            <Button size="lg" variant="outline">
              Save
            </Button>
          </CardFooter>
        </Card>
      </DsExample>

      <DsExample
        title="Table"
        description="Tabular data with header, footer, and caption."
        contentClassName="flex-col items-stretch"
      >
        <Table>
          <TableCaption>Recent community submissions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Track</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.title}>
                <TableCell className="font-medium">
                  {submission.title}
                </TableCell>
                <TableCell>{submission.track}</TableCell>
                <TableCell className="text-right">
                  {submission.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {submissions.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </DsExample>

      <DsExample title="Avatar" description="A user or entity image with fallback.">
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>PM</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>JD</AvatarFallback>
          <AvatarBadge>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
          </AvatarBadge>
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+5</AvatarGroupCount>
        </AvatarGroup>
      </DsExample>

      <DsExample
        title="Item"
        description="A flexible row for lists of resources, people, or settings."
        contentClassName="flex-col items-stretch"
      >
        <ItemGroup className="max-w-lg">
          <Item variant="outline">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>APM Case Interview Guide</ItemTitle>
              <ItemDescription>
                Frameworks, worked examples, and drills.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="lg" variant="outline">
                Open
              </Button>
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item variant="muted" size="sm">
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={Doc01Icon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Growth Metrics Cheat Sheet</ItemTitle>
              <ItemDescription>One-page reference for AARRR metrics.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="outline">Growth PM</Badge>
            </ItemActions>
          </Item>
        </ItemGroup>
      </DsExample>

      <DsExample
        title="Attachment"
        description="Represents an uploaded or attached file."
        contentClassName="flex-col items-stretch"
      >
        <AttachmentGroup>
          <Attachment>
            <AttachmentTrigger aria-label="Open attachment" />
            <AttachmentMedia>
              <HugeiconsIcon icon={Pdf01Icon} strokeWidth={2} />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Case-Interview-Notes.pdf</AttachmentTitle>
              <AttachmentDescription>2.4 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Remove attachment">
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <Attachment state="uploading">
            <AttachmentMedia>
              <Spinner />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>Growth-PM-Template.docx</AttachmentTitle>
              <AttachmentDescription>Uploading…</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </AttachmentGroup>
      </DsExample>

      <DsExample title="Aspect Ratio" description="Constrains content to a fixed ratio.">
        <AspectRatio
          ratio={16 / 9}
          className="w-full max-w-sm overflow-hidden rounded-xl bg-muted"
        >
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            16:9
          </div>
        </AspectRatio>
      </DsExample>

      <DsExample
        title="Marker"
        description="Timeline-style markers for status and progress."
        contentClassName="flex-col items-stretch"
      >
        <div className="flex w-full max-w-sm flex-col gap-2">
          <Marker>
            <MarkerIcon>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
            </MarkerIcon>
            <MarkerContent>Application submitted</MarkerContent>
          </Marker>
          <Marker variant="separator">
            <MarkerContent>Today</MarkerContent>
          </Marker>
          <Marker variant="border">
            <MarkerIcon>
              <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
            </MarkerIcon>
            <MarkerContent>Interview scheduled</MarkerContent>
          </Marker>
        </div>
      </DsExample>

      <DsExample
        title="Accordion"
        description="Expandable sections for FAQs and grouped content."
        contentClassName="flex-col items-stretch"
      >
        <Accordion defaultValue={["item-1"]} className="w-full max-w-md">
          <AccordionItem value="item-1">
            <AccordionTrigger>What tracks are covered?</AccordionTrigger>
            <AccordionContent>
              APM, Core PM, Growth PM, and Technical PM.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is this free?</AccordionTrigger>
            <AccordionContent>
              Yes, all resources are community-contributed and free.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DsExample>

      <DsExample
        title="Collapsible"
        description="Toggle the visibility of a single block of content."
        contentClassName="flex-col items-stretch"
      >
        <Collapsible defaultOpen className="w-full max-w-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">3 related resources</p>
            <CollapsibleTrigger render={<Button variant="ghost" size="lg" />}>
              Toggle
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="flex flex-col gap-1 pt-2 text-sm text-muted-foreground">
            <p>Case interview cheat sheet</p>
            <p>Estimation drills</p>
            <p>Behavioral question bank</p>
          </CollapsibleContent>
        </Collapsible>
      </DsExample>
    </>
  )
}

export { DataDisplaySection }
