#!/usr/bin/env node

import { RedisTestRunner } from "../lib/testing/redis-test-runner"
import { logger } from "../lib/logging/enhanced-logger"

/**
 * Command-line script for running Redis tests
 * Usage: npm run test:redis
 */

async function main() {
  logger.info("Starting Redis test suite from command line")

  try {
    const testRunner = new RedisTestRunner()
    const results = await testRunner.runAllTests()

    // Log summary
    logger.info("Test suite completed", {
      totalTests: results.totalTests,
      passed: results.passed,
      failed: results.failed,
      durationMs: results.duration,
    })

    // Log detailed results
    console.log("\n=== Redis Test Results ===\n")
    console.log(`Total Tests: ${results.totalTests}`)
    console.log(`Passed: ${results.passed}`)
    console.log(`Failed: ${results.failed}`)
    console.log(`Duration: ${(results.duration / 1000).toFixed(2)}s`)
    console.log("\n=== Test Details ===\n")

    results.results.forEach((result, index) => {
      const status = result.success ? "✅ PASS" : "❌ FAIL"
      console.log(`${index + 1}. ${status} - ${result.name} (${result.duration}ms)`)
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0)
  } catch (error) {
    logger.error("Failed to run Redis tests", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    console.error("Error:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
