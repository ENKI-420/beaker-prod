"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { logger } from "@/lib/logging/enhanced-logger"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InitRbac() {
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState("")

  const handleInitRbac = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      // Call the Supabase Edge Function with the admin token
      const response = await fetch("https://rdrsuhegrxnoshmofoxx.supabase.co/functions/v1/initialize-rbac", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the admin token in the Authorization header
          Authorization: `Bearer ${token}`,
        },
        // You can include additional parameters if needed
        body: JSON.stringify({
          projectId: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "rdrsuhegrxnoshmofoxx",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to initialize RBAC: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Failed to initialize RBAC")
      }

      toast.success("RBAC system initialized successfully")
      setToken("") // Clear the token input after success

      // Log success but don't include sensitive information
      logger.info("RBAC system initialized successfully")
    } catch (error) {
      logger.error("Error initializing RBAC", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      toast.error(error instanceof Error ? error.message : "Failed to initialize RBAC")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Initialize RBAC System</CardTitle>
        <CardDescription>Set up the Role-Based Access Control system in the database</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          This will create the necessary tables, functions, and policies for the RBAC system. Only run this once during
          initial setup.
        </p>

        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4">
          <p className="text-yellow-800 text-sm">
            Warning: This operation will modify the database schema. Make sure you have a backup before proceeding.
          </p>
        </div>

        <form onSubmit={handleInitRbac}>
          <div className="space-y-2">
            <Label htmlFor="adminToken">Admin Token</Label>
            <Input
              id="adminToken"
              name="adminToken"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter admin token"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading || !token.trim()} className="w-full mt-4">
            {isLoading ? "Initializing..." : "Initialize RBAC System"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
