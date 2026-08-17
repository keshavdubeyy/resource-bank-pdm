"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DsExample } from "@/components/ds/ds-section"

const tracks = ["APM", "Core PM", "Growth PM", "Technical PM"]

const questionnaireItems = [
  {
    name: "track",
    choices: tracks.map((track) => ({ value: track })),
  },
  { name: "start-date" },
]

function FormAdvancedSection() {
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <>
      <DsExample title="Select" description="Choose one option from a popup list.">
        <Select defaultValue="APM">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a track" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tracks</SelectLabel>
              {tracks.map((track) => (
                <SelectItem key={track} value={track}>
                  {track}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </DsExample>

      <DsExample
        title="Native Select"
        description="A styled wrapper around the browser's native <select>."
      >
        <NativeSelect defaultValue="APM">
          {tracks.map((track) => (
            <NativeSelectOption key={track} value={track}>
              {track}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </DsExample>

      <DsExample title="Combobox" description="Searchable select with filtering.">
        <Combobox items={tracks} defaultValue="APM">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-combobox">Track</Label>
            <ComboboxInput
              id="ds-combobox"
              placeholder="Search a track..."
              className="w-56"
            />
          </div>
          <ComboboxContent>
            <ComboboxEmpty>No track found.</ComboboxEmpty>
            <ComboboxList>
              {tracks.map((track) => (
                <ComboboxItem key={track} value={track}>
                  {track}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </DsExample>

      <DsExample title="Calendar" description="Date picker built on react-day-picker.">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-2xl border"
        />
      </DsExample>

      <DsExample
        title="Questionnaire"
        description="A single-step-at-a-time form flow."
        contentClassName="flex-col items-stretch"
      >
        <Questionnaire
          items={questionnaireItems}
          className="max-w-md"
          onSubmit={(event) => event.preventDefault()}
        >
          <QuestionnaireProgress />
          <QuestionnaireItem name="track">
            <QuestionnaireTitle>Which track fits you best?</QuestionnaireTitle>
            <QuestionnaireChoices>
              {tracks.map((track) => (
                <QuestionnaireChoice key={track} value={track}>
                  {track}
                </QuestionnaireChoice>
              ))}
            </QuestionnaireChoices>
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireSkip />
              <QuestionnaireNext />
            </QuestionnaireActions>
          </QuestionnaireItem>
          <QuestionnaireItem name="start-date">
            <QuestionnaireTitle>When do you want to start?</QuestionnaireTitle>
            <QuestionnaireInput placeholder="e.g. Summer 2026" />
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireSkip />
              <QuestionnaireSubmit />
            </QuestionnaireActions>
          </QuestionnaireItem>
        </Questionnaire>
      </DsExample>
    </>
  )
}

export { FormAdvancedSection }
