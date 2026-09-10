import remarkParse from 'remark-parse'
import { unified } from 'unified'

export type Resource = {
  id: string
  title: string
  url: string
  description: string
  category: string
  categorySlug: string
  subcategory: string | null
  subcategorySlug: string | null
}

export type Subcategory = {
  name: string
  slug: string
  count: number
}

export type Category = {
  name: string
  slug: string
  count: number
  subcategories: Subcategory[]
}

export type Catalog = {
  title: string
  description: string
  resources: Resource[]
  categories: Category[]
}

type MdNode = {
  type: string
  depth?: number
  value?: string
  url?: string
  children?: MdNode[]
}

const SKIP_HEADINGS = new Set(['contribute'])

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function resourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function matchesQuery(resource: Resource, query: string) {
  if (!query) return true
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [resource.title, resource.description, resource.category, resource.subcategory ?? '', resource.url, resourceHost(resource.url)].join(' ').toLowerCase().includes(q)
}

function textOf(node: MdNode | undefined): string {
  if (!node) return ''
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value ?? ''
  }
  if (node.children?.length) {
    return node.children.map(textOf).join('')
  }
  return ''
}

function firstLink(nodes: MdNode[]): { title: string; url: string } | null {
  for (const node of nodes) {
    if (node.type === 'link' && node.url) {
      return { title: textOf(node).trim(), url: node.url }
    }
    if (node.children) {
      const nested = firstLink(node.children)
      if (nested) return nested
    }
  }
  return null
}

function descriptionAfterLink(nodes: MdNode[]) {
  const idx = nodes.findIndex((node) => node.type === 'link')
  if (idx === -1) return ''
  return textOf({ type: 'paragraph', children: nodes.slice(idx + 1) })
    .replace(/^\s*[-–—:]\s*/, '')
    .trim()
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type CatalogProps = {
  title: string
  description: string
  categories: Category[]
  resources: Array<[string, string, string, string, string, string | null]>
}

export function toCatalogProps(catalog: Catalog): CatalogProps {
  return {
    title: catalog.title,
    description: catalog.description,
    categories: catalog.categories,
    resources: catalog.resources.map((resource) => [resource.id, resource.title, resource.url, resource.description, resource.categorySlug, resource.subcategorySlug])
  }
}

export function fromCatalogProps(props: CatalogProps): Catalog {
  const categoryBySlug = new Map(props.categories.map((category) => [category.slug, category]))

  return {
    title: props.title,
    description: props.description,
    categories: props.categories,
    resources: props.resources.map(([id, title, url, description, categorySlug, subcategorySlug]) => {
      const category = categoryBySlug.get(categorySlug)
      return {
        id,
        title,
        url,
        description,
        category: category?.name ?? categorySlug,
        categorySlug,
        subcategory: category?.subcategories.find((item) => item.slug === subcategorySlug)?.name ?? null,
        subcategorySlug
      }
    })
  }
}

export function parseReadme(markdown: string): Catalog {
  const tree = unified().use(remarkParse).parse(markdown) as MdNode
  const resources: Resource[] = []
  const categoryMap = new Map<string, Category>()

  let title = 'Awesome Web3'
  let description = ''
  let category: string | null = null
  let subcategory: string | null = null
  let started = false

  for (const node of tree.children ?? []) {
    if (node.type === 'heading' && node.depth === 1) {
      title = textOf(node).trim() || title
      continue
    }

    if (!started && (node.type === 'html' || node.type === 'paragraph')) {
      const raw = node.type === 'html' ? stripHtml(node.value ?? '') : textOf(node).trim()
      const text = raw.split(/(?<=\.)\s+/)[0]?.trim() ?? raw
      if (text && !description) description = text
      continue
    }

    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      const name = textOf(node).trim()
      started = true

      if (SKIP_HEADINGS.has(name.toLowerCase())) {
        category = null
        subcategory = null
        continue
      }

      if (node.depth === 2) {
        category = name
        subcategory = null
        if (!categoryMap.has(name)) {
          categoryMap.set(name, {
            name,
            slug: slugify(name),
            count: 0,
            subcategories: []
          })
        }
      } else if (category) {
        subcategory = name
        const current = categoryMap.get(category)
        if (current && !current.subcategories.some((item) => item.name === name)) {
          current.subcategories.push({
            name,
            slug: slugify(name),
            count: 0
          })
        }
      }
      continue
    }

    if (!started || !category || node.type !== 'list') continue

    const current = categoryMap.get(category)
    if (!current) continue

    for (const item of node.children ?? []) {
      const paragraph = item.children?.find((child) => child.type === 'paragraph') ?? item
      const children = paragraph.children ?? []
      const link = firstLink(children)
      if (!link?.title || !link.url || link.url.startsWith('#')) continue

      resources.push({
        id: `${current.slug}:${slugify(link.title)}`,
        title: link.title,
        url: link.url,
        description: descriptionAfterLink(children),
        category: current.name,
        categorySlug: current.slug,
        subcategory,
        subcategorySlug: subcategory ? slugify(subcategory) : null
      })

      current.count += 1
      if (subcategory) {
        const sub = current.subcategories.find((item) => item.name === subcategory)
        if (sub) sub.count += 1
      }
    }
  }

  const seen = new Map<string, number>()
  for (const resource of resources) {
    const next = (seen.get(resource.id) ?? 0) + 1
    seen.set(resource.id, next)
    if (next > 1) resource.id = `${resource.id}-${next}`
  }

  return {
    title,
    description,
    resources,
    categories: Array.from(categoryMap.values()).filter((item) => item.count > 0)
  }
}
