import Head from 'next/head'
import Image from 'next/image'
import renderReadme from '../lib/markdown_render'
import styles from '../styles/Home.module.css'

export default function Home({ renderedContent }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Awesome Web3 - Curated list of Web3 resources</title>
        <meta name="description" content="Curated list of Web3 resources" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div dangerouslySetInnerHTML={{ __html: renderedContent.html }} />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export async function getStaticProps({ params }) {
  const renderedContent = await renderReadme()

  return {
    props: {
      renderedContent
    }
  }
}
