import { getSupabaseServiceClient } from "./client"
import { logger } from "../logging/enhanced-logger"
import fs from "fs"
import path from "path"

/**
 * Executes a SQL query using the Supabase service client
 * @param query SQL query to execute
 * @param params Query parameters
 * @returns Query result
 */
export async function executeSql(query: string, params?: any[]): Promise<any> {
  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase.rpc("exec_sql", { sql: query, params: params || [] })

    if (error) {
      logger.error("SQL execution failed", { error, query })
      throw error
    }

    return data
  } catch (error) {
    logger.error("Error executing SQL", {
      error: error instanceof Error ? error.message : "Unknown error",
      query,
    })
    throw error
  }
}

/**
 * Executes a SQL file using the Supabase service client
 * @param filePath Path to the SQL file
 * @returns Success status
 */
export async function executeSqlFile(filePath: string): Promise<boolean> {
  try {
    // Resolve the file path
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)

    // Read the SQL file
    const sqlContent = fs.readFileSync(resolvedPath, "utf8")

    // Execute the SQL
    await executeSql(sqlContent)

    logger.info("SQL file executed successfully", { filePath })
    return true
  } catch (error) {
    logger.error("Failed to execute SQL file", {
      filePath,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

export default {
  executeSql,
  executeSqlFile,
}
