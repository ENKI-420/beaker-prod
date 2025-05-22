"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/ui/loading-state"
import { ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GenomicVariant {
  id: string
  position: number
  chromosome: string
  reference: string
  alternate: string
  gene: string
  consequence: string
  significance: "benign" | "likely_benign" | "uncertain" | "likely_pathogenic" | "pathogenic"
  frequency: number
  rsid?: string
  hgvs?: string
}

interface GenomicVariantViewerProps {
  patientId?: string
  variantId?: string
  initialVariants?: GenomicVariant[]
  isLoading?: boolean
  showControls?: boolean
  height?: number
  width?: string | number
  onVariantSelect?: (variant: GenomicVariant) => void
}

/**
 * Professional genomic variant visualization component
 * Displays genomic variants with interactive controls and detailed information
 */
export function GenomicVariantViewer({
  patientId,
  variantId,
  initialVariants,
  isLoading = false,
  showControls = true,
  height = 400,
  width = "100%",
  onVariantSelect,
}: GenomicVariantViewerProps) {
  const [variants, setVariants] = useState<GenomicVariant[]>(initialVariants || [])
  const [selectedVariant, setSelectedVariant] = useState<GenomicVariant | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [viewMode, setViewMode] = useState<"linear" | "circular">("linear")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fetch variants if not provided
  useEffect(() => {
    if (initialVariants) {
      setVariants(initialVariants)
      return
    }

    if (isLoading) return

    // Simulate fetching variant data
    const fetchVariants = async () => {
      // In a real app, this would be an API call
      const mockVariants: GenomicVariant[] = [
        {
          id: "var1",
          position: 32936732,
          chromosome: "13",
          reference: "A",
          alternate: "G",
          gene: "BRCA2",
          consequence: "missense_variant",
          significance: "pathogenic",
          frequency: 0.0001,
          rsid: "rs80359550",
          hgvs: "c.8167G>C",
        },
        {
          id: "var2",
          position: 43124096,
          chromosome: "17",
          reference: "T",
          alternate: "C",
          gene: "BRCA1",
          consequence: "frameshift_variant",
          significance: "pathogenic",
          frequency: 0.0002,
          rsid: "rs80357906",
          hgvs: "c.5266dupC",
        },
        {
          id: "var3",
          position: 43106487,
          chromosome: "17",
          reference: "G",
          alternate: "T",
          gene: "BRCA1",
          consequence: "missense_variant",
          significance: "likely_benign",
          frequency: 0.0015,
          rsid: "rs80357323",
          hgvs: "c.5339T>C",
        },
        {
          id: "var4",
          position: 32912299,
          chromosome: "13",
          reference: "C",
          alternate: "T",
          gene: "BRCA2",
          consequence: "synonymous_variant",
          significance: "benign",
          frequency: 0.0089,
          rsid: "rs28897727",
          hgvs: "c.7242A>G",
        },
        {
          id: "var5",
          position: 43063930,
          chromosome: "17",
          reference: "G",
          alternate: "A",
          gene: "BRCA1",
          consequence: "missense_variant",
          significance: "uncertain",
          frequency: 0.0004,
          rsid: "rs80356892",
          hgvs: "c.1067A>G",
        },
      ]

      // If variantId is provided, find and select that variant
      if (variantId) {
        const variant = mockVariants.find((v) => v.id === variantId) || null
        setSelectedVariant(variant)
      }

      setVariants(mockVariants)
    }

    fetchVariants()
  }, [initialVariants, isLoading, variantId])

  // Draw the visualization when variants or zoom level changes
  useEffect(() => {
    if (isLoading || variants.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (viewMode === "linear") {
      drawLinearView(ctx, canvas, variants, zoomLevel, selectedVariant)
    } else {
      drawCircularView(ctx, canvas, variants, zoomLevel, selectedVariant)
    }
  }, [variants, zoomLevel, selectedVariant, viewMode, isLoading])

  // Handle variant selection
  const handleVariantClick = (variant: GenomicVariant) => {
    setSelectedVariant(variant)
    if (onVariantSelect) {
      onVariantSelect(variant)
    }
  }

  // Draw linear genomic view
  const drawLinearView = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    variants: GenomicVariant[],
    zoom: number,
    selected: GenomicVariant | null,
  ) => {
    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Draw chromosome axis
    ctx.beginPath()
    ctx.moveTo(padding, height / 2)
    ctx.lineTo(width - padding, height / 2)
    ctx.strokeStyle = "#9ca3af"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw axis labels
    ctx.font = "12px Inter, sans-serif"
    ctx.fillStyle = "#4b5563"
    ctx.textAlign = "center"

    // Draw variants
    variants.forEach((variant, index) => {
      // Calculate position (simplified for demo)
      const x = padding + ((width - padding * 2) * index) / (variants.length - 1 || 1)
      const y = height / 2

      // Determine color based on significance
      let color
      switch (variant.significance) {
        case "benign":
          color = "#10b981" // Green
          break
        case "likely_benign":
          color = "#34d399" // Light green
          break
        case "uncertain":
          color = "#f59e0b" // Amber
          break
        case "likely_pathogenic":
          color = "#f97316" // Orange
          break
        case "pathogenic":
          color = "#ef4444" // Red
          break
        default:
          color = "#6b7280" // Gray
      }

      // Draw variant marker
      const radius = variant === selected ? 8 * zoom : 6 * zoom
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Add stroke for selected variant
      if (variant === selected) {
        ctx.strokeStyle = "#1f2937"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw gene label
      ctx.fillStyle = variant === selected ? "#1f2937" : "#6b7280"
      ctx.font = `${variant === selected ? "bold " : ""}12px Inter, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(variant.gene, x, y - 20)

      // Draw position label
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px Inter, sans-serif"
      ctx.fillText(`Chr${variant.chromosome}:${variant.position}`, x, y + 20)

      // Make variants clickable
      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        variants.forEach((v, i) => {
          const vx = padding + ((width - padding * 2) * i) / (variants.length - 1 || 1)
          const vy = height / 2
          const distance = Math.sqrt(Math.pow(mouseX - vx, 2) + Math.pow(mouseY - vy, 2))

          if (distance <= 10 * zoom) {
            handleVariantClick(v)
          }
        })
      }
    })
  }

  // Draw circular genomic view
  const drawCircularView = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    variants: GenomicVariant[],
    zoom: number,
    selected: GenomicVariant | null,
  ) => {
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 50

    // Draw circular chromosome
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "#9ca3af"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw variants
    variants.forEach((variant, index) => {
      // Calculate position on circle
      const angle = (index / variants.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Determine color based on significance
      let color
      switch (variant.significance) {
        case "benign":
          color = "#10b981" // Green
          break
        case "likely_benign":
          color = "#34d399" // Light green
          break
        case "uncertain":
          color = "#f59e0b" // Amber
          break
        case "likely_pathogenic":
          color = "#f97316" // Orange
          break
        case "pathogenic":
          color = "#ef4444" // Red
          break
        default:
          color = "#6b7280" // Gray
      }

      // Draw variant marker
      const markerRadius = variant === selected ? 8 * zoom : 6 * zoom
      ctx.beginPath()
      ctx.arc(x, y, markerRadius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Add stroke for selected variant
      if (variant === selected) {
        ctx.strokeStyle = "#1f2937"
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw gene label
      const labelRadius = radius + 20
      const labelX = centerX + Math.cos(angle) * labelRadius
      const labelY = centerY + Math.sin(angle) * labelRadius

      ctx.fillStyle = variant === selected ? "#1f2937" : "#6b7280"
      ctx.font = `${variant === selected ? "bold " : ""}12px Inter, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText(variant.gene, labelX, labelY)

      // Make variants clickable
      canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        variants.forEach((v, i) => {
          const angle = (i / variants.length) * Math.PI * 2
          const vx = centerX + Math.cos(angle) * radius
          const vy = centerY + Math.sin(angle) * radius
          const distance = Math.sqrt(Math.pow(mouseX - vx, 2) + Math.pow(mouseY - vy, 2))

          if (distance <= 10 * zoom) {
            handleVariantClick(v)
          }
        })
      }
    })
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }

  // Handle download
  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `genomic-variants-${patientId || "view"}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  // Significance color legend
  const significanceLegend = [
    { label: "Pathogenic", color: "#ef4444" },
    { label: "Likely Pathogenic", color: "#f97316" },
    { label: "Uncertain", color: "#f59e0b" },
    { label: "Likely Benign", color: "#34d399" },
    { label: "Benign", color: "#10b981" },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Genomic Variant Visualization</CardTitle>
            <CardDescription>Interactive visualization of genomic variants</CardDescription>
          </div>
          {showControls && (
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setViewMode(viewMode === "linear" ? "circular" : "linear")}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle View Mode</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom In</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zoom Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download Image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative" style={{ height: `${height}px`, width }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingState text="Loading genomic data..." size="lg" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={800}
              height={height}
              className="w-full h-full"
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-3">
          {significanceLegend.map((item) => (
            <div key={item.label} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
        {selectedVariant && (
          <div className="text-sm">
            <span className="font-medium">Selected:</span> {selectedVariant.gene} (
            {selectedVariant.hgvs || `${selectedVariant.reference}>${selectedVariant.alternate}`})
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
