import { type NextRequest, NextResponse } from "next/server"
import { listBlobs, BlobCategory } from "@/lib/blob/blob-storage-client"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API route for listing patient reports
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const patientId = searchParams.get("patientId")
    const reportType = searchParams.get("reportType")

    let prefix = BlobCategory.PATIENT_REPORTS

    if (patientId) {
      prefix = `${BlobCategory.PATIENT_REPORTS}/patient-${patientId}`

      if (reportType) {
        prefix = `${prefix}/${reportType}`
      }
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

    logger.info("Patient reports listed successfully", {
      prefix,
      count: files.length,
    })

    return NextResponse.json({ files })
  } catch (error) {
    logger.error("Failed to list patient reports", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json({ error: "Failed to list reports" }, { status: 500 })
  }
}
