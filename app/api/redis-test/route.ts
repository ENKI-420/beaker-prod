import { NextResponse } from "next/server"
import { logger } from "@/lib/logging/enhanced-logger"
import { cacheSet, cacheGet, cacheDelete, cacheStats } from "@/lib/cache/simple-memory-cache"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operation = searchParams.get("operation") || "status"
    const key = searchParams.get("key") || "test-key"
    const value = searchParams.get("value") || `test-value-${Date.now()}`
    const ttl = searchParams.get("ttl") ? Number.parseInt(searchParams.get("ttl"), 10) : undefined

    logger.info("Cache test API called", { operation, key, ttl })

    // Test connection
    if (operation === "status") {
      return NextResponse.json({
        status: "connected",
        type: "in-memory",
        timestamp: new Date().toISOString(),
        message: "In-memory cache is active",
        stats: cacheStats(),
      })
    }

    // Set operation
    if (operation === "set") {
      const result = cacheSet(key, value, ttl)
      return NextResponse.json({
        operation: "set",
        key,
        value,
        ttl,
        success: result,
        timestamp: new Date().toISOString(),
      })
    }

    // Get operation
    if (operation === "get") {
      const result = cacheGet(key)
      return NextResponse.json({
        operation: "get",
        key,
        value: result,
        exists: result !== null,
        timestamp: new Date().toISOString(),
      })
    }

    // Delete operation
    if (operation === "del") {
      const result = cacheDelete(key)
      return NextResponse.json({
        operation: "del",
        key,
        success: result,
        timestamp: new Date().toISOString(),
      })
    }

    // TTL test
    if (operation === "ttl-test") {
      // Set with TTL
      const ttlSeconds = 10
      cacheSet(key, value, ttlSeconds)

      // Get immediately
      const immediate = cacheGet(key)

      // Wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Get after 5 seconds
      const afterFiveSeconds = cacheGet(key)

      // Wait another 6 seconds (total 11 seconds, should expire)
      await new Promise((resolve) => setTimeout(resolve, 6000))

      // Get after expiration
      const afterExpiration = cacheGet(key)

      return NextResponse.json({
        operation: "ttl-test",
        key,
        value,
        ttlSeconds,
        results: {
          immediate: immediate !== null,
          afterFiveSeconds: afterFiveSeconds !== null,
          afterExpiration: afterExpiration !== null,
        },
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Invalid operation. Use 'status', 'set', 'get', 'del', or 'ttl-test'.",
      },
      { status: 400 },
    )
  } catch (error) {
    logger.error("Cache test API error", { error: String(error) })
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred during cache test",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
