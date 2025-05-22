import { type NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logging/enhanced-logger"
import { validateUserPermission, PermissionType } from "@/lib/auth/permissions"

/**
 * API route for getting a presentation by ID
 * GET /api/presentations/[id]
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate user permission
    const { authorized, message, user } = await validateUserPermission(request, PermissionType.SYSTEM_READ)

    if (!authorized || !user) {
      logger.warn("Unauthorized attempt to access presentation", {
        message,
        presentationId: params.id,
      })
      return NextResponse.json({ error: message }, { status: 401 })
    }

    // Get presentation ID from params
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Presentation ID is required" }, { status: 400 })
    }

    // In a real implementation, this would fetch the presentation from a database
    // For now, we'll return a mock response
    return NextResponse.json({
      presentation: {
        id,
        title: "Mock Presentation",
        description: "This is a mock presentation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slides: [
          {
            id: "slide_1",
            title: "Introduction",
            content: "This is the introduction slide",
            contentType: "educational",
            importance: 10,
            duration: 60,
          },
          {
            id: "slide_2",
            title: "Key Findings",
            content: "These are the key findings",
            contentType: "clinical",
            importance: 9,
            duration: 120,
          },
        ],
        config: {
          title: "Mock Presentation",
          contentTypes: ["educational", "clinical"],
          toneType: "conversational",
          detailLevel: "medium",
          includeMetrics: true,
          includeVisuals: true,
          includeCitations: false,
        },
        targetStakeholder: {
          role: user.role,
        },
        totalDuration: 180,
      },
    })
  } catch (error) {
    logger.error("Error getting presentation", {
      error: error instanceof Error ? error.message : "Unknown error",
      presentationId: params.id,
    })
    return NextResponse.json(
      { error: "Failed to get presentation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
