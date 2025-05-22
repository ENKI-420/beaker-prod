import { storeBlob, listBlobs, BlobCategory } from "./blob-storage-client"
import { logger } from "../logging/enhanced-logger"

/**
 * Genomic file types
 */
export enum GenomicFileType {
  VCF = "vcf",
  BAM = "bam",
  FASTQ = "fastq",
  BED = "bed",
  GTF = "gtf",
  FASTA = "fasta",
  JSON = "json",
  CSV = "csv",
  TSV = "tsv",
  REPORT = "report",
}

/**
 * Genomic data service for storing and retrieving genomic files
 */

/**
 * Store a genomic file
 * @param data - File data
 * @param filename - Name of the file
 * @param patientId - Patient ID
 * @param fileType - Type of genomic file
 * @param metadata - Additional metadata
 * @returns URL of the stored file
 */
export async function storeGenomicFile(
  data: Buffer | ReadableStream | File,
  filename: string,
  patientId: string,
  fileType: GenomicFileType,
  metadata: Record<string, any> = {},
): Promise<string> {
  try {
    // Determine content type based on file type
    const contentType = getContentType(fileType)

    // Store the file
    const url = await storeBlob(data, filename, {
      category: BlobCategory.GENOMIC_DATA,
      patientId,
      fileType,
      contentType,
      createdAt: new Date().toISOString(),
      ...metadata,
    })

    logger.info("Genomic file stored successfully", {
      filename,
      patientId,
      fileType,
      url,
    })

    return url
  } catch (error) {
    logger.error("Failed to store genomic file", {
      filename,
      patientId,
      fileType,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error
  }
}

/**
 * Get content type based on file type
 */
function getContentType(fileType: GenomicFileType): string {
  switch (fileType) {
    case GenomicFileType.VCF:
      return "text/plain"
    case GenomicFileType.BAM:
      return "application/octet-stream"
    case GenomicFileType.FASTQ:
      return "text/plain"
    case GenomicFileType.BED:
      return "text/plain"
    case GenomicFileType.GTF:
      return "text/plain"
    case GenomicFileType.FASTA:
      return "text/plain"
    case GenomicFileType.JSON:
      return "application/json"
    case GenomicFileType.CSV:
      return "text/csv"
    case GenomicFileType.TSV:
      return "text/tab-separated-values"
    case GenomicFileType.REPORT:
      return "application/pdf"
    default:
      return "application/octet-stream"
  }
}

/**
 * List genomic files for a patient
 * @param patientId - Patient ID
 * @returns Array of genomic files
 */
export async function listPatientGenomicFiles(patientId: string) {
  return listBlobs(`${BlobCategory.GENOMIC_DATA}/patient-${patientId}`)
}

/**
 * Store a VCF file
 * @param data - VCF file data
 * @param filename - Name of the file
 * @param patientId - Patient ID
 * @param metadata - Additional metadata
 * @returns URL of the stored file
 */
export async function storeVCFFile(
  data: Buffer | ReadableStream | File,
  filename: string,
  patientId: string,
  metadata: Record<string, any> = {},
): Promise<string> {
  return storeGenomicFile(data, filename, patientId, GenomicFileType.VCF, metadata)
}

/**
 * Store a BAM file
 * @param data - BAM file data
 * @param filename - Name of the file
 * @param patientId - Patient ID
 * @param metadata - Additional metadata
 * @returns URL of the stored file
 */
export async function storeBAMFile(
  data: Buffer | ReadableStream | File,
  filename: string,
  patientId: string,
  metadata: Record<string, any> = {},
): Promise<string> {
  return storeGenomicFile(data, filename, patientId, GenomicFileType.BAM, metadata)
}

export default {
  storeGenomicFile,
  listPatientGenomicFiles,
  storeVCFFile,
  storeBAMFile,
  GenomicFileType,
}
