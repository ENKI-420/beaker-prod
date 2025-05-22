import { NextResponse } from "next/server"
import { cacheSet, cacheGet, cacheDelete, cacheStats, cleanupExpiredKeys } from "@/lib/cache/simple-memory-cache"
import { logger } from "@/lib/logging/enhanced-logger"

export async function GET() {
  try {
    logger.info("Starting in-memory cache verification via API...")
    const results = {
      tests: [] as Array<{ name: string; passed: boolean; details?: any }>,
      allPassed: true,
      timestamp: new Date().toISOString(),
    }

    // Test 1: Basic set and get
    try {
      const testKey = "api-test-key-1"
      const testValue = { name: "API Test Value", timestamp: Date.now() }

      const setResult = cacheSet(testKey, testValue)
      const retrievedValue = cacheGet(testKey)

      const passed = setResult && retrievedValue && retrievedValue.name === testValue.name

      results.tests.push({
        name: "Basic set and get",
        passed,
        details: passed ? undefined : { setResult, retrievedValue },
      })

      if (!passed) results.allPassed = false
    } catch (error) {
      results.tests.push({
        name: "Basic set and get",
        passed: false,
        details: { error: String(error) },
      })
      results.allPassed = false
    }

    // Test 2: Delete operation
    try {
      const testKey = "api-test-key-2"
      const testValue = "API test value for deletion"

      cacheSet(testKey, testValue)
      const beforeDelete = cacheGet(testKey)
      const deleteResult = cacheDelete(testKey)
      const afterDelete = cacheGet(testKey)

      const passed = beforeDelete === testValue && deleteResult && afterDelete === null

      results.tests.push({
        name: "Delete operation",
        passed,
        details: passed ? undefined : { beforeDelete, deleteResult, afterDelete },
      })

      if (!passed) results.allPassed = false
    } catch (error) {
      results.tests.push({
        name: "Delete operation",
        passed: false,
        details: { error: String(error) },
      })
      results.allPassed = false
    }

    // Test 3: Cache statistics
    try {
      const stats = cacheStats()
      const passed = stats && typeof stats.totalItems === "number"

      results.tests.push({
        name: "Cache statistics",
        passed,
        details: passed ? { stats } : { error: "Invalid statistics object" },
      })

      if (!passed) results.allPassed = false
    } catch (error) {
      results.tests.push({
        name: "Cache statistics",
        passed: false,
        details: { error: String(error) },
      })
      results.allPassed = false
    }

    // Test 4: Immediate TTL test (can't wait in API call)
    try {
      const testKey = "api-test-key-ttl"
      const testValue = "API test value with TTL"

      cacheSet(testKey, testValue, 3600) // 1 hour TTL
      const retrievedValue = cacheGet(testKey)

      const passed = retrievedValue === testValue

      results.tests.push({
        name: "TTL setup (immediate check)",
        passed,
        details: passed ? undefined : { retrievedValue },
      })

      if (!passed) results.allPassed = false
    } catch (error) {
      results.tests.push({
        name: "TTL setup",
        passed: false,
        details: { error: String(error) },
      })
      results.allPassed = false
    }

    // Test 5: Cleanup function
    try {
      const cleanupResult = cleanupExpiredKeys()
      const passed = typeof cleanupResult === "number"

      results.tests.push({
        name: "Cleanup function",
        passed,
        details: { cleanedItems: cleanupResult },
      })

      if (!passed) results.allPassed = false
    } catch (error) {
      results.tests.push({
        name: "Cleanup function",
        passed: false,
        details: { error: String(error) },
      })
      results.allPassed = false
    }

    return NextResponse.json(results)
  } catch (error) {
    logger.error("Cache verification API error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to verify cache",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
