import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sol Kaffé - Premium Coffee Experience",
  description: "Experience the finest coffee at Sol Kaffé. Order online for pickup or delivery.",
  keywords: ["coffee", "cafe", "espresso", "latte", "cappuccino", "sol kaffe"],
  authors: [{ name: "Sol Kaffé Team" }],
  creator: "Sol Kaffé",
  publisher: "Sol Kaffé",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sol-kaffe.vercel.app"),
  openGraph: {
    title: "Sol Kaffé - Premium Coffee Experience",
    description: "Experience the finest coffee at Sol Kaffé. Order online for pickup or delivery.",
    url: "https://sol-kaffe.vercel.app",
    siteName: "Sol Kaffé",
    images: [
      {
        url: "/sol-kaffe-logo.png",
        width: 1200,
        height: 630,
        alt: "Sol Kaffé Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sol Kaffé - Premium Coffee Experience",
    description: "Experience the finest coffee at Sol Kaffé. Order online for pickup or delivery.",
    images: ["/sol-kaffe-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
