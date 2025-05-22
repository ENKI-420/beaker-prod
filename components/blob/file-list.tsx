"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, AlertTriangle, FileText, FileImage, FileIcon as FilePdf } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FileInfo {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  contentType?: string
  metadata?: Record<string, any>
}

interface FileListProps {
  title: string
  description?: string
  endpoint: string
  onViewFile?: (file: FileInfo) => void
  onDeleteFile?: (file: FileInfo) => void
  className?: string
}

export function FileList({ title, description, endpoint, onViewFile, onDeleteFile, className }: FileListProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`Failed to fetch files: ${response.statusText}`)
        }

        const data = await response.json()
        setFiles(data.files || [])

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load files")
        setLoading(false)
      }
    }

    fetchFiles()
  }, [endpoint])

  const getFileIcon = (file: FileInfo) => {
    const contentType = file.contentType || ""
    const pathname = file.pathname.toLowerCase()

    if (contentType.startsWith("image/") || pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      return <FileImage className="h-4 w-4" />
    }

    if (contentType === "application/pdf" || pathname.endsWith(".pdf")) {
      return <FilePdf className="h-4 w-4" />
    }

    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const getFileCategory = (file: FileInfo) => {
    const metadata = file.metadata || {}
    const category = metadata.category || ""

    return (
      <Badge variant="outline">
        {category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </Badge>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (files.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No files found</h3>
          <p className="text-sm text-muted-foreground">There are no files available in this category.</p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.url}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  {getFileIcon(file)}
                  <span className="truncate max-w-[200px]">{file.pathname.split("/").pop()}</span>
                </div>
              </TableCell>
              <TableCell>{getFileCategory(file)}</TableCell>
              <TableCell>{formatFileSize(file.size)}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onViewFile?.(file)} title="View file">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const a = document.createElement("a")
                      a.href = file.url
                      a.download = file.pathname.split("/").pop() || "download"
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                    }}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  {onDeleteFile && (
                    <Button variant="ghost" size="icon" onClick={() => onDeleteFile(file)} title="Delete file">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
