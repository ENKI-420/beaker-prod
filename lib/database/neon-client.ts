import { neon } from "@neondatabase/serverless"
import { logger } from "../logging/enhanced-logger"

/**
 * Neon database client for serverless PostgreSQL operations
 * Uses the serverless driver which doesn't require native modules
 */

// Use environment variables with NEXT_ prefix if available
const connectionString = process.env.NEXT_POSTGRES_URL || process.env.POSTGRES_URL
const nonPoolingConnectionString = process.env.NEXT_POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING

// Create SQL query function using the appropriate connection string
export const sql = neon(nonPoolingConnectionString || connectionString)

/**
 * Health check function
 * @returns Boolean indicating if Neon database is healthy
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    await sql`SELECT 1`
    logger.info("Neon database health check successful")
    return true
  } catch (error) {
    logger.error("Neon database health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * Get connection strings for use in other parts of the application
 * @returns Object containing connection strings
 */
export const getConnectionStrings = () => {
  return {
    default: connectionString,
    nonPooling: nonPoolingConnectionString,
  }
}

export default {
  sql,
  healthCheck,
  getConnectionStrings,
}
