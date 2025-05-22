"use client"

/**
 * Hook for fetching and managing FHIR patient data
 */

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast-provider"
import type { PatientSummary, PatientHealthRecord } from "@/lib/fhir/fhir-transformer"
import type { FhirAnalysisType } from "@/lib/fhir/fhir-aiden-integration"
import { useAidenTask } from "@/hooks/use-aiden-task"

interface UseFhirPatientOptions {
  autoFetch?: boolean
  includeHealthRecord?: boolean
}

interface UseFhirPatientReturn {
  patient: PatientSummary | null
  healthRecord: PatientHealthRecord | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  analyzePatientData: (analysisType: FhirAnalysisType, options?: any) => Promise<any>
}

/**
 * Hook for fetching and managing FHIR patient data
 */
export function useFhirPatient(patientId: string, options: UseFhirPatientOptions = {}): UseFhirPatientReturn {
  const { autoFetch = true, includeHealthRecord = false } = options

  const [patient, setPatient] = useState<PatientSummary | null>(null)
  const [healthRecord, setHealthRecord] = useState<PatientHealthRecord | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const { addToast } = useToast()
  const { submitTask } = useAidenTask()

  // Fetch patient data
  const fetchPatient = async () => {
    if (!patientId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/fhir/patients/${patientId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch patient data")
      }

      const data = await response.json()
      setPatient(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(error instanceof Error ? error : new Error(errorMessage))

      addToast({
        type: "error",
        title: "Error",
        message: `Failed to fetch patient data: ${errorMessage}`,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch patient health record
  const fetchHealthRecord = async () => {
    if (!patientId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/fhir/patients/${patientId}/health-record`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch health record")
      }

      const data = await response.json()
      setHealthRecord(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(error instanceof Error ? error : new Error(errorMessage))

      addToast({
        type: "error",
        title: "Error",
        message: `Failed to fetch health record: ${errorMessage}`,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch data
  const refetch = async () => {
    await fetchPatient()
    if (includeHealthRecord) {
      await fetchHealthRecord()
    }
  }

  // Analyze patient data
  const analyzePatientData = async (analysisType: FhirAnalysisType, options: any = {}) => {
    if (!patientId) {
      throw new Error("Patient ID is required")
    }

    try {
      const response = await fetch(`/api/fhir/patients/${patientId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisType,
          options,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to analyze patient data")
      }

      const data = await response.json()

      addToast({
        type: "success",
        title: "Analysis Submitted",
        message: `Patient data analysis has been submitted successfully`,
        duration: 3000,
      })

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      addToast({
        type: "error",
        title: "Error",
        message: `Failed to analyze patient data: ${errorMessage}`,
        duration: 5000,
      })

      throw error
    }
  }

  // Fetch data on mount or when patientId changes
  useEffect(() => {
    if (autoFetch && patientId) {
      fetchPatient()
      if (includeHealthRecord) {
        fetchHealthRecord()
      }
    }
  }, [patientId, autoFetch, includeHealthRecord])

  return {
    patient,
    healthRecord,
    isLoading,
    error,
    refetch,
    analyzePatientData,
  }
}
