import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logging/enhanced-logger"
import RedisPoolMonitor from "@/lib/redis/redis-pool-monitor"

// In-memory storage for historical metrics (in a production app, this would be stored in a database)
let metricsHistory: any[] = []
const MAX_HISTORY_LENGTH = 100

// Function to add a new metrics snapshot
function addMetricsSnapshot(metrics: any) {
  metricsHistory.push({
    timestamp: new Date().toISOString(),
    metrics,
  })

  // Keep history within limits
  if (metricsHistory.length > MAX_HISTORY_LENGTH) {
    metricsHistory = metricsHistory.slice(metricsHistory.length - MAX_HISTORY_LENGTH)
  }
}

// Initialize with some data
setInterval(async () => {
  try {
    const poolStats = RedisPoolMonitor.getInstance().getLatestStats()
    addMetricsSnapshot({ pool: poolStats })
  } catch (error) {
    logger.error("Error collecting metrics history", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}, 60000) // Collect every minute

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let filteredHistory = [...metricsHistory]

    // Apply time range filter if provided
    if (from) {
      const fromDate = new Date(from).getTime()
      filteredHistory = filteredHistory.filter((item) => new Date(item.timestamp).getTime() >= fromDate)
    }

    if (to) {
      const toDate = new Date(to).getTime()
      filteredHistory = filteredHistory.filter((item) => new Date(item.timestamp).getTime() <= toDate)
    }

    // Apply limit
    const limitedHistory = filteredHistory.slice(-limit)

    return NextResponse.json({
      status: "success",
      count: limitedHistory.length,
      history: limitedHistory,
    })
  } catch (error) {
    logger.error("Error in Redis metrics history API", {
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
