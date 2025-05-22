/**
 * API Route: /api/fhir/patients/[patientId]/analyze
 * Submits patient data to AIDEN for analysis
 */

import { type NextRequest, NextResponse } from "next/server"
import { submitPatientDataForAnalysis, FhirAnalysisType } from "@/lib/fhir/fhir-aiden-integration"
import { AidenTaskPriority } from "@/lib/aiden/aiden-client"
import { logger } from "@/lib/logging/enhanced-logger"
import { handleError } from "@/lib/error/error-handler"
import { validateUserPermission } from "@/lib/auth/permissions"

export async function POST(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    // Validate user permissions
    const permissionCheck = await validateUserPermission(request, "fhir:analyze_patient")
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized", message: permissionCheck.message }, { status: 403 })
    }

    const { patientId } = params

    // Parse request body
    const body = await request.json()
    const { analysisType, options = {} } = body

    // Validate analysis type
    if (!Object.values(FhirAnalysisType).includes(analysisType as FhirAnalysisType)) {
      return NextResponse.json({ error: "Bad Request", message: "Invalid analysis type" }, { status: 400 })
    }

    logger.info("Submitting patient data for analysis", { patientId, analysisType })

    // Submit patient data for analysis
    const result = await submitPatientDataForAnalysis(patientId, analysisType as FhirAnalysisType, {
      includeGenomicData: options.includeGenomicData,
      includeMedications: options.includeMedications,
      includeAllergies: options.includeAllergies,
      timeframe: options.timeframe,
      priority: (options.priority as AidenTaskPriority) || AidenTaskPriority.MEDIUM,
    })

    return NextResponse.json(result)
  } catch (error) {
    const errorResponse = handleError(error, { route: "/api/fhir/patients/[patientId]/analyze" })
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 })
  }
}
