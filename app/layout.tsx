import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthRefreshProvider } from "@/components/auth/auth-refresh-provider"
import { ClinicalAccessibility } from "@/components/accessibility/clinical-accessibility"

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Metadata for the application
export const metadata: Metadata = {
  title: "Genomic Twin Platform",
  description: "Advanced genomic healthcare platform for personalized medicine",
  keywords: ["genomics", "healthcare", "personalized medicine", "genetic analysis", "clinical genomics", "laboratory"],
  authors: [{ name: "Genomic Twin Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <AuthRefreshProvider>
                <ClinicalAccessibility />
                {children}
              </AuthRefreshProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
