"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FileList } from "@/components/blob/file-list"
import { FileViewer } from "@/components/blob/file-viewer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText } from "lucide-react"

interface FileInfo {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType?: string
  metadata?: Record<string, any>
}

export default function PatientFilesPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string

  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleViewFile = (file: FileInfo) => {
    setSelectedFile(file)
    setViewerOpen(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patient Files</h1>
        <div className="flex space-x-4">
          <Button onClick={() => router.push(`/genomics/upload?patientId=${patientId}`)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Genomic File
          </Button>
          <Button onClick={() => router.push(`/patients/reports/upload?patientId=${patientId}`)}>
            <FileText className="mr-2 h-4 w-4" />
            Upload Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="genomic">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="genomic">Genomic Files</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="genomic" className="mt-6">
          <FileList
            title="Genomic Files"
            description="Genomic data files for this patient"
            endpoint={`/api/genomics/files?patientId=${patientId}`}
            onViewFile={handleViewFile}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <FileList
            title="Patient Reports"
            description="Clinical and genomic reports for this patient"
            endpoint={`/api/patients/reports?patientId=${patientId}`}
            onViewFile={handleViewFile}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.pathname.split("/").pop() || "File Viewer"}</DialogTitle>
          </DialogHeader>

          {selectedFile && (
            <FileViewer
              url={selectedFile.url}
              filename={selectedFile.pathname.split("/").pop()}
              fileType={selectedFile.contentType}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
