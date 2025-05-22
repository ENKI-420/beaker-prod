/**
 * API Route: /api/fhir/patients/[patientId]
 * Fetches patient data from FHIR server
 */

import { type NextRequest, NextResponse } from "next/server"
import { getPatient } from "@/lib/fhir/fhir-client"
import { transformPatient } from "@/lib/fhir/fhir-transformer"
import { logger } from "@/lib/logging/enhanced-logger"
import { handleError } from "@/lib/error/error-handler"
import { validateUserPermission } from "@/lib/auth/permissions"

export async function GET(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    // Validate user permissions
    const permissionCheck = await validateUserPermission(request, "fhir:read_patient")
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized", message: permissionCheck.message }, { status: 403 })
    }

    const { patientId } = params

    logger.info("Fetching patient data", { patientId })

    // Get patient from FHIR server
    const patient = await getPatient(patientId)

    // Transform to internal format
    const patientSummary = transformPatient(patient)

    return NextResponse.json(patientSummary)
  } catch (error) {
    const errorResponse = handleError(error, { route: "/api/fhir/patients/[patientId]" })
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 })
  }
}
