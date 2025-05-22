"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function VerifyDeploymentPage() {
  const [verificationResults, setVerificationResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [overallStatus, setOverallStatus] = useState<"success" | "error" | "pending">("pending")

  const runVerification = async () => {
    setLoading(true)
    setOverallStatus("pending")

    try {
      // Test 1: Check if the application is running
      const appCheck = {
        name: "Application Running",
        status: "success",
        details: "The application is running correctly",
      }

      // Test 2: Check if the cache API is working
      let cacheApiCheck
      try {
        const cacheResponse = await fetch("/api/redis-test?operation=status")
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json()
          cacheApiCheck = {
            name: "Cache API",
            status: "success",
            details: `Cache API responded with status: ${cacheData.status}, type: ${cacheData.type}`,
          }
        } else {
          cacheApiCheck = {
            name: "Cache API",
            status: "error",
            details: `Cache API returned status code: ${cacheResponse.status}`,
          }
        }
      } catch (error) {
        cacheApiCheck = {
          name: "Cache API",
          status: "error",
          details: `Failed to connect to Cache API: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

      // Test 3: Test basic cache operations
      let cacheOperationsCheck
      try {
        // Set a test value
        const testKey = `test-key-${Date.now()}`
        const testValue = `test-value-${Date.now()}`

        const setResponse = await fetch(`/api/redis-test?operation=set&key=${testKey}&value=${testValue}`)
        const setData = await setResponse.json()

        // Get the test value
        const getResponse = await fetch(`/api/redis-test?operation=get&key=${testKey}`)
        const getData = await getResponse.json()

        // Delete the test value
        const delResponse = await fetch(`/api/redis-test?operation=del&key=${testKey}`)
        const delData = await delResponse.json()

        const setSuccess = setData.success === true
        const getSuccess = getData.value === testValue
        const delSuccess = delData.success === true

        if (setSuccess && getSuccess && delSuccess) {
          cacheOperationsCheck = {
            name: "Cache Operations",
            status: "success",
            details: "Set, Get, and Delete operations working correctly",
          }
        } else {
          cacheOperationsCheck = {
            name: "Cache Operations",
            status: "error",
            details: `Cache operations failed: Set=${setSuccess}, Get=${getSuccess}, Delete=${delSuccess}`,
          }
        }
      } catch (error) {
        cacheOperationsCheck = {
          name: "Cache Operations",
          status: "error",
          details: `Failed to test cache operations: ${error instanceof Error ? error.message : String(error)}`,
        }
      }

      // Collect all results
      const results = {
        appCheck,
        cacheApiCheck,
        cacheOperationsCheck,
        timestamp: new Date().toISOString(),
      }

      setVerificationResults(results)

      // Determine overall status
      const hasErrors = [appCheck, cacheApiCheck, cacheOperationsCheck].some((check) => check.status === "error")
      setOverallStatus(hasErrors ? "error" : "success")
    } catch (error) {
      console.error("Verification failed:", error)
      setOverallStatus("error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runVerification()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Deployment Verification</h1>

      <Alert
        className={`mb-6 ${
          overallStatus === "success"
            ? "bg-green-50 border-green-200"
            : overallStatus === "error"
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <AlertCircle
          className={`h-4 w-4 ${
            overallStatus === "success"
              ? "text-green-500"
              : overallStatus === "error"
                ? "text-red-500"
                : "text-yellow-500"
          }`}
        />
        <AlertTitle className="font-bold">
          {overallStatus === "success"
            ? "Deployment Successful"
            : overallStatus === "error"
              ? "Deployment Issues Detected"
              : "Verifying Deployment"}
        </AlertTitle>
        <AlertDescription>
          {overallStatus === "success"
            ? "All verification checks passed successfully."
            : overallStatus === "error"
              ? "Some verification checks failed. See details below."
              : "Running verification checks..."}
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verification Results</CardTitle>
          <CardDescription>Results of deployment verification checks</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(verificationResults)
                .filter(([key]) => key !== "timestamp")
                .map(([key, check]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      {check.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <h3 className="font-medium">{check.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{check.details}</p>
                  </div>
                ))}

              <div className="text-sm text-gray-500 mt-4">Last verified: {verificationResults.timestamp}</div>
            </div>
          )}

          <Button onClick={runVerification} className="mt-6" disabled={loading}>
            {loading ? "Verifying..." : "Run Verification Again"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Check application logs for any errors</li>
            <li>Verify other application features are working correctly</li>
            <li>Consider implementing a more robust caching solution if needed</li>
            <li>Monitor application performance and memory usage</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
