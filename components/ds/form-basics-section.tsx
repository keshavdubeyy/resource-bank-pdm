"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DsExample } from "@/components/ds/ds-section"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"

function FormBasicsSection() {
  return (
    <>
      <DsExample title="Input" description="Single-line text entry.">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Input placeholder="e.g. Cracking the APM Case Interview" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Invalid" aria-invalid />
        </div>
      </DsExample>

      <DsExample title="Textarea" description="Multi-line text entry.">
        <Textarea
          placeholder="What makes this resource useful?"
          className="max-w-sm"
        />
      </DsExample>

      <DsExample title="Label" description="Accessible form field labels.">
        <div className="flex items-center gap-2">
          <Checkbox id="ds-label-checkbox" defaultChecked />
          <Label htmlFor="ds-label-checkbox">Notify me about new resources</Label>
        </div>
      </DsExample>

      <DsExample
        title="Input Group"
        description="Inputs composed with addons, icons, and buttons."
        contentClassName="flex-col items-stretch"
      >
        <InputGroup className="max-w-sm">
          <InputGroupInput placeholder="Search resources..." />
          <InputGroupAddon>
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="your-resource.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="sm">Verify</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </DsExample>

      <DsExample title="Input OTP" description="One-time passcode entry.">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </DsExample>

      <DsExample title="Checkbox" description="Binary selection control.">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="ds-checkbox-1" defaultChecked />
            <Label htmlFor="ds-checkbox-1">Accept terms</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ds-checkbox-2" disabled />
            <Label htmlFor="ds-checkbox-2">Disabled</Label>
          </div>
        </div>
      </DsExample>

      <DsExample title="Radio Group" description="Single choice from a set of options.">
        <RadioGroup defaultValue="apm" className="gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="apm" id="ds-radio-apm" />
            <Label htmlFor="ds-radio-apm">APM</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="core-pm" id="ds-radio-core" />
            <Label htmlFor="ds-radio-core">Core PM</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="growth-pm" id="ds-radio-growth" />
            <Label htmlFor="ds-radio-growth">Growth PM</Label>
          </div>
        </RadioGroup>
      </DsExample>

      <DsExample title="Switch" description="Toggle a setting on or off.">
        <div className="flex items-center gap-2">
          <Switch id="ds-switch-1" defaultChecked />
          <Label htmlFor="ds-switch-1">Email digest</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="ds-switch-2" size="sm" />
          <Label htmlFor="ds-switch-2">Small size</Label>
        </div>
      </DsExample>

      <DsExample title="Slider" description="Select a value from a range.">
        <Slider defaultValue={[40]} className="max-w-sm" />
      </DsExample>

      <DsExample
        title="Field"
        description="Layout primitives for building forms, including Fieldset, Legend, and error states."
        contentClassName="flex-col items-stretch"
      >
        <FieldSet className="max-w-sm">
          <FieldLegend>Contact preferences</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ds-field-email">Email</FieldLabel>
              <Input id="ds-field-email" type="email" placeholder="you@example.com" />
              <FieldDescription>We only send weekly digests.</FieldDescription>
            </Field>
            <FieldSeparator>or</FieldSeparator>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Push notifications</FieldTitle>
                <FieldDescription>Get notified on your device.</FieldDescription>
              </FieldContent>
              <Switch />
            </Field>
            <Field data-invalid="true">
              <FieldLabel htmlFor="ds-field-invalid">Referral code</FieldLabel>
              <Input id="ds-field-invalid" aria-invalid defaultValue="INVALID" />
              <FieldError>This referral code is not recognized.</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
      </DsExample>
    </>
  )
}

export { FormBasicsSection }
