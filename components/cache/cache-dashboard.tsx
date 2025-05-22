"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CacheStats {
  hits: number
  misses: number
  errors: number
  hitRatio: number
}

interface CacheStatsResponse {
  [key: string]: CacheStats
}

export default function CacheDashboard() {
  const [stats, setStats] = useState<CacheStatsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/cache/stats")
      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cache/stats/reset", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error(`Failed to reset cache stats: ${response.status}`)
      }
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Set up polling for stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const prepareChartData = () => {
    if (!stats) return []

    return Object.entries(stats).map(([region, data]) => ({
      name: region,
      hits: data.hits,
      misses: data.misses,
      errors: data.errors,
      hitRatio: Math.round(data.hitRatio * 100),
    }))
  }

  const calculateTotals = () => {
    if (!stats) return { hits: 0, misses: 0, errors: 0, hitRatio: 0, total: 0 }

    let totalHits = 0
    let totalMisses = 0
    let totalErrors = 0

    Object.values(stats).forEach((regionStats) => {
      totalHits += regionStats.hits
      totalMisses += regionStats.misses
      totalErrors += regionStats.errors
    })

    const total = totalHits + totalMisses
    const hitRatio = total > 0 ? totalHits / total : 0

    return {
      hits: totalHits,
      misses: totalMisses,
      errors: totalErrors,
      hitRatio,
      total,
    }
  }

  const totals = calculateTotals()
  const chartData = prepareChartData()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cache Performance Dashboard</h2>
        <div className="space-x-2">
          <Button onClick={fetchStats} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={resetStats} disabled={loading} variant="outline">
            Reset Stats
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regions">Cache Regions</TabsTrigger>
          <TabsTrigger value="chart">Performance Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cache Hit Ratio</CardTitle>
                <CardDescription>Percentage of successful cache retrievals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(totals.hitRatio * 100).toFixed(1)}%</div>
                <Progress value={totals.hitRatio * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Requests</CardTitle>
                <CardDescription>Total number of cache operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totals.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {totals.hits.toLocaleString()} hits / {totals.misses.toLocaleString()} misses
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>Percentage of operations resulting in errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {totals.total > 0 ? ((totals.errors / totals.total) * 100).toFixed(2) : "0.00"}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">{totals.errors.toLocaleString()} errors</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cache Performance Summary</CardTitle>
              <CardDescription>Overall cache performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Cache Hits:</span>
                  <span className="font-medium">{totals.hits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cache Misses:</span>
                  <span className="font-medium">{totals.misses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cache Errors:</span>
                  <span className="font-medium">{totals.errors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Hit Ratio:</span>
                  <span className="font-medium">{(totals.hitRatio * 100).toFixed(2)}%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          {stats && Object.entries(stats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats).map(([region, regionStats]) => (
                <Card key={region}>
                  <CardHeader>
                    <CardTitle className="capitalize">{region}</CardTitle>
                    <CardDescription>Cache region performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Hit Ratio:</span>
                        <span className="font-medium">{(regionStats.hitRatio * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={regionStats.hitRatio * 100} className="h-2" />
                      <div className="flex justify-between">
                        <span>Hits:</span>
                        <span className="font-medium">{regionStats.hits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Misses:</span>
                        <span className="font-medium">{regionStats.misses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Errors:</span>
                        <span className="font-medium">{regionStats.errors.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No cache statistics available. Start using the cache to generate statistics.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance by Region</CardTitle>
              <CardDescription>Visual representation of cache performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="hits" name="Cache Hits" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="misses" name="Cache Misses" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="hitRatio" name="Hit Ratio (%)" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
