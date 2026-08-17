import { cn } from "@/lib/utils"

const dsSections = [
  { id: "buttons-actions", label: "Buttons & Actions" },
  { id: "form-controls", label: "Form Controls" },
  { id: "overlays-dialogs", label: "Overlays & Dialogs" },
  { id: "navigation", label: "Navigation" },
  { id: "data-display", label: "Data Display" },
  { id: "media-charts", label: "Media & Charts" },
  { id: "chat-messaging", label: "Chat & Messaging" },
  { id: "feedback-status", label: "Feedback & Status" },
  { id: "layout", label: "Layout" },
] as const

function DsNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Design system sections" className={cn(className)}>
      <ul className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
        {dsSections.map((section) => (
          <li key={section.id} className="lg:w-full">
            <a
              href={`#${section.id}`}
              className="block rounded-xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { DsNav, dsSections }
