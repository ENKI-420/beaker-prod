"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyRbacSetup } from "@/lib/supabase/rbac-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function RbacStatus() {
  const [status, setStatus] = useState<{
    isSetup: boolean
    tables: { [key: string]: boolean }
    functions: { [key: string]: boolean }
    isLoading: boolean
    error?: string
  }>({
    isSetup: false,
    tables: {},
    functions: {},
    isLoading: true,
  })

  useEffect(() => {
    async function checkRbacStatus() {
      try {
        const result = await verifyRbacSetup()
        setStatus({
          ...result,
          isLoading: false,
        })
      } catch (error) {
        setStatus({
          isSetup: false,
          tables: {},
          functions: {},
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to check RBAC status",
        })
      }
    }

    checkRbacStatus()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>RBAC System Status</CardTitle>
        <CardDescription>Current status of the Role-Based Access Control system</CardDescription>
      </CardHeader>

      <CardContent>
        {status.isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : status.error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{status.error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {status.isSetup ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="font-medium">
                  Overall Status: {status.isSetup ? "Initialized" : "Not Initialized"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Database Tables:</h3>
                <ul className="space-y-1">
                  {Object.entries(status.tables).map(([table, exists]) => (
                    <li key={table} className="flex items-center text-sm">
                      {exists ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <code>{table}</code>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Database Functions:</h3>
                <ul className="space-y-1">
                  {Object.entries(status.functions).map(([func, exists]) => (
                    <li key={func} className="flex items-center text-sm">
                      {exists ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <code>{func}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {!status.isSetup && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  The RBAC system is not fully initialized. Please use the initialization tool to set up the required
                  database objects.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
