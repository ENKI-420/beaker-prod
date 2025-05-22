"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Activity, Database } from "lucide-react"

interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  maxConnections: number
  minConnections: number
}

interface AverageUsage {
  avgTotalConnections: number
  avgActiveConnections: number
  avgIdleConnections: number
  avgUsageRatio: number
}

interface PoolMetrics {
  timestamps: number[]
  totalConnections: number[]
  activeConnections: number[]
  idleConnections: number[]
}

interface MonitoringData {
  status: string
  timestamp: string
  currentStats: PoolStats
  averageUsage: AverageUsage
  metrics: PoolMetrics
}

export default function RedisPoolDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/monitoring/redis-pool")

      if (!response.ok) {
        throw new Error(`Failed to fetch Redis pool data: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh) {
      intervalId = setInterval(fetchData, 10000) // Refresh every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Redis Connection Pool Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="text-sm text-muted-foreground">Last updated: {formatTimestamp(data.timestamp)}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Connections</CardTitle>
                <CardDescription>Active and idle connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-sm">
                        {data.currentStats.activeConnections} / {data.currentStats.maxConnections}
                      </span>
                    </div>
                    <Progress
                      value={(data.currentStats.activeConnections / data.currentStats.maxConnections) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Idle</span>
                      <span className="text-sm">
                        {data.currentStats.idleConnections} / {data.currentStats.totalConnections}
                      </span>
                    </div>
                    <Progress
                      value={(data.currentStats.idleConnections / data.currentStats.totalConnections) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-sm">
                        {data.currentStats.totalConnections} / {data.currentStats.maxConnections}
                      </span>
                    </div>
                    <Progress
                      value={(data.currentStats.totalConnections / data.currentStats.maxConnections) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-xs text-muted-foreground">Min connections: {data.currentStats.minConnections}</div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Usage</CardTitle>
                <CardDescription>Over the monitoring period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Active Connections:</span>
                    <span className="font-medium">{data.averageUsage.avgActiveConnections.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Idle Connections:</span>
                    <span className="font-medium">{data.averageUsage.avgIdleConnections.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Total Connections:</span>
                    <span className="font-medium">{data.averageUsage.avgTotalConnections.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Usage Ratio:</span>
                    <span className="font-medium">{formatPercentage(data.averageUsage.avgUsageRatio)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-xs text-muted-foreground">
                  Based on {data.metrics.timestamps.length} data points
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pool Status</CardTitle>
                <CardDescription>Health and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      data.currentStats.activeConnections / data.currentStats.maxConnections > 0.9
                        ? "bg-red-500"
                        : data.currentStats.activeConnections / data.currentStats.maxConnections > 0.7
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  ></div>
                  <span className="font-medium">
                    {data.currentStats.activeConnections / data.currentStats.maxConnections > 0.9
                      ? "Critical"
                      : data.currentStats.activeConnections / data.currentStats.maxConnections > 0.7
                        ? "Warning"
                        : "Healthy"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Max Pool Size:</span>
                    <span className="font-medium">{data.currentStats.maxConnections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Usage:</span>
                    <span className="font-medium">
                      {formatPercentage(data.currentStats.activeConnections / data.currentStats.maxConnections)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Connections:</span>
                    <span className="font-medium">
                      {data.currentStats.maxConnections - data.currentStats.activeConnections}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full" onClick={fetchData}>
                  <Database className="h-4 w-4 mr-2" />
                  Check Pool Health
                </Button>
              </CardFooter>
            </Card>
          </div>

          {data.currentStats.activeConnections / data.currentStats.maxConnections > 0.8 && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>High Connection Usage</AlertTitle>
              <AlertDescription>
                The Redis connection pool is experiencing high usage (
                {formatPercentage(data.currentStats.activeConnections / data.currentStats.maxConnections)}). Consider
                increasing the maximum pool size if this persists.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {loading && !data && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading Redis pool data...</p>
          </div>
        </div>
      )}
    </div>
  )
}
