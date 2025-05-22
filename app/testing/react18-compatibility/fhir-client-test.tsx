"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function FhirClientTest() {
  const [patientId, setPatientId] = useState("example-patient-1")
  const [result, setResult] = useState<any>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const testFhirPatient = async () => {
    setStatus("loading")
    try {
      const response = await fetch(`/api/fhir/patients/${patientId}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      setStatus("success")
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Unknown error" })
      setStatus("error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>FHIR Client Test</CardTitle>
        <CardDescription>Testing FHIR client with React 18</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          </div>

          <Button onClick={testFhirPatient} disabled={status === "loading"}>
            {status === "loading" ? "Testing..." : "Test FHIR Patient"}
          </Button>

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>FHIR operation completed successfully</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-50 border-red-200" variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result?.error || "FHIR operation failed"}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div>
              <h3 className="text-sm font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
