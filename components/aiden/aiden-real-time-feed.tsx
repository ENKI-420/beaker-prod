"use client"

/**
 * AIDEN Real-Time Feed Component
 * Displays real-time updates from the AIDEN AI engine
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAidenWebSocket } from "@/hooks/use-aiden-websocket"
import { AidenWebSocketEventType, type AidenWebSocketEvent } from "@/lib/aiden/aiden-websocket"
import {
  Bell,
  AlertTriangle,
  Info,
  Activity,
  Users,
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Filter,
  MoreHorizontal,
} from "lucide-react"

interface AidenRealTimeFeedProps {
  subscriptions?: AidenWebSocketEventType[]
  maxEvents?: number
  showControls?: boolean
  title?: string
  description?: string
  className?: string
}

/**
 * AIDEN Real-Time Feed Component
 */
export function AidenRealTimeFeed({
  subscriptions = [
    AidenWebSocketEventType.TASK_UPDATE,
    AidenWebSocketEventType.ANOMALY_DETECTED,
    AidenWebSocketEventType.SYSTEM_NOTIFICATION,
  ],
  maxEvents = 50,
  showControls = true,
  title = "AIDEN Real-Time Feed",
  description = "Live updates and notifications from the AI orchestration engine",
  className,
}: AidenRealTimeFeedProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [events, setEvents] = useState<AidenWebSocketEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<AidenWebSocketEvent[]>([])

  const { isConnected, isConnecting, error, eventHistory, connect, disconnect } = useAidenWebSocket({
    autoConnect: true,
    subscriptions,
    showToasts: true,
    onMessage: (event) => {
      setEvents((prev) => [event, ...prev].slice(0, maxEvents))
    },
  })

  // Update filtered events when active tab or events change
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter((event) => event.event_type === activeTab))
    }
  }, [activeTab, events])

  // Get event icon based on event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case AidenWebSocketEventType.TASK_UPDATE:
        return <Activity className="h-4 w-4" />
      case AidenWebSocketEventType.ANOMALY_DETECTED:
        return <AlertTriangle className="h-4 w-4" />
      case AidenWebSocketEventType.COLLABORATION_UPDATE:
        return <Users className="h-4 w-4" />
      case AidenWebSocketEventType.SYSTEM_NOTIFICATION:
        return <Bell className="h-4 w-4" />
      case AidenWebSocketEventType.DATA_STREAM:
        return <Database className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  // Get event badge color based on event type
  const getEventBadgeClass = (eventType: string) => {
    switch (eventType) {
      case AidenWebSocketEventType.TASK_UPDATE:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case AidenWebSocketEventType.ANOMALY_DETECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case AidenWebSocketEventType.COLLABORATION_UPDATE:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case AidenWebSocketEventType.SYSTEM_NOTIFICATION:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case AidenWebSocketEventType.DATA_STREAM:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={
              isConnected
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : isConnecting
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }
          >
            {isConnected ? (
              <>
                <Wifi className="mr-1 h-3 w-3" /> Connected
              </>
            ) : isConnecting ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> Connecting
              </>
            ) : (
              <>
                <WifiOff className="mr-1 h-3 w-3" /> Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {showControls && (
          <div className="mb-4 flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value={AidenWebSocketEventType.TASK_UPDATE}>Tasks</TabsTrigger>
                <TabsTrigger value={AidenWebSocketEventType.ANOMALY_DETECTED}>Anomalies</TabsTrigger>
                <TabsTrigger value={AidenWebSocketEventType.SYSTEM_NOTIFICATION}>Notifications</TabsTrigger>
                <TabsTrigger value={AidenWebSocketEventType.COLLABORATION_UPDATE}>Collaboration</TabsTrigger>
                <TabsTrigger value={AidenWebSocketEventType.DATA_STREAM}>Data</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex space-x-2 ml-2">
              <Button variant="outline" size="icon" title="Filter">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-300">Connection Error</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={connect}>
                  Reconnect
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p>No events to display</p>
              <p className="text-xs mt-1">Real-time updates will appear here</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`mr-2 flex items-center ${getEventBadgeClass(event.event_type)}`}
                    >
                      {getEventIcon(event.event_type)}
                      <span className="ml-1 text-xs">
                        {event.event_type
                          .replace(/_/g, " ")
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(" ")}
                      </span>
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(event.timestamp)}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  {typeof event.payload === "string" ? (
                    <p>{event.payload}</p>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-32">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span>{" "}
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {isConnected && showControls && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        )}

        {!isConnected && !isConnecting && !error && (
          <div className="mt-4 flex justify-center">
            <Button variant="default" size="sm" onClick={connect}>
              Connect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
