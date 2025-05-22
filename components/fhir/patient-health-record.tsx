"use client"

/**
 * Patient Health Record Component
 * Displays comprehensive patient health information from FHIR
 */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFhirPatient } from "@/hooks/use-fhir-patient"
import { PatientCard } from "@/components/fhir/patient-card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface PatientHealthRecordProps {
  patientId: string
  className?: string
}

/**
 * Patient Health Record Component
 */
export function PatientHealthRecord({ patientId, className }: PatientHealthRecordProps) {
  const { healthRecord, isLoading, error, refetch } = useFhirPatient(patientId, {
    includeHealthRecord: true,
  })

  const [activeTab, setActiveTab] = useState("overview")

  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-10 w-64 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Health Record</CardTitle>
          <CardDescription>Failed to load patient health information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!healthRecord) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Record Not Found</CardTitle>
          <CardDescription>No health record information available for this patient</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PatientCard patient={healthRecord.patient} />
        </TabsContent>
        <TabsContent value="conditions">{/* Render conditions here */}</TabsContent>
        <TabsContent value="medications">{/* Render medications here */}</TabsContent>
        <TabsContent value="procedures">{/* Render procedures here */}</TabsContent>
      </Tabs>
    </div>
  )
}
