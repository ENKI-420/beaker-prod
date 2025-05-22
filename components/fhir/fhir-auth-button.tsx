"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Link2, Loader2 } from "lucide-react"

interface FhirAuthButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  scopes?: string[]
  onSuccess?: () => void
  onError?: (error: string) => void
  children?: React.ReactNode
}

/**
 * FHIR OAuth2 Authentication Button
 * Initiates the FHIR OAuth2 authentication flow
 */
export function FhirAuthButton({
  variant = "default",
  size = "default",
  className,
  scopes = ["patient/*.read", "openid", "profile", "offline_access"],
  onSuccess,
  onError,
  children,
}: FhirAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAuth = async () => {
    try {
      setIsLoading(true)

      // Store the current URL to return to after authentication
      sessionStorage.setItem("fhir_auth_redirect", window.location.href)

      // Build the auth URL
      const authUrl = `/api/fhir/auth?scope=${encodeURIComponent(scopes.join(" "))}`

      // Redirect to the auth URL
      window.location.href = authUrl
    } catch (error) {
      setIsLoading(false)
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      })

      if (onError) {
        onError(errorMessage)
      }
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleAuth} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
      {children || "Connect to Epic FHIR"}
    </Button>
  )
}
