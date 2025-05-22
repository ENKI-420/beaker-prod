import { NextResponse } from "next/server"
import { getCacheStats } from "@/lib/cache/genomic-cache-service"
import { logger } from "@/lib/logging/enhanced-logger"

export async function GET() {
  try {
    const stats = getCacheStats()
    return NextResponse.json(stats)
  } catch (error) {
    logger.error("Failed to get cache stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json({ error: "Failed to get cache stats" }, { status: 500 })
  }
}
