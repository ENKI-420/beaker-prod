import { createClient, type RedisClientType } from "redis"
import { logger } from "../logging/enhanced-logger"

/**
 * Configuration options for the Redis connection pool
 */
export interface RedisPoolConfig {
  /** Maximum number of connections in the pool */
  maxConnections: number
  /** Minimum number of connections to keep ready */
  minConnections: number
  /** Time in ms after which idle connections are removed */
  idleTimeoutMs: number
  /** Maximum time in ms to wait for a connection before timeout */
  acquireTimeoutMs: number
  /** Time in ms between health checks on idle connections */
  healthCheckIntervalMs: number
  /** Redis connection URL */
  url?: string
  /** Redis password */
  password?: string
  /** Redis username */
  username?: string
  /** Redis database index */
  database?: number
  /** TLS configuration */
  tls?: boolean
}

/**
 * Default configuration for the Redis connection pool
 */
const DEFAULT_POOL_CONFIG: RedisPoolConfig = {
  maxConnections: 10,
  minConnections: 2,
  idleTimeoutMs: 30000, // 30 seconds
  acquireTimeoutMs: 5000, // 5 seconds
  healthCheckIntervalMs: 60000, // 1 minute
}

/**
 * Represents a Redis connection in the pool
 */
interface PooledConnection {
  /** The Redis client instance */
  client: RedisClientType
  /** Whether the connection is currently in use */
  inUse: boolean
  /** Timestamp when the connection was last used */
  lastUsed: number
}

/**
 * Manages a pool of Redis connections for efficient resource utilization
 */
export class RedisConnectionPool {
  private static instance: RedisConnectionPool | null = null
  private connections: PooledConnection[] = []
  private config: RedisPoolConfig
  private healthCheckInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  /**
   * Creates a new Redis connection pool
   * @param config - Pool configuration options
   */
  private constructor(config: Partial<RedisPoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config }
    this.initialize()
  }

  /**
   * Gets the singleton instance of the connection pool
   * @param config - Pool configuration options
   * @returns The connection pool instance
   */
  public static getInstance(config: Partial<RedisPoolConfig> = {}): RedisConnectionPool {
    if (!RedisConnectionPool.instance) {
      RedisConnectionPool.instance = new RedisConnectionPool(config)
    }
    return RedisConnectionPool.instance
  }

  /**
   * Initializes the connection pool
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Create minimum connections
      for (let i = 0; i < this.config.minConnections; i++) {
        await this.createConnection()
      }

      // Start health check interval
      this.healthCheckInterval = setInterval(() => {
        this.performHealthCheck()
      }, this.config.healthCheckIntervalMs)

      this.isInitialized = true
      logger.info("Redis connection pool initialized", {
        minConnections: this.config.minConnections,
        maxConnections: this.config.maxConnections,
      })
    } catch (error) {
      logger.error("Failed to initialize Redis connection pool", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  /**
   * Creates a new Redis connection
   * @returns The created connection
   */
  private async createConnection(): Promise<PooledConnection> {
    try {
      const url = this.config.url || process.env.REDIS_URL || ""
      const password = this.config.password || process.env.REDIS_PASSWORD || ""
      const username = this.config.username || process.env.REDIS_USERNAME || ""
      const database = this.config.database || 0
      const tls = this.config.tls || process.env.REDIS_TLS === "true"

      if (!url) {
        throw new Error("Missing required Redis connection URL")
      }

      // Create Redis client with node-redis
      const client = createClient({
        url,
        password: password || undefined,
        username: username || undefined,
        database,
        socket: {
          tls: tls,
          reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // Exponential backoff with max 3s
        },
      })

      // Set up error handler
      client.on("error", (err) => {
        logger.error("Redis client error", {
          error: err.message,
        })
      })

      // Connect to Redis
      await client.connect()

      // Test the connection
      await client.ping()

      const connection: PooledConnection = {
        client,
        inUse: false,
        lastUsed: Date.now(),
      }

      this.connections.push(connection)
      logger.debug("Created new Redis connection", { poolSize: this.connections.length })
      return connection
    } catch (error) {
      logger.error("Failed to create Redis connection", {
        error: error instanceof Error ? error.message : "Unknown error",
      })
      throw error
    }
  }

  /**
   * Acquires a connection from the pool
   * @returns A Redis client instance
   */
  public async getConnection(): Promise<RedisClientType> {
    // Find an available connection
    const availableConnection = this.connections.find((conn) => !conn.inUse)

    if (availableConnection) {
      availableConnection.inUse = true
      availableConnection.lastUsed = Date.now()
      return availableConnection.client
    }

    // If no available connections and below max, create a new one
    if (this.connections.length < this.config.maxConnections) {
      const newConnection = await this.createConnection()
      newConnection.inUse = true
      return newConnection.client
    }

    // If at max connections, wait for one to become available
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const checkInterval = setInterval(() => {
        const availableConnection = this.connections.find((conn) => !conn.inUse)

        if (availableConnection) {
          clearInterval(checkInterval)
          availableConnection.inUse = true
          availableConnection.lastUsed = Date.now()
          resolve(availableConnection.client)
        } else if (Date.now() - startTime > this.config.acquireTimeoutMs) {
          clearInterval(checkInterval)
          reject(new Error("Timed out waiting for available Redis connection"))
        }
      }, 100) // Check every 100ms
    })
  }

  /**
   * Releases a connection back to the pool
   * @param client - The Redis client to release
   */
  public releaseConnection(client: RedisClientType): void {
    const connectionIndex = this.connections.findIndex((conn) => conn.client === client)

    if (connectionIndex !== -1) {
      this.connections[connectionIndex].inUse = false
      this.connections[connectionIndex].lastUsed = Date.now()
      logger.debug("Released Redis connection back to pool", { poolSize: this.connections.length })
    }
  }

  /**
   * Performs health checks on idle connections and manages pool size
   */
  private async performHealthCheck(): Promise<void> {
    logger.debug("Performing Redis connection pool health check", { poolSize: this.connections.length })

    const now = Date.now()
    const idleConnections = this.connections.filter(
      (conn) => !conn.inUse && now - conn.lastUsed > this.config.idleTimeoutMs,
    )

    // Keep at least minConnections
    const connectionsToRemove = Math.max(
      0,
      idleConnections.length - (this.connections.length - this.config.minConnections),
    )

    if (connectionsToRemove > 0) {
      logger.debug(`Removing ${connectionsToRemove} idle Redis connections`, {
        idleConnections: idleConnections.length,
        totalConnections: this.connections.length,
      })

      // Remove excess idle connections
      for (let i = 0; i < connectionsToRemove; i++) {
        const connIndex = this.connections.findIndex((conn) => conn === idleConnections[i])
        if (connIndex !== -1) {
          try {
            await this.connections[connIndex].client.quit()
          } catch (error) {
            logger.warn("Error disconnecting Redis client", {
              error: error instanceof Error ? error.message : "Unknown error",
            })
          }
          this.connections.splice(connIndex, 1)
        }
      }
    }

    // Test remaining connections
    for (const conn of this.connections) {
      if (!conn.inUse) {
        try {
          await conn.client.ping()
        } catch (error) {
          logger.warn("Removing unhealthy Redis connection", {
            error: error instanceof Error ? error.message : "Unknown error",
          })

          const connIndex = this.connections.indexOf(conn)
          if (connIndex !== -1) {
            try {
              await conn.client.quit()
            } catch (disconnectError) {
              // Ignore disconnect errors
            }
            this.connections.splice(connIndex, 1)
          }
        }
      }
    }

    // Ensure we maintain minConnections
    const availableConnections = this.connections.length
    if (availableConnections < this.config.minConnections) {
      logger.debug(`Adding ${this.config.minConnections - availableConnections} Redis connections to meet minimum`, {
        currentConnections: availableConnections,
        minConnections: this.config.minConnections,
      })

      for (let i = availableConnections; i < this.config.minConnections; i++) {
        await this.createConnection()
      }
    }
  }

  /**
   * Closes all connections in the pool
   */
  public async close(): Promise<void> {
    logger.info("Closing Redis connection pool", { poolSize: this.connections.length })

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }

    // Close all connections
    for (const conn of this.connections) {
      try {
        await conn.client.quit()
      } catch (error) {
        logger.warn("Error closing Redis connection", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    this.connections = []
    this.isInitialized = false
    RedisConnectionPool.instance = null
  }

  /**
   * Gets the current number of connections in the pool
   * @returns The pool size
   */
  public getPoolSize(): number {
    return this.connections.length
  }

  /**
   * Gets the number of active connections in the pool
   * @returns The number of active connections
   */
  public getActiveConnectionCount(): number {
    return this.connections.filter((conn) => conn.inUse).length
  }

  /**
   * Gets the number of idle connections in the pool
   * @returns The number of idle connections
   */
  public getIdleConnectionCount(): number {
    return this.connections.filter((conn) => !conn.inUse).length
  }

  /**
   * Gets the pool statistics
   * @returns Pool statistics
   */
  public getStats() {
    return {
      totalConnections: this.connections.length,
      activeConnections: this.getActiveConnectionCount(),
      idleConnections: this.getIdleConnectionCount(),
      maxConnections: this.config.maxConnections,
      minConnections: this.config.minConnections,
    }
  }
}

export default RedisConnectionPool
