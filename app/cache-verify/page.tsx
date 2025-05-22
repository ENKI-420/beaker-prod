"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function CacheVerifyPage() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastVerified, setLastVerified] = useState(null)

  const runVerification = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/cache/verify")
      const data = await response.json()
      setResults(data)
      setLastVerified(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err.message || "Failed to run verification")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runVerification()
  }, [])

  if (loading && !results) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Cache Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="mb-4">Running cache verification tests...</div>
                <Progress value={80} className="w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !results) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={runVerification}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cache Verification</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Last verified: {lastVerified || "Never"}</span>
          <Button onClick={runVerification} disabled={loading}>
            {loading ? "Verifying..." : "Run Verification"}
          </Button>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Verification Results</span>
                {results.allPassed ? (
                  <Badge className="bg-green-500">All Tests Passed</Badge>
                ) : (
                  <Badge className="bg-red-500">Some Tests Failed</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.tests.map((test, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {test.passed ? (
                        <CheckCircle className="text-green-500 h-5 w-5" />
                      ) : (
                        <XCircle className="text-red-500 h-5 w-5" />
                      )}
                      <h3 className="font-medium">{test.name}</h3>
                    </div>
                    {test.details && (
                      <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(test.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="instructions">
            <TabsList>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="raw">Raw Results</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">What This Verifies</h3>
                      <p>This verification process tests the following aspects of the in-memory cache:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Basic set and get operations</li>
                        <li>Delete operations</li>
                        <li>Cache statistics functionality</li>
                        <li>TTL (time-to-live) setup</li>
                        <li>Cleanup of expired items</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">For More Thorough Testing</h3>
                      <p>
                        For a more comprehensive verification including TTL expiration tests, run the verification
                        script:
                      </p>
                      <div className="bg-gray-100 p-2 rounded mt-2">
                        <code>npx ts-node scripts/verify-cache.ts</code>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        The script includes tests that wait for TTL expiration, which cannot be done in an API request.
                      </p>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                        If all tests pass, the in-memory cache is working correctly after the syntax fix.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Raw Verification Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
