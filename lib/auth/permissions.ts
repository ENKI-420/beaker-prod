/**
 * Permissions Module
 * Handles role-based access control (RBAC) for the application
 */

import type { NextRequest } from "next/server"
import { createAuthorizationError } from "@/lib/error/error-handler"
import { logger } from "@/lib/logging/enhanced-logger"
import { getSupabaseClient } from "@/lib/supabase/client"

// Permission types
export enum PermissionType {
  // AIDEN permissions
  AIDEN_SUBMIT_TASK = "aiden:submit_task",
  AIDEN_READ_TASK = "aiden:read_task",
  AIDEN_CANCEL_TASK = "aiden:cancel_task",
  AIDEN_ADMIN = "aiden:admin",

  // Genomic data permissions
  GENOMIC_READ = "genomic:read",
  GENOMIC_WRITE = "genomic:write",
  GENOMIC_ANALYZE = "genomic:analyze",
  GENOMIC_ADMIN = "genomic:admin",

  // Patient data permissions
  PATIENT_READ = "patient:read",
  PATIENT_WRITE = "patient:write",
  PATIENT_ADMIN = "patient:admin",

  // System permissions
  SYSTEM_READ = "system:read",
  SYSTEM_WRITE = "system:write",
  SYSTEM_ADMIN = "system:admin",
}

// Role types
export enum RoleType {
  ADMIN = "admin",
  CLINICIAN = "clinician",
  RESEARCHER = "researcher",
  LAB_TECHNICIAN = "lab_technician",
  ANALYST = "analyst",
  PATIENT = "patient",
  GUEST = "guest",
}

// Role to permissions mapping
const rolePermissions: Record<RoleType, PermissionType[]> = {
  [RoleType.ADMIN]: [
    // Admin has all permissions
    PermissionType.AIDEN_SUBMIT_TASK,
    PermissionType.AIDEN_READ_TASK,
    PermissionType.AIDEN_CANCEL_TASK,
    PermissionType.AIDEN_ADMIN,
    PermissionType.GENOMIC_READ,
    PermissionType.GENOMIC_WRITE,
    PermissionType.GENOMIC_ANALYZE,
    PermissionType.GENOMIC_ADMIN,
    PermissionType.PATIENT_READ,
    PermissionType.PATIENT_WRITE,
    PermissionType.PATIENT_ADMIN,
    PermissionType.SYSTEM_READ,
    PermissionType.SYSTEM_WRITE,
    PermissionType.SYSTEM_ADMIN,
  ],
  [RoleType.CLINICIAN]: [
    PermissionType.AIDEN_SUBMIT_TASK,
    PermissionType.AIDEN_READ_TASK,
    PermissionType.GENOMIC_READ,
    PermissionType.GENOMIC_ANALYZE,
    PermissionType.PATIENT_READ,
    PermissionType.PATIENT_WRITE,
    PermissionType.SYSTEM_READ,
  ],
  [RoleType.RESEARCHER]: [
    PermissionType.AIDEN_SUBMIT_TASK,
    PermissionType.AIDEN_READ_TASK,
    PermissionType.GENOMIC_READ,
    PermissionType.GENOMIC_ANALYZE,
    PermissionType.PATIENT_READ,
    PermissionType.SYSTEM_READ,
  ],
  [RoleType.LAB_TECHNICIAN]: [
    PermissionType.AIDEN_READ_TASK,
    PermissionType.GENOMIC_READ,
    PermissionType.GENOMIC_WRITE,
    PermissionType.PATIENT_READ,
    PermissionType.SYSTEM_READ,
  ],
  [RoleType.ANALYST]: [
    PermissionType.AIDEN_SUBMIT_TASK,
    PermissionType.AIDEN_READ_TASK,
    PermissionType.GENOMIC_READ,
    PermissionType.GENOMIC_ANALYZE,
    PermissionType.PATIENT_READ,
    PermissionType.SYSTEM_READ,
  ],
  [RoleType.PATIENT]: [PermissionType.GENOMIC_READ, PermissionType.PATIENT_READ, PermissionType.SYSTEM_READ],
  [RoleType.GUEST]: [PermissionType.SYSTEM_READ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: RoleType, permission: string): boolean {
  if (!rolePermissions[role]) {
    return false
  }

  return rolePermissions[role].includes(permission as PermissionType)
}

/**
 * Get user from request
 */
async function getUserFromRequest(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()

    // Get session from cookie
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    // Get user profile with role
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("id, role")
      .eq("user_id", session.user.id)
      .single()

    if (error || !profile) {
      logger.error("Failed to get user profile", {
        error: error?.message || "Profile not found",
        user_id: session.user.id,
      })
      return {
        id: session.user.id,
        email: session.user.email,
        role: RoleType.GUEST, // Default role if profile not found
      }
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: profile.role as RoleType,
    }
  } catch (error) {
    logger.error("Error getting user from request", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null
  }
}

/**
 * Validate user permission
 */
export async function validateUserPermission(request: NextRequest, permission: string) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request)

    // If no user found, return unauthorized
    if (!user) {
      return {
        authorized: false,
        message: "Authentication required",
        user: null,
      }
    }

    // Check if user has the required permission
    const authorized = hasPermission(user.role, permission)

    if (!authorized) {
      logger.warn("Permission denied", {
        user_id: user.id,
        permission,
        role: user.role,
      })

      return {
        authorized: false,
        message: `You don't have permission to perform this action (${permission})`,
        user,
      }
    }

    return {
      authorized: true,
      message: "Authorized",
      user,
    }
  } catch (error) {
    logger.error("Error validating user permission", {
      error: error instanceof Error ? error.message : "Unknown error",
      permission,
    })

    throw createAuthorizationError("Failed to validate permission", {
      permission,
    })
  }
}

export default {
  PermissionType,
  RoleType,
  hasPermission,
  validateUserPermission,
}
