import { RoleManagement } from "@/components/admin/role-management"
import { RoleGuard } from "@/components/auth/role-guard"

export default function RolesPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>

      <RoleGuard allowedRoles={["admin"]}>
        <RoleManagement />
      </RoleGuard>
    </div>
  )
}
