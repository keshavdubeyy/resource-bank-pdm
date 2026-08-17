function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} PDM Resource Hub</p>
        <p>Built by and for placement-driven product managers.</p>
      </div>
    </footer>
  )
}

export { SiteFooter }
