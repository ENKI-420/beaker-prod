"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logging/enhanced-logger"

// Define user type
interface User {
  id: string
  email?: string
  name?: string
  role?: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication provider component
 * Manages user authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient()

        // Check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            // You can fetch additional user data here if needed
          })
        }
      } catch (error) {
        logger.error("Auth initialization error", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Set up auth state change listener
  useEffect(() => {
    try {
      const supabase = getSupabaseClient()

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            // You can fetch additional user data here if needed
          })
        } else {
          setUser(null)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      logger.error("Auth subscription error", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }, [])

  // Sign in method
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          // You can fetch additional user data here if needed
        })
        return { success: true }
      }

      return { success: false, error: "Unknown error occurred" }
    } catch (error) {
      logger.error("Sign in error", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out method
  const signOut = async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      logger.error("Sign out error", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
