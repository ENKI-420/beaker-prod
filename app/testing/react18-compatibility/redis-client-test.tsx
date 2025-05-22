"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function RedisClientTest() {
  const [key, setKey] = useState("test-key-react18")
  const [value, setValue] = useState("Test value from React 18")
  const [result, setResult] = useState<any>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const testRedisSet = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/redis-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value,
        }),
      })

      const data = await response.json()
      setResult(data)
      setStatus(data.success ? "success" : "error")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
      setStatus("error")
    }
  }

  const testRedisGet = async () => {
    setStatus("loading")
    try {
      const response = await fetch(`/api/redis-verify?key=${encodeURIComponent(key)}`, {
        method: "PUT",
      })

      const data = await response.json()
      setResult(data)
      setStatus(data.success ? "success" : "error")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
      setStatus("error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redis Client Test</CardTitle>
        <CardDescription>Testing Redis client with React 18</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Key</label>
            <Input value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          </div>

          <div className="flex space-x-2">
            <Button onClick={testRedisSet} disabled={status === "loading"}>
              {status === "loading" ? "Testing..." : "Test Redis Set"}
            </Button>
            <Button onClick={testRedisGet} disabled={status === "loading"} variant="outline">
              {status === "loading" ? "Testing..." : "Test Redis Get"}
            </Button>
          </div>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Redis operation completed successfully</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50 border-red-200" variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result?.error || "Redis operation failed"}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div>
              <h3 className="text-sm font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
