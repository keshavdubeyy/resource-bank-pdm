"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DsExample } from "@/components/ds/ds-section"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  Delete02Icon,
  Search01Icon,
  Settings01Icon,
  SmileIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

function OverlaysSection() {
  const [commandOpen, setCommandOpen] = React.useState(false)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <DsExample title="Dialog" description="A modal window layered above the page.">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Open dialog
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save resource</DialogTitle>
              <DialogDescription>
                This will add the resource to your personal bank.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DsExample>

      <DsExample
        title="Alert Dialog"
        description="An interruptive dialog that requires a decision."
      >
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            Delete resource
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the
                resource from the bank.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DsExample>

      <DsExample title="Sheet" description="A panel that slides in from the viewport edge.">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            Open sheet
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Filter resources</SheetTitle>
              <SheetDescription>
                Narrow results by track and format.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose render={<Button variant="outline" />}>
                Close
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </DsExample>

      <DsExample title="Drawer" description="A bottom sheet with swipe support.">
        <Drawer>
          <DrawerTrigger render={<Button variant="outline" />}>
            Open drawer
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick actions</DrawerTitle>
              <DrawerDescription>Manage this resource.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Share</Button>
              <DrawerClose render={<Button variant="outline" />}>
                Close
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DsExample>

      <DsExample title="Popover" description="A non-modal surface anchored to a trigger.">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            Open popover
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Reminder</PopoverTitle>
              <PopoverDescription>
                Set a reminder to revisit this resource before your interview.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </DsExample>

      <DsExample
        title="Hover Card"
        description="A preview surface revealed on hover or focus."
      >
        <HoverCard>
          <HoverCardTrigger
            render={<Button variant="link" className="px-0" />}
          >
            @pdm-resource-hub
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">PDM Resource Hub</p>
              <p className="text-sm text-muted-foreground">
                A curated resource hub for aspiring product managers.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </DsExample>

      <DsExample title="Dropdown Menu" description="A menu of actions or options.">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Options
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Resource</DropdownMenuLabel>
            <DropdownMenuItem>
              Edit
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to track</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>APM</DropdownMenuItem>
                <DropdownMenuItem>Core PM</DropdownMenuItem>
                <DropdownMenuItem>Growth PM</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem defaultChecked>
              Featured
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup defaultValue="grid">
              <DropdownMenuRadioItem value="grid">
                Grid view
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="list">
                List view
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DsExample>

      <DsExample
        title="Context Menu"
        description="A menu triggered by a right click."
      >
        <ContextMenu>
          <ContextMenuTrigger className="flex h-24 w-56 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuItem>
              Bookmark
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Share</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem defaultChecked>
              Show preview
            </ContextMenuCheckboxItem>
            <ContextMenuRadioGroup defaultValue="grid">
              <ContextMenuRadioItem value="grid">
                Grid view
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="list">
                List view
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      </DsExample>

      <DsExample
        title="Menubar"
        description="A horizontal set of always-visible menus."
      >
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New resource
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>Open...</MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Export</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>PDF</MenubarItem>
                  <MenubarItem>Markdown</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem defaultChecked>
                Show sidebar
              </MenubarCheckboxItem>
              <MenubarRadioGroup defaultValue="grid">
                <MenubarRadioItem value="grid">Grid</MenubarRadioItem>
                <MenubarRadioItem value="list">List</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </DsExample>

      <DsExample
        title="Command"
        description="A searchable command list, inline or as a dialog."
        contentClassName="flex-col items-stretch gap-4"
      >
        <Command className="max-w-sm rounded-2xl border shadow-none">
          <CommandInput placeholder="Search resources..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
                Interview prep calendar
              </CommandItem>
              <CommandItem>
                <HugeiconsIcon icon={SmileIcon} strokeWidth={2} />
                APM case guide
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                Profile
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                Preferences
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>

        <Button variant="outline" onClick={() => setCommandOpen(true)}>
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} data-icon="inline-start" />
          Open command dialog
        </Button>
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput placeholder="Type a command..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => setCommandOpen(false)}>
                Resources
              </CommandItem>
              <CommandItem onSelect={() => setCommandOpen(false)}>
                Interview Prep
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </DsExample>

      <DsExample title="Tooltip" description="A short hint shown on hover or focus.">
        <Tooltip>
          <TooltipTrigger
            render={<Button variant="outline" size="icon-lg" aria-label="Settings" />}
          >
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </DsExample>
    </>
  )
}

export { OverlaysSection }
