"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"

export default function RedisTestPage() {
  const [activeTab, setActiveTab] = useState("status")
  const [key, setKey] = useState("test-key")
  const [value, setValue] = useState(`test-value-${Date.now()}`)
  const [ttl, setTtl] = useState("60")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")

  // Check connection status on page load
  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/redis-test?operation=status`)
      const data = await response.json()

      if (data.status === "connected") {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("error")
      }

      setResult(data)
    } catch (err) {
      setConnectionStatus("error")
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleOperation = async (operation: string) => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/redis-test?operation=${operation}`

      if (operation !== "status") {
        url += `&key=${encodeURIComponent(key)}`
      }

      if (operation === "set" || operation === "ttl-test") {
        url += `&value=${encodeURIComponent(value)}`
      }

      if (operation === "set" && ttl) {
        url += `&ttl=${encodeURIComponent(ttl)}`
      }

      const response = await fetch(url)
      const data = await response.json()

      setResult(data)

      if (operation === "status" && data.status === "connected") {
        setConnectionStatus("connected")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Redis Connection and Data Persistence Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Current Redis connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <StatusIndicator status={connectionStatus} loading={loading} />
                <span className="font-medium">
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "error"
                      ? "Connection Error"
                      : "Unknown"}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleOperation("status")} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh Connection Status
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Redis Operations</CardTitle>
              <CardDescription>Test Redis operations to verify functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="set">Set</TabsTrigger>
                  <TabsTrigger value="get">Get</TabsTrigger>
                  <TabsTrigger value="del">Delete</TabsTrigger>
                  <TabsTrigger value="ttl-test">TTL Test</TabsTrigger>
                </TabsList>

                <TabsContent value="set" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter key" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">TTL (seconds, optional)</label>
                    <Input
                      value={ttl}
                      onChange={(e) => setTtl(e.target.value)}
                      placeholder="Enter TTL in seconds"
                      type="number"
                    />
                  </div>
                  <Button
                    onClick={() => handleOperation("set")}
                    disabled={loading || !key || !value}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Set Value
                  </Button>
                </TabsContent>

                <TabsContent value="get" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter key" />
                  </div>
                  <Button onClick={() => handleOperation("get")} disabled={loading || !key} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Value
                  </Button>
                </TabsContent>

                <TabsContent value="del" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter key" />
                  </div>
                  <Button
                    onClick={() => handleOperation("del")}
                    disabled={loading || !key}
                    className="w-full"
                    variant="destructive"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Delete Value
                  </Button>
                </TabsContent>

                <TabsContent value="ttl-test" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter key" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value" />
                  </div>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>TTL Test</AlertTitle>
                    <AlertDescription>
                      This test will set a value with a 10-second TTL and check if it expires correctly. The test takes
                      about 11 seconds to complete.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => handleOperation("ttl-test")}
                    disabled={loading || !key || !value}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Run TTL Test
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Response from the Redis test API</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatusIndicator({ status, loading }: { status: "unknown" | "connected" | "error"; loading: boolean }) {
  if (loading) {
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
  }

  switch (status) {
    case "connected":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }
}
