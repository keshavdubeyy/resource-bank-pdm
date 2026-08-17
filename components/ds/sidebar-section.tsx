"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DsExample } from "@/components/ds/ds-section"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen01Icon,
  Home01Icon,
  PlusSignIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

function SidebarSection() {
  return (
    <DsExample
      title="Sidebar"
      description="A composable application sidebar, shown pinned open in a contained box since it normally spans the full app shell."
      contentClassName="p-0"
    >
      <div className="h-[26rem] w-full overflow-hidden rounded-2xl border">
        <SidebarProvider className="h-full min-h-0">
          <Sidebar collapsible="none" className="border-r">
            <SidebarHeader>
              <p className="px-2 pt-1 text-sm font-semibold">
                PDM Resource Hub
              </p>
              <SidebarInput placeholder="Search..." />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigate</SidebarGroupLabel>
                <SidebarGroupAction title="Add shortcut">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                </SidebarGroupAction>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
                        <span>Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} />
                        <span>Resources</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>12</SidebarMenuBadge>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Case guides
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#">
                            Templates
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                        <span>Settings</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction title="Open settings">
                        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
            </SidebarContent>
            <SidebarFooter>
              <p className="px-2 text-xs text-muted-foreground">v0.0.1</p>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-1 items-center gap-2 p-4">
            <SidebarTrigger />
            <p className="text-sm text-muted-foreground">Main content area</p>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </DsExample>
  )
}

export { SidebarSection }
