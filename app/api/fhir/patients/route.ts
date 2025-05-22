import { type NextRequest, NextResponse } from "next/server"
import { searchPatients, type FhirSearchParams } from "@/lib/fhir/fhir-client"
import { logger } from "@/lib/logging/enhanced-logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract search parameters
    const name = searchParams.get("name")
    const identifier = searchParams.get("identifier")
    const gender = searchParams.get("gender")
    const birthDate = searchParams.get("birthDate")
    const phone = searchParams.get("phone")
    const email = searchParams.get("email")
    const address = searchParams.get("address")
    const _count = searchParams.get("_count") || "10"
    const _page = searchParams.get("_page") || "1"

    // Build FHIR search parameters
    const fhirParams: FhirSearchParams = {
      _count: Number.parseInt(_count),
      _sort: "-_lastUpdated",
    }

    // Add conditional search parameters
    if (name) fhirParams.name = name
    if (identifier) fhirParams.identifier = identifier
    if (gender) fhirParams.gender = gender
    if (birthDate) fhirParams.birthdate = birthDate
    if (phone) fhirParams["telecom:contains"] = phone
    if (email) fhirParams["telecom:contains"] = email
    if (address) fhirParams["address:contains"] = address

    // Calculate pagination
    if (Number.parseInt(_page) > 1) {
      fhirParams._getpagesoffset = (Number.parseInt(_page) - 1) * Number.parseInt(_count)
    }

    // Execute search
    logger.info("Searching for patients", { params: fhirParams })
    const results = await searchPatients(fhirParams)

    return NextResponse.json(results)
  } catch (error) {
    logger.error("Error searching patients", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      { error: "Failed to search patients", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
