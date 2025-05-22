import { UserRoleDisplay } from "@/components/auth/user-role-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details and roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Roles & Permissions</h3>
            <UserRoleDisplay />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
