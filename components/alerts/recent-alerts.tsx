"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, AlertCircle, Bell, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Alert {
  id: string
  title: string
  message: string
  type: "critical" | "warning" | "info" | "notification"
  timestamp: string
  isRead: boolean
}

interface RecentAlertsProps {
  limit?: number
  isLoading?: boolean
}

/**
 * Recent alerts component
 * Displays a list of recent system alerts
 */
export function RecentAlerts({ limit = 5, isLoading = false }: RecentAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Simulate fetching alert data
  useEffect(() => {
    if (isLoading) return

    // Mock alert data
    const mockAlerts: Alert[] = [
      {
        id: "a1",
        title: "Critical Variant Detected",
        message: "Pathogenic variant detected in patient Sarah Johnson's latest genomic analysis",
        type: "critical",
        timestamp: "2 hours ago",
        isRead: false,
      },
      {
        id: "a2",
        title: "Lab Results Available",
        message: "New lab results available for patient Michael Chen",
        type: "notification",
        timestamp: "4 hours ago",
        isRead: false,
      },
      {
        id: "a3",
        title: "Treatment Conflict",
        message: "Potential drug interaction detected in Emma Rodriguez's treatment plan",
        type: "warning",
        timestamp: "Yesterday",
        isRead: true,
      },
      {
        id: "a4",
        title: "System Maintenance",
        message: "Scheduled maintenance will occur tonight from 2-4 AM",
        type: "info",
        timestamp: "Yesterday",
        isRead: true,
      },
      {
        id: "a5",
        title: "New Research Published",
        message: "New research on BRCA1 variants published in Journal of Genomic Medicine",
        type: "info",
        timestamp: "2 days ago",
        isRead: true,
      },
    ]

    setAlerts(mockAlerts.slice(0, limit))
  }, [limit, isLoading])

  // Alert type icons and colors
  const alertTypeConfig = {
    critical: {
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
    },
    info: {
      icon: Info,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    notification: {
      icon: Bell,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const AlertIcon = alertTypeConfig[alert.type].icon

        return (
          <div
            key={alert.id}
            className={`flex items-start space-x-4 p-3 rounded-md ${
              !alert.isRead ? "bg-gray-50 dark:bg-gray-800" : ""
            }`}
          >
            <div className={`p-2 rounded-full ${alertTypeConfig[alert.type].bgColor}`}>
              <AlertIcon className={`h-4 w-4 ${alertTypeConfig[alert.type].color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.title}</p>
                {!alert.isRead && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.message}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{alert.timestamp}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
