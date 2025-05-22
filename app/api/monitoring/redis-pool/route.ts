import { type NextRequest, NextResponse } from "next/server"
import RedisPoolMonitor from "@/lib/redis/redis-pool-monitor"
import { getRedisPoolStats } from "@/lib/redis/genomic-redis-client"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API endpoint for Redis connection pool monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // Start the monitor if it's not already running
    const monitor = RedisPoolMonitor.getInstance()
    monitor.start()

    // Get current stats and metrics
    const currentStats = getRedisPoolStats()
    const metrics = monitor.getMetrics()
    const averageUsage = monitor.getAverageUsage()

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      currentStats,
      averageUsage,
      metrics,
    })
  } catch (error) {
    logger.error("Error in Redis pool monitoring API", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
