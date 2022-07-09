import { readFileSync } from 'fs'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import renderHTML from 'react-render-html'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home({ content }) {
  return (
    <>
      <Head>
        <title>Awesome Web3 - Curated list of Web3 resources, libraries, tools and more</title>
        <meta name="title" content="Awesome Web3 - Curated list of Web3 resources, libraries, tools and more" />
        <meta name="description" content="Curated list of Web3 resources: videos, tutorials, books, libraries, tools, boilerplates, and more." />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Awesome Web3" />
        <meta property="og:site_name" content="Awesome Web3" />
        <meta property="og:url" content="https://awesome-web3.com" />
        <meta property="og:description" content="Curated list of Web3 resources: videos, tutorials, books, libraries, tools, boilerplates, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://awesome-web3.com/opengraph_cover.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@ahmetaygun" />
        <meta name="twitter:title" content="Awesome Web3" />
        <meta name="twitter:description" content="Curated list of Web3 resources: videos, tutorials, books, libraries, tools, boilerplates, and more." />
        <meta name="twitter:image" content="https://awesome-web3.com/opengraph_cover.png" />
      </Head>

      <div className='absolute top-0 right-0'>
        <Link href="https://github.com/ahmet/awesome-web3/fork?utm_source=awesome-web3.com&utm_medium=fork_me_banner" passHref>
          <a>
            <Image
              src="/forkme_right_darkblue.png"
              width={149}
              height={149}
              alt="Fork Awesome Web3 on GitHub"
              loading='lazy'
              className='attachment-full size-full'
            />
          </a>
        </Link>
      </div>
      <main className="mx-4 my-12 lg:mx-0 flex flex-row justify-center">
        <article className='prose prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-a:text-nowrap prose-a:font-mono prose-headings:text-gray prose-headings:my-0 prose-h2:mb-2 prose-h1:text-center prose-li:my-0'>
          {renderHTML(content)}
        </article>
      </main>

      <footer className="flex flex-row justify-center mb-4">
        From your
        <Link href='https://github.com/ahmet/awesome-web3/graphs/contributors?utm_source=awesome-web3.com&utm_medium=footer' passHref>
          <a target="_blank" rel="noopener" className='mx-1 text-blue-700 no-underline hover:underline text-nowrap'>frens</a>
        </Link>
        with
        <span className='ml-1 mt-0.5'>
          <Image src="/heart.svg" alt="love" width={16} height={16} />
        </span>
      </footer>
    </>
  )
}

export async function getStaticProps({ params }) {
  let readmePath = 'README.md'
  if (params?.locale && params.locale !== 'en') {
    readmePath = join('locales', params.locale, 'README.md')
  }

  const readmeFile = readFileSync(readmePath).toString()
  const content = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks, { target: '_blank', rel: ['nofollow', 'noopener'] })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(readmeFile)

  return {
    props: {
      content: content.toString()
    }
  }
}
