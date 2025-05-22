import { NextResponse } from "next/server"
import { checkRedisPoolHealth } from "@/lib/redis/genomic-redis-client"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API endpoint for checking Redis connection pool health
 */
export async function GET() {
  try {
    const healthCheck = await checkRedisPoolHealth()

    if (healthCheck.healthy) {
      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        poolSize: healthCheck.poolSize,
        activeConnections: healthCheck.activeConnections,
        responseTimeMs: healthCheck.responseTimeMs,
      })
    } else {
      logger.warn("Redis health check failed", {
        error: healthCheck.error,
        responseTimeMs: healthCheck.responseTimeMs,
      })

      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: healthCheck.error,
          responseTimeMs: healthCheck.responseTimeMs,
        },
        { status: 503 },
      )
    }
  } catch (error) {
    logger.error("Error in Redis health check API", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
