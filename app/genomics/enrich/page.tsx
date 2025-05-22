"use client"

import { useState } from "react"
import { GenomicDataUploader } from "@/components/genomics/genomic-data-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ClinicalSignificance,
  type EnrichmentResult,
  type GenomicVariant,
} from "@/lib/agent/services/genomic-enrichment"
import { Download, ExternalLink, Filter, Info } from "lucide-react"

/**
 * Genomic Data Enrichment Page
 */
export default function GenomicEnrichmentPage() {
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null)
  const [activeTab, setActiveTab] = useState<"summary" | "variants" | "json">("summary")
  const [filteredVariants, setFilteredVariants] = useState<GenomicVariant[]>([])
  const [filterApplied, setFilterApplied] = useState(false)

  const handleEnrichmentComplete = (result: EnrichmentResult) => {
    setEnrichmentResult(result)
    setFilteredVariants(result.variants)
    setFilterApplied(false)
    setActiveTab("summary")
  }

  const handleFilterPathogenic = () => {
    if (!enrichmentResult) return

    const pathogenicVariants = enrichmentResult.variants.filter(
      (variant) =>
        variant.clinicalSignificance === ClinicalSignificance.PATHOGENIC ||
        variant.clinicalSignificance === ClinicalSignificance.LIKELY_PATHOGENIC,
    )
    setFilteredVariants(pathogenicVariants)
    setFilterApplied(true)
  }

  const handleFilterUncertain = () => {
    if (!enrichmentResult) return

    const uncertainVariants = enrichmentResult.variants.filter(
      (variant) => variant.clinicalSignificance === ClinicalSignificance.UNCERTAIN_SIGNIFICANCE,
    )
    setFilteredVariants(uncertainVariants)
    setFilterApplied(true)
  }

  const handleFilterBenign = () => {
    if (!enrichmentResult) return

    const benignVariants = enrichmentResult.variants.filter(
      (variant) =>
        variant.clinicalSignificance === ClinicalSignificance.BENIGN ||
        variant.clinicalSignificance === ClinicalSignificance.LIKELY_BENIGN,
    )
    setFilteredVariants(benignVariants)
    setFilterApplied(true)
  }

  const handleResetFilter = () => {
    if (!enrichmentResult) return
    setFilteredVariants(enrichmentResult.variants)
    setFilterApplied(false)
  }

  const handleDownloadJSON = () => {
    if (!enrichmentResult) return

    const dataStr = JSON.stringify(enrichmentResult, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", `genomic-enrichment-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
  }

  // Helper function to get badge color based on clinical significance
  const getSignificanceBadgeVariant = (significance?: ClinicalSignificance) => {
    if (!significance) return "outline"

    switch (significance) {
      case ClinicalSignificance.PATHOGENIC:
      case ClinicalSignificance.LIKELY_PATHOGENIC:
        return "destructive"
      case ClinicalSignificance.UNCERTAIN_SIGNIFICANCE:
      case ClinicalSignificance.CONFLICTING:
        return "secondary"
      case ClinicalSignificance.BENIGN:
      case ClinicalSignificance.LIKELY_BENIGN:
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <GenomicDataUploader onEnrichmentComplete={handleEnrichmentComplete} />
        </div>

        <div className="md:col-span-2">
          {enrichmentResult ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Enrichment Results</CardTitle>
                    <CardDescription>
                      {enrichmentResult.originalVariantCount} variants processed in{" "}
                      {(enrichmentResult.processingTime / 1000).toFixed(2)} seconds
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="json">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                      <h3 className="font-medium text-lg mb-2">Clinical Summary</h3>
                      <p>{enrichmentResult.clinicalSummary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Confidence Score</h3>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${enrichmentResult.confidenceScore * 100}%` }}
                            ></div>
                          </div>
                          <span>{(enrichmentResult.confidenceScore * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Knowledge Base</h3>
                        <p>Version: {enrichmentResult.knowledgeBaseVersion}</p>
                        <p>Date: {new Date(enrichmentResult.enrichmentDate).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium text-lg mb-2">Variant Distribution</h3>
                      <div className="space-y-2">
                        {Object.values(ClinicalSignificance).map((significance) => {
                          const count = enrichmentResult.variants.filter(
                            (v) => v.clinicalSignificance === significance,
                          ).length
                          if (count === 0) return null

                          return (
                            <div key={significance} className="flex items-center">
                              <Badge variant={getSignificanceBadgeVariant(significance)} className="mr-2">
                                {significance.replace("_", " ")}
                              </Badge>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    getSignificanceBadgeVariant(significance) === "destructive"
                                      ? "bg-red-600"
                                      : getSignificanceBadgeVariant(significance) === "secondary"
                                        ? "bg-purple-600"
                                        : "bg-green-600"
                                  }`}
                                  style={{
                                    width: `${(count / enrichmentResult.variants.length) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <span>{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variants">
                    <div className="flex flex-wrap gap-2 my-4">
                      <Button variant="outline" size="sm" onClick={handleFilterPathogenic}>
                        <Filter className="mr-2 h-4 w-4" />
                        Pathogenic
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleFilterUncertain}>
                        <Filter className="mr-2 h-4 w-4" />
                        Uncertain
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleFilterBenign}>
                        <Filter className="mr-2 h-4 w-4" />
                        Benign
                      </Button>
                      {filterApplied && (
                        <Button variant="ghost" size="sm" onClick={handleResetFilter}>
                          Reset Filter
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4 mt-2">
                      {filteredVariants.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">No variants match the current filter.</p>
                      ) : (
                        filteredVariants.map((variant, index) => (
                          <Card key={variant.id || index} className="overflow-hidden">
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Badge
                                    variant={getSignificanceBadgeVariant(variant.clinicalSignificance)}
                                    className="mr-2"
                                  >
                                    {variant.clinicalSignificance
                                      ? variant.clinicalSignificance.replace("_", " ")
                                      : "Unknown"}
                                  </Badge>
                                  <CardTitle className="text-base">
                                    {variant.genes && variant.genes.length > 0
                                      ? variant.genes.join(", ")
                                      : "Unknown Gene"}
                                  </CardTitle>
                                </div>
                                {variant.confidence !== undefined && (
                                  <Badge variant="outline">Confidence: {(variant.confidence * 100).toFixed(0)}%</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="py-0">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Location:</span> {variant.chromosome}:{variant.position}
                                </div>
                                <div>
                                  <span className="font-medium">Change:</span> {variant.referenceAllele} &gt;{" "}
                                  {variant.alternateAllele}
                                </div>
                                <div>
                                  <span className="font-medium">Type:</span> {variant.type}
                                </div>
                                <div>
                                  <span className="font-medium">Zygosity:</span> {variant.zygosity || "Unknown"}
                                </div>
                              </div>

                              {variant.phenotypes && variant.phenotypes.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium">Associated Phenotypes:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {variant.phenotypes.map((phenotype, i) => (
                                      <Badge key={i} variant="secondary">
                                        {phenotype}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {variant.publications && variant.publications.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium">Publications:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {variant.publications.map((pub, i) => (
                                      <Badge key={i} variant="outline" className="flex items-center">
                                        {pub}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {variant.predictedImpact && (
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                  <div className="flex items-center">
                                    <Info className="h-4 w-4 mr-1" />
                                    <span className="font-medium">Predicted Impact:</span>{" "}
                                    {variant.predictedImpact.interpretation} ({variant.predictedImpact.method})
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="json">
                    <div className="mt-4 relative">
                      <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md overflow-auto max-h-[500px] text-xs">
                        {JSON.stringify(enrichmentResult, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Enrichment Results Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Upload genomic data using the form on the left to see enrichment results here. The service will
                  enhance your data with clinical annotations, population frequencies, and predicted impacts.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
