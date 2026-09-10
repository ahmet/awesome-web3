import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Geist } from "next/font/google"
import type { AppProps } from "next/app"

import { TooltipProvider } from "@/components/ui/tooltip"

import "../styles/globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export default function AwesomeWeb3({ Component, pageProps }: AppProps) {
  return (
    <div className={`${geist.variable} h-full antialiased`}>
      <TooltipProvider>
        <Component {...pageProps} />
      </TooltipProvider>
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
