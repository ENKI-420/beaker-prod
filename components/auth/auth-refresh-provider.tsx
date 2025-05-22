"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logging/enhanced-logger"

// Define refresh context type
interface AuthRefreshContextType {
  refreshSession: () => Promise<boolean>
}

// Create refresh context
const AuthRefreshContext = createContext<AuthRefreshContextType | undefined>(undefined)

// Auth refresh provider props
interface AuthRefreshProviderProps {
  children: ReactNode
  refreshInterval?: number
}

/**
 * Authentication refresh provider component
 * Handles token refresh for maintaining authentication state
 */
export function AuthRefreshProvider({
  children,
  refreshInterval = 10 * 60 * 1000, // Default: refresh every 10 minutes
}: AuthRefreshProviderProps) {
  const { isAuthenticated } = useAuth()

  // Set up refresh interval
  useEffect(() => {
    if (!isAuthenticated) return

    // Function to refresh the session
    const refreshSession = async () => {
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.refreshSession()

        if (error) {
          logger.error("Session refresh error", {
            error: error.message,
          })
        }
      } catch (error) {
        logger.error("Session refresh exception", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Initial refresh
    refreshSession()

    // Set up interval for regular refreshes
    const intervalId = setInterval(refreshSession, refreshInterval)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [isAuthenticated, refreshInterval])

  // Refresh session method
  const refreshSession = async (): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.refreshSession()

      if (error) {
        logger.error("Manual session refresh error", {
          error: error.message,
        })
        return false
      }

      return true
    } catch (error) {
      logger.error("Manual session refresh exception", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      return false
    }
  }

  // Provide refresh context
  return <AuthRefreshContext.Provider value={{ refreshSession }}>{children}</AuthRefreshContext.Provider>
}

/**
 * Hook to use authentication refresh context
 */
export function useAuthRefresh() {
  const context = useContext(AuthRefreshContext)

  if (context === undefined) {
    throw new Error("useAuthRefresh must be used within an AuthRefreshProvider")
  }

  return context
}
