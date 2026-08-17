import type { Metadata } from "next"

import { PageHeader } from "@/components/shared/page-header"
import { ButtonsSection } from "@/components/ds/buttons-section"
import { ChatSection } from "@/components/ds/chat-section"
import { DataDisplaySection } from "@/components/ds/data-display-section"
import { DsNav } from "@/components/ds/ds-nav"
import { DsSection } from "@/components/ds/ds-section"
import { FeedbackSection } from "@/components/ds/feedback-section"
import { FormAdvancedSection } from "@/components/ds/form-advanced-section"
import { FormBasicsSection } from "@/components/ds/form-basics-section"
import { LayoutSection } from "@/components/ds/layout-section"
import { MediaSection } from "@/components/ds/media-section"
import { NavigationSection } from "@/components/ds/navigation-section"
import { OverlaysSection } from "@/components/ds/overlays-section"
import { SidebarSection } from "@/components/ds/sidebar-section"

export const metadata: Metadata = {
  title: "Design System | PDM Resource Hub",
  description:
    "A living reference of every shadcn/ui component installed in this project.",
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="Design System"
        description="A living reference of every shadcn/ui component installed in this project, grouped by purpose."
      />

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-12">
        <div className="rounded-2xl border p-3 lg:sticky lg:top-20">
          <p className="px-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Jump to section
          </p>
          <DsNav />
        </div>

        <div className="flex min-w-0 flex-col gap-16">
          <DsSection
            id="buttons-actions"
            title="Buttons & Actions"
            description="Primary interaction elements: buttons, button groups, toggles, badges, and keyboard hints."
          >
            <ButtonsSection />
          </DsSection>

          <DsSection
            id="form-controls"
            title="Form Controls"
            description="Inputs, selection controls, and layout primitives for building forms."
          >
            <FormBasicsSection />
            <FormAdvancedSection />
          </DsSection>

          <DsSection
            id="overlays-dialogs"
            title="Overlays & Dialogs"
            description="Modals, panels, menus, and other surfaces layered above the page."
          >
            <OverlaysSection />
          </DsSection>

          <DsSection
            id="navigation"
            title="Navigation"
            description="Wayfinding components for moving around the app."
          >
            <NavigationSection />
            <SidebarSection />
          </DsSection>

          <DsSection
            id="data-display"
            title="Data Display"
            description="Cards, tables, lists, and other ways of presenting structured content."
          >
            <DataDisplaySection />
          </DsSection>

          <DsSection
            id="media-charts"
            title="Media & Charts"
            description="Charts, carousels, and scrollable or resizable containers."
          >
            <MediaSection />
          </DsSection>

          <DsSection
            id="chat-messaging"
            title="Chat & Messaging"
            description="Building blocks for chat-style conversations and message logs."
          >
            <ChatSection />
          </DsSection>

          <DsSection
            id="feedback-status"
            title="Feedback & Status"
            description="Alerts, progress, loading states, and toast notifications."
          >
            <FeedbackSection />
          </DsSection>

          <DsSection
            id="layout"
            title="Layout"
            description="Structural primitives for spacing and directionality."
          >
            <LayoutSection />
          </DsSection>
        </div>
      </div>
    </div>
  )
}
