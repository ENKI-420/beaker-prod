"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { assignRoleToUser, removeRoleFromUser, getUserRoles, type UserRole } from "@/lib/auth/role-management"
import { getSupabaseClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logging/enhanced-logger"

export function RoleManagement() {
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("clinician" as unknown as UserRole)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const roles = [
  "admin",
  "clinician",
  "researcher",
  "patient",
  "developer"
] as const satisfies readonly UserRole[];

  const handleSearchUser = async () => {
    if (!email) {
      toast.error("Please enter an email address")
      return
    }

    try {
      setIsSearching(true)
      const supabase = getSupabaseClient()

      // Search for user by email
      const { data, error } = await supabase.auth.admin.listUsers({
        filters: {
          email: email,
        },
      })

      if (error) throw error

      if (data.users.length === 0) {
        toast.error("User not found")
        return
      }

      const user = data.users[0]
      setUserId(user.id)

      // Get user's current roles
      const roles = [
  "admin",
  "clinician",
  "researcher",
  "patient",
  "developer"
] as const satisfies readonly UserRole[];
      setUserRoles(roles)

      toast.success("User found")
    } catch (error) {
      logger.error("Error searching for user", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      })
      toast.error("Failed to search for user")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAssignRole = async () => {
    if (!userId || !selectedRole) {
      toast.error("Please select a user and role")
      return
    }

    try {
      setIsLoading(true)
      await assignRoleToUser(userId, selectedRole)

      // Refresh user roles
      const roles = [
  "admin",
  "clinician",
  "researcher",
  "patient",
  "developer"
] as const satisfies readonly UserRole[];
      setUserRoles(roles)

      toast.success(`Role ${selectedRole} assigned successfully`)
    } catch (error) {
      logger.error("Error assigning role", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        role: selectedRole,
      })
      toast.error("Failed to assign role")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveRole = async (role: UserRole) => {
    if (!userId) {
      toast.error("User ID is required")
      return
    }

    try {
      setIsLoading(true)
      await removeRoleFromUser(userId, role)

      // Refresh user roles
      const roles = [
  "admin",
  "clinician",
  "researcher",
  "patient",
  "developer"
] as const satisfies readonly UserRole[];
      setUserRoles(roles)

      toast.success(`Role ${role} removed successfully`)
    } catch (error) {
      logger.error("Error removing role", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
        role,
      })
      toast.error("Failed to remove role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>Assign or remove roles for users in the system</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <div className="flex gap-2">
            <Input id="email" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={handleSearchUser} disabled={isSearching || !email}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {userId && (
          <>
            <div className="space-y-2">
              <Label htmlFor="role-select">Assign Role</Label>
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                  <SelectTrigger id="role-select" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignRole} disabled={isLoading || !selectedRole}>
                  {isLoading ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Roles</Label>
              <div className="flex flex-wrap gap-2">
                {userRoles.length > 0 ? (
                  userRoles.map((role) => (
                    <div key={role} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      <span>{role}</span>
                      <button
                        onClick={() => handleRemoveRole(role)}
                        className="text-red-500 hover:text-red-700"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setUserId("")
            setEmail("")
            setUserRoles([])
          }}
        >
          Clear
        </Button>
      </CardFooter>
    </Card>
  )
}
