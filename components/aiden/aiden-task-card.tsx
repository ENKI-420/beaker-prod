"use client"

/**
 * AIDEN Task Card Component
 * Displays the status and results of an AIDEN task
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useAidenTask } from "@/hooks/use-aiden-task"
import { AidenTaskStatus, type AidenTaskType } from "@/lib/aiden/aiden-client"
import { Clock, CheckCircle, AlertTriangle, XCircle, RefreshCw, Download, ExternalLink } from "lucide-react"

interface AidenTaskCardProps {
  taskId?: string
  taskType?: AidenTaskType
  title?: string
  description?: string
  payload?: any
  onResult?: (result: any) => void
  showControls?: boolean
  className?: string
}

/**
 * AIDEN Task Card Component
 */
export function AidenTaskCard({
  taskId,
  taskType,
  title,
  description,
  payload,
  onResult,
  showControls = true,
  className,
}: AidenTaskCardProps) {
  const [progress, setProgress] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string | null>(null)

  const {
    taskId: currentTaskId,
    status,
    result,
    error,
    isLoading,
    isSubmitting,
    submitTask,
    getTaskResult,
    startPolling,
  } = useAidenTask({
    onSuccess: (result) => {
      if (onResult) {
        onResult(result)
      }
    },
  })

  // Initialize with existing taskId if provided
  useEffect(() => {
    if (taskId && !currentTaskId && !isSubmitting && !isLoading) {
      startPolling(taskId)
    }
  }, [taskId, currentTaskId, isSubmitting, isLoading, startPolling])

  // Submit task if payload and taskType are provided but no taskId
  useEffect(() => {
    const submitNewTask = async () => {
      if (payload && taskType && !taskId && !currentTaskId && !isSubmitting) {
        await submitTask(taskType, payload)
      }
    }

    submitNewTask()
  }, [payload, taskType, taskId, currentTaskId, isSubmitting, submitTask])

  // Update progress based on status
  useEffect(() => {
    if (status === AidenTaskStatus.QUEUED) {
      setProgress(10)
    } else if (status === AidenTaskStatus.PROCESSING) {
      setProgress(50)
    } else if (status === AidenTaskStatus.COMPLETED) {
      setProgress(100)
    } else if (status === AidenTaskStatus.FAILED || status === AidenTaskStatus.CANCELLED) {
      setProgress(0)
    }
  }, [status])

  // Simulate progress updates for better UX
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (status === AidenTaskStatus.PROCESSING && progress < 90) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 5
          return Math.min(prev + increment, 90)
        })

        // Update estimated time remaining
        const remainingPercentage = 100 - progress
        const estimatedSecondsPerPercent = 0.5 // Adjust based on typical task duration
        const estimatedSeconds = Math.ceil(remainingPercentage * estimatedSecondsPerPercent)

        if (estimatedSeconds > 60) {
          const minutes = Math.floor(estimatedSeconds / 60)
          setEstimatedTimeRemaining(`~${minutes} min remaining`)
        } else {
          setEstimatedTimeRemaining(`~${estimatedSeconds} sec remaining`)
        }
      }, 2000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [status, progress])

  // Get status badge
  const getStatusBadge = () => {
    if (isSubmitting) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
          Submitting
        </Badge>
      )
    }

    switch (status) {
      case AidenTaskStatus.QUEUED:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <Clock className="mr-1 h-3 w-3" />
            Queued
          </Badge>
        )
      case AidenTaskStatus.PROCESSING:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case AidenTaskStatus.COMPLETED:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case AidenTaskStatus.FAILED:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      case AidenTaskStatus.CANCELLED:
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    if (currentTaskId) {
      getTaskResult(currentTaskId)
    }
  }

  // Handle download
  const handleDownload = () => {
    if (!result) return

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aiden-task-${currentTaskId || "result"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title || `AIDEN ${taskType || "Task"}`}</CardTitle>
            <CardDescription>{description || "AI-powered analysis and processing"}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {(isSubmitting || isLoading || status === AidenTaskStatus.PROCESSING || status === AidenTaskStatus.QUEUED) && (
          <div className="space-y-2 mb-4">
            <Progress value={progress} className="h-2" />
            {estimatedTimeRemaining && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-right">{estimatedTimeRemaining}</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {result ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 max-h-80 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        ) : (
          !error &&
          !isSubmitting &&
          !isLoading &&
          status !== AidenTaskStatus.PROCESSING &&
          status !== AidenTaskStatus.QUEUED && (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mb-2 opacity-50" />
              <p>Waiting for task completion</p>
            </div>
          )
        )}

        {(isSubmitting || isLoading) && !result && !error && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {currentTaskId && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Task ID:</span> {currentTaskId}
          </div>
        )}
      </CardContent>
      {showControls && (status === AidenTaskStatus.COMPLETED || error) && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {result && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="default" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
