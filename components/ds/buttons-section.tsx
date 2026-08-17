"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DsExample } from "@/components/ds/ds-section"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Download04Icon,
  PlusSignIcon,
  Settings01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"

function ButtonsSection() {
  return (
    <>
      <DsExample
        title="Button"
        description="Variants and sizes for the primary action component."
      >
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
      </DsExample>

      <DsExample title="Button sizes" description="From xs to lg, plus icon-only squares.">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" variant="outline" aria-label="Settings">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </Button>
        <Button size="icon-sm" variant="outline" aria-label="Add">
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        </Button>
      </DsExample>

      <DsExample title="Button with icon" description="Icons render inline with label text.">
        <Button>
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
          Add resource
        </Button>
        <Button variant="outline">
          Download
          <HugeiconsIcon icon={Download04Icon} strokeWidth={2} data-icon="inline-end" />
        </Button>
      </DsExample>

      <DsExample
        title="Button as link"
        description="Polymorphic composition uses the render prop instead of asChild."
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<a href="#buttons-actions" />}
        >
          Rendered as anchor
        </Button>
      </DsExample>

      <DsExample title="Button Group" description="Buttons combined into a single control.">
        <ButtonGroup>
          <Button variant="outline">Weekly</Button>
          <Button variant="outline">Monthly</Button>
          <Button variant="outline">Yearly</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon" aria-label="Settings">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
          </Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>Track</ButtonGroupText>
          <ButtonGroupSeparator />
          <Button variant="outline">Save</Button>
        </ButtonGroup>
      </DsExample>

      <DsExample
        title="Toggle"
        description="A two-state pressable button."
      >
        <Toggle aria-label="Toggle bold">
          <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
        </Toggle>
        <Toggle variant="outline" defaultPressed aria-label="Toggle italic">
          <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
        </Toggle>
      </DsExample>

      <DsExample
        title="Toggle Group"
        description="A set of toggles where multiple items can be pressed."
      >
        <ToggleGroup multiple defaultValue={["bold"]} variant="outline">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={2} />
          </ToggleGroupItem>
        </ToggleGroup>
      </DsExample>

      <DsExample title="Badge" description="Compact status and count labels.">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </DsExample>

      <DsExample title="Kbd" description="Represents keyboard input.">
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </DsExample>
    </>
  )
}

export { ButtonsSection }
