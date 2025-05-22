"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { type UserRole, getCurrentUserRoles, getCurrentUserPrimaryRole } from "@/lib/auth/role-management"
import { logger } from "@/lib/logging/enhanced-logger"

export function useUserRoles() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadUserRoles() {
      try {
        setIsLoading(true)
        const supabase = getSupabaseClient()

        // Get user roles from JWT claims
        const userRoles = await getCurrentUserRoles(supabase)
        const primaryRole = await getCurrentUserPrimaryRole(supabase)

        setRoles(userRoles)
        setPrimaryRole(primaryRole)
        setError(null)
      } catch (err) {
        logger.error("Error loading user roles", {
          error: err instanceof Error ? err.message : "Unknown error",
        })
        setError(err instanceof Error ? err : new Error("Failed to load user roles"))
      } finally {
        setIsLoading(false)
      }
    }

    loadUserRoles()
  }, [])

  /**
   * Check if the user has a specific role
   * @param role - The role to check
   * @returns Boolean indicating if user has the role
   */
  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role)
  }

  /**
   * Check if the user has any of the specified roles
   * @param requiredRoles - Array of roles to check
   * @returns Boolean indicating if user has any of the roles
   */
  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.some((role) => roles.includes(role))
  }

  /**
   * Check if the user has all of the specified roles
   * @param requiredRoles - Array of roles to check
   * @returns Boolean indicating if user has all of the roles
   */
  const hasAllRoles = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.every((role) => roles.includes(role))
  }

  return {
    roles,
    primaryRole,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  }
}
