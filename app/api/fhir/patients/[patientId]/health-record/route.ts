/**
 * API Route: /api/fhir/patients/[patientId]/health-record
 * Fetches complete patient health record from FHIR server
 */

import { type NextRequest, NextResponse } from "next/server"
import { fetchPatientHealthRecord } from "@/lib/fhir/fhir-aiden-integration"
import { logger } from "@/lib/logging/enhanced-logger"
import { handleError } from "@/lib/error/error-handler"
import { validateUserPermission } from "@/lib/auth/permissions"

export async function GET(request: NextRequest, { params }: { params: { patientId: string } }) {
  try {
    // Validate user permissions
    const permissionCheck = await validateUserPermission(request, "fhir:read_health_record")
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized", message: permissionCheck.message }, { status: 403 })
    }

    const { patientId } = params

    logger.info("Fetching patient health record", { patientId })

    // Get complete health record
    const healthRecord = await fetchPatientHealthRecord(patientId)

    return NextResponse.json(healthRecord)
  } catch (error) {
    const errorResponse = handleError(error, { route: "/api/fhir/patients/[patientId]/health-record" })
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 })
  }
}
