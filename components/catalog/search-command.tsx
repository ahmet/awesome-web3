'use client'

import { ExternalLinkIcon } from 'lucide-react'
import * as React from 'react'

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { matchesQuery, type Resource, resourceHost } from '@/lib/catalog'

type SearchCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  resources: Resource[]
}

export function SearchCommand({ open, onOpenChange, resources }: SearchCommandProps) {
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const filtered = React.useMemo(() => resources.filter((resource) => matchesQuery(resource, query)), [resources, query])

  const groups = new Map<string, Resource[]>()
  for (const resource of filtered) {
    const list = groups.get(resource.category) ?? []
    list.push(resource)
    groups.set(resource.category, list)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false} title="Search resources" description="Find a Web3 resource from the curated list.">
      <CommandInput placeholder="Search resources..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No resources found.</CommandEmpty>
        {Array.from(groups.entries()).map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((resource) => (
              <CommandItem
                key={resource.id}
                value={resource.id}
                onSelect={() => {
                  window.open(resource.url, '_blank', 'noopener,noreferrer')
                  onOpenChange(false)
                }}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate">{resource.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {resource.subcategory ? `${resource.subcategory} · ${resourceHost(resource.url)}` : resourceHost(resource.url)}
                  </span>
                </div>
                <ExternalLinkIcon />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
