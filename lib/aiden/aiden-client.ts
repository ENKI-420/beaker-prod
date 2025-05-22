/**
 * AIDEN AI Orchestration Engine Client
 * Provides secure communication with the AIDEN AI engine for task orchestration,
 * multi-modal data fusion, and decision support capabilities.
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { createAuthenticationError, createNetworkError } from "@/lib/error/error-handler"

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
 * Task types supported by AIDEN
 */
export enum AidenTaskType {
  DATA_ANALYSIS = "data_analysis",
  REPORT_GENERATION = "report_generation",
  ANOMALY_DETECTION = "anomaly_detection",
  DECISION_SUPPORT = "decision_support",
  WORKFLOW_AUTOMATION = "workflow_automation",
  GENOMIC_ANALYSIS = "genomic_analysis",
  THREAT_ASSESSMENT = "threat_assessment",
  COMPLIANCE_VERIFICATION = "compliance_verification",
}

/**
 * Task status values
 */
export enum AidenTaskStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

/**
 * Task priority levels
 */
export enum AidenTaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Task submission interface
 */
export interface AidenTaskSubmission {
  task_type: AidenTaskType
  priority?: AidenTaskPriority
  payload: Record<string, any>
  metadata?: {
    user_id?: string
    session_id?: string
    source_system?: string
    tags?: string[]
    context?: Record<string, any>
  }
  callback_url?: string
}

/**
 * Task response interface
 */
export interface AidenTaskResponse {
  task_id: string
  status: AidenTaskStatus
  created_at: string
  updated_at: string
  estimated_completion?: string
}

/**
 * Task result interface
 */
export interface AidenTaskResult<T = any> {
  task_id: string
  status: AidenTaskStatus
  result: T
  metrics?: {
    processing_time_ms: number
    confidence_score?: number
    model_version?: string
  }
  created_at: string
  completed_at: string
}

/**
 * Get an OAuth token for AIDEN API authentication
 * Uses client credentials flow
 */
async function getAidenToken(): Promise<string> {
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
 * Make an authenticated request to the AIDEN API
 */
async function aidenRequest<T>(
  endpoint: string,
  method = "GET",
  body?: any,
  additionalHeaders: Record<string, string> = {},
): Promise<T> {
  try {
    const token = await getAidenToken()

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...additionalHeaders,
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    }

    const response = await fetch(`${AIDEN_API_BASE_URL}${endpoint}`, requestOptions)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw createNetworkError(`AIDEN API error: ${errorData.message || response.statusText}`, {
        status: response.status,
        endpoint,
      })
    }

    return await response.json()
  } catch (error) {
    logger.error("AIDEN API request failed", {
      endpoint,
      method,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Submit a task to AIDEN for processing
 */
export async function submitAidenTask(task: AidenTaskSubmission): Promise<AidenTaskResponse> {
  logger.info("Submitting task to AIDEN", { task_type: task.task_type })
  return aidenRequest<AidenTaskResponse>("/tasks", "POST", task)
}

/**
 * Get the status of a task
 */
export async function getAidenTaskStatus(taskId: string): Promise<AidenTaskResponse> {
  logger.info("Checking AIDEN task status", { task_id: taskId })
  return aidenRequest<AidenTaskResponse>(`/tasks/${taskId}/status`)
}

/**
 * Get the result of a completed task
 */
export async function getAidenTaskResult<T = any>(taskId: string): Promise<AidenTaskResult<T>> {
  logger.info("Retrieving AIDEN task result", { task_id: taskId })
  return aidenRequest<AidenTaskResult<T>>(`/tasks/${taskId}/result`)
}

/**
 * Cancel a running task
 */
export async function cancelAidenTask(taskId: string): Promise<AidenTaskResponse> {
  logger.info("Cancelling AIDEN task", { task_id: taskId })
  return aidenRequest<AidenTaskResponse>(`/tasks/${taskId}/cancel`, "POST")
}

/**
 * Submit a genomic analysis task to AIDEN
 */
export async function submitGenomicAnalysisTask(
  genomicData: any,
  analysisType: string,
  metadata?: Record<string, any>,
): Promise<AidenTaskResponse> {
  const task: AidenTaskSubmission = {
    task_type: AidenTaskType.GENOMIC_ANALYSIS,
    priority: AidenTaskPriority.HIGH,
    payload: {
      genomic_data: genomicData,
      analysis_type: analysisType,
      parameters: metadata?.parameters || {},
    },
    metadata: {
      source_system: "AGENT_GENOMIC_PLATFORM",
      ...metadata,
    },
  }

  return submitAidenTask(task)
}

/**
 * Submit a compliance verification task to AIDEN
 */
export async function submitComplianceVerificationTask(
  data: any,
  complianceType: string,
  metadata?: Record<string, any>,
): Promise<AidenTaskResponse> {
  const task: AidenTaskSubmission = {
    task_type: AidenTaskType.COMPLIANCE_VERIFICATION,
    payload: {
      data,
      compliance_type: complianceType,
      standards: metadata?.standards || ["HIPAA", "FISMA"],
    },
    metadata: {
      source_system: "AGENT_COMPLIANCE_MODULE",
      ...metadata,
    },
  }

  return submitAidenTask(task)
}

export default {
  submitTask: submitAidenTask,
  getTaskStatus: getAidenTaskStatus,
  getTaskResult: getAidenTaskResult,
  cancelTask: cancelAidenTask,
  submitGenomicAnalysisTask,
  submitComplianceVerificationTask,
}
