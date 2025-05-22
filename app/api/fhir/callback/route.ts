/**
 * API Route: /api/fhir/callback
 * Handles FHIR OAuth2 callback
 */

import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken } from "@/lib/fhir/fhir-oauth-client"
import { logger } from "@/lib/logging/enhanced-logger"
import { cookies } from "next/headers"

/**
 * GET /api/fhir/callback
 * Handles FHIR OAuth2 callback
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization code and state from query parameters
    const code = request.nextUrl.searchParams.get("code")
    const state = request.nextUrl.searchParams.get("state")
    const error = request.nextUrl.searchParams.get("error")
    const errorDescription = request.nextUrl.searchParams.get("error_description")

    // Check for errors
    if (error) {
      logger.error("FHIR OAuth2 callback error", {
        error,
        error_description: errorDescription,
      })

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/fhir/auth-error?error=${error}&error_description=${errorDescription}`,
      )
    }

    // Validate required parameters
    if (!code || !state) {
      logger.error("FHIR OAuth2 callback missing required parameters", {
        code: !!code,
        state: !!state,
      })

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/fhir/auth-error?error=invalid_request&error_description=Missing+required+parameters`,
      )
    }

    // Validate state against stored state
    const cookieStore = cookies()
    const storedState = cookieStore.get("fhir_auth_state")?.value

    if (!storedState || storedState !== state) {
      logger.error("FHIR OAuth2 callback state mismatch", {
        received_state: state,
        stored_state: storedState || "none",
      })

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/fhir/auth-error?error=invalid_state&error_description=State+mismatch`,
      )
    }

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code)

    logger.info("FHIR OAuth2 authentication successful", {
      patient: tokenResponse.patient || "none",
      user: tokenResponse.user || "none",
      scope: tokenResponse.scope,
    })

    // Set tokens in cookies
    const tokenExpires = new Date(Date.now() + tokenResponse.expires_in * 1000)
    const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Create response with cookies
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || ""}/fhir/auth-success`)

    // Set cookies
    response.cookies.set({
      name: "fhir_access_token",
      value: tokenResponse.access_token,
      expires: tokenExpires,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    if (tokenResponse.refresh_token) {
      response.cookies.set({
        name: "fhir_refresh_token",
        value: tokenResponse.refresh_token,
        expires: refreshExpires,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    }

    // Store user/patient ID if available
    if (tokenResponse.patient) {
      response.cookies.set({
        name: "fhir_patient_id",
        value: tokenResponse.patient,
        expires: refreshExpires,
        path: "/",
        httpOnly: false, // Needed for client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    }

    if (tokenResponse.user) {
      response.cookies.set({
        name: "fhir_user_id",
        value: tokenResponse.user,
        expires: refreshExpires,
        path: "/",
        httpOnly: false, // Needed for client-side access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    }

    // Clear the state cookie
    response.cookies.set({
      name: "fhir_auth_state",
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    logger.error("FHIR OAuth2 callback error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/fhir/auth-error?error=server_error&error_description=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`,
    )
  }
}
