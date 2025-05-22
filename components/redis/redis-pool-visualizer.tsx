"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, Database, Activity, AlertCircle } from "lucide-react"

interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  maxConnections: number
  minConnections: number
  isSimulated?: boolean
}

interface HealthCheck {
  status: string
  timestamp: string
  poolSize: number
  activeConnections: number
  responseTimeMs: number
  error?: string
}

export default function RedisPoolVisualizer() {
  const [stats, setStats] = useState<PoolStats | null>(null)
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/monitoring/redis-pool")

      if (!response.ok) {
        throw new Error(`Failed to fetch Redis pool stats: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setStats(data.currentStats)
      setLastUpdated(new Date().toLocaleString())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/redis/health")
      const data = await response.json()
      setHealth(data)
    } catch (err) {
      console.error("Failed to check Redis health:", err)
    }
  }

  useEffect(() => {
    fetchStats()
    checkHealth()

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchStats()
        checkHealth()
      }, 5000) // Refresh every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh])

  const formatPercentage = (value: number, total: number) => {
    return `${((value / total) * 100).toFixed(1)}%`
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
        <h2 className="text-2xl font-bold">Redis Connection Pool</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats()
              checkHealth()
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
          </Button>
        </div>
      </div>

      {lastUpdated && <div className="text-sm text-muted-foreground">Last updated: {lastUpdated}</div>}

      {stats?.isSimulated && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Simulated Data</AlertTitle>
          <AlertDescription>
            The Redis connection pool is using simulated data. The actual connection pool may not be initialized.
          </AlertDescription>
        </Alert>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Connection Pool Status</CardTitle>
              <CardDescription>Active and idle connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Active</span>
                    <span className="text-sm">
                      {stats.activeConnections} / {stats.maxConnections} (
                      {formatPercentage(stats.activeConnections, stats.maxConnections)})
                    </span>
                  </div>
                  <Progress value={(stats.activeConnections / stats.maxConnections) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Idle</span>
                    <span className="text-sm">
                      {stats.idleConnections} / {stats.totalConnections} (
                      {formatPercentage(stats.idleConnections, stats.totalConnections)})
                    </span>
                  </div>
                  <Progress value={(stats.idleConnections / stats.totalConnections) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm">
                      {stats.totalConnections} / {stats.maxConnections} (
                      {formatPercentage(stats.totalConnections, stats.maxConnections)})
                    </span>
                  </div>
                  <Progress value={(stats.totalConnections / stats.maxConnections) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="text-xs text-muted-foreground">Min connections: {stats.minConnections}</div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Health Check</CardTitle>
              <CardDescription>Connection response time and status</CardDescription>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${health.status === "healthy" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="font-medium">{health.status === "healthy" ? "Healthy" : "Unhealthy"}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time:</span>
                      <span className="font-medium">{health.responseTimeMs}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pool Size:</span>
                      <span className="font-medium">{health.poolSize}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Connections:</span>
                      <span className="font-medium">{health.activeConnections}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Checked:</span>
                      <span className="font-medium">{new Date(health.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {health.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{health.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p>Checking Redis health...</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="w-full" onClick={checkHealth}>
                <Database className="h-4 w-4 mr-2" />
                Run Health Check
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {loading && !stats && (
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
