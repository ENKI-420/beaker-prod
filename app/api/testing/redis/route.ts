import { type NextRequest, NextResponse } from "next/server"
import { RedisTestRunner } from "@/lib/testing/redis-test-runner"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API endpoint for running Redis tests
 * POST /api/testing/redis - Runs the Redis test suite
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    // In production, you would validate this token against a secure source
    // For this example, we're using a simple environment variable
    const validToken = process.env.TESTING_API_TOKEN || "test-token"

    if (token !== validToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    // Parse request body for test options
    let options: { timeout?: number } = {}
    try {
      const body = await request.json()
      options = body || {}
    } catch (e) {
      // If body parsing fails, use default options
    }

    // Set timeout for long-running tests
    const timeout = options.timeout || 60000 // Default 60s timeout

    // Create a promise that resolves with test results
    const testPromise = new Promise(async (resolve, reject) => {
      try {
        const testRunner = new RedisTestRunner()
        const results = await testRunner.runAllTests()
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
    logger.error("Redis test API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        error: "Failed to run Redis tests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
