import 'tailwindcss/tailwind.css'
import { Analytics } from '@vercel/analytics/react'

function AwesomeWeb3({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}

export default AwesomeWeb3
