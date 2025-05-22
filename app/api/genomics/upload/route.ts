import { type NextRequest, NextResponse } from "next/server"
import { storeGenomicFile, GenomicFileType } from "@/lib/blob/genomic-data-service"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API route for uploading genomic files
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const patientId = formData.get("patientId") as string
    const fileType = (formData.get("fileType") as GenomicFileType) || GenomicFileType.VCF
    const description = (formData.get("description") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Store the file
    const url = await storeGenomicFile(file, file.name, patientId, fileType, {
      description,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    })

    logger.info("Genomic file uploaded successfully", {
      filename: file.name,
      patientId,
      fileType,
      url,
    })

    return NextResponse.json({ url })
  } catch (error) {
    logger.error("Failed to upload genomic file", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
