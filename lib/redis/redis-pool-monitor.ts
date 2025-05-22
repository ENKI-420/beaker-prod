import { logger } from "../logging/enhanced-logger"
import { getRedisPoolStats } from "./genomic-redis-client"

/**
 * Configuration for the Redis pool monitor
 */
export interface RedisPoolMonitorConfig {
  /** Interval in milliseconds between monitoring checks */
  intervalMs: number
  /** Whether to log statistics on each interval */
  logStats: boolean
  /** Threshold for high connection usage warning (0-1) */
  highUsageThreshold: number
}

/**
 * Default configuration for the Redis pool monitor
 */
const DEFAULT_MONITOR_CONFIG: RedisPoolMonitorConfig = {
  intervalMs: 60000, // 1 minute
  logStats: true,
  highUsageThreshold: 0.8, // 80%
}

/**
 * Monitors Redis connection pool performance and health
 */
export class RedisPoolMonitor {
  private static instance: RedisPoolMonitor | null = null
  private config: RedisPoolMonitorConfig
  private monitorInterval: NodeJS.Timeout | null = null
  private metrics: {
    timestamps: number[]
    totalConnections: number[]
    activeConnections: number[]
    idleConnections: number[]
  } = {
    timestamps: [],
    totalConnections: [],
    activeConnections: [],
    idleConnections: [],
  }
  private maxMetricsLength = 100 // Keep last 100 data points

  /**
   * Creates a new Redis pool monitor
   * @param config - Monitor configuration
   */
  private constructor(config: Partial<RedisPoolMonitorConfig> = {}) {
    this.config = { ...DEFAULT_MONITOR_CONFIG, ...config }
  }

  /**
   * Gets the singleton instance of the pool monitor
   * @param config - Monitor configuration
   * @returns The pool monitor instance
   */
  public static getInstance(config: Partial<RedisPoolMonitorConfig> = {}): RedisPoolMonitor {
    if (!RedisPoolMonitor.instance) {
      RedisPoolMonitor.instance = new RedisPoolMonitor(config)
    }
    return RedisPoolMonitor.instance
  }

  /**
   * Starts monitoring the Redis connection pool
   */
  public start(): void {
    if (this.monitorInterval) {
      return
    }

    logger.info("Starting Redis pool monitoring", {
      intervalMs: this.config.intervalMs,
      logStats: this.config.logStats,
    })

    this.monitorInterval = setInterval(() => {
      this.checkPoolHealth()
    }, this.config.intervalMs)

    // Initial check
    this.checkPoolHealth()
  }

  /**
   * Stops monitoring the Redis connection pool
   */
  public stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
      logger.info("Stopped Redis pool monitoring")
    }
  }

  /**
   * Checks the health of the Redis connection pool
   */
  private checkPoolHealth(): void {
    try {
      const stats = getRedisPoolStats()
      const timestamp = Date.now()

      // Record metrics
      this.metrics.timestamps.push(timestamp)
      this.metrics.totalConnections.push(stats.totalConnections)
      this.metrics.activeConnections.push(stats.activeConnections)
      this.metrics.idleConnections.push(stats.idleConnections)

      // Trim metrics if needed
      if (this.metrics.timestamps.length > this.maxMetricsLength) {
        this.metrics.timestamps.shift()
        this.metrics.totalConnections.shift()
        this.metrics.activeConnections.shift()
        this.metrics.idleConnections.shift()
      }

      // Check for high usage
      const usageRatio = stats.activeConnections / stats.maxConnections
      if (usageRatio >= this.config.highUsageThreshold) {
        logger.warn("Redis connection pool usage is high", {
          activeConnections: stats.activeConnections,
          maxConnections: stats.maxConnections,
          usageRatio: usageRatio.toFixed(2),
        })
      }

      // Log stats if enabled
      if (this.config.logStats) {
        logger.info("Redis connection pool stats", {
          totalConnections: stats.totalConnections,
          activeConnections: stats.activeConnections,
          idleConnections: stats.idleConnections,
          maxConnections: stats.maxConnections,
          usageRatio: (usageRatio * 100).toFixed(1) + "%",
        })
      }
    } catch (error) {
      logger.error("Error monitoring Redis connection pool", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  /**
   * Gets the collected metrics
   * @returns Pool metrics over time
   */
  public getMetrics() {
    return { ...this.metrics }
  }

  /**
   * Gets the latest pool statistics
   * @returns Latest pool statistics
   */
  public getLatestStats() {
    return getRedisPoolStats()
  }

  /**
   * Calculates average connection usage over the recorded period
   * @returns Average connection usage statistics
   */
  public getAverageUsage() {
    if (this.metrics.totalConnections.length === 0) {
      return {
        avgTotalConnections: 0,
        avgActiveConnections: 0,
        avgIdleConnections: 0,
        avgUsageRatio: 0,
      }
    }

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
    const avg = (arr: number[]) => sum(arr) / arr.length

    const avgTotalConnections = avg(this.metrics.totalConnections)
    const avgActiveConnections = avg(this.metrics.activeConnections)
    const avgIdleConnections = avg(this.metrics.idleConnections)
    const stats = getRedisPoolStats()
    const avgUsageRatio = avgActiveConnections / stats.maxConnections

    return {
      avgTotalConnections,
      avgActiveConnections,
      avgIdleConnections,
      avgUsageRatio,
    }
  }
}

export default RedisPoolMonitor
