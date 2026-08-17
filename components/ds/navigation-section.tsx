"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DsExample } from "@/components/ds/ds-section"

function NavigationSection() {
  return (
    <>
      <DsExample title="Breadcrumb" description="Shows the current page's location.">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resources">Resources</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/tracks/apm">APM</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Case Interview Guide</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </DsExample>

      <DsExample title="Pagination" description="Navigate between pages of results.">
        <Pagination className="mx-0 w-fit justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </DsExample>

      <DsExample
        title="Tabs"
        description="Switch between related views."
        contentClassName="flex-col items-stretch"
      >
        <Tabs defaultValue="overview" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-3 text-muted-foreground">
            A high-level summary of what this track covers.
          </TabsContent>
          <TabsContent value="curriculum" className="pt-3 text-muted-foreground">
            Week-by-week breakdown of topics and exercises.
          </TabsContent>
          <TabsContent value="reviews" className="pt-3 text-muted-foreground">
            Feedback from other candidates who used this track.
          </TabsContent>
        </Tabs>
      </DsExample>

      <DsExample
        title="Navigation Menu"
        description="A set of links with rich dropdown content."
      >
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-1 sm:w-64">
                  <li>
                    <NavigationMenuLink href="/tracks/apm">
                      APM interview guide
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="/tracks/growth-pm">
                      Growth PM interview guide
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="/interview-prep">
                      Interview prep hub
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/resources"
                className={navigationMenuTriggerStyle()}
              >
                Resources
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </DsExample>
    </>
  )
}

export { NavigationSection }
