"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function RedisVerifyPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runVerification = async () => {
    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/redis-verify")
      const data = await response.json()

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Redis Client Verification</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verify Redis Client</CardTitle>
          <CardDescription>
            Run a comprehensive test suite to verify that the Redis client is working correctly after the syntax fix.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This verification will test connection, set, get, delete, and TTL operations to ensure the Redis client is
              functioning properly.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={runVerification} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Verification...
              </>
            ) : (
              "Run Verification"
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Verification Results</CardTitle>
              <div className="flex items-center space-x-2">
                {result.success ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    <span>Success</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-5 w-5 mr-1" />
                    <span>Failed</span>
                  </div>
                )}
              </div>
            </div>
            <CardDescription>
              Verification completed in {(result.duration / 1000).toFixed(2)} seconds at{" "}
              {new Date(result.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm">
              {result.logs?.map((log: string, index: number) => (
                <div
                  key={index}
                  className={`py-1 ${
                    log.includes("❌") || log.startsWith("ERROR")
                      ? "text-red-600"
                      : log.includes("✅")
                        ? "text-green-600"
                        : ""
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
