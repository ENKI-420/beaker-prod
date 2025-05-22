/**
 * API Route: /api/fhir/auth
 * Initiates FHIR OAuth2 authentication flow
 */

import { type NextRequest, NextResponse } from "next/server"
import { generateAuthUrl, FhirScope } from "@/lib/fhir/fhir-oauth-client"
import { logger } from "@/lib/logging/enhanced-logger"
import { handleError } from "@/lib/error/error-handler"

/**
 * GET /api/fhir/auth
 * Initiates FHIR OAuth2 authentication flow
 */
export async function GET(request: NextRequest) {
  try {
    // Get requested scopes from query parameters
    const requestedScopes = request.nextUrl.searchParams.get("scope")?.split(" ") as FhirScope[] | undefined

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    // Store state in a cookie for validation in the callback
    const stateExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Generate the authorization URL
    const authUrl = generateAuthUrl(
      requestedScopes || [FhirScope.PATIENT_READ, FhirScope.OPENID, FhirScope.PROFILE, FhirScope.OFFLINE_ACCESS],
      state,
    )

    logger.info("Initiating FHIR OAuth2 authentication", {
      scopes: requestedScopes || "default",
      state,
    })

    // Set state cookie and redirect to authorization URL
    return NextResponse.redirect(authUrl, {
      headers: {
        "Set-Cookie": `fhir_auth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${stateExpires.toUTCString()}`,
      },
    })
  } catch (error) {
    const errorResponse = handleError(error, { route: "/api/fhir/auth" })
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 })
  }
}
