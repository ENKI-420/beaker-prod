import { NextResponse } from "next/server"
import { resetCacheStats } from "@/lib/cache/genomic-cache-service"
import { logger } from "@/lib/logging/enhanced-logger"

export async function POST() {
  try {
    resetCacheStats()
    logger.info("Cache stats reset")
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Failed to reset cache stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json({ error: "Failed to reset cache stats" }, { status: 500 })
  }
}
