/**
 * API Route: /api/aiden/tasks
 * Handles task submission to AIDEN AI engine
 */

import { type NextRequest, NextResponse } from "next/server"
import { submitAidenTask, type AidenTaskSubmission } from "@/lib/aiden/aiden-client"
import { logger } from "@/lib/logging/enhanced-logger"
import { handleError } from "@/lib/error/error-handler"
import { validateUserPermission } from "@/lib/auth/permissions"

/**
 * POST /api/aiden/tasks
 * Submit a new task to AIDEN
 */
export async function POST(request: NextRequest) {
  try {
    // Validate user permissions
    const permissionCheck = await validateUserPermission(request, "aiden:submit_task")
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized", message: permissionCheck.message }, { status: 403 })
    }

    // Parse request body
    const taskSubmission: AidenTaskSubmission = await request.json()

    // Validate request
    if (!taskSubmission.task_type || !taskSubmission.payload) {
      return NextResponse.json(
        { error: "Bad Request", message: "Missing required fields: task_type or payload" },
        { status: 400 },
      )
    }

    // Add user context to metadata if available
    if (permissionCheck.user) {
      taskSubmission.metadata = {
        ...taskSubmission.metadata,
        user_id: permissionCheck.user.id,
      }
    }

    // Submit task to AIDEN
    const result = await submitAidenTask(taskSubmission)

    logger.info("AIDEN task submitted successfully", {
      task_id: result.task_id,
      task_type: taskSubmission.task_type,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const errorResponse = handleError(error, { route: "/api/aiden/tasks" })
    return NextResponse.json(errorResponse, { status: errorResponse.error.statusCode || 500 })
  }
}
