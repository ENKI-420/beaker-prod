import { storeBlob, deleteBlob, listBlobs, BlobCategory } from "./blob-storage-client"
import { logger } from "../logging/enhanced-logger"

/**
 * Report types
 */
export enum ReportType {
  CLINICAL_SUMMARY = "clinical-summary",
  GENOMIC_ANALYSIS = "genomic-analysis",
  VARIANT_INTERPRETATION = "variant-interpretation",
  TREATMENT_RECOMMENDATION = "treatment-recommendation",
  FOLLOW_UP = "follow-up",
  CUSTOM = "custom",
}

/**
 * Report formats
 */
export enum ReportFormat {
  PDF = "pdf",
  HTML = "html",
  DOCX = "docx",
  JSON = "json",
}

/**
 * Patient report service for storing and retrieving patient reports
 */

/**
 * Store a patient report
 * @param data - Report data
 * @param filename - Name of the report file
 * @param patientId - Patient ID
 * @param reportType - Type of report
 * @param format - Format of the report
 * @param metadata - Additional metadata
 * @returns URL of the stored report
 */
export async function storePatientReport(
  data: Buffer | ReadableStream | File,
  filename: string,
  patientId: string,
  reportType: ReportType,
  format: ReportFormat,
  metadata: Record<string, any> = {},
): Promise<string> {
  try {
    // Determine content type based on format
    const contentType = getContentType(format)

    // Store the report
    const url = await storeBlob(data, filename, {
      category: BlobCategory.PATIENT_REPORTS,
      patientId,
      reportType,
      fileType: format,
      contentType,
      createdAt: new Date().toISOString(),
      ...metadata,
    })

    logger.info("Patient report stored successfully", {
      filename,
      patientId,
      reportType,
      format,
      url,
    })

    return url
  } catch (error) {
    logger.error("Failed to store patient report", {
      filename,
      patientId,
      reportType,
      format,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Get content type based on format
 */
function getContentType(format: ReportFormat): string {
  switch (format) {
    case ReportFormat.PDF:
      return "application/pdf"
    case ReportFormat.HTML:
      return "text/html"
    case ReportFormat.DOCX:
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    case ReportFormat.JSON:
      return "application/json"
    default:
      return "application/octet-stream"
  }
}

/**
 * List reports for a patient
 * @param patientId - Patient ID
 * @param reportType - Optional report type filter
 * @returns Array of patient reports
 */
export async function listPatientReports(patientId: string, reportType?: ReportType) {
  const prefix = reportType
    ? `${BlobCategory.PATIENT_REPORTS}/patient-${patientId}/${reportType}`
    : `${BlobCategory.PATIENT_REPORTS}/patient-${patientId}`

  return listBlobs(prefix)
}

/**
 * Delete a patient report
 * @param url - URL of the report to delete
 * @returns True if successful, false otherwise
 */
export async function deletePatientReport(url: string): Promise<boolean> {
  return deleteBlob(url)
}

export default {
  storePatientReport,
  listPatientReports,
  deletePatientReport,
  ReportType,
  ReportFormat,
}
