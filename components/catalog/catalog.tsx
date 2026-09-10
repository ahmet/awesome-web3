"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"

import { CatalogSidebar } from "@/components/catalog/catalog-sidebar"
import { ResourceCard } from "@/components/catalog/resource-card"
import { SearchCommand } from "@/components/catalog/search-command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { matchesQuery, type Catalog } from "@/lib/catalog"

const REPO_URL = "https://github.com/ahmet/awesome-web3"

type Filters = {
  q: string
  category: string | null
  sub: string | null
}

const EMPTY_FILTERS: Filters = { q: "", category: null, sub: null }

function readFiltersFromUrl(): Filters {
  const params = new URLSearchParams(window.location.search)
  return {
    q: params.get("q") ?? "",
    category: params.get("category"),
    sub: params.get("sub"),
  }
}

function writeFiltersToUrl(filters: Filters) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.category) params.set("category", filters.category)
  if (filters.sub) params.set("sub", filters.sub)
  const query = params.toString()
  const next = query ? `?${query}` : window.location.pathname
  window.history.replaceState(null, "", next)
}

export function CatalogApp({ catalog }: { catalog: Catalog }) {
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
  const [hydrated, setHydrated] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  React.useEffect(() => {
    setFilters(readFiltersFromUrl())
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    writeFiltersToUrl(filters)
  }, [filters, hydrated])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandOpen((open) => !open)
        return
      }

      if (event.key === "/" && !typing) {
        event.preventDefault()
        document.getElementById("catalog-search")?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const searched = React.useMemo(
    () => catalog.resources.filter((resource) => matchesQuery(resource, filters.q)),
    [catalog.resources, filters.q]
  )

  const visible = React.useMemo(
    () =>
      searched.filter((resource) => {
        if (filters.category && resource.categorySlug !== filters.category) {
          return false
        }
        if (filters.sub && resource.subcategorySlug !== filters.sub) {
          return false
        }
        return true
      }),
    [searched, filters.category, filters.sub]
  )

  const sidebarCategories = React.useMemo(
    () =>
      catalog.categories
        .map((category) => {
          const resources = searched.filter(
            (resource) => resource.categorySlug === category.slug
          )
          return {
            ...category,
            count: resources.length,
            subcategories: category.subcategories
              .map((subcategory) => ({
                ...subcategory,
                count: resources.filter(
                  (resource) => resource.subcategorySlug === subcategory.slug
                ).length,
              }))
              .filter((subcategory) => subcategory.count > 0),
          }
        })
        .filter((category) => category.count > 0),
    [catalog.categories, searched]
  )

  const activeCategory = catalog.categories.find(
    (category) => category.slug === filters.category
  )
  const activeSubcategory = activeCategory?.subcategories.find(
    (subcategory) => subcategory.slug === filters.sub
  )
  const hasFilters = Boolean(filters.q || filters.category)

  const setFilter = (next: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...next }))
  }

  const heading = activeSubcategory?.name ?? activeCategory?.name ?? "All resources"

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
    >
      <CatalogSidebar
        description={catalog.description}
        categories={sidebarCategories}
        totalCount={searched.length}
        activeCategory={filters.category}
        activeSubcategory={filters.sub}
        onSelect={(category, sub) => setFilter({ category, sub })}
      />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex shrink-0 flex-col gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <InputGroup className="max-w-xl flex-1">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="catalog-search"
                value={filters.q}
                onChange={(event) => setFilter({ q: event.target.value })}
                placeholder="Filter libraries, tools, tutorials..."
                aria-label="Filter resources"
              />
              <InputGroupAddon align="inline-end">
                {filters.q ? (
                  <InputGroupButton
                    aria-label="Clear search"
                    onClick={() => setFilter({ q: "" })}
                  >
                    <XIcon />
                  </InputGroupButton>
                ) : (
                  <Kbd>⌘K</Kbd>
                )}
              </InputGroupAddon>
            </InputGroup>
            <Button
              variant="outline"
              className="shrink-0"
              nativeButton={false}
              render={
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" />
              }
            >
              GitHub
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{visible.length}</span>
              {visible.length === 1 ? " resource" : " resources"}
              {heading !== "All resources" ? ` in ${heading}` : ""}
            </p>
            {filters.q ? (
              <Badge
                variant="secondary"
                render={
                  <button
                    type="button"
                    aria-label={`Clear search ${filters.q}`}
                    onClick={() => setFilter({ q: "" })}
                  />
                }
              >
                Search: {filters.q}
                <XIcon data-icon="inline-end" />
              </Badge>
            ) : null}
            {activeCategory ? (
              <Badge
                variant="secondary"
                render={
                  <button
                    type="button"
                    aria-label={`Clear category ${activeCategory.name}`}
                    onClick={() => setFilter({ category: null, sub: null })}
                  />
                }
              >
                {activeCategory.name}
                <XIcon data-icon="inline-end" />
              </Badge>
            ) : null}
            {activeSubcategory ? (
              <Badge
                variant="outline"
                render={
                  <button
                    type="button"
                    aria-label={`Clear subcategory ${activeSubcategory.name}`}
                    onClick={() => setFilter({ sub: null })}
                  />
                }
              >
                {activeSubcategory.name}
                <XIcon data-icon="inline-end" />
              </Badge>
            ) : null}
            {hasFilters ? (
              <Button variant="ghost" size="xs" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear filters
              </Button>
            ) : null}
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visible.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onFilter={(category, sub) => setFilter({ category, sub })}
                />
              ))}
            </div>
          ) : (
            <Empty className="h-full border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchIcon />
                </EmptyMedia>
                <EmptyTitle>No resources found</EmptyTitle>
                <EmptyDescription>
                  Try a different search or choose another category from the
                  sidebar.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Reset filters
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </SidebarInset>
      <SearchCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        resources={catalog.resources}
      />
    </SidebarProvider>
  )
}
