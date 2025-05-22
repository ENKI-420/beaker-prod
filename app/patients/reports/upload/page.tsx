"use client"

import { useState } from "react"
import { FileUploader } from "@/components/blob/file-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ReportType, ReportFormat } from "@/lib/blob/patient-report-service"
import { useToast } from "@/components/ui/use-toast"

export default function PatientReportUploadPage() {
  const [patientId, setPatientId] = useState("")
  const [reportType, setReportType] = useState<ReportType>(ReportType.CLINICAL_SUMMARY)
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.PDF)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleUploadComplete = (url: string) => {
    setUploadedUrl(url)
    toast({
      title: "Upload Complete",
      description: "Patient report has been uploaded successfully",
    })
  }

  const getAcceptedFileTypes = () => {
    switch (format) {
      case ReportFormat.PDF:
        return ".pdf"
      case ReportFormat.HTML:
        return ".html,.htm"
      case ReportFormat.DOCX:
        return ".docx,.doc"
      case ReportFormat.JSON:
        return ".json"
      default:
        return "*"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Patient Report</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
            <CardDescription>Enter information about the patient report you are uploading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter report title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ReportType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ReportFormat).map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for this report"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <FileUploader
          endpoint={`/api/patients/reports/upload?patientId=${encodeURIComponent(patientId)}&reportType=${encodeURIComponent(reportType)}&format=${encodeURIComponent(format)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`}
          acceptedFileTypes={getAcceptedFileTypes()}
          maxSizeMB={50}
          title="Upload Patient Report"
          description="Upload a patient report document (PDF, DOCX, HTML, etc.)"
          buttonText="Upload Report"
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {uploadedUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Successful</CardTitle>
            <CardDescription>Your patient report has been uploaded successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md">
              <p className="font-mono text-sm break-all">{uploadedUrl}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
