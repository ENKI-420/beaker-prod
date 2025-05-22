"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

type EpicConnectionStatus = "connected" | "limited" | "disconnected" | "unknown"

interface EpicStatusIndicatorProps {
  showLabel?: boolean
}

/**
 * Epic status indicator component
 * Displays the current connection status to Epic EHR system
 */
export function EpicStatusIndicator({ showLabel = false }: EpicStatusIndicatorProps) {
  const [status, setStatus] = useState<EpicConnectionStatus>("unknown")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate checking Epic connection status
  useEffect(() => {
    const checkEpicStatus = async () => {
      try {
        // In a real application, this would be an API call to check Epic connection status
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate a successful connection (in production, this would be based on actual API response)
        setStatus("connected")
      } catch (error) {
        setStatus("disconnected")
      } finally {
        setIsLoading(false)
      }
    }

    checkEpicStatus()
  }, [])

  // Status configuration
  const statusConfig = {
    connected: {
      icon: CheckCircle2,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      label: "Connected to Epic",
      description: "Full integration with Epic EHR is active",
    },
    limited: {
      icon: AlertTriangle,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      label: "Limited Connection",
      description: "Some Epic EHR features may be unavailable",
    },
    disconnected: {
      icon: XCircle,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      label: "Disconnected",
      description: "No connection to Epic EHR",
    },
    unknown: {
      icon: AlertTriangle,
      color: "text-gray-500 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      label: "Checking Status",
      description: "Verifying connection to Epic EHR",
    },
  }

  const StatusIcon = statusConfig[status].icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`${statusConfig[status].bgColor} ${
                isLoading ? "animate-pulse" : ""
              } flex items-center space-x-1 px-2 py-1`}
            >
              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig[status].color}`} />
              {showLabel && <span className="text-xs">{statusConfig[status].label}</span>}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{statusConfig[status].label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{statusConfig[status].description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
