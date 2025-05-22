"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Task {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  dueDate: string
  progress: number
  status: "pending" | "in-progress" | "completed" | "overdue"
}

interface TaskQueueProps {
  limit?: number
  isLoading?: boolean
}

/**
 * Task queue component
 * Displays a list of pending tasks with their status and progress
 */
export function TaskQueue({ limit = 5, isLoading = false }: TaskQueueProps) {
  const [tasks, setTasks] = useState<Task[]>([])

  // Simulate fetching task data
  useEffect(() => {
    if (isLoading) return

    // Mock task data
    const mockTasks: Task[] = [
      {
        id: "t1",
        title: "Review Genomic Analysis",
        description: "Review genomic analysis results for patient Sarah Johnson",
        priority: "high",
        dueDate: "Today, 5:00 PM",
        progress: 75,
        status: "in-progress",
      },
      {
        id: "t2",
        title: "Update Treatment Plan",
        description: "Update treatment plan based on new lab results for Michael Chen",
        priority: "high",
        dueDate: "Tomorrow, 10:00 AM",
        progress: 30,
        status: "in-progress",
      },
      {
        id: "t3",
        title: "Schedule Follow-up",
        description: "Schedule follow-up appointment for Emma Rodriguez",
        priority: "medium",
        dueDate: "Yesterday, 3:00 PM",
        progress: 0,
        status: "overdue",
      },
      {
        id: "t4",
        title: "Complete Medical Report",
        description: "Complete medical report for James Wilson",
        priority: "medium",
        dueDate: "Friday, 12:00 PM",
        progress: 50,
        status: "in-progress",
      },
      {
        id: "t5",
        title: "Review Research Paper",
        description: "Review new research paper on BRCA1 variants",
        priority: "low",
        dueDate: "Next Monday",
        progress: 0,
        status: "pending",
      },
      {
        id: "t6",
        title: "Update Patient Records",
        description: "Update patient records with new contact information",
        priority: "low",
        dueDate: "Last Week",
        progress: 100,
        status: "completed",
      },
    ]

    setTasks(mockTasks.slice(0, limit))
  }, [limit, isLoading])

  // Task priority and status configuration
  const priorityConfig = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-amber-600 dark:text-amber-400",
    low: "text-blue-600 dark:text-blue-400",
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-gray-600 dark:text-gray-400",
    },
    "in-progress": {
      icon: ArrowRight,
      color: "text-blue-600 dark:text-blue-400",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
    },
    overdue: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
    },
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {tasks.map((task) => {
        const StatusIcon = statusConfig[task.status].icon

        return (
          <div key={task.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <StatusIcon className={`h-4 w-4 ${statusConfig[task.status].color}`} />
                <h4 className="text-sm font-medium">{task.title}</h4>
              </div>
              <span className={`text-xs font-medium ${priorityConfig[task.priority]}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <Progress value={task.progress} className="h-1.5" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{task.dueDate}</span>
            </div>
            <div className="pt-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                View Task
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
