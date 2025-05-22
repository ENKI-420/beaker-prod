import {
  getRedisPool,
  genomicRedisSet,
  genomicRedisGet,
  getRedisPoolStats,
  checkRedisPoolHealth,
} from "../lib/redis/genomic-redis-client"
import { logger } from "../lib/logging/enhanced-logger"

/**
 * Test script for Redis connection pool
 */
async function testRedisPool() {
  logger.info("Starting Redis connection pool test")

  try {
    // Initialize the pool
    const pool = getRedisPool()
    logger.info("Redis pool initialized", { stats: getRedisPoolStats() })

    // Check pool health
    const healthCheck = await checkRedisPoolHealth()
    logger.info("Redis pool health check", healthCheck)

    // Run parallel operations to test pool behavior
    const testCount = 20
    logger.info(`Running ${testCount} parallel Redis operations to test pool`)

    const testKey = "test:pool:parallel"
    const startTime = Date.now()

    // Create an array of promises for parallel execution
    const promises = Array.from({ length: testCount }).map(async (_, i) => {
      const itemKey = `${testKey}:${i}`
      const value = { index: i, timestamp: Date.now(), data: `Test data ${i}` }

      // Set value
      const setResult = await genomicRedisSet(itemKey, value)
      if (!setResult) {
        throw new Error(`Failed to set value for key ${itemKey}`)
      }

      // Get value
      const getValue = await genomicRedisGet(itemKey)
      if (!getValue) {
        throw new Error(`Failed to get value for key ${itemKey}`)
      }

      return { key: itemKey, value: getValue }
    })

    // Execute all promises in parallel
    const results = await Promise.all(promises)
    const duration = Date.now() - startTime

    logger.info(`Completed ${testCount} parallel Redis operations`, {
      durationMs: duration,
      averageMs: duration / testCount,
      poolStats: getRedisPoolStats(),
    })

    // Check final pool health
    const finalHealth = await checkRedisPoolHealth()
    logger.info("Final Redis pool health check", finalHealth)

    logger.info("Redis connection pool test completed successfully")
    return { success: true, results, duration, poolStats: getRedisPoolStats() }
  } catch (error) {
    logger.error("Redis connection pool test failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Execute the test if this script is run directly
if (require.main === module) {
  testRedisPool()
    .then((result) => {
      console.log("Test result:", result.success ? "SUCCESS" : "FAILURE")
      if (!result.success) {
        console.error("Error:", result.error)
        process.exit(1)
      }
      process.exit(0)
    })
    .catch((err) => {
      console.error("Unhandled error:", err)
      process.exit(1)
    })
}

export default testRedisPool
