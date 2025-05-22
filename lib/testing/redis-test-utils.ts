import type { Redis } from "@upstash/redis"
import { logger } from "../logging/enhanced-logger"
import { getGenomicRedisClient, createGenomicKVClient } from "../redis/genomic-redis-client"

/**
 * Test utilities for Redis operations
 * Provides helper functions for testing Redis functionality
 */

export interface TestResult {
  name: string
  success: boolean
  duration: number
  error?: string
  details?: Record<string, any>
}

export interface TestSuiteResult {
  name: string
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  results: TestResult[]
}

/**
 * Runs a single test case and returns the result
 * @param name - Test name
 * @param testFn - Test function to execute
 * @returns Test result
 */
export async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now()
  let success = false
  let error: string | undefined

  try {
    await testFn()
    success = true
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error"
    logger.error(`Test failed: ${name}`, { error })
  }

  const duration = Date.now() - start
  return { name, success, duration, error }
}

/**
 * Generates a unique test key to avoid collisions
 * @param prefix - Key prefix
 * @returns Unique key
 */
export function generateTestKey(prefix = "test"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
}

/**
 * Cleans up test keys after tests
 * @param keys - Array of keys to delete
 */
export async function cleanupTestKeys(keys: string[]): Promise<void> {
  const redis = getGenomicRedisClient()
  for (const key of keys) {
    try {
      await redis.del(key)
    } catch (error) {
      logger.warn(`Failed to clean up test key: ${key}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}

/**
 * Creates a test value with specified size
 * @param sizeInKB - Size of the test value in KB
 * @returns Test value as string
 */
export function createTestValue(sizeInKB = 1): string {
  const chunk = "X".repeat(1024) // 1KB chunk
  return chunk.repeat(sizeInKB)
}

/**
 * Measures Redis operation performance
 * @param operation - Function to measure
 * @param iterations - Number of iterations
 * @returns Average operation time in ms
 */
export async function measurePerformance(operation: () => Promise<any>, iterations = 100): Promise<number> {
  const times: number[] = []

  for (let i = 0; i < iterations; i++) {
    const start = Date.now()
    await operation()
    times.push(Date.now() - start)
  }

  // Calculate average time
  return times.reduce((sum, time) => sum + time, 0) / times.length
}

/**
 * Simulates network latency for testing
 * @param ms - Milliseconds to delay
 */
export function simulateLatency(ms = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Creates a test Redis client with custom configuration
 * @param config - Client configuration
 * @returns Redis client
 */
export function createTestClient(config?: { url?: string; token?: string }): Redis {
  return createGenomicKVClient(config)
}
