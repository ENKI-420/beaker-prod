import { cacheSet, cacheGet, cacheDelete, cacheStats, cleanupExpiredKeys } from "../lib/cache/in-memory-cache"
import { logger } from "../lib/logging/enhanced-logger"

/**
 * Comprehensive verification of the in-memory cache
 */
async function verifyCache() {
  logger.info("Starting in-memory cache verification...")
  let allTestsPassed = true

  // Test 1: Basic set and get
  try {
    const testKey = "test-key-1"
    const testValue = { name: "Test Value", timestamp: Date.now() }

    logger.info("Test 1: Basic set and get")
    const setResult = cacheSet(testKey, testValue)

    if (!setResult) {
      logger.error("Test 1 Failed: Could not set value in cache")
      allTestsPassed = false
    } else {
      logger.info("Set operation successful")
    }

    const retrievedValue = cacheGet(testKey)

    if (!retrievedValue) {
      logger.error("Test 1 Failed: Could not retrieve value from cache")
      allTestsPassed = false
    } else if (retrievedValue.name !== testValue.name) {
      logger.error("Test 1 Failed: Retrieved value does not match original", {
        original: testValue,
        retrieved: retrievedValue,
      })
      allTestsPassed = false
    } else {
      logger.info("Test 1 Passed: Basic set and get operations work correctly")
    }
  } catch (error) {
    logger.error("Test 1 Failed with exception", { error })
    allTestsPassed = false
  }

  // Test 2: TTL functionality
  try {
    const testKey = "test-key-2"
    const testValue = "This value should expire"
    const shortTtl = 2 // 2 seconds

    logger.info("Test 2: TTL functionality")
    cacheSet(testKey, testValue, shortTtl)

    // Check immediately - should exist
    const immediateValue = cacheGet(testKey)
    if (!immediateValue) {
      logger.error("Test 2 Failed: Value not available immediately after setting")
      allTestsPassed = false
    } else {
      logger.info("Value available immediately after setting")
    }

    // Wait for expiration
    logger.info("Waiting for TTL to expire...")
    await new Promise((resolve) => setTimeout(resolve, shortTtl * 1000 + 500)) // Add 500ms buffer

    // Check after expiration - should be null
    const afterExpiryValue = cacheGet(testKey)
    if (afterExpiryValue) {
      logger.error("Test 2 Failed: Value still available after TTL expired", { value: afterExpiryValue })
      allTestsPassed = false
    } else {
      logger.info("Test 2 Passed: TTL functionality works correctly")
    }
  } catch (error) {
    logger.error("Test 2 Failed with exception", { error })
    allTestsPassed = false
  }

  // Test 3: Delete operation
  try {
    const testKey = "test-key-3"
    const testValue = "This value should be deleted"

    logger.info("Test 3: Delete operation")
    cacheSet(testKey, testValue)

    // Verify it was set
    const setValue = cacheGet(testKey)
    if (!setValue) {
      logger.error("Test 3 Failed: Could not set value for delete test")
      allTestsPassed = false
    } else {
      // Delete the value
      const deleteResult = cacheDelete(testKey)
      if (!deleteResult) {
        logger.error("Test 3 Failed: Delete operation returned false")
        allTestsPassed = false
      }

      // Verify it was deleted
      const afterDeleteValue = cacheGet(testKey)
      if (afterDeleteValue) {
        logger.error("Test 3 Failed: Value still available after deletion", { value: afterDeleteValue })
        allTestsPassed = false
      } else {
        logger.info("Test 3 Passed: Delete operation works correctly")
      }
    }
  } catch (error) {
    logger.error("Test 3 Failed with exception", { error })
    allTestsPassed = false
  }

  // Test 4: Cache statistics
  try {
    logger.info("Test 4: Cache statistics")
    const stats = cacheStats()

    if (!stats) {
      logger.error("Test 4 Failed: Could not retrieve cache statistics")
      allTestsPassed = false
    } else if (typeof stats.totalItems !== "number") {
      logger.error("Test 4 Failed: Statistics missing totalItems property", { stats })
      allTestsPassed = false
    } else {
      logger.info("Test 4 Passed: Cache statistics work correctly", { stats })
    }
  } catch (error) {
    logger.error("Test 4 Failed with exception", { error })
    allTestsPassed = false
  }

  // Test 5: Cleanup of expired items
  try {
    logger.info("Test 5: Cleanup of expired items")

    // Add several items with short TTL
    for (let i = 0; i < 5; i++) {
      cacheSet(`expired-key-${i}`, `Expired value ${i}`, 1) // 1 second TTL
    }

    // Wait for expiration
    logger.info("Waiting for items to expire...")
    await new Promise((resolve) => setTimeout(resolve, 1500)) // 1.5 seconds

    // Run cleanup
    const removedCount = cleanupExpiredKeys()

    if (removedCount < 5) {
      logger.error("Test 5 Failed: Not all expired items were cleaned up", { removedCount })
      allTestsPassed = false
    } else {
      logger.info("Test 5 Passed: Cleanup of expired items works correctly", { removedCount })
    }
  } catch (error) {
    logger.error("Test 5 Failed with exception", { error })
    allTestsPassed = false
  }

  // Final result
  if (allTestsPassed) {
    logger.info("✅ All tests passed! The in-memory cache is working correctly.")
  } else {
    logger.error("❌ Some tests failed. The in-memory cache may not be working correctly.")
  }
}

// Run the verification
verifyCache().catch((error) => {
  logger.error("Cache verification failed with unhandled exception", { error })
})
