"use client"

import { useUserRoles } from "@/hooks/use-user-roles"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function UserRoleDisplay() {
  const { roles, primaryRole, isLoading, error } = useUserRoles()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-32" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading roles: {error.message}</div>
  }

  if (!roles.length) {
    return <div className="text-gray-500">No roles assigned</div>
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 hover:bg-red-600"
      case "clinician":
        return "bg-blue-500 hover:bg-blue-600"
      case "researcher":
        return "bg-green-500 hover:bg-green-600"
      case "patient":
        return "bg-purple-500 hover:bg-purple-600"
      case "developer":
        return "bg-orange-500 hover:bg-orange-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-500">Your Roles:</div>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <Badge
            key={role}
            className={`${getRoleBadgeColor(role)} ${role === primaryRole ? "ring-2 ring-offset-2" : ""}`}
          >
            {role}
            {role === primaryRole && " (primary)"}
          </Badge>
        ))}
      </div>
    </div>
  )
}
