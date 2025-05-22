import { InitRbac } from "@/components/admin/init-rbac"
import { RbacStatus } from "@/components/admin/rbac-status"

export default function InitRbacPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">RBAC System Initialization</h1>
      <InitRbac />
      <RbacStatus />
    </div>
  )
}
