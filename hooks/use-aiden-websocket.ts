"use client"

/**
 * Hook for using AIDEN WebSocket connections
 * Provides real-time updates from the AIDEN AI engine
 */

import { useState, useEffect, useCallback, useRef } from "react"
import {
  AidenWebSocketClient,
  type AidenWebSocketEventType,
  type AidenWebSocketEvent,
} from "@/lib/aiden/aiden-websocket"
import { useToast } from "@/components/ui/toast-provider"

interface UseAidenWebSocketOptions {
  autoConnect?: boolean
  subscriptions?: AidenWebSocketEventType[]
  onMessage?: (event: AidenWebSocketEvent) => void
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  showToasts?: boolean
}

/**
 * Hook for using AIDEN WebSocket connections
 */
export function useAidenWebSocket(options: UseAidenWebSocketOptions = {}) {
  const { autoConnect = true, subscriptions = [], onMessage, onOpen, onClose, onError, showToasts = true } = options

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastEvent, setLastEvent] = useState<AidenWebSocketEvent | null>(null)
  const [eventHistory, setEventHistory] = useState<AidenWebSocketEvent[]>([])

  const wsClientRef = useRef<AidenWebSocketClient | null>(null)
  const { addToast } = useToast()

  // Initialize WebSocket client
  useEffect(() => {
    if (!wsClientRef.current) {
      wsClientRef.current = new AidenWebSocketClient({
        autoReconnect: true,
        subscriptions: subscriptions as string[],
        onOpen: () => {
          setIsConnected(true)
          setIsConnecting(false)
          setError(null)

          if (showToasts) {
            addToast({
              type: "success",
              title: "Connected to AIDEN",
              message: "Real-time updates are now active",
              duration: 3000,
            })
          }

          if (onOpen) {
            onOpen()
          }
        },
        onClose: (event) => {
          setIsConnected(false)

          if (showToasts && event.code !== 1000) {
            addToast({
              type: "warning",
              title: "Disconnected from AIDEN",
              message: "Connection closed. Attempting to reconnect...",
              duration: 5000,
            })
          }

          if (onClose) {
            onClose(event)
          }
        },
        onError: (event) => {
          setError(new Error("WebSocket connection error"))

          if (showToasts) {
            addToast({
              type: "error",
              title: "AIDEN Connection Error",
              message: "Failed to connect to AIDEN real-time services",
              duration: 5000,
            })
          }

          if (onError) {
            onError(event)
          }
        },
        onMessage: (event) => {
          setLastEvent(event)
          setEventHistory((prev) => [event, ...prev].slice(0, 50)) // Keep last 50 events

          if (onMessage) {
            onMessage(event)
          }
        },
      })
    }

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
        wsClientRef.current = null
      }
    }
  }, [subscriptions, onOpen, onClose, onError, onMessage, addToast, showToasts])

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && wsClientRef.current && !isConnected && !isConnecting) {
      connect()
    }
  }, [autoConnect, isConnected, isConnecting])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsClientRef.current && !isConnected && !isConnecting) {
      setIsConnecting(true)
      wsClientRef.current.connect()
    }
  }, [isConnected, isConnecting])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.disconnect()
      setIsConnected(false)
    }
  }, [])

  // Subscribe to event types
  const subscribe = useCallback((eventTypes: AidenWebSocketEventType | AidenWebSocketEventType[]) => {
    if (wsClientRef.current) {
      wsClientRef.current.subscribe(eventTypes)
    }
  }, [])

  // Unsubscribe from event types
  const unsubscribe = useCallback((eventTypes: AidenWebSocketEventType | AidenWebSocketEventType[]) => {
    if (wsClientRef.current) {
      wsClientRef.current.unsubscribe(eventTypes)
    }
  }, [])

  // Send a message
  const send = useCallback((message: any) => {
    if (wsClientRef.current) {
      wsClientRef.current.send(message)
    }
  }, [])

  // Add event handler
  const on = useCallback((eventType: AidenWebSocketEventType, handler: (event: AidenWebSocketEvent) => void) => {
    if (wsClientRef.current) {
      wsClientRef.current.on(eventType, handler)
    }
  }, [])

  // Remove event handler
  const off = useCallback((eventType: AidenWebSocketEventType, handler: (event: AidenWebSocketEvent) => void) => {
    if (wsClientRef.current) {
      wsClientRef.current.off(eventType, handler)
    }
  }, [])

  return {
    isConnected,
    isConnecting,
    error,
    lastEvent,
    eventHistory,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    on,
    off,
  }
}
