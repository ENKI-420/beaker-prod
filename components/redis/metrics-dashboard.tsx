"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  RefreshCw,
  Activity,
  Database,
  AlertCircle,
  Clock,
  Key,
  MemoryStickIcon as Memory,
  Zap,
  Users,
  History,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Dynamically import charts to avoid SSR issues
const DynamicLineChart = dynamic(() => import("../charts/line-chart"), { ssr: false })
const DynamicBarChart = dynamic(() => import("../charts/bar-chart"), { ssr: false })
const DynamicPieChart = dynamic(() => import("../charts/pie-chart"), { ssr: false })
const DynamicGaugeChart = dynamic(() => import("../charts/gauge-chart"), { ssr: false })

interface RedisMetrics {
  pool: {
    totalConnections: number
    activeConnections: number
    idleConnections: number
    maxConnections: number
    minConnections: number
  } | null
  memory: {
    memoryUsed: number
    memoryPeak: number
    memoryRss: number
    memoryFragmentationRatio: number
  } | null
  keyspace: {
    totalKeys: number
    databases: Record<string, any>
  } | null
  operations: {
    totalCommands: number
    opsPerSecond: number
    keyspaceHits: number
    keyspaceMisses: number
    hitRate: number
  } | null
  latency: {
    avgLatencyMs: number
    minLatencyMs: number
    maxLatencyMs: number
    samples: number[]
  } | null
  clients: {
    connectedClients: number
    blockedClients: number
    maxClients: number
  } | null
  topKeys: Array<{
    key: string
    type: string
    size: number
  }> | null
}

interface MetricsResponse {
  status: string
  timestamp: string
  metrics: RedisMetrics
}

interface HistoryResponse {
  status: string
  count: number
  history: Array<{
    timestamp: string
    metrics: Partial<RedisMetrics>
  }>
}

export default function RedisMetricsDashboard() {
  const [metrics, setMetrics] = useState<RedisMetrics | null>(null)
  const [history, setHistory] = useState<HistoryResponse["history"]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 seconds

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/redis/metrics")

      if (!response.ok) {
        throw new Error(`Failed to fetch Redis metrics: ${response.status} ${response.statusText}`)
      }

      const result: MetricsResponse = await response.json()
      setMetrics(result.metrics)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      const response = await fetch("/api/redis/metrics/history")

      if (!response.ok) {
        throw new Error(`Failed to fetch Redis metrics history: ${response.status} ${response.statusText}`)
      }

      const result: HistoryResponse = await response.json()
      setHistory(result.history)
    } catch (err) {
      console.error("Error fetching history:", err)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    fetchHistory()

    // Set up auto-refresh if enabled
    let metricsIntervalId: NodeJS.Timeout | null = null
    let historyIntervalId: NodeJS.Timeout | null = null

    if (autoRefresh) {
      metricsIntervalId = setInterval(fetchMetrics, refreshInterval)
      historyIntervalId = setInterval(fetchHistory, refreshInterval * 6) // Less frequent for history
    }

    return () => {
      if (metricsIntervalId) clearInterval(metricsIntervalId)
      if (historyIntervalId) clearInterval(historyIntervalId)
    }
  }, [autoRefresh, refreshInterval, fetchMetrics, fetchHistory])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
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

  // Prepare chart data for operations
  const prepareOperationsChartData = () => {
    if (!history.length) return { labels: [], datasets: [] }

    const labels = history.map((item) => {
      const date = new Date(item.timestamp)
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    })

    const opsData = history.map((item) => item.metrics.operations?.opsPerSecond || 0)

    return {
      labels,
      datasets: [
        {
          label: "Operations Per Second",
          data: opsData,
          borderColor: "rgb(99, 102, 241)",
          backgroundColor: "rgba(99, 102, 241, 0.5)",
          tension: 0.2,
        },
      ],
    }
  }

  // Prepare chart data for memory usage
  const prepareMemoryChartData = () => {
    if (!history.length) return { labels: [], datasets: [] }

    const labels = history.map((item) => {
      const date = new Date(item.timestamp)
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    })

    const memoryData = history.map((item) => item.metrics.memory?.memoryUsed || 0)

    return {
      labels,
      datasets: [
        {
          label: "Memory Usage (bytes)",
          data: memoryData,
          borderColor: "rgb(234, 88, 12)",
          backgroundColor: "rgba(234, 88, 12, 0.5)",
          tension: 0.2,
        },
      ],
    }
  }

  // Prepare chart data for connections
  const prepareConnectionsChartData = () => {
    if (!history.length) return { labels: [], datasets: [] }

    const labels = history.map((item) => {
      const date = new Date(item.timestamp)
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    })

    const activeData = history.map((item) => item.metrics.pool?.activeConnections || 0)
    const idleData = history.map((item) => item.metrics.pool?.idleConnections || 0)

    return {
      labels,
      datasets: [
        {
          label: "Active Connections",
          data: activeData,
          borderColor: "rgb(220, 38, 38)",
          backgroundColor: "rgba(220, 38, 38, 0.5)",
          tension: 0.2,
        },
        {
          label: "Idle Connections",
          data: idleData,
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          tension: 0.2,
        },
      ],
    }
  }

  // Prepare chart data for hit rate
  const prepareHitRateChartData = () => {
    if (!metrics?.operations) return { labels: [], datasets: [] }

    const total = metrics.operations.keyspaceHits + metrics.operations.keyspaceMisses
    const hitRate = total > 0 ? metrics.operations.keyspaceHits / total : 0
    const missRate = total > 0 ? metrics.operations.keyspaceMisses / total : 0

    return {
      labels: ["Cache Hits", "Cache Misses"],
      datasets: [
        {
          data: [hitRate, missRate],
          backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(220, 38, 38, 0.8)"],
          borderColor: ["rgb(34, 197, 94)", "rgb(220, 38, 38)"],
          borderWidth: 1,
        },
      ],
    }
  }

  // Prepare chart data for top keys
  const prepareTopKeysChartData = () => {
    if (!metrics?.topKeys || metrics.topKeys.length === 0) return { labels: [], datasets: [] }

    // Take top 10 keys
    const topKeys = metrics.topKeys.slice(0, 10)

    return {
      labels: topKeys.map((item) => item.key),
      datasets: [
        {
          label: "Size",
          data: topKeys.map((item) => item.size),
          backgroundColor: "rgba(99, 102, 241, 0.8)",
          borderColor: "rgb(99, 102, 241)",
          borderWidth: 1,
        },
      ],
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Redis Metrics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="text-sm text-muted-foreground">Last updated: {formatTimestamp(new Date().toISOString())}</div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="overview">
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="memory">
            <Memory className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Memory</span>
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Zap className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Operations</span>
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Connections</span>
          </TabsTrigger>
          <TabsTrigger value="latency">
            <Clock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Latency</span>
          </TabsTrigger>
          <TabsTrigger value="keyspace">
            <Key className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Keyspace</span>
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Memory Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Memory className="h-5 w-5 mr-2 text-orange-500" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.memory ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{formatBytes(metrics.memory.memoryUsed)}</div>
                    <Progress value={(metrics.memory.memoryUsed / metrics.memory.memoryPeak) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground">Peak: {formatBytes(metrics.memory.memoryPeak)}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operations Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.operations ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{formatNumber(metrics.operations.opsPerSecond)}/s</div>
                    <div className="text-sm">Total: {formatNumber(metrics.operations.totalCommands)}</div>
                    <div className="text-xs text-muted-foreground">
                      Hit Rate: {formatPercentage(metrics.operations.hitRate)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connections Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.pool ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{metrics.pool.activeConnections}</div>
                    <Progress
                      value={(metrics.pool.activeConnections / metrics.pool.maxConnections) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      Total: {metrics.pool.totalConnections} / {metrics.pool.maxConnections}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latency Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-500" />
                  Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.latency ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{metrics.latency.avgLatencyMs.toFixed(2)} ms</div>
                    <div className="flex justify-between text-xs">
                      <span>Min: {metrics.latency.minLatencyMs.toFixed(2)} ms</span>
                      <span>Max: {metrics.latency.maxLatencyMs.toFixed(2)} ms</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hit Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
                <CardDescription>Ratio of cache hits to total operations</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading || !metrics?.operations ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicPieChart data={prepareHitRateChartData()} />
                )}
              </CardContent>
            </Card>

            {/* Operations Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Operations Per Second</CardTitle>
                <CardDescription>Recent operation throughput</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareOperationsChartData()} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage Over Time</CardTitle>
                <CardDescription>Historical memory consumption</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareMemoryChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Details</CardTitle>
                <CardDescription>Current memory statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.memory ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Used Memory</h3>
                      <div className="text-3xl font-bold mb-2">{formatBytes(metrics.memory.memoryUsed)}</div>
                      <Progress value={(metrics.memory.memoryUsed / metrics.memory.memoryPeak) * 100} className="h-2" />
                      <div className="flex justify-between text-xs mt-1">
                        <span>0</span>
                        <span>Peak: {formatBytes(metrics.memory.memoryPeak)}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">RSS Memory</h3>
                      <div className="text-xl font-medium">{formatBytes(metrics.memory.memoryRss)}</div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Fragmentation Ratio</h3>
                      <div className="text-xl font-medium">{metrics.memory.memoryFragmentationRatio.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {metrics.memory.memoryFragmentationRatio > 1.5
                          ? "High fragmentation - consider optimizing memory usage"
                          : "Normal fragmentation ratio"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Memory Usage by Key Type</CardTitle>
              <CardDescription>Estimated memory distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading || !metrics?.topKeys ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <DynamicBarChart data={prepareTopKeysChartData()} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Operations Per Second</CardTitle>
                <CardDescription>Historical throughput</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareOperationsChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate</CardTitle>
                <CardDescription>Ratio of cache hits to total operations</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading || !metrics?.operations ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicGaugeChart
                    value={metrics.operations.hitRate * 100}
                    min={0}
                    max={100}
                    label="Hit Rate"
                    suffix="%"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Operation Statistics</CardTitle>
              <CardDescription>Detailed operation metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !metrics?.operations ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Total Commands</h3>
                    <div className="text-3xl font-bold">{formatNumber(metrics.operations.totalCommands)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Lifetime command count</div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Operations Per Second</h3>
                    <div className="text-3xl font-bold">{formatNumber(metrics.operations.opsPerSecond)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Current throughput</div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Cache Hits</h3>
                    <div className="text-3xl font-bold">{formatNumber(metrics.operations.keyspaceHits)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Successful key lookups</div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Cache Misses</h3>
                    <div className="text-3xl font-bold">{formatNumber(metrics.operations.keyspaceMisses)}</div>
                    <div className="text-sm text-muted-foreground mt-1">Failed key lookups</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connection Pool</CardTitle>
                <CardDescription>Active and idle connections over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareConnectionsChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
                <CardDescription>Current connection statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.pool || !metrics?.clients ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Pool Connections</h3>
                      <div className="text-3xl font-bold mb-2">{metrics.pool.totalConnections}</div>
                      <Progress
                        value={(metrics.pool.totalConnections / metrics.pool.maxConnections) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>Min: {metrics.pool.minConnections}</span>
                        <span>Max: {metrics.pool.maxConnections}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Active Connections</h3>
                      <div className="text-xl font-medium">{metrics.pool.activeConnections}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatPercentage(metrics.pool.activeConnections / metrics.pool.maxConnections)} of maximum
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Redis Clients</h3>
                      <div className="text-xl font-medium">{metrics.clients.connectedClients}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {metrics.clients.blockedClients > 0 ? (
                          <span className="text-amber-500">{metrics.clients.blockedClients} blocked clients</span>
                        ) : (
                          "No blocked clients"
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connection Health</CardTitle>
              <CardDescription>Pool status and health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !metrics?.pool ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pool Status</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          metrics.pool.activeConnections / metrics.pool.maxConnections > 0.9
                            ? "bg-red-500"
                            : metrics.pool.activeConnections / metrics.pool.maxConnections > 0.7
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      ></div>
                      <span className="font-medium">
                        {metrics.pool.activeConnections / metrics.pool.maxConnections > 0.9
                          ? "Critical"
                          : metrics.pool.activeConnections / metrics.pool.maxConnections > 0.7
                            ? "Warning"
                            : "Healthy"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {metrics.pool.activeConnections / metrics.pool.maxConnections > 0.9
                        ? "Pool is near capacity - consider increasing max connections"
                        : metrics.pool.activeConnections / metrics.pool.maxConnections > 0.7
                          ? "Pool usage is high but manageable"
                          : "Pool has sufficient capacity"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Idle Connections</h3>
                    <div className="text-xl font-medium">{metrics.pool.idleConnections}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {metrics.pool.idleConnections < metrics.pool.minConnections
                        ? "Below minimum threshold - new connections will be created"
                        : "Sufficient idle connections available"}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Available Capacity</h3>
                    <div className="text-xl font-medium">
                      {metrics.pool.maxConnections - metrics.pool.activeConnections}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {formatPercentage(
                        (metrics.pool.maxConnections - metrics.pool.activeConnections) / metrics.pool.maxConnections,
                      )}{" "}
                      of maximum capacity available
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Latency Tab */}
        <TabsContent value="latency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
                <CardDescription>Current latency measurements</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading || !metrics?.latency ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicGaugeChart
                    value={metrics.latency.avgLatencyMs}
                    min={0}
                    max={Math.max(20, metrics.latency.maxLatencyMs)}
                    label="Avg Latency"
                    suffix=" ms"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latency Details</CardTitle>
                <CardDescription>Response time statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.latency ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Average Latency</h3>
                      <div className="text-3xl font-bold">{metrics.latency.avgLatencyMs.toFixed(2)} ms</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {metrics.latency.avgLatencyMs < 1
                          ? "Excellent response time"
                          : metrics.latency.avgLatencyMs < 5
                            ? "Good response time"
                            : metrics.latency.avgLatencyMs < 10
                              ? "Acceptable response time"
                              : "High latency - investigate network or server issues"}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Minimum Latency</h3>
                      <div className="text-xl font-medium">{metrics.latency.minLatencyMs.toFixed(2)} ms</div>
                      <div className="text-xs text-muted-foreground mt-1">Best case response time</div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Maximum Latency</h3>
                      <div className="text-xl font-medium">{metrics.latency.maxLatencyMs.toFixed(2)} ms</div>
                      <div className="text-xs text-muted-foreground mt-1">Worst case response time</div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Latency Variance</h3>
                      <div className="text-xl font-medium">
                        {(metrics.latency.maxLatencyMs - metrics.latency.minLatencyMs).toFixed(2)} ms
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {metrics.latency.maxLatencyMs - metrics.latency.minLatencyMs < 5
                          ? "Low variance - consistent performance"
                          : "High variance - inconsistent performance"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Latency Recommendations</CardTitle>
              <CardDescription>Performance optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !metrics?.latency ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <div className="space-y-4">
                  {metrics.latency.avgLatencyMs > 10 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>High Average Latency</AlertTitle>
                      <AlertDescription>
                        Average latency of {metrics.latency.avgLatencyMs.toFixed(2)} ms is higher than recommended.
                        Consider checking network conditions, Redis server load, or connection pooling settings.
                      </AlertDescription>
                    </Alert>
                  )}

                  {metrics.latency.maxLatencyMs - metrics.latency.minLatencyMs > 10 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>High Latency Variance</AlertTitle>
                      <AlertDescription>
                        Large difference between minimum and maximum latency indicates inconsistent performance. This
                        could be caused by network jitter, garbage collection pauses, or resource contention.
                      </AlertDescription>
                    </Alert>
                  )}

                  {metrics.latency.avgLatencyMs <= 10 &&
                    metrics.latency.maxLatencyMs - metrics.latency.minLatencyMs <= 10 && (
                      <Alert variant="success">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Good Latency Performance</AlertTitle>
                        <AlertDescription>
                          Current latency metrics are within acceptable ranges. Continue monitoring for any changes.
                        </AlertDescription>
                      </Alert>
                    )}

                  <div className="text-sm mt-4">
                    <h4 className="font-medium mb-2">Optimization Tips:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Use pipelining for multiple operations</li>
                      <li>Consider data locality (use same Redis instance for related data)</li>
                      <li>Optimize key size and data structures</li>
                      <li>Monitor network conditions between application and Redis</li>
                      <li>Ensure Redis server has adequate resources</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keyspace Tab */}
        <TabsContent value="keyspace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Distribution</CardTitle>
                <CardDescription>Top keys by estimated size</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {loading || !metrics?.topKeys ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicBarChart data={prepareTopKeysChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keyspace Overview</CardTitle>
                <CardDescription>Key statistics and database info</CardDescription>
              </CardHeader>
              <CardContent>
                {loading || !metrics?.keyspace ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Total Keys</h3>
                      <div className="text-3xl font-bold">{formatNumber(metrics.keyspace.totalKeys)}</div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Database Distribution</h3>
                      {Object.keys(metrics.keyspace.databases).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(metrics.keyspace.databases).map(([db, stats]: [string, any]) => (
                            <div key={db} className="flex justify-between items-center">
                              <span>{db}:</span>
                              <span>{formatNumber(stats.keys)} keys</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No database statistics available</div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Expiring Keys</h3>
                      {Object.keys(metrics.keyspace.databases).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(metrics.keyspace.databases).map(([db, stats]: [string, any]) => (
                            <div key={db} className="flex justify-between items-center">
                              <span>{db}:</span>
                              <span>
                                {formatNumber(stats.expires)} keys ({formatPercentage(stats.expires / stats.keys)})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No expiration statistics available</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Keys</CardTitle>
              <CardDescription>Keys with highest estimated size</CardDescription>
            </CardHeader>
            <CardContent>
              {loading || !metrics?.topKeys ? (
                <Skeleton className="h-64 w-full" />
              ) : metrics.topKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No key data available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Key</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-right py-2 px-4">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topKeys.map((key, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4 font-mono text-sm truncate max-w-[200px]">{key.key}</td>
                          <td className="py-2 px-4">{key.type}</td>
                          <td className="py-2 px-4 text-right">
                            {key.type === "string" ? formatBytes(key.size) : formatNumber(key.size)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Historical Metrics</CardTitle>
                <CardDescription>Performance trends over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareConnectionsChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Trend</CardTitle>
                <CardDescription>Memory usage over time</CardDescription>
              </CardHeader>
              <CardContent className="h-60">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareMemoryChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operations Trend</CardTitle>
                <CardDescription>Operation throughput over time</CardDescription>
              </CardHeader>
              <CardContent className="h-60">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareOperationsChartData()} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Trend</CardTitle>
                <CardDescription>Connection usage over time</CardDescription>
              </CardHeader>
              <CardContent className="h-60">
                {historyLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <DynamicLineChart data={prepareConnectionsChartData()} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metrics History</CardTitle>
              <CardDescription>Raw historical data points</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No historical data available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Timestamp</th>
                        <th className="text-right py-2 px-4">Active Connections</th>
                        <th className="text-right py-2 px-4">Idle Connections</th>
                        <th className="text-right py-2 px-4">Total Connections</th>
                        <th className="text-right py-2 px-4">Operations/sec</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(-10).map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{formatTimestamp(item.timestamp)}</td>
                          <td className="py-2 px-4 text-right">{item.metrics.pool?.activeConnections || "N/A"}</td>
                          <td className="py-2 px-4 text-right">{item.metrics.pool?.idleConnections || "N/A"}</td>
                          <td className="py-2 px-4 text-right">{item.metrics.pool?.totalConnections || "N/A"}</td>
                          <td className="py-2 px-4 text-right">{item.metrics.operations?.opsPerSecond || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing last {Math.min(10, history.length)} of {history.length} data points
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && !metrics && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading Redis metrics...</p>
          </div>
        </div>
      )}
    </div>
  )
}
