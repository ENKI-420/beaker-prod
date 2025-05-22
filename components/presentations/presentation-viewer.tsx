"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import type { AdaptivePresentation, PresentationSlide } from "@/lib/agent/services/adaptive-presentation"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Download,
  Maximize,
  Minimize,
  Clock,
  Presentation,
  Loader2,
} from "lucide-react"

interface PresentationViewerProps {
  presentationId: string
  initialPresentation?: AdaptivePresentation
  autoStart?: boolean
}

/**
 * Presentation Viewer Component
 * Displays an adaptive presentation with navigation controls
 */
export function PresentationViewer({
  presentationId,
  initialPresentation,
  autoStart = false,
}: PresentationViewerProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(!initialPresentation)
  const [presentation, setPresentation] = useState<AdaptivePresentation | null>(initialPresentation || null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoStart)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideTimer, setSlideTimer] = useState<NodeJS.Timeout | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  // Fetch presentation if not provided
  useEffect(() => {
    if (!initialPresentation) {
      fetchPresentation()
    }
  }, [initialPresentation, presentationId])

  // Handle auto-play
  useEffect(() => {
    if (isPlaying && presentation) {
      const currentSlide = presentation.slides[currentSlideIndex]
      const duration = currentSlide?.duration || 30 // Default to 30 seconds

      setRemainingTime(duration)

      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            handleNextSlide()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setSlideTimer(timer)

      return () => {
        if (timer) clearInterval(timer)
      }
    }
  }, [isPlaying, currentSlideIndex, presentation])

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Fetch presentation data
  const fetchPresentation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/presentations/${presentationId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch presentation")
      }

      const data = await response.json()
      setPresentation(data.presentation)
    } catch (error) {
      console.error("Error fetching presentation:", error)
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to fetch presentation",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle next slide
  const handleNextSlide = () => {
    if (!presentation) return

    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    } else {
      // End of presentation
      setIsPlaying(false)
      addToast({
        type: "info",
        title: "Presentation Complete",
        message: "You have reached the end of the presentation",
      })
    }
  }

  // Handle previous slide
  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      if (slideTimer) clearInterval(slideTimer)
    }
    setIsPlaying(!isPlaying)
  }

  // Handle restart
  const handleRestart = () => {
    setCurrentSlideIndex(0)
    setIsPlaying(false)
    if (slideTimer) clearInterval(slideTimer)
  }

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    const presentationElement = document.getElementById("presentation-container")
    if (!presentationElement) return

    if (!isFullscreen) {
      if (presentationElement.requestFullscreen) {
        presentationElement.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Handle download
  const handleDownload = () => {
    if (!presentation) return

    const presentationData = JSON.stringify(presentation, null, 2)
    const blob = new Blob([presentationData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `presentation-${presentationId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get current slide
  const currentSlide: PresentationSlide | undefined = presentation?.slides[currentSlideIndex]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading presentation...</p>
      </div>
    )
  }

  if (!presentation) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-lg text-red-500">Presentation not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/presentations")}>
          Back to Presentations
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full" id="presentation-container">
      <div
        className={`relative ${
          isFullscreen ? "bg-white dark:bg-gray-900 p-8 min-h-screen flex flex-col justify-center" : ""
        }`}
      >
        {/* Presentation header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Presentation className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-xl font-bold">{presentation.title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Slide {currentSlideIndex + 1} of {presentation.slides.length}
            </span>
            {isPlaying && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(remainingTime)}
              </div>
            )}
          </div>
        </div>

        {/* Current slide */}
        <Card className="w-full overflow-hidden mb-4">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] bg-gray-50 dark:bg-gray-800">
              {/* Slide content */}
              <div className="absolute inset-0 p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-4">{currentSlide?.title}</h3>
                <div className="flex-1">
                  <p className="text-lg">{currentSlide?.content}</p>

                  {/* Visual aids */}
                  {currentSlide?.visualAids && currentSlide.visualAids.length > 0 && (
                    <div className="mt-6">
                      {currentSlide.visualAids.map((visual, index) => (
                        <div key={index} className="mt-4">
                          <div className="relative w-full max-w-2xl mx-auto aspect-[16/9]">
                            <Image
                              src={visual.url || "/placeholder.svg"}
                              alt={visual.caption || "Visual aid"}
                              fill
                              className="object-contain"
                            />
                          </div>
                          {visual.caption && <p className="text-sm text-center text-gray-500 mt-2">{visual.caption}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Citations */}
                {currentSlide?.citations && currentSlide.citations.length > 0 && (
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="font-medium">Citations:</p>
                    <ul className="list-disc list-inside">
                      {currentSlide.citations.map((citation, index) => (
                        <li key={index}>{citation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePreviousSlide} disabled={currentSlideIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
            <Button variant="outline" onClick={handleFullscreenToggle}>
              {isFullscreen ? <Minimize className="h-4 w-4 mr-1" /> : <Maximize className="h-4 w-4 mr-1" />}
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
