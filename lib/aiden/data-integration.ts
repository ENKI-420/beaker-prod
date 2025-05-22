/**
 * AIDEN Data Integration Module
 * Handles multi-modal data fusion between AGENT and AIDEN
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { getAidenToken } from "@/lib/aiden/aiden-auth"
import { createNetworkError } from "@/lib/error/error-handler"

// AIDEN API configuration
const AIDEN_API_BASE_URL = process.env.AIDEN_API_BASE_URL || "https://api.aiden.agiledefense.com/v1"

/**
 * Data source types
 */
export enum DataSourceType {
  FHIR = "fhir",
  GENOMIC = "genomic",
  TELEMETRY = "telemetry",
  SENSOR = "sensor",
  OPERATIONAL = "operational",
  ENVIRONMENTAL = "environmental",
  MEDICAL_IMAGING = "medical_imaging",
}

/**
 * Data fusion request interface
 */
export interface DataFusionRequest {
  sources: {
    type: DataSourceType
    data: any
    metadata?: Record<string, any>
  }[]
  fusion_type: "correlation" | "aggregation" | "enrichment" | "anomaly_detection"
  parameters?: Record<string, any>
}

/**
 * Data fusion response interface
 */
export interface DataFusionResponse {
  fusion_id: string
  status: "completed" | "processing" | "failed"
  result?: any
  metrics?: {
    processing_time_ms: number
    confidence_score?: number
    data_quality_score?: number
  }
}

/**
 * Submit data for multi-modal fusion
 */
export async function submitDataFusion(request: DataFusionRequest): Promise<DataFusionResponse> {
  try {
    logger.info("Submitting data fusion request", {
      fusion_type: request.fusion_type,
      source_types: request.sources.map((s) => s.type),
    })

    const token = await getAidenToken()

    const response = await fetch(`${AIDEN_API_BASE_URL}/data/fusion`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw createNetworkError(`Data fusion request failed: ${errorData.message || response.statusText}`, {
        status: response.status,
      })
    }

    return await response.json()
  } catch (error) {
    logger.error("Data fusion request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Get the result of a data fusion operation
 */
export async function getDataFusionResult(fusionId: string): Promise<DataFusionResponse> {
  try {
    logger.info("Retrieving data fusion result", { fusion_id: fusionId })

    const token = await getAidenToken()

    const response = await fetch(`${AIDEN_API_BASE_URL}/data/fusion/${fusionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw createNetworkError(`Failed to retrieve data fusion result: ${errorData.message || response.statusText}`, {
        status: response.status,
      })
    }

    return await response.json()
  } catch (error) {
    logger.error("Failed to retrieve data fusion result", {
      fusion_id: fusionId,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Submit FHIR data for integration
 */
export async function submitFhirData(fhirData: any, parameters?: Record<string, any>): Promise<DataFusionResponse> {
  const request: DataFusionRequest = {
    sources: [
      {
        type: DataSourceType.FHIR,
        data: fhirData,
      },
    ],
    fusion_type: "enrichment",
    parameters,
  }

  return submitDataFusion(request)
}

/**
 * Submit genomic data for integration
 */
export async function submitGenomicData(
  genomicData: any,
  parameters?: Record<string, any>,
): Promise<DataFusionResponse> {
  const request: DataFusionRequest = {
    sources: [
      {
        type: DataSourceType.GENOMIC,
        data: genomicData,
      },
    ],
    fusion_type: "enrichment",
    parameters,
  }

  return submitDataFusion(request)
}

/**
 * Submit multi-modal data for correlation analysis
 */
export async function correlateMultiModalData(
  fhirData: any,
  genomicData: any,
  telemetryData?: any,
  parameters?: Record<string, any>,
): Promise<DataFusionResponse> {
  const sources = [
    {
      type: DataSourceType.FHIR,
      data: fhirData,
    },
    {
      type: DataSourceType.GENOMIC,
      data: genomicData,
    },
  ]

  if (telemetryData) {
    sources.push({
      type: DataSourceType.TELEMETRY,
      data: telemetryData,
    })
  }

  const request: DataFusionRequest = {
    sources,
    fusion_type: "correlation",
    parameters,
  }

  return submitDataFusion(request)
}

export default {
  submitDataFusion,
  getDataFusionResult,
  submitFhirData,
  submitGenomicData,
  correlateMultiModalData,
  DataSourceType,
}
