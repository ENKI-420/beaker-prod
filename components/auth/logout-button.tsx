"use client"

import type { ReactNode } from "react"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  children: ReactNode
  redirectTo?: string
}

/**
 * Logout button component
 * Handles user sign out and optional redirect
 */
export function LogoutButton({ children, redirectTo = "/" }: LogoutButtonProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push(redirectTo)
  }

  return (
    <div onClick={handleLogout} role="button" tabIndex={0}>
      {children}
    </div>
  )
}
