import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logging/enhanced-logger"
import { generateAdaptivePresentation } from "@/lib/agent/services/adaptive-presentation"
import { validateUserPermission, PermissionType } from "@/lib/auth/permissions"

/**
 * API route for generating adaptive presentations
 * POST /api/presentations/generate
 */
export async function POST(request: NextRequest) {
  try {
    // Validate user permission
    const { authorized, message, user } = await validateUserPermission(request, PermissionType.SYSTEM_READ)

    if (!authorized || !user) {
      logger.warn("Unauthorized attempt to generate presentation", {
        message,
      })
      return NextResponse.json({ error: message }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { stakeholder, config, contentId } = body

    // Validate request
    if (!stakeholder || !stakeholder.role) {
      return NextResponse.json({ error: "Stakeholder profile with role is required" }, { status: 400 })
    }

    // Generate presentation
    const presentation = await generateAdaptivePresentation(stakeholder, config, contentId)

    // Return presentation
    return NextResponse.json({ presentation })
  } catch (error) {
    logger.error("Error generating presentation", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json(
      { error: "Failed to generate presentation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
