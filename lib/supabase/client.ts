import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { SUPABASE_CONFIG } from "../env"
import { logger } from "../logging/enhanced-logger"

// Types for Supabase clients
type SupabaseClientType = SupabaseClient

// Singleton instance for client-side
let clientInstance: SupabaseClientType | null = null

// Singleton instance for server-side with service role
let serviceClientInstance: SupabaseClientType | null = null

/**
 * Creates and returns a Supabase client for client-side use
 * Uses singleton pattern to prevent multiple instances
 */
export function getSupabaseClient(): SupabaseClientType {
  if (clientInstance) return clientInstance

  const supabaseUrl = SUPABASE_CONFIG.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = SUPABASE_CONFIG.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error("Missing Supabase environment variables for client")
    logger.error("Supabase client initialization failed", { error })
    throw error
  }

  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })

    logger.info("Supabase client initialized successfully")
    return clientInstance
  } catch (error) {
    logger.error("Failed to initialize Supabase client", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Creates and returns a Supabase client with service role for server-side use
 * Uses singleton pattern to prevent multiple instances
 */
export function getSupabaseServiceClient(): SupabaseClientType {
  if (serviceClientInstance) return serviceClientInstance

  const supabaseUrl = SUPABASE_CONFIG.SUPABASE_URL
  const supabaseServiceKey = SUPABASE_CONFIG.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    const error = new Error("Missing Supabase environment variables for service client")
    logger.error("Supabase service client initialization failed", { error })
    throw error
  }

  try {
    serviceClientInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    logger.info("Supabase service client initialized successfully")
    return serviceClientInstance
  } catch (error) {
    logger.error("Failed to initialize Supabase service client", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

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

export default {
  getClient: getSupabaseClient,
  getServiceClient: getSupabaseServiceClient,
  executeSql,
}
