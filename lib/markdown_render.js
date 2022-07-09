import { join } from 'path'
import { readFileSync } from 'fs'
import { remark } from 'remark'
import matter from 'gray-matter'
import html from 'remark-html'

const renderReadme = async (locale = '') => {
  const readmePath = join(locale, 'README.md')
  const fileContents = readFileSync(readmePath, 'utf8')
  const matterResult = matter(fileContents)
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()
  return {
    locale,
    html: contentHtml,
    ...matterResult.data
  }
}

export default renderReadme
