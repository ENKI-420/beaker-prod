"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft } from "lucide-react"

/**
 * FHIR Authentication Success Page
 */
export default function FhirAuthSuccessPage() {
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Get the redirect URL from session storage
    const storedRedirectUrl = sessionStorage.getItem("fhir_auth_redirect")
    setRedirectUrl(storedRedirectUrl || "/dashboard")

    // Start countdown for automatic redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(storedRedirectUrl || "/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleRedirect = () => {
    router.push(redirectUrl || "/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Authentication Successful</CardTitle>
          <CardDescription>You have successfully connected to the Epic FHIR API.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>
            You will be automatically redirected in <span className="font-bold">{countdown}</span> seconds.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleRedirect} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue to Application
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
