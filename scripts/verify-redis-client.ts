/**
 * Redis Client Verification Script
 *
 * This script tests the Redis client functionality after syntax fixes.
 * It verifies connection, set, get, and delete operations.
 */

import {
  createGenomicKVClient,
  genomicRedisSet,
  genomicRedisGet,
  genomicRedisDel,
  checkRedisPoolHealth,
} from "../lib/redis/genomic-redis-client"
import { logger } from "../lib/logging/enhanced-logger"

async function verifyRedisClient() {
  console.log("🧪 Starting Redis Client Verification...")
  console.log("----------------------------------------")

  const testKey = `test-key-${Date.now()}`
  const testValue = `test-value-${Date.now()}`
  let success = true

  try {
    // Step 1: Test connection
    console.log("Step 1: Testing Redis connection...")
    const client = createGenomicKVClient()
    const pingResult = await client.ping()

    if (pingResult === "PONG") {
      console.log("✅ Connection successful: Received PONG response")
    } else {
      console.error(`❌ Connection error: Expected PONG, got ${pingResult}`)
      success = false
    }

    // Step 2: Test pool health
    console.log("\nStep 2: Testing Redis pool health...")
    const healthResult = await checkRedisPoolHealth()

    if (healthResult.healthy) {
      console.log(
        `✅ Pool health check successful: ${healthResult.poolSize} connections, ${healthResult.responseTimeMs}ms response time`,
      )
    } else {
      console.error(`❌ Pool health check failed: ${healthResult.error}`)
      success = false
    }

    // Step 3: Test set operation
    console.log("\nStep 3: Testing SET operation...")
    console.log(`Setting ${testKey} = ${testValue}`)
    const setResult = await genomicRedisSet(testKey, testValue)

    if (setResult) {
      console.log("✅ SET operation successful")
    } else {
      console.error("❌ SET operation failed")
      success = false
    }

    // Step 4: Test get operation
    console.log("\nStep 4: Testing GET operation...")
    const getValue = await genomicRedisGet<string>(testKey)

    if (getValue === testValue) {
      console.log(`✅ GET operation successful: Retrieved "${getValue}"`)
    } else {
      console.error(`❌ GET operation failed: Expected "${testValue}", got "${getValue}"`)
      success = false
    }

    // Step 5: Test TTL set and expiration
    console.log("\nStep 5: Testing TTL functionality...")
    const ttlKey = `ttl-test-key-${Date.now()}`
    const ttlValue = `ttl-test-value-${Date.now()}`
    const ttlSeconds = 2

    console.log(`Setting ${ttlKey} with ${ttlSeconds} second TTL`)
    await genomicRedisSet(ttlKey, ttlValue, ttlSeconds)

    // Check immediately
    const immediateValue = await genomicRedisGet<string>(ttlKey)
    if (immediateValue === ttlValue) {
      console.log("✅ TTL immediate check successful")
    } else {
      console.error(`❌ TTL immediate check failed: Expected "${ttlValue}", got "${immediateValue}"`)
      success = false
    }

    // Wait for expiration
    console.log(`Waiting ${ttlSeconds + 1} seconds for key to expire...`)
    await new Promise((resolve) => setTimeout(resolve, (ttlSeconds + 1) * 1000))

    // Check after expiration
    const expiredValue = await genomicRedisGet<string>(ttlKey)
    if (expiredValue === null) {
      console.log("✅ TTL expiration successful: Key expired as expected")
    } else {
      console.error(`❌ TTL expiration failed: Key did not expire, got "${expiredValue}"`)
      success = false
    }

    // Step 6: Test delete operation
    console.log("\nStep 6: Testing DEL operation...")
    const delResult = await genomicRedisDel(testKey)

    if (delResult) {
      console.log("✅ DEL operation successful")
    } else {
      console.error("❌ DEL operation failed")
      success = false
    }

    // Verify deletion
    const deletedValue = await genomicRedisGet<string>(testKey)
    if (deletedValue === null) {
      console.log("✅ Verification successful: Key was deleted")
    } else {
      console.error(`❌ Verification failed: Key still exists with value "${deletedValue}"`)
      success = false
    }

    // Final result
    console.log("\n----------------------------------------")
    if (success) {
      console.log("🎉 All Redis client tests passed! The syntax fix was successful.")
    } else {
      console.error("❌ Some Redis client tests failed. Please check the logs above.")
    }
  } catch (error) {
    console.error("❌ Verification failed with an error:", error instanceof Error ? error.message : error)
    logger.error("Redis client verification failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    success = false
  }

  return success
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyRedisClient()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Fatal error during verification:", error)
      process.exit(1)
    })
}

export { verifyRedisClient }
