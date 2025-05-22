/**
 * AIDEN Authentication Module
 * Handles authentication with the AIDEN AI engine using OAuth 2.0
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { createAuthenticationError } from "@/lib/error/error-handler"

// AIDEN API configuration
const AIDEN_API_BASE_URL = process.env.AIDEN_API_BASE_URL || "https://api.aiden.agiledefense.com/v1"
const AIDEN_CLIENT_ID = process.env.AIDEN_CLIENT_ID
const AIDEN_CLIENT_SECRET = process.env.AIDEN_CLIENT_SECRET

// Token cache
let cachedToken: {
  access_token: string
  expires_at: number
} | null = null

/**
 * Get an OAuth token for AIDEN API authentication
 * Uses client credentials flow
 */
export async function getAidenToken(): Promise<string> {
  try {
    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expires_at > Date.now()) {
      return cachedToken.access_token
    }

    // Validate required credentials
    if (!AIDEN_CLIENT_ID || !AIDEN_CLIENT_SECRET) {
      throw createAuthenticationError("Missing AIDEN API credentials")
    }

    // Request new token
    const response = await fetch(`${AIDEN_API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AIDEN_CLIENT_ID,
        client_secret: AIDEN_CLIENT_SECRET,
        scope: "aiden:tasks aiden:data",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw createAuthenticationError(`Failed to obtain AIDEN token: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    // Cache the token with expiration
    cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60000, // Subtract 1 minute for safety
    }

    return cachedToken.access_token
  } catch (error) {
    logger.error("AIDEN authentication error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Validate an AIDEN JWT token
 */
export async function validateAidenToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${AIDEN_API_BASE_URL}/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })

    return response.ok
  } catch (error) {
    logger.error("AIDEN token validation error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * Clear the token cache
 */
export function clearAidenTokenCache(): void {
  cachedToken = null
}

export default {
  getAidenToken,
  validateAidenToken,
  clearAidenTokenCache,
}
