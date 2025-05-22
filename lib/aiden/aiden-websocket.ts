/**
 * AIDEN WebSocket Client
 * Provides real-time communication with the AIDEN AI engine for streaming updates,
 * collaborative sessions, and live notifications.
 */

import { logger } from "@/lib/logging/enhanced-logger"
import { getAidenToken } from "@/lib/aiden/aiden-auth"

// WebSocket configuration
const AIDEN_WS_URL = process.env.AIDEN_WS_URL || "wss://api.aiden.agiledefense.com/v1/ws"

// Event types
export enum AidenWebSocketEventType {
  TASK_UPDATE = "task_update",
  ANOMALY_DETECTED = "anomaly_detected",
  COLLABORATION_UPDATE = "collaboration_update",
  SYSTEM_NOTIFICATION = "system_notification",
  DATA_STREAM = "data_stream",
}

// Event interface
export interface AidenWebSocketEvent<T = any> {
  event_type: AidenWebSocketEventType
  timestamp: string
  payload: T
  metadata?: Record<string, any>
}

// Connection options
export interface AidenWebSocketOptions {
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  subscriptions?: string[]
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  onError?: (error: Event) => void
  onMessage?: (event: AidenWebSocketEvent) => void
  onReconnect?: (attempt: number) => void
}

/**
 * AIDEN WebSocket Client class
 * Manages WebSocket connections to AIDEN for real-time updates
 */
export class AidenWebSocketClient {
  private ws: WebSocket | null = null
  private options: Required<AidenWebSocketOptions>
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private eventHandlers: Map<string, Set<(event: AidenWebSocketEvent) => void>> = new Map()
  private isConnecting = false

  constructor(options: AidenWebSocketOptions = {}) {
    // Set default options
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      subscriptions: [],
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      onMessage: () => {},
      onReconnect: () => {},
      ...options,
    }
  }

  /**
   * Connect to the AIDEN WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      // Get authentication token
      const token = await getAidenToken()

      // Create WebSocket connection with auth token
      this.ws = new WebSocket(`${AIDEN_WS_URL}?token=${token}`)

      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
    } catch (error) {
      this.isConnecting = false
      logger.error("Failed to connect to AIDEN WebSocket", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      this.attemptReconnect()
    }
  }

  /**
   * Disconnect from the AIDEN WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, "Client disconnected")
      this.ws = null
    }

    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventTypes: AidenWebSocketEventType | AidenWebSocketEventType[]): void {
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes]

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "subscribe",
          event_types: types,
        }),
      )
    } else {
      // Store subscriptions for when connection is established
      this.options.subscriptions = [...new Set([...this.options.subscriptions, ...types])]
    }
  }

  /**
   * Unsubscribe from specific event types
   */
  unsubscribe(eventTypes: AidenWebSocketEventType | AidenWebSocketEventType[]): void {
    const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes]

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "unsubscribe",
          event_types: types,
        }),
      )
    }

    // Remove from pending subscriptions
    this.options.subscriptions = this.options.subscriptions.filter(
      (type) => !types.includes(type as AidenWebSocketEventType),
    )
  }

  /**
   * Add event handler for specific event type
   */
  on(eventType: AidenWebSocketEventType, handler: (event: AidenWebSocketEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    this.eventHandlers.get(eventType)?.add(handler)
  }

  /**
   * Remove event handler for specific event type
   */
  off(eventType: AidenWebSocketEventType, handler: (event: AidenWebSocketEvent) => void): void {
    this.eventHandlers.get(eventType)?.delete(handler)
  }

  /**
   * Send a message to the AIDEN WebSocket server
   */
  send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      logger.warn("Cannot send message, WebSocket is not connected")
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    logger.info("Connected to AIDEN WebSocket")
    this.isConnecting = false
    this.reconnectAttempts = 0

    // Subscribe to requested event types
    if (this.options.subscriptions.length > 0) {
      this.subscribe(this.options.subscriptions as AidenWebSocketEventType[])
    }

    // Call user-provided onOpen handler
    this.options.onOpen()
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.isConnecting = false
    logger.info("Disconnected from AIDEN WebSocket", {
      code: event.code,
      reason: event.reason,
    })

    // Call user-provided onClose handler
    this.options.onClose(event)

    // Attempt to reconnect if enabled
    if (this.options.autoReconnect && event.code !== 1000) {
      this.attemptReconnect()
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.isConnecting = false
    logger.error("AIDEN WebSocket error", { event })

    // Call user-provided onError handler
    this.options.onError(event)
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as AidenWebSocketEvent

      // Call specific event handlers
      this.eventHandlers.get(data.event_type)?.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          logger.error("Error in AIDEN WebSocket event handler", {
            event_type: data.event_type,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      })

      // Call general message handler
      this.options.onMessage(data)
    } catch (error) {
      logger.error("Failed to parse AIDEN WebSocket message", {
        error: error instanceof Error ? error.message : "Unknown error",
        data: event.data,
      })
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (
      this.reconnectTimer ||
      !this.options.autoReconnect ||
      this.reconnectAttempts >= this.options.maxReconnectAttempts
    ) {
      return
    }

    this.reconnectAttempts++

    logger.info("Attempting to reconnect to AIDEN WebSocket", {
      attempt: this.reconnectAttempts,
      maxAttempts: this.options.maxReconnectAttempts,
    })

    // Call user-provided onReconnect handler
    this.options.onReconnect(this.reconnectAttempts)

    // Schedule reconnection
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.options.reconnectInterval)
  }
}

// Singleton instance for app-wide use
let wsClientInstance: AidenWebSocketClient | null = null

/**
 * Get the singleton WebSocket client instance
 */
export function getAidenWebSocketClient(options?: AidenWebSocketOptions): AidenWebSocketClient {
  if (!wsClientInstance) {
    wsClientInstance = new AidenWebSocketClient(options)
  }
  return wsClientInstance
}

export default {
  AidenWebSocketClient,
  getAidenWebSocketClient,
  AidenWebSocketEventType,
}
