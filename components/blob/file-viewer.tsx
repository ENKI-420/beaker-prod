"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, ExternalLink, FileText, AlertTriangle } from "lucide-react"

interface FileViewerProps {
  url: string
  filename?: string
  fileType?: string
  title?: string
  description?: string
  className?: string
}

export function FileViewer({
  url,
  filename,
  fileType,
  title = "File Viewer",
  description,
  className,
}: FileViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentType, setContentType] = useState<string | null>(null)

  // Extract filename from URL if not provided
  const displayFilename = filename || url.split("/").pop() || "Unknown file"

  // Determine file type from filename or provided fileType
  const determineFileType = () => {
    if (fileType) return fileType

    const extension = displayFilename.split(".").pop()?.toLowerCase()
    if (!extension) return "unknown"

    return extension
  }

  const fileExtension = determineFileType()

  useEffect(() => {
    const checkFile = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch headers to check content type
        const response = await fetch(url, { method: "HEAD" })

        if (!response.ok) {
          throw new Error(`Failed to access file: ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        setContentType(contentType)

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file")
        setLoading(false)
      }
    }

    checkFile()
  }, [url])

  const renderPreview = () => {
    // If still loading, show skeleton
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
        </div>
      )
    }

    // If error, show error message
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    // Render based on file type
    if (contentType?.includes("image/")) {
      return (
        <div className="flex justify-center">
          <img
            src={url || "/placeholder.svg"}
            alt={displayFilename}
            className="max-h-[500px] object-contain rounded-md"
          />
        </div>
      )
    }

    if (contentType?.includes("application/pdf")) {
      return <iframe src={`${url}#toolbar=0`} className="w-full h-[500px] rounded-md border" title={displayFilename} />
    }

    if (contentType?.includes("text/html")) {
      return <iframe src={url} className="w-full h-[500px] rounded-md border" title={displayFilename} />
    }

    // For other file types, show a generic preview
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-md bg-muted/50">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{displayFilename}</h3>
        <p className="text-sm text-muted-foreground mb-4">{contentType || `${fileExtension.toUpperCase()} file`}</p>
        <p className="text-sm text-center max-w-md">
          Preview not available for this file type. Please download the file to view its contents.
        </p>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderPreview()}</CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.open(url, "_blank")} disabled={loading || !!error}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in New Tab
        </Button>
        <Button
          onClick={() => {
            const a = document.createElement("a")
            a.href = url
            a.download = displayFilename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }}
          disabled={loading || !!error}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}
