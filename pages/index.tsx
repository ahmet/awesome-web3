import { readFileSync } from "fs"
import { join } from "path"
import Head from "next/head"

import { CatalogApp } from "@/components/catalog/catalog"
import {
  fromCatalogProps,
  parseReadme,
  toCatalogProps,
  type CatalogProps,
} from "@/lib/catalog"

const TITLE = "Awesome Web3 - Curated list of Web3 resources, libraries, tools and more"
const DESCRIPTION =
  "Curated list of Web3 resources: videos, tutorials, books, libraries, tools, boilerplates, and more."

export default function Home({ catalog }: { catalog: CatalogProps }) {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="title" content={TITLE} />
        <meta name="description" content={DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Awesome Web3" />
        <meta property="og:site_name" content="Awesome Web3" />
        <meta property="og:url" content="https://awesome-web3.com" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://awesome-web3.com/opengraph_cover.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@ahmetaygun" />
        <meta name="twitter:title" content="Awesome Web3" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="https://awesome-web3.com/opengraph_cover.png" />
      </Head>
      <CatalogApp catalog={fromCatalogProps(catalog)} />
    </>
  )
}

export function getStaticProps() {
  const markdown = readFileSync(join(process.cwd(), "README.md"), "utf8")

  return {
    props: {
      catalog: toCatalogProps(parseReadme(markdown)),
    },
  }
}
