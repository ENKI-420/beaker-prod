"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { logger } from "@/lib/logging/enhanced-logger"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

/**
 * Global error boundary component to catch and display errors gracefully
 */
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Add global error handler
    const errorHandler = (event: ErrorEvent) => {
      logger.error("Unhandled error caught by ErrorBoundary", {
        message: event.message,
        source: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        stack: event.error?.stack,
      })

      setError(event.error)
      setHasError(true)

      // Prevent default browser error handling
      event.preventDefault()
    }

    // Add global promise rejection handler
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      logger.error("Unhandled promise rejection caught by ErrorBoundary", {
        reason: event.reason,
        stack: event.reason?.stack,
      })

      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
      setHasError(true)

      // Prevent default browser error handling
      event.preventDefault()
    }

    window.addEventListener("error", errorHandler)
    window.addEventListener("unhandledrejection", rejectionHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
      window.removeEventListener("unhandledrejection", rejectionHandler)
    }
  }, [])

  // Reset error state
  const resetError = () => {
    setHasError(false)
    setError(null)
  }

  // If no error, render children
  if (!hasError) {
    return <>{children}</>
  }

  // Render error UI
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>We encountered an unexpected error</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">{error?.message || "An unknown error occurred"}</p>

            {process.env.NODE_ENV === "development" && error?.stack && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Error details (only visible in development):
                </p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to Home
          </Button>
          <Button onClick={resetError} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
