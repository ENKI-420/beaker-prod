import { NextResponse, type NextRequest } from "next/server"
import { verifyRedisClient } from "@/scripts/verify-redis-client"
import { logger } from "@/lib/logging/enhanced-logger"

export async function GET(request: NextRequest) {
  try {
    logger.info("Redis verification API called")

    // Create a stream to capture console output
    const logs: string[] = []
    const originalConsoleLog = console.log
    const originalConsoleError = console.error

    // Override console methods to capture output
    console.log = (...args) => {
      logs.push(args.join(" "))
      originalConsoleLog(...args)
    }

    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(" ")}`)
      originalConsoleError(...args)
    }

    // Run the verification
    const startTime = Date.now()
    const success = await verifyRedisClient()
    const duration = Date.now() - startTime

    // Restore console methods
    console.log = originalConsoleLog
    console.error = originalConsoleError

    return NextResponse.json({
      success,
      duration,
      timestamp: new Date().toISOString(),
      logs,
    })
  } catch (error) {
    logger.error("Redis verification API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
