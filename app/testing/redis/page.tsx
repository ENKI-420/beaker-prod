"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import type { TestResult, TestSuiteResult } from "@/lib/testing/redis-test-utils"

export default function RedisTestingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestSuiteResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState("")
  const [activeTab, setActiveTab] = useState("summary")

  const runTests = async () => {
    try {
      setIsRunning(true)
      setError(null)

      const response = await fetch("/api/testing/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timeout: 120000 }), // 2 minute timeout
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to run tests")
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Redis Test Suite</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Run Redis Tests</CardTitle>
          <CardDescription>Execute a comprehensive test suite for Redis operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Token</label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter API token"
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Running the full test suite may take several minutes and will create temporary test data in Redis.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runTests} disabled={isRunning || !token} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Test Suite"
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

      {results && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Test Results</CardTitle>
              <div className="flex space-x-2">
                <Badge variant={results.failed === 0 ? "success" : "destructive"}>
                  {results.passed}/{results.totalTests} Passed
                </Badge>
                <Badge variant="outline">{(results.duration / 1000).toFixed(2)}s</Badge>
              </div>
            </div>
            <CardDescription>Test run completed at {new Date(results.timestamp).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Test Details</TabsTrigger>
                <TabsTrigger value="json">Raw JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Tests"
                    value={results.totalTests.toString()}
                    icon={<Clock className="h-5 w-5 text-blue-500" />}
                  />
                  <StatCard
                    title="Passed"
                    value={results.passed.toString()}
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                  />
                  <StatCard
                    title="Failed"
                    value={results.failed.toString()}
                    icon={<XCircle className="h-5 w-5 text-red-500" />}
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Test Categories</h3>
                  <div className="space-y-2">
                    {getCategoryStats(results.results).map((category) => (
                      <div key={category.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={category.failed === 0 ? "success" : "destructive"}>
                            {category.passed}/{category.total} Passed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-4">
                  {results.results.map((result, index) => (
                    <TestResultCard key={index} result={result} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="json">
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

function TestResultCard({ result }: { result: TestResult }) {
  return (
    <div
      className={`p-4 rounded-md border ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <h3 className="font-medium">{result.name}</h3>
        </div>
        <Badge variant="outline">{result.duration}ms</Badge>
      </div>

      {!result.success && result.error && <div className="mt-2 text-sm text-red-600">Error: {result.error}</div>}

      {result.details && (
        <div className="mt-2">
          <details>
            <summary className="text-sm font-medium cursor-pointer">Details</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{JSON.stringify(result.details, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

function getCategoryStats(results: TestResult[]) {
  const categories = new Map<string, { total: number; passed: number; failed: number }>()

  results.forEach((result) => {
    // Extract category from test name (e.g., "Connection - Basic connection" -> "Connection")
    const category = result.name.split(" - ")[0]

    if (!categories.has(category)) {
      categories.set(category, { total: 0, passed: 0, failed: 0 })
    }

    const stats = categories.get(category)!
    stats.total++
    if (result.success) {
      stats.passed++
    } else {
      stats.failed++
    }
  })

  return Array.from(categories.entries()).map(([name, stats]) => ({
    name,
    ...stats,
  }))
}
