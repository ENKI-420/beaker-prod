"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toast-provider"
import { formatDistanceToNow } from "date-fns"
import { Presentation, Clock, FileText, BarChart, Trash2, Play, Edit, Loader2, Plus } from "lucide-react"

interface PresentationItem {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  targetStakeholder: {
    role: string
  }
  totalDuration: number
  slideCount: number
}

interface PresentationsListProps {
  onCreateNew?: () => void
}

/**
 * Presentations List Component
 * Displays a list of available presentations
 */
export function PresentationsList({ onCreateNew }: PresentationsListProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [presentations, setPresentations] = useState<PresentationItem[]>([])

  // Fetch presentations
  useEffect(() => {
    fetchPresentations()
  }, [])

  // Fetch presentations
  const fetchPresentations = async () => {
    try {
      setIsLoading(true)
      // In a real implementation, this would fetch from an API
      // For now, we'll use mock data
      const mockPresentations: PresentationItem[] = [
        {
          id: "pres_1",
          title: "Clinical Genomic Analysis",
          description: "Presentation for clinicians about genomic analysis results",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          targetStakeholder: {
            role: "clinician",
          },
          totalDuration: 600, // 10 minutes
          slideCount: 12,
        },
        {
          id: "pres_2",
          title: "Genomic Research Findings",
          description: "Technical presentation for researchers",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
          targetStakeholder: {
            role: "researcher",
          },
          totalDuration: 900, // 15 minutes
          slideCount: 18,
        },
        {
          id: "pres_3",
          title: "Genomic Platform Investment Opportunity",
          description: "Financial presentation for investors",
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          targetStakeholder: {
            role: "investor",
          },
          totalDuration: 1200, // 20 minutes
          slideCount: 15,
        },
      ]

      setPresentations(mockPresentations)
    } catch (error) {
      console.error("Error fetching presentations:", error)
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to fetch presentations",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle view presentation
  const handleViewPresentation = (id: string) => {
    router.push(`/presentations/${id}`)
  }

  // Handle edit presentation
  const handleEditPresentation = (id: string) => {
    router.push(`/presentations/${id}/edit`)
  }

  // Handle delete presentation
  const handleDeletePresentation = async (id: string) => {
    try {
      // In a real implementation, this would call an API
      // For now, we'll just update the local state
      setPresentations((prev) => prev.filter((p) => p.id !== id))

      addToast({
        type: "success",
        title: "Presentation Deleted",
        message: "The presentation has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting presentation:", error)
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete presentation",
      })
    }
  }

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "clinician":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "researcher":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "lab_technician":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "admin":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "investor":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "patient":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading presentations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Presentations</h2>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {presentations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Presentation className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No presentations yet</h3>
            <p className="text-gray-500 mb-6">Create your first adaptive presentation</p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Presentation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {presentations.map((presentation) => (
            <Card key={presentation.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{presentation.title}</CardTitle>
                  <Badge className={getRoleBadgeColor(presentation.targetStakeholder.role)}>
                    {presentation.targetStakeholder.role}
                  </Badge>
                </div>
                <CardDescription>{presentation.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-y-2">
                  <div className="flex items-center text-sm text-gray-500 mr-4">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(presentation.totalDuration)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mr-4">
                    <FileText className="h-4 w-4 mr-1" />
                    {presentation.slideCount} slides
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <BarChart className="h-4 w-4 mr-1" />
                    Created {formatDistanceToNow(new Date(presentation.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPresentation(presentation.id)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeletePresentation(presentation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleViewPresentation(presentation.id)}>
                    <Play className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
