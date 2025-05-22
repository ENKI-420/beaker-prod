"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

/**
 * FHIR Authentication Error Page
 */
export default function FhirAuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  // Get error details from URL parameters
  const error = searchParams.get("error") || "unknown_error"
  const errorDescription = searchParams.get("error_description") || "An unknown error occurred during authentication."

  useEffect(() => {
    // Get the redirect URL from session storage
    const storedRedirectUrl = sessionStorage.getItem("fhir_auth_redirect")
    setRedirectUrl(storedRedirectUrl || "/dashboard")
  }, [])

  const handleRedirect = () => {
    router.push(redirectUrl || "/dashboard")
  }

  const handleRetry = () => {
    router.push("/api/fhir/auth")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Authentication Failed</CardTitle>
          <CardDescription>There was a problem connecting to the Epic FHIR API.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            <h4 className="font-medium text-red-800 dark:text-red-300">{error}</h4>
            <p className="text-sm text-red-700 dark:text-red-300">{errorDescription}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={handleRedirect} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
