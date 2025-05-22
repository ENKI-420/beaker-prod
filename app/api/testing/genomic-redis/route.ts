import { type NextRequest, NextResponse } from "next/server"
import { runGenomicRedisTests } from "@/lib/testing/genomic-redis-tests"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API endpoint for running genomic-specific Redis tests
 * POST /api/testing/genomic-redis - Runs the genomic Redis test suite
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const validToken = process.env.TESTING_API_TOKEN || "test-token"

    if (token !== validToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Set timeout for long-running tests
    const timeout = 60000 // 60s timeout

    // Create a promise that resolves with test results
    const testPromise = new Promise(async (resolve, reject) => {
      try {
        const results = await runGenomicRedisTests()
        resolve(results)
      } catch (error) {
        reject(error)
      }
    })

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout)
    })

    // Race the test execution against the timeout
    const results = await Promise.race([testPromise, timeoutPromise])

    return NextResponse.json(results)
  } catch (error) {
    logger.error("Genomic Redis test API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        error: "Failed to run genomic Redis tests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
