import { put, list, del, head, type PutOptions } from "@vercel/blob"
import { logger } from "../logging/enhanced-logger"

/**
 * Blob storage types and categories
 */
export enum BlobCategory {
  GENOMIC_DATA = "genomic-data",
  PATIENT_REPORTS = "patient-reports",
  ANALYSIS_RESULTS = "analysis-results",
  VISUALIZATIONS = "visualizations",
  REFERENCE_DATA = "reference-data",
  TEMP = "temp",
}

/**
 * Blob metadata interface
 */
export interface BlobMetadata {
  category: BlobCategory
  patientId?: string
  sampleId?: string
  fileType?: string
  contentType?: string
  size?: number
  createdAt?: string
  createdBy?: string
  description?: string
  version?: string
  tags?: string[]
  [key: string]: any
}

/**
 * Blob storage client for genomic data operations
 */

/**
 * Store a file in blob storage
 * @param data - File data (Buffer, ReadableStream, or File)
 * @param filename - Name of the file
 * @param metadata - Additional metadata for the file
 * @returns URL of the stored blob
 */
export async function storeBlob(
  data: Buffer | ReadableStream | File,
  filename: string,
  metadata: BlobMetadata,
): Promise<string> {
  try {
    // Create a path based on the category and other metadata
    const path = generateBlobPath(filename, metadata)

    // Prepare options
    const options: PutOptions = {
      access: "public", // or 'private' if needed
      addRandomSuffix: false, // Use our own path structure
      contentType: metadata.contentType,
      metadata: metadata,
    }

    // Store the blob
    const blob = await put(path, data, options)

    logger.info("Blob stored successfully", {
      path,
      url: blob.url,
      size: blob.size,
    })

    return blob.url
  } catch (error) {
    logger.error("Failed to store blob", {
      filename,
      category: metadata.category,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Generate a path for the blob based on metadata
 */
function generateBlobPath(filename: string, metadata: BlobMetadata): string {
  const parts = [metadata.category]

  // Add patient ID if available
  if (metadata.patientId) {
    parts.push(`patient-${metadata.patientId}`)
  }

  // Add sample ID if available
  if (metadata.sampleId) {
    parts.push(`sample-${metadata.sampleId}`)
  }

  // Add version if available
  if (metadata.version) {
    parts.push(`v${metadata.version}`)
  }

  // Add the filename
  parts.push(filename)

  return parts.join("/")
}

/**
 * Delete a blob from storage
 * @param url - URL of the blob to delete
 * @returns True if successful, false otherwise
 */
export async function deleteBlob(url: string): Promise<boolean> {
  try {
    await del(url)
    logger.info("Blob deleted successfully", { url })
    return true
  } catch (error) {
    logger.error("Failed to delete blob", {
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return false
  }
}

/**
 * List blobs in a directory
 * @param prefix - Directory prefix to list
 * @returns Array of blob information
 */
export async function listBlobs(prefix: string) {
  try {
    const blobs = await list({ prefix })
    logger.info("Blobs listed successfully", {
      prefix,
      count: blobs.blobs.length,
    })
    return blobs
  } catch (error) {
    logger.error("Failed to list blobs", {
      prefix,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Get blob metadata
 * @param url - URL of the blob
 * @returns Blob metadata
 */
export async function getBlobMetadata(url: string) {
  try {
    const blob = await head(url)
    logger.info("Blob metadata retrieved successfully", { url })
    return blob
  } catch (error) {
    logger.error("Failed to get blob metadata", {
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * List blobs for a specific patient
 * @param patientId - Patient ID
 * @param category - Optional category filter
 * @returns Array of blob information
 */
export async function listPatientBlobs(patientId: string, category?: BlobCategory) {
  const prefix = category ? `${category}/patient-${patientId}` : `patient-${patientId}`

  return listBlobs(prefix)
}

export default {
  storeBlob,
  deleteBlob,
  listBlobs,
  getBlobMetadata,
  listPatientBlobs,
  BlobCategory,
}
