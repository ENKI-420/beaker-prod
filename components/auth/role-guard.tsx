"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserRoles } from "@/hooks/use-user-roles"
import type { UserRole } from "@/lib/auth/role-management"
import { logger } from "@/lib/logging/enhanced-logger"

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallbackPath?: string
  requireAll?: boolean
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
  requireAll = false,
}: RoleGuardProps) {
  const router = useRouter()
  const { roles, isLoading, hasAnyRole, hasAllRoles } = useUserRoles()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      const hasAccess = requireAll ? hasAllRoles(allowedRoles) : hasAnyRole(allowedRoles)

      setIsAuthorized(hasAccess)

      if (!hasAccess) {
        logger.warn("Unauthorized access attempt", {
          allowedRoles,
          userRoles: roles,
          requireAll,
        })
        router.push(fallbackPath)
      }
    }
  }, [isLoading, roles, allowedRoles, requireAll, hasAnyRole, hasAllRoles, router, fallbackPath])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return isAuthorized ? <>{children}</> : null
}
