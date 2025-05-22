"use client"

/**
 * Patient Card Component
 * Displays patient information from FHIR
 */

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFhirPatient } from "@/hooks/use-fhir-patient"
import { FhirAnalysisType } from "@/lib/fhir/fhir-aiden-integration"
import { AidenTaskCard } from "@/components/aiden/aiden-task-card"
import { useState } from "react"
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Activity,
  AlertCircle,
  RefreshCw,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react"

interface PatientCardProps {
  patientId: string
  className?: string
}

/**
 * Patient Card Component
 */
export function PatientCard({ patientId, className }: PatientCardProps) {
  const { patient, healthRecord, isLoading, error, refetch } = useFhirPatient(patientId, {
    includeHealthRecord: true,
  })

  const [analysisTaskId, setAnalysisTaskId] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<FhirAnalysisType | null>(null)

  // Handle clinical summary generation
  const handleGenerateClinicalSummary = async () => {
    try {
      const result = await fetch(`/api/fhir/patients/${patientId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisType: FhirAnalysisType.CLINICAL_SUMMARY,
        }),
      })

      const data = await result.json()
      setAnalysisTaskId(data.task_id)
      setAnalysisType(FhirAnalysisType.CLINICAL_SUMMARY)
    } catch (error) {
      console.error("Failed to generate clinical summary:", error)
    }
  }

  // Handle risk assessment generation
  const handleGenerateRiskAssessment = async () => {
    try {
      const result = await fetch(`/api/fhir/patients/${patientId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisType: FhirAnalysisType.RISK_ASSESSMENT,
        }),
      })

      const data = await result.json()
      setAnalysisTaskId(data.task_id)
      setAnalysisType(FhirAnalysisType.RISK_ASSESSMENT)
    } catch (error) {
      console.error("Failed to generate risk assessment:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/6" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Patient</CardTitle>
          <CardDescription>Failed to load patient information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!patient) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Patient Not Found</CardTitle>
          <CardDescription>No patient information available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{patient.name}</CardTitle>
              <CardDescription>
                Patient ID: {patient.id} • MRN:{" "}
                {patient.identifiers.find((id) => id.type === "Medical Record Number")?.value || "Unknown"}
              </CardDescription>
            </div>
            <Badge variant={patient.active ? "default" : "destructive"}>{patient.active ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">Gender:</span>
                <span className="capitalize">{patient.gender || "Unknown"}</span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium mr-2">DOB:</span>
                <span>
                  {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : "Unknown"}{" "}
                  {patient.age ? `(${patient.age} years)` : ""}
                </span>
              </div>

              {patient.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Address:</span>
                  <span>{patient.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {patient.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Phone:</span>
                  <span>{patient.phone}</span>
                </div>
              )}

              {patient.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium mr-2">Email:</span>
                  <span>{patient.email}</span>
                </div>
              )}

              {patient.deceased && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium mr-2">Deceased:</span>
                  <span>{patient.deceasedDate ? new Date(patient.deceasedDate).toLocaleDateString() : "Yes"}</span>
                </div>
              )}
            </div>
          </div>

          {healthRecord && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Health Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1">
                    <Activity className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Conditions</span>
                  </div>
                  <p className="text-2xl font-bold">{healthRecord.conditions.length}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Observations</span>
                  </div>
                  <p className="text-2xl font-bold">{healthRecord.observations.length}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                  <div className="flex items-center text-amber-600 dark:text-amber-400 mb-1">
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Reports</span>
                  </div>
                  <p className="text-2xl font-bold">{healthRecord.diagnosticReports.length}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                  <div className="flex items-center text-purple-600 dark:text-purple-400 mb-1">
                    <Pill className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Medications</span>
                  </div>
                  <p className="text-2xl font-bold">{healthRecord.medications.length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleGenerateClinicalSummary}>
              Generate Clinical Summary
            </Button>
            <Button variant="outline" onClick={handleGenerateRiskAssessment}>
              Risk Assessment
            </Button>
          </div>
        </CardFooter>
      </Card>

      {analysisTaskId && (
        <AidenTaskCard
          taskId={analysisTaskId}
          title={
            analysisType === FhirAnalysisType.CLINICAL_SUMMARY
              ? "Clinical Summary"
              : analysisType === FhirAnalysisType.RISK_ASSESSMENT
                ? "Risk Assessment"
                : "AIDEN Analysis"
          }
          description={`AI-powered analysis of patient ${patient.name}`}
        />
      )}
    </div>
  )
}
