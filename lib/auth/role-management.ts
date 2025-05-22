import type { createClient } from "@supabase/supabase-js"
import { getSupabaseClient, getSupabaseServiceClient } from "../supabase/client"
import { logger } from "../logging/enhanced-logger"

export type UserRole = "admin" | "clinician" | "researcher" | "patient" | "developer"

export interface RoleAssignment {
  id: string
  userId: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

/**
 * Assigns a role to a user
 * @param userId - The user ID
 * @param role - The role to assign
 * @returns The role assignment ID
 */
export async function assignRoleToUser(userId: string, role: UserRole): Promise<string | null> {
  try {
    // Use service client for admin operations
    const supabase = getSupabaseServiceClient()

    const { data, error } = await supabase.rpc("assign_role", {
      user_id: userId,
      role_name: role,
    })

    if (error) {
      logger.error("Failed to assign role to user", { userId, role, error })
      throw error
    }

    logger.info("Role assigned successfully", { userId, role, roleId: data })
    return data
  } catch (error) {
    logger.error("Error in assignRoleToUser", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      role,
    })
    return null
  }
}

/**
 * Gets all roles for a user
 * @param userId - The user ID
 * @returns Array of user roles
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const supabase = getSupabaseServiceClient()

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId)

    if (error) {
      logger.error("Failed to get user roles", { userId, error })
      throw error
    }

    return data.map((item) => item.role as UserRole)
  } catch (error) {
    logger.error("Error in getUserRoles", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    })
    return []
  }
}

/**
 * Removes a role from a user
 * @param userId - The user ID
 * @param role - The role to remove
 * @returns Success status
 */
export async function removeRoleFromUser(userId: string, role: UserRole): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient()

    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role)

    if (error) {
      logger.error("Failed to remove role from user", { userId, role, error })
      throw error
    }

    logger.info("Role removed successfully", { userId, role })
    return true
  } catch (error) {
    logger.error("Error in removeRoleFromUser", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      role,
    })
    return false
  }
}

/**
 * Checks if a user has a specific role
 * @param userId - The user ID
 * @param role - The role to check
 * @returns Boolean indicating if user has the role
 */
export async function userHasRole(userId: string, role: UserRole): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.includes(role)
}

/**
 * Gets the current user's roles from their JWT claims
 * @param client - Supabase client
 * @returns Array of user roles
 */
export async function getCurrentUserRoles(client?: ReturnType<typeof createClient>): Promise<UserRole[]> {
  try {
    const supabase = client || getSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return []
    }

    // Extract roles from JWT claims
    const roles = session.user.app_metadata?.user_roles || []
    return roles as UserRole[]
  } catch (error) {
    logger.error("Error in getCurrentUserRoles", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return []
  }
}

/**
 * Gets the primary role of the current user
 * @param client - Supabase client
 * @returns The primary role or null
 */
export async function getCurrentUserPrimaryRole(client?: ReturnType<typeof createClient>): Promise<UserRole | null> {
  try {
    const supabase = client || getSupabaseClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    // Extract primary role from JWT claims
    const primaryRole = session.user.app_metadata?.user_role
    return (primaryRole as UserRole) || null
  } catch (error) {
    logger.error("Error in getCurrentUserPrimaryRole", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}
