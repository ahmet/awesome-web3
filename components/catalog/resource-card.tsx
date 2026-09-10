import { ExternalLinkIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type Resource, resourceHost } from '@/lib/catalog'

type ResourceCardProps = {
  resource: Resource
  onFilter: (categorySlug: string, subcategorySlug: string | null) => void
}

export function ResourceCard({ resource, onFilter }: ResourceCardProps) {
  return (
    <Card size="sm" className="h-full">
      <CardHeader className="flex-1">
        <CardTitle className="min-h-[2lh] min-w-0">
          <a href={resource.url} target="_blank" rel="nofollow noopener noreferrer" className="line-clamp-2 outline-none hover:underline focus-visible:underline">
            {resource.title}
          </a>
        </CardTitle>
        <CardAction>
          <a
            href={resource.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            aria-label={`Open ${resource.title}`}
            className="text-muted-foreground outline-none hover:text-foreground"
          >
            <ExternalLinkIcon />
          </a>
        </CardAction>
        <CardDescription className="line-clamp-3 min-h-[3lh]">{resource.description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto min-h-10 shrink-0 justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
          <Badge variant="secondary" render={<button type="button" onClick={() => onFilter(resource.categorySlug, null)} />}>
            {resource.category}
          </Badge>
          {resource.subcategory && resource.subcategorySlug ? (
            <Badge variant="outline" render={<button type="button" onClick={() => onFilter(resource.categorySlug, resource.subcategorySlug)} />}>
              {resource.subcategory}
            </Badge>
          ) : null}
        </div>
        <span className="max-w-28 shrink-0 truncate text-xs text-muted-foreground">{resourceHost(resource.url)}</span>
      </CardFooter>
    </Card>
  )
}
