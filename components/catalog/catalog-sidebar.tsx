import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import type { Category } from "@/lib/catalog"

const REPO_URL = "https://github.com/ahmet/awesome-web3"
const CONTRIBUTE_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`
const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`

type CatalogSidebarProps = {
  description: string
  categories: Category[]
  totalCount: number
  activeCategory: string | null
  activeSubcategory: string | null
  onSelect: (categorySlug: string | null, subcategorySlug: string | null) => void
}

export function CatalogSidebar({
  description,
  categories,
  totalCount,
  activeCategory,
  activeSubcategory,
  onSelect,
}: CatalogSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex flex-col gap-1 px-2 py-1.5">
          <span className="font-heading text-sm font-medium">Awesome Web3</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={!activeCategory}
                  onClick={() => onSelect(null, null)}
                >
                  All resources
                </SidebarMenuButton>
                <SidebarMenuBadge>{totalCount}</SidebarMenuBadge>
              </SidebarMenuItem>
              {categories.map((category) => {
                const isActive = activeCategory === category.slug
                return (
                  <SidebarMenuItem key={category.slug}>
                    <SidebarMenuButton
                      isActive={isActive && !activeSubcategory}
                      tooltip={category.name}
                      onClick={() => onSelect(category.slug, null)}
                    >
                      <span>{category.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{category.count}</SidebarMenuBadge>
                    {isActive && category.subcategories.length > 0 ? (
                      <SidebarMenuSub>
                        {category.subcategories.map((subcategory) => (
                          <SidebarMenuSubItem key={subcategory.slug}>
                            <SidebarMenuSubButton
                              size="sm"
                              isActive={activeSubcategory === subcategory.slug}
                              render={<button type="button" />}
                              onClick={() =>
                                onSelect(category.slug, subcategory.slug)
                              }
                            >
                              <span>{subcategory.name}</span>
                              <Badge variant="outline">{subcategory.count}</Badge>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex flex-col gap-2 px-2 py-1">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              nativeButton={false}
              render={<a href={CONTRIBUTE_URL} target="_blank" rel="noopener noreferrer" />}
            >
              Contribute
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              nativeButton={false}
              render={<a href={REPO_URL} target="_blank" rel="noopener noreferrer" />}
            >
              GitHub
            </Button>
          </div>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            From your
            <a
              href={CONTRIBUTORS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              frens
            </a>
            with
            <Image src="/heart.svg" alt="love" width={12} height={12} />
          </p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
