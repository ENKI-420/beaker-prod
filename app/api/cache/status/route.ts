import { NextResponse } from "next/server"
import { cacheStats, cleanupExpiredKeys } from "@/lib/cache/simple-memory-cache"
import { getCacheStats } from "@/lib/cache/genomic-cache-service"
import { logger } from "@/lib/logging/enhanced-logger"

export async function GET() {
  try {
    // Clean up expired keys before returning stats
    const cleanedKeys = cleanupExpiredKeys()

    // Get stats from both cache implementations
    const rawCacheStats = cacheStats()
    const genomicCacheStats = getCacheStats()

    return NextResponse.json({
      status: "healthy",
      type: "in-memory",
      timestamp: new Date().toISOString(),
      cleanedExpiredKeys: cleanedKeys,
      rawCache: rawCacheStats,
      genomicCache: genomicCacheStats,
    })
  } catch (error) {
    logger.error("Cache status API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to get cache status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
