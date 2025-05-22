import { getSupabaseServiceClient } from "./client"
import { logger } from "../logging/enhanced-logger"

/**
 * Verifies that RBAC tables and functions exist in the database
 * @returns Object indicating if RBAC is properly set up
 */
export async function verifyRbacSetup(): Promise<{
  isSetup: boolean
  tables: { [key: string]: boolean }
  functions: { [key: string]: boolean }
}> {
  try {
    const supabase = getSupabaseServiceClient()

    // Check if user_roles table exists
    const { data: userRolesExists, error: userRolesError } = await supabase.rpc("check_table_exists", {
      table_name: "user_roles",
    })

    if (userRolesError) {
      logger.error("Error checking user_roles table", { error: userRolesError })
    }

    // Check if functions exist
    const functionNames = ["custom_access_token_hook", "assign_role", "has_role"]
    const functionChecks: { [key: string]: boolean } = {}

    for (const funcName of functionNames) {
      const { data: exists, error } = await supabase.rpc("check_function_exists", { function_name: funcName })

      if (error) {
        logger.error(`Error checking function ${funcName}`, { error })
      }

      functionChecks[funcName] = !!exists
    }

    return {
      isSetup: userRolesExists && Object.values(functionChecks).every(Boolean),
      tables: {
        user_roles: !!userRolesExists,
      },
      functions: functionChecks,
    }
  } catch (error) {
    logger.error("Error verifying RBAC setup", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return {
      isSetup: false,
      tables: { user_roles: false },
      functions: {
        custom_access_token_hook: false,
        assign_role: false,
        has_role: false,
      },
    }
  }
}

/**
 * Assigns a role to a user
 * @param userId User ID to assign role to
 * @param role Role to assign
 * @returns Success status and role ID if successful
 */
export async function assignUserRole(userId: string, role: string): Promise<{ success: boolean; roleId?: string }> {
  try {
    const supabase = getSupabaseServiceClient()

    const { data, error } = await supabase.rpc("assign_role", { user_id: userId, role_name: role })

    if (error) {
      logger.error("Error assigning role to user", { error, userId, role })
      return { success: false }
    }

    return { success: true, roleId: data }
  } catch (error) {
    logger.error("Error in assignUserRole", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      role,
    })

    return { success: false }
  }
}

/**
 * Gets all roles for a user
 * @param userId User ID to get roles for
 * @returns Array of roles
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const supabase = getSupabaseServiceClient()

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId)

    if (error) {
      logger.error("Error getting user roles", { error, userId })
      return []
    }

    return data.map((row) => row.role)
  } catch (error) {
    logger.error("Error in getUserRoles", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    })

    return []
  }
}
