"use client"

import { useState } from "react"
import { FileUploader } from "@/components/blob/file-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { GenomicFileType } from "@/lib/blob/genomic-data-service"
import { useToast } from "@/components/ui/use-toast"

export default function GenomicFileUploadPage() {
  const [patientId, setPatientId] = useState("")
  const [fileType, setFileType] = useState<GenomicFileType>(GenomicFileType.VCF)
  const [description, setDescription] = useState("")
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleUploadComplete = (url: string) => {
    setUploadedUrl(url)
    toast({
      title: "Upload Complete",
      description: "Genomic file has been uploaded successfully",
    })
  }

  const getAcceptedFileTypes = () => {
    switch (fileType) {
      case GenomicFileType.VCF:
        return ".vcf,.vcf.gz"
      case GenomicFileType.BAM:
        return ".bam,.bam.bai"
      case GenomicFileType.FASTQ:
        return ".fastq,.fq,.fastq.gz,.fq.gz"
      case GenomicFileType.JSON:
        return ".json"
      case GenomicFileType.CSV:
        return ".csv"
      case GenomicFileType.TSV:
        return ".tsv,.txt"
      default:
        return "*"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Genomic File</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
            <CardDescription>Enter information about the genomic file you are uploading</CardDescription>
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
              <Label htmlFor="fileType">File Type</Label>
              <Select value={fileType} onValueChange={(value) => setFileType(value as GenomicFileType)}>
                <SelectTrigger id="fileType">
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(GenomicFileType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
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
                placeholder="Enter a description for this file"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <FileUploader
          endpoint={`/api/genomics/upload?patientId=${encodeURIComponent(patientId)}&fileType=${encodeURIComponent(fileType)}&description=${encodeURIComponent(description)}`}
          acceptedFileTypes={getAcceptedFileTypes()}
          maxSizeMB={500}
          title="Upload Genomic File"
          description="Upload a genomic data file (VCF, BAM, FASTQ, etc.)"
          buttonText="Upload Genomic File"
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {uploadedUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Successful</CardTitle>
            <CardDescription>Your genomic file has been uploaded successfully</CardDescription>
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
