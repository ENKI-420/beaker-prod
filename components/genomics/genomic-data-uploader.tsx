"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, FileText, Database } from "lucide-react"
import { KnowledgeSource } from "@/lib/agent/services/genomic-enrichment"

interface GenomicDataUploaderProps {
  onEnrichmentComplete?: (result: any) => void
  className?: string
}

/**
 * Genomic Data Uploader Component
 * Allows users to upload genomic data for enrichment
 */
export function GenomicDataUploader({ onEnrichmentComplete, className }: GenomicDataUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("file")
  const [pasteData, setPasteData] = useState("")
  const [selectedFormat, setSelectedFormat] = useState<"vcf" | "beaker" | "json">("vcf")
  const [selectedSources, setSelectedSources] = useState<KnowledgeSource[]>(Object.values(KnowledgeSource))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset state when a new file is selected
    setPasteData("")
    setActiveTab("file")
  }

  const handlePasteDataChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPasteData(event.target.value)
  }

  const handleSourceToggle = (source: KnowledgeSource) => {
    setSelectedSources((prev) => (prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      let data: string

      if (activeTab === "file") {
        // Get file data
        const files = fileInputRef.current?.files
        if (!files || files.length === 0) {
          toast({
            title: "No file selected",
            description: "Please select a file to upload.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        const file = files[0]
        data = await file.text()
      } else {
        // Use pasted data
        data = pasteData
        if (!data.trim()) {
          toast({
            title: "No data provided",
            description: "Please paste genomic data in the text area.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // Call the API to enrich the data
      const response = await fetch("/api/genomics/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          format: selectedFormat,
          sources: selectedSources,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to enrich genomic data")
      }

      const result = await response.json()

      toast({
        title: "Enrichment Complete",
        description: `Successfully enriched ${result.enrichedVariantCount} variants.`,
      })

      if (onEnrichmentComplete) {
        onEnrichmentComplete(result)
      }
    } catch (error) {
      toast({
        title: "Enrichment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Genomic Data Enrichment</CardTitle>
        <CardDescription>
          Upload genomic data to enhance it with clinical annotations, population frequencies, and predicted impacts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" disabled={isLoading}>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="paste" disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                Paste Data
              </TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload Genomic Data File</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".vcf,.txt,.json"
                  disabled={isLoading}
                />
              </div>
            </TabsContent>
            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data">Paste Genomic Data</Label>
                <Textarea
                  id="data"
                  placeholder="Paste VCF, Beaker report, or JSON data here..."
                  value={pasteData}
                  onChange={handlePasteDataChange}
                  className="min-h-[200px]"
                  disabled={isLoading}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Data Format</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={selectedFormat === "vcf" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("vcf")}
                  disabled={isLoading}
                >
                  VCF
                </Button>
                <Button
                  type="button"
                  variant={selectedFormat === "beaker" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("beaker")}
                  disabled={isLoading}
                >
                  Beaker Report
                </Button>
                <Button
                  type="button"
                  variant={selectedFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat("json")}
                  disabled={isLoading}
                >
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Knowledge Sources</Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(KnowledgeSource).map((source) => (
                  <Button
                    key={source}
                    type="button"
                    variant={selectedSources.includes(source) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSourceToggle(source)}
                    disabled={isLoading}
                  >
                    {source.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          onClick={handleSubmit}
          disabled={isLoading || (activeTab === "paste" && !pasteData.trim())}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Enrich Genomic Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
