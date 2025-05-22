import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import { logger } from "../logging/enhanced-logger"

/**
 * Database client for PostgreSQL operations using Neon's serverless driver
 * This avoids native module dependencies that cause build issues
 */

// Use environment variables with NEXT_ prefix if available
const connectionString = process.env.NEXT_POSTGRES_URL || process.env.POSTGRES_URL
const nonPoolingConnectionString = process.env.NEXT_POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING

// Create SQL query function using the appropriate connection string
let sqlClient: NeonQueryFunction | null = null

/**
 * Returns a singleton instance of the SQL client
 * @returns Neon SQL query function
 */
export const getSqlClient = (): NeonQueryFunction => {
  if (!sqlClient) {
    try {
      sqlClient = neon(nonPoolingConnectionString || connectionString)
      logger.info("SQL client initialized")
    } catch (error) {
      logger.error("Failed to initialize SQL client", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  return sqlClient
}

/**
 * Executes a database query with proper error handling and logging
 * @param text - SQL query text
 * @param params - Query parameters
 * @returns Query result rows
 */
export async function query<T>(text: string, params: any[] = []): Promise<T[]> {
  const sql = getSqlClient()

  try {
    const start = Date.now()
    // Use the SQL template tag with parameters
    const result = await sql(text, ...params)
    const duration = Date.now() - start

    logger.info("Executed query", {
      query: text,
      duration,
      rows: result.length,
    })

    return result as T[]
  } catch (error) {
    logger.error("Query error", {
      query: text,
      params,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Executes a database query and returns a single result
 * @param text - SQL query text
 * @param params - Query parameters
 * @returns Single query result or null
 */
export async function queryOne<T>(text: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(text, params)
  return results.length > 0 ? results[0] : null
}

/**
 * Executes a database query without returning results
 * @param text - SQL query text
 * @param params - Query parameters
 */
export async function execute(text: string, params: any[] = []): Promise<void> {
  await query(text, params)
}

/**
 * Health check function
 * @returns Boolean indicating if database is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query("SELECT 1")
    return true
  } catch (error) {
    logger.error("Database health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

export default {
  query,
  queryOne,
  execute,
  healthCheck,
  getSqlClient,
}
