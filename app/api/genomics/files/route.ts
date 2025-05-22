import { type NextRequest, NextResponse } from "next/server"
import { listBlobs, BlobCategory } from "@/lib/blob/blob-storage-client"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API route for listing genomic files
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get("patientId")

    let prefix = BlobCategory.GENOMIC_DATA

    if (patientId) {
      prefix = `${BlobCategory.GENOMIC_DATA}/patient-${patientId}`
    }

    const result = await listBlobs(prefix)

    // Transform the result
    const files = result.blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      contentType: blob.contentType,
      metadata: blob.metadata,
    }))

    logger.info("Genomic files listed successfully", {
      prefix,
      count: files.length,
    })

    return NextResponse.json({ files })
  } catch (error) {
    logger.error("Failed to list genomic files", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
