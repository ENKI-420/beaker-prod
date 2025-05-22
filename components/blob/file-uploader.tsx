"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, File, X, Check, Loader2 } from "lucide-react"

interface FileUploaderProps {
  onUploadComplete?: (url: string, file: File) => void
  onUploadError?: (error: Error) => void
  acceptedFileTypes?: string
  maxSizeMB?: number
  endpoint: string
  title?: string
  description?: string
  buttonText?: string
  className?: string
}

export function FileUploader({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = "*",
  maxSizeMB = 100,
  endpoint,
  title = "Upload File",
  description = "Upload a file to the system",
  buttonText = "Upload",
  className,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setSuccess(false)

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Check file size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`)
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)
    setSuccess(false)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload the file
      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      })

      // Handle response
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          setSuccess(true)
          toast({
            title: "Upload Complete",
            description: "File has been uploaded successfully",
          })

          if (onUploadComplete) {
            onUploadComplete(response.url, file)
          }
        } else {
          const errorMessage = xhr.responseText ? JSON.parse(xhr.responseText).error : "Upload failed"
          setError(errorMessage)

          if (onUploadError) {
            onUploadError(new Error(errorMessage))
          }

          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive",
          })
        }

        setUploading(false)
      }

      // Handle errors
      xhr.onerror = () => {
        const errorMessage = "Network error occurred during upload"
        setError(errorMessage)
        setUploading(false)

        if (onUploadError) {
          onUploadError(new Error(errorMessage))
        }

        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }

      // Send the request
      xhr.open("POST", endpoint, true)
      xhr.send(formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      setUploading(false)

      if (onUploadError) {
        onUploadError(err instanceof Error ? err : new Error(errorMessage))
      }

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={acceptedFileTypes}
              disabled={uploading}
              className="cursor-pointer"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          {file && (
            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
              <div className="flex items-center space-x-2">
                <File className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} disabled={uploading}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : success ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Uploaded
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
