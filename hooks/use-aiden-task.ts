"use client"

/**
 * Hook for managing AIDEN tasks
 * Provides functionality to submit, track, and retrieve results from AIDEN tasks
 */

import { useState, useEffect, useCallback } from "react"
import { type AidenTaskType, AidenTaskStatus, type AidenTaskPriority } from "@/lib/aiden/aiden-client"
import { useToast } from "@/components/ui/toast-provider"

interface UseAidenTaskOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  autoFetch?: boolean
  pollingInterval?: number
}

interface AidenTaskState<T = any> {
  taskId: string | null
  status: AidenTaskStatus | null
  result: T | null
  error: Error | null
  isLoading: boolean
  isSubmitting: boolean
  isPolling: boolean
}

/**
 * Hook for managing AIDEN tasks
 */
export function useAidenTask<T = any>(options: UseAidenTaskOptions = {}) {
  const { onSuccess, onError, autoFetch = true, pollingInterval = 3000 } = options

  const [state, setState] = useState<AidenTaskState<T>>({
    taskId: null,
    status: null,
    result: null,
    error: null,
    isLoading: false,
    isSubmitting: false,
    isPolling: false,
  })

  const { addToast } = useToast()

  // Submit a task to AIDEN
  const submitTask = useCallback(
    async (taskType: AidenTaskType, payload: any, priority?: AidenTaskPriority, metadata?: Record<string, any>) => {
      setState((prev) => ({ ...prev, isSubmitting: true, error: null }))

      try {
        const response = await fetch("/api/aiden/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task_type: taskType,
            priority,
            payload,
            metadata,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to submit task")
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          taskId: data.task_id,
          status: data.status,
          isSubmitting: false,
        }))

        addToast({
          type: "success",
          title: "Task Submitted",
          message: `Task ${data.task_id} has been submitted successfully`,
          duration: 3000,
        })

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(errorMessage),
          isSubmitting: false,
        }))

        addToast({
          type: "error",
          title: "Task Submission Failed",
          message: errorMessage,
          duration: 5000,
        })

        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage))
        }

        throw error
      }
    },
    [addToast, onError],
  )

  // Get the status of a task
  const getTaskStatus = useCallback(
    async (taskId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch(`/api/aiden/tasks/${taskId}/status`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to get task status")
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          status: data.status,
          isLoading: false,
        }))

        return data
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(errorMessage),
          isLoading: false,
        }))

        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage))
        }

        throw error
      }
    },
    [onError],
  )

  // Get the result of a task
  const getTaskResult = useCallback(
    async (taskId: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch(`/api/aiden/tasks/${taskId}/result`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to get task result")
        }

        const data = await response.json()

        setState((prev) => ({
          ...prev,
          result: data.result,
          status: data.status,
          isLoading: false,
        }))

        if (onSuccess) {
          onSuccess(data.result)
        }

        return data.result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error(errorMessage),
          isLoading: false,
        }))

        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage))
        }

        throw error
      }
    },
    [onSuccess, onError],
  )

  // Poll for task status and result
  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      if (!taskId) return

      setState((prev) => ({ ...prev, isPolling: true }))

      try {
        const statusData = await getTaskStatus(taskId)

        if (statusData.status === AidenTaskStatus.COMPLETED) {
          await getTaskResult(taskId)
          setState((prev) => ({ ...prev, isPolling: false }))
        } else if (statusData.status === AidenTaskStatus.FAILED || statusData.status === AidenTaskStatus.CANCELLED) {
          setState((prev) => ({ ...prev, isPolling: false }))

          addToast({
            type: "error",
            title: "Task Failed",
            message: `Task ${taskId} has failed or been cancelled`,
            duration: 5000,
          })
        }
      } catch (error) {
        setState((prev) => ({ ...prev, isPolling: false }))
      }
    },
    [getTaskStatus, getTaskResult, addToast],
  )

  // Start polling for task status
  const startPolling = useCallback(
    (taskId: string) => {
      if (!taskId) return

      const poll = async () => {
        await pollTaskStatus(taskId)

        if (
          state.status !== AidenTaskStatus.COMPLETED &&
          state.status !== AidenTaskStatus.FAILED &&
          state.status !== AidenTaskStatus.CANCELLED
        ) {
          setTimeout(poll, pollingInterval)
        }
      }

      poll()
    },
    [pollTaskStatus, state.status, pollingInterval],
  )

  // Stop polling
  const stopPolling = useCallback(() => {
    setState((prev) => ({ ...prev, isPolling: false }))
  }, [])

  // Auto-fetch result when taskId changes
  useEffect(() => {
    if (autoFetch && state.taskId && !state.result && !state.isPolling) {
      startPolling(state.taskId)
    }
  }, [autoFetch, state.taskId, state.result, state.isPolling, startPolling])

  return {
    ...state,
    submitTask,
    getTaskStatus,
    getTaskResult,
    startPolling,
    stopPolling,
  }
}
