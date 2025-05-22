/**
 * FHIR OAuth2 Client
 * Handles OAuth 2.0 authentication with Epic's FHIR Sandbox
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { createAuthenticationError } from "@/lib/error/error-handler"

// FHIR OAuth configuration
const FHIR_BASE_URL = process.env.FHIR_BASE_URL || "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
const FHIR_AUTH_URL = process.env.FHIR_AUTH_URL || "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize"
const FHIR_TOKEN_URL = process.env.FHIR_TOKEN_URL || "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token"
const FHIR_CLIENT_ID = process.env.FHIR_CLIENT_ID
const FHIR_CLIENT_SECRET = process.env.FHIR_CLIENT_SECRET
const FHIR_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/fhir/callback`
  : "http://localhost:3000/api/fhir/callback"

// Token cache
interface TokenCache {
  [key: string]: {
    access_token: string
    refresh_token?: string
    expires_at: number
    scope: string
  }
}

const tokenCache: TokenCache = {}

/**
 * FHIR OAuth scopes
 */
export enum FhirScope {
  PATIENT_READ = "patient/*.read",
  PATIENT_WRITE = "patient/*.write",
  USER_READ = "user/*.read",
  USER_WRITE = "user/*.write",
  LAUNCH = "launch",
  LAUNCH_PATIENT = "launch/patient",
  OPENID = "openid",
  PROFILE = "profile",
  OFFLINE_ACCESS = "offline_access",
}

/**
 * Generate authorization URL for FHIR OAuth
 */
export function generateAuthUrl(
  scopes: FhirScope[] = [FhirScope.PATIENT_READ, FhirScope.OPENID, FhirScope.PROFILE, FhirScope.OFFLINE_ACCESS],
  state: string = generateRandomState(),
  aud: string = FHIR_BASE_URL,
): string {
  if (!FHIR_CLIENT_ID) {
    throw createAuthenticationError("Missing FHIR client ID")
  }

  const url = new URL(FHIR_AUTH_URL)
  url.searchParams.append("response_type", "code")
  url.searchParams.append("client_id", FHIR_CLIENT_ID)
  url.searchParams.append("redirect_uri", FHIR_REDIRECT_URI)
  url.searchParams.append("scope", scopes.join(" "))
  url.searchParams.append("state", state)
  url.searchParams.append("aud", aud)

  return url.toString()
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  patient?: string
  user?: string
}> {
  try {
    if (!FHIR_CLIENT_ID || !FHIR_CLIENT_SECRET) {
      throw createAuthenticationError("Missing FHIR client credentials")
    }

    const response = await fetch(FHIR_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: FHIR_CLIENT_ID,
        client_secret: FHIR_CLIENT_SECRET,
        redirect_uri: FHIR_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw createAuthenticationError(`Failed to exchange code for token: ${error.error || response.statusText}`)
    }

    const data = await response.json()

    // Cache the token
    const userId = data.patient || data.user || "anonymous"
    tokenCache[userId] = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute for safety
      scope: data.scope,
    }

    return data
  } catch (error) {
    logger.error("Failed to exchange code for token", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  userId = "anonymous",
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
}> {
  try {
    if (!FHIR_CLIENT_ID || !FHIR_CLIENT_SECRET) {
      throw createAuthenticationError("Missing FHIR client credentials")
    }

    const response = await fetch(FHIR_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: FHIR_CLIENT_ID,
        client_secret: FHIR_CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw createAuthenticationError(`Failed to refresh token: ${error.error || response.statusText}`)
    }

    const data = await response.json()

    // Update the cache
    tokenCache[userId] = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute for safety
      scope: data.scope,
    }

    return data
  } catch (error) {
    logger.error("Failed to refresh access token", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Get access token for a user
 * Will refresh if necessary
 */
export async function getAccessToken(userId = "anonymous"): Promise<string> {
  try {
    const cachedToken = tokenCache[userId]

    // If we have a valid cached token, return it
    if (cachedToken && cachedToken.expires_at > Date.now()) {
      return cachedToken.access_token
    }

    // If we have a refresh token, use it to get a new access token
    if (cachedToken && cachedToken.refresh_token) {
      const refreshedData = await refreshAccessToken(cachedToken.refresh_token, userId)
      return refreshedData.access_token
    }

    // Otherwise, we need to re-authenticate
    throw createAuthenticationError("No valid token available, re-authentication required")
  } catch (error) {
    logger.error("Failed to get access token", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Generate a random state string for OAuth
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Revoke a token
 */
export async function revokeToken(
  token: string,
  tokenType: "access_token" | "refresh_token" = "access_token",
): Promise<boolean> {
  try {
    if (!FHIR_CLIENT_ID || !FHIR_CLIENT_SECRET) {
      throw createAuthenticationError("Missing FHIR client credentials")
    }

    const response = await fetch(`${FHIR_TOKEN_URL}/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token,
        token_type_hint: tokenType,
        client_id: FHIR_CLIENT_ID,
        client_secret: FHIR_CLIENT_SECRET,
      }),
    })

    return response.ok
  } catch (error) {
    logger.error("Failed to revoke token", {
      tokenType,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

export default {
  generateAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  getAccessToken,
  revokeToken,
  FhirScope,
}
