"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function CacheStatusPage() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/cache/status")
      const data = await response.json()
      setStatus(data)
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch cache status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !status) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="mb-4">Loading cache status...</div>
                <Progress value={80} className="w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !status) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchStatus}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cache Status Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Last updated: {lastUpdated || "Never"}</span>
          <Button onClick={fetchStatus} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status?.status === "healthy" ? (
                <span className="text-green-500">Healthy</span>
              ) : (
                <span className="text-red-500">Error</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Cache implementation: {status?.type}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.rawCache?.size || 0} items</div>
            <p className="text-xs text-gray-500 mt-1">{status?.rawCache?.expiringKeys || 0} items with expiration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(status?.genomicCache?.hitRatio * 100 || 0).toFixed(1)}% hit rate</div>
            <p className="text-xs text-gray-500 mt-1">
              {status?.genomicCache?.hits || 0} hits, {status?.genomicCache?.misses || 0} misses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Cache Status</h3>
                  <p>The in-memory cache is currently active and {status?.status}.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last cleaned up: {status?.cleanedExpiredKeys || 0} expired keys
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Cache Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Raw Cache</p>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>Total Items: {status?.rawCache?.size || 0}</li>
                        <li>Expiring Items: {status?.rawCache?.expiringKeys || 0}</li>
                        <li>Timestamp: {status?.rawCache?.timestamp}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Genomic Cache</p>
                      <ul className="text-sm mt-1 space-y-1">
                        <li>Hits: {status?.genomicCache?.hits || 0}</li>
                        <li>Misses: {status?.genomicCache?.misses || 0}</li>
                        <li>Errors: {status?.genomicCache?.errors || 0}</li>
                        <li>Hit Ratio: {((status?.genomicCache?.hitRatio || 0) * 100).toFixed(1)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Raw Data</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You can test cache operations using the Redis Test API at <code>/api/redis-test</code>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Example Operations</h3>
                  <ul className="text-sm space-y-2">
                    <li>
                      <code className="bg-gray-100 p-1 rounded">GET /api/redis-test?operation=status</code>
                      <p className="text-xs text-gray-500 mt-1">Check cache status</p>
                    </li>
                    <li>
                      <code className="bg-gray-100 p-1 rounded">
                        GET /api/redis-test?operation=set&key=test&value=123
                      </code>
                      <p className="text-xs text-gray-500 mt-1">Set a cache value</p>
                    </li>
                    <li>
                      <code className="bg-gray-100 p-1 rounded">GET /api/redis-test?operation=get&key=test</code>
                      <p className="text-xs text-gray-500 mt-1">Get a cache value</p>
                    </li>
                    <li>
                      <code className="bg-gray-100 p-1 rounded">GET /api/redis-test?operation=del&key=test</code>
                      <p className="text-xs text-gray-500 mt-1">Delete a cache value</p>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">TTL Example</h3>
                  <code className="bg-gray-100 p-1 rounded block mb-2">
                    GET /api/redis-test?operation=set&key=expiring&value=test&ttl=60
                  </code>
                  <p className="text-xs text-gray-500">This sets a cache value that expires after 60 seconds.</p>

                  <h3 className="font-medium mt-4 mb-2">TTL Test</h3>
                  <code className="bg-gray-100 p-1 rounded block mb-2">GET /api/redis-test?operation=ttl-test</code>
                  <p className="text-xs text-gray-500">
                    This runs a test that sets a value with a 10-second TTL and checks it at different times.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
