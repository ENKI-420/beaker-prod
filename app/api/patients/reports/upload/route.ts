import { type NextRequest, NextResponse } from "next/server"
import { storePatientReport, ReportType, ReportFormat } from "@/lib/blob/patient-report-service"
import { logger } from "@/lib/logging/enhanced-logger"

/**
 * API route for uploading patient reports
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const patientId = formData.get("patientId") as string
    const reportType = (formData.get("reportType") as ReportType) || ReportType.CUSTOM
    const format = (formData.get("format") as ReportFormat) || ReportFormat.PDF
    const title = (formData.get("title") as string) || ""
    const description = (formData.get("description") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Store the report
    const url = await storePatientReport(file, file.name, patientId, reportType, format, {
      title,
      description,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    })

    logger.info("Patient report uploaded successfully", {
      filename: file.name,
      patientId,
      reportType,
      format,
      url,
    })

    return NextResponse.json({ url })
  } catch (error) {
    logger.error("Failed to upload patient report", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json({ error: "Failed to upload report" }, { status: 500 })
  }
}
