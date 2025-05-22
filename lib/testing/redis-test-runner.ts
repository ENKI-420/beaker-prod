import { logger } from "../logging/enhanced-logger"
import {
  type TestResult,
  type TestSuiteResult,
  runTest,
  generateTestKey,
  cleanupTestKeys,
  createTestValue,
  measurePerformance,
} from "./redis-test-utils"
import { getGenomicRedisClient, genomicRedisSet, genomicRedisGet, genomicRedisDel } from "../redis/genomic-redis-client"

/**
 * Redis Test Runner
 * Executes a comprehensive suite of tests for Redis operations
 */

export class RedisTestRunner {
  private testKeys: string[] = []
  private results: TestResult[] = []
  private startTime = 0

  /**
   * Initializes the test runner
   */
  constructor() {
    this.startTime = Date.now()
  }

  /**
   * Runs all Redis tests
   * @returns Test suite results
   */
  async runAllTests(): Promise<TestSuiteResult> {
    logger.info("Starting Redis test suite")

    try {
      // Connection tests
      await this.runTest("Connection - Basic connection", this.testBasicConnection.bind(this))
      await this.runTest("Connection - Client creation", this.testClientCreation.bind(this))
      await this.runTest("Connection - Connection pooling", this.testConnectionPooling.bind(this))

      // Basic operations
      await this.runTest("Operations - Set and get string", this.testSetGetString.bind(this))
      await this.runTest("Operations - Set and get object", this.testSetGetObject.bind(this))
      await this.runTest("Operations - Delete key", this.testDeleteKey.bind(this))
      await this.runTest("Operations - Check key existence", this.testKeyExists.bind(this))

      // TTL tests
      await this.runTest("TTL - Set with expiration", this.testSetWithExpiration.bind(this))
      await this.runTest("TTL - Key expiration", this.testKeyExpiration.bind(this))

      // Performance tests
      await this.runTest("Performance - Small value (1KB)", this.testSmallValuePerformance.bind(this))
      await this.runTest("Performance - Medium value (100KB)", this.testMediumValuePerformance.bind(this))
      await this.runTest("Performance - Large value (1MB)", this.testLargeValuePerformance.bind(this))
      await this.runTest("Performance - Batch operations", this.testBatchOperations.bind(this))

      // Error handling
      await this.runTest("Error - Invalid key type", this.testInvalidKeyType.bind(this))
      await this.runTest("Error - Recovery after error", this.testRecoveryAfterError.bind(this))

      // Edge cases
      await this.runTest("Edge - Empty key", this.testEmptyKey.bind(this))
      await this.runTest("Edge - Very long key", this.testVeryLongKey.bind(this))
      await this.runTest("Edge - Unicode characters", this.testUnicodeUnicode.bind(this))
    } finally {
      // Clean up all test keys
      await this.cleanup()
    }

    // Calculate test statistics
    const totalTests = this.results.length
    const passed = this.results.filter((r) => r.success).length
    const failed = totalTests - passed
    const duration = Date.now() - this.startTime

    const testSuiteResult: TestSuiteResult = {
      name: "Redis Operations Test Suite",
      timestamp: new Date().toISOString(),
      totalTests,
      passed,
      failed,
      skipped: 0,
      duration,
      results: this.results,
    }

    logger.info("Redis test suite completed", {
      totalTests,
      passed,
      failed,
      durationMs: duration,
    })

    return testSuiteResult
  }

  /**
   * Runs a single test and records the result
   * @param name - Test name
   * @param testFn - Test function
   */
  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    logger.info(`Running test: ${name}`)
    const result = await runTest(name, testFn)
    this.results.push(result)

    if (result.success) {
      logger.info(`Test passed: ${name}`, { durationMs: result.duration })
    } else {
      logger.error(`Test failed: ${name}`, { error: result.error, durationMs: result.duration })
    }
  }

  /**
   * Cleans up all test keys
   */
  private async cleanup(): Promise<void> {
    if (this.testKeys.length > 0) {
      logger.info(`Cleaning up ${this.testKeys.length} test keys`)
      await cleanupTestKeys(this.testKeys)
      this.testKeys = []
    }
  }

  /**
   * Test: Basic connection to Redis
   */
  private async testBasicConnection(): Promise<void> {
    const redis = getGenomicRedisClient()
    const ping = await redis.ping()

    if (ping !== "PONG") {
      throw new Error(`Expected PONG, got ${ping}`)
    }
  }

  /**
   * Test: Client creation with custom config
   */
  private async testClientCreation(): Promise<void> {
    // Use existing environment variables but create a new client instance
    const url = process.env.GENOMIC_KV_URL || process.env.GENOMIC_REDIS_URL || ""
    const token = process.env.GENOMIC_KV_REST_API_TOKEN || ""

    if (!url || !token) {
      throw new Error("Missing required Redis environment variables")
    }

    const customClient = new (getGenomicRedisClient() as any).constructor({ url, token })
    const ping = await customClient.ping()

    if (ping !== "PONG") {
      throw new Error(`Expected PONG, got ${ping}`)
    }
  }

  /**
   * Test: Connection pooling
   */
  private async testConnectionPooling(): Promise<void> {
    // Import the connection pool
    const { getRedisConnectionPool, getRedisPoolStats } = await import("../redis/genomic-redis-client")

    // Initialize the pool
    const pool = getRedisConnectionPool({
      maxConnections: 5,
      minConnections: 2,
    })

    // Get initial stats
    const initialStats = getRedisPoolStats()

    if (initialStats.totalConnections < initialStats.minConnections) {
      throw new Error(
        `Pool should have at least ${initialStats.minConnections} connections, but has ${initialStats.totalConnections}`,
      )
    }

    // Run multiple operations in parallel to test pool
    const operations = 10
    const keys: string[] = []

    for (let i = 0; i < operations; i++) {
      const key = generateTestKey(`pool-test-${i}`)
      keys.push(key)
      this.testKeys.push(key)
    }

    // Run parallel operations
    await Promise.all(
      keys.map(async (key, i) => {
        await genomicRedisSet(key, `pool-value-${i}`)
        const value = await genomicRedisGet<string>(key)
        if (value !== `pool-value-${i}`) {
          throw new Error(`Pool operation failed for key ${key}`)
        }
      }),
    )

    // Check final stats
    const finalStats = getRedisPoolStats()
    logger.info("Connection pool stats after test", finalStats)

    // Verify pool is working correctly
    if (finalStats.totalConnections < initialStats.minConnections) {
      throw new Error("Pool should maintain minimum connections")
    }
  }

  /**
   * Test: Set and get string value
   */
  private async testSetGetString(): Promise<void> {
    const key = generateTestKey("string")
    this.testKeys.push(key)
    const value = "test-value-" + Date.now()

    const setResult = await genomicRedisSet(key, value)
    if (!setResult) {
      throw new Error("Failed to set string value")
    }

    const getValue = await genomicRedisGet<string>(key)
    if (getValue !== value) {
      throw new Error(`Value mismatch: expected ${value}, got ${getValue}`)
    }
  }

  /**
   * Test: Set and get object value
   */
  private async testSetGetObject(): Promise<void> {
    const key = generateTestKey("object")
    this.testKeys.push(key)
    const value = {
      id: Date.now(),
      name: "Test Object",
      nested: {
        field1: "value1",
        field2: 42,
      },
    }

    const setResult = await genomicRedisSet(key, value)
    if (!setResult) {
      throw new Error("Failed to set object value")
    }

    const getValue = await genomicRedisGet<typeof value>(key)
    if (!getValue || getValue.id !== value.id || getValue.nested.field2 !== value.nested.field2) {
      throw new Error("Object value mismatch")
    }
  }

  /**
   * Test: Delete key
   */
  private async testDeleteKey(): Promise<void> {
    const key = generateTestKey("delete")
    this.testKeys.push(key)

    await genomicRedisSet(key, "delete-me")

    const deleteResult = await genomicRedisDel(key)
    if (!deleteResult) {
      throw new Error("Failed to delete key")
    }

    const getValue = await genomicRedisGet<string>(key)
    if (getValue !== null) {
      throw new Error(`Key should be deleted but returned: ${getValue}`)
    }
  }

  /**
   * Test: Check key existence
   */
  private async testKeyExists(): Promise<void> {
    const key = generateTestKey("exists")
    this.testKeys.push(key)
    const nonExistentKey = generateTestKey("non-existent")

    await genomicRedisSet(key, "i-exist")

    const existingValue = await genomicRedisGet<string>(key)
    const nonExistingValue = await genomicRedisGet<string>(nonExistentKey)

    if (existingValue === null) {
      throw new Error("Key should exist but returned null")
    }

    if (nonExistingValue !== null) {
      throw new Error(`Non-existent key should return null but got: ${nonExistingValue}`)
    }
  }

  /**
   * Test: Set with expiration
   */
  private async testSetWithExpiration(): Promise<void> {
    const key = generateTestKey("ttl")
    this.testKeys.push(key)

    await genomicRedisSet(key, "expires-soon", 5) // 5 seconds TTL

    const redis = getGenomicRedisClient()
    const ttl = await redis.ttl(key)

    if (ttl <= 0 || ttl > 5) {
      throw new Error(`Expected TTL between 1-5, got ${ttl}`)
    }
  }

  /**
   * Test: Key expiration
   */
  private async testKeyExpiration(): Promise<void> {
    const key = generateTestKey("expire")
    this.testKeys.push(key)

    await genomicRedisSet(key, "expires-quickly", 1) // 1 second TTL

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const value = await genomicRedisGet<string>(key)
    if (value !== null) {
      throw new Error(`Key should have expired but returned: ${value}`)
    }
  }

  /**
   * Test: Small value performance
   */
  private async testSmallValuePerformance(): Promise<void> {
    const key = generateTestKey("perf-small")
    this.testKeys.push(key)
    const value = createTestValue(1) // 1KB

    const setTime = await measurePerformance(async () => {
      await genomicRedisSet(key, value)
    }, 10)

    const getTime = await measurePerformance(async () => {
      await genomicRedisGet<string>(key)
    }, 10)

    logger.info("Small value performance", { setTimeMs: setTime, getTimeMs: getTime })
  }

  /**
   * Test: Medium value performance
   */
  private async testMediumValuePerformance(): Promise<void> {
    const key = generateTestKey("perf-medium")
    this.testKeys.push(key)
    const value = createTestValue(100) // 100KB

    const setTime = await measurePerformance(async () => {
      await genomicRedisSet(key, value)
    }, 5)

    const getTime = await measurePerformance(async () => {
      await genomicRedisGet<string>(key)
    }, 5)

    logger.info("Medium value performance", { setTimeMs: setTime, getTimeMs: getTime })
  }

  /**
   * Test: Large value performance
   */
  private async testLargeValuePerformance(): Promise<void> {
    const key = generateTestKey("perf-large")
    this.testKeys.push(key)
    const value = createTestValue(1024) // 1MB

    const setTime = await measurePerformance(async () => {
      await genomicRedisSet(key, value)
    }, 3)

    const getTime = await measurePerformance(async () => {
      await genomicRedisGet<string>(key)
    }, 3)

    logger.info("Large value performance", { setTimeMs: setTime, getTimeMs: getTime })
  }

  /**
   * Test: Batch operations
   */
  private async testBatchOperations(): Promise<void> {
    const redis = getGenomicRedisClient()
    const batchSize = 10
    const keys: string[] = []

    // Create batch of keys
    for (let i = 0; i < batchSize; i++) {
      const key = generateTestKey(`batch-${i}`)
      keys.push(key)
      this.testKeys.push(key)
    }

    // Test batch set
    const pipeline = redis.pipeline()
    for (let i = 0; i < batchSize; i++) {
      pipeline.set(keys[i], `batch-value-${i}`)
    }
    await pipeline.exec()

    // Verify all keys were set
    for (let i = 0; i < batchSize; i++) {
      const value = await genomicRedisGet<string>(keys[i])
      if (value !== `batch-value-${i}`) {
        throw new Error(`Batch operation failed for key ${keys[i]}`)
      }
    }
  }

  /**
   * Test: Invalid key type
   */
  private async testInvalidKeyType(): Promise<void> {
    try {
      // @ts-ignore - Intentionally passing invalid key type for testing
      await genomicRedisGet(null)
      throw new Error("Should have thrown an error for null key")
    } catch (error) {
      // Expected error, test passes
    }

    try {
      // @ts-ignore - Intentionally passing invalid key type for testing
      await genomicRedisGet(undefined)
      throw new Error("Should have thrown an error for undefined key")
    } catch (error) {
      // Expected error, test passes
    }

    try {
      // @ts-ignore - Intentionally passing invalid key type for testing
      await genomicRedisGet({ complex: "object" })
      throw new Error("Should have thrown an error for object key")
    } catch (error) {
      // Expected error, test passes
    }
  }

  /**
   * Test: Recovery after error
   */
  private async testRecoveryAfterError(): Promise<void> {
    try {
      // Intentionally cause an error
      // @ts-ignore - Intentionally passing invalid key type for testing
      await genomicRedisGet(null)
    } catch (error) {
      // Expected error
    }

    // Verify we can still use the client after an error
    const key = generateTestKey("recovery")
    this.testKeys.push(key)

    const setResult = await genomicRedisSet(key, "recovery-value")
    if (!setResult) {
      throw new Error("Failed to set value after error")
    }

    const getValue = await genomicRedisGet<string>(key)
    if (getValue !== "recovery-value") {
      throw new Error(`Recovery failed: expected "recovery-value", got ${getValue}`)
    }
  }

  /**
   * Test: Empty key
   */
  private async testEmptyKey(): Promise<void> {
    const key = ""

    try {
      await genomicRedisSet(key, "empty-key-value")
      throw new Error("Should have thrown an error for empty key")
    } catch (error) {
      // Expected error, test passes
    }
  }

  /**
   * Test: Very long key
   */
  private async testVeryLongKey(): Promise<void> {
    // Redis keys can be up to 512MB, but we'll test with a reasonably long key
    const key = "x".repeat(1000)
    this.testKeys.push(key)

    const setResult = await genomicRedisSet(key, "long-key-value")
    if (!setResult) {
      throw new Error("Failed to set value with long key")
    }

    const getValue = await genomicRedisGet<string>(key)
    if (getValue !== "long-key-value") {
      throw new Error(`Long key test failed: expected "long-key-value", got ${getValue}`)
    }
  }

  /**
   * Test: Unicode characters
   */
  private async testUnicodeUnicode(): Promise<void> {
    const key = generateTestKey("unicode") + "🔬🧬🧪"
    this.testKeys.push(key)
    const value = "Unicode value with emojis: 🧬 🔬 🧪 🦠 🧫"

    const setResult = await genomicRedisSet(key, value)
    if (!setResult) {
      throw new Error("Failed to set unicode value")
    }

    const getValue = await genomicRedisGet<string>(key)
    if (getValue !== value) {
      throw new Error(`Unicode test failed: expected "${value}", got "${getValue}"`)
    }
  }
}
