import { logger } from "../logging/enhanced-logger";

/**
 * Interface for cache entries with generic value type and expiration
 */
interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

/**
 * In-memory cache implementation with TTL support
 * Provides a lightweight alternative to Redis for caching
 */
class InMemoryCache {
  private static instance: InMemoryCache | null = null;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Set up cleanup interval to remove expired items
    this.cleanupInterval = setInterval(() => this.removeExpiredItems(), 60000); // Run every minute
    logger.info("In-memory cache initialized");
  }

  /**
   * Get the singleton instance of the cache
   */
  public static getInstance(): InMemoryCache {
    if (!InMemoryCache.instance) {
      InMemoryCache.instance = new InMemoryCache();
    }
    return InMemoryCache.instance;
  }

  /**
   * Set a value in the cache with optional TTL
   */
  public set<T>(key: string, value: T, ttlSeconds?: number): boolean {
    try {
      const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      this.cache.set(key, { value, expiry });
      return true;
    } catch (error) {
      logger.error("Error setting cache value", {
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Get a value from the cache, returning null if expired or not found
   */
  public get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);

      // If entry doesn't exist or is expired, return null
      if (!entry || (entry.expiry !== null && entry.expiry < Date.now())) {
        if (entry && entry.expiry !== null && entry.expiry < Date.now()) {
          // Remove expired entry
          this.cache.delete(key);
        }
        return null;
      }

      return entry.value as T;
    } catch (error) {
      logger.error("Error getting cache value", {
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Delete a value from the cache
   */
  public delete(key: string): boolean {
    try {
      return this.cache.delete(key);
    } catch (error) {
      logger.error("Error deleting cache value", {
        key,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Clear all values from the cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Remove all expired items from the cache
   */
  public removeExpiredItems(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry !== null && entry.expiry < now) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.debug(`Removed ${expiredCount} expired items from cache`);
    }
  }

  /**
   * Clean up resources when the cache is no longer needed
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    InMemoryCache.instance = null;
  }

  /**
   * Get cache statistics
   */
  public getStats(): Record<string, unknown> {
    const now = Date.now();
    let activeItems = 0;
    let expiredItems = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiry === null || entry.expiry >= now) {
        activeItems++;
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      activeItems,
      expiredItems,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance getter
export const getInMemoryCache = (): InMemoryCache => {
  return InMemoryCache.getInstance();
};

// Export convenience methods
export const cacheSet = <T>(key: string, value: T, ttlSeconds?: number): boolean => {
  return getInMemoryCache().set(key, value, ttlSeconds);
};

export const cacheGet = <T>(key: string): T | null => {
  return getInMemoryCache().get<T>(key);
};

export const cacheDelete = (key: string): boolean => {
  return getInMemoryCache().delete(key);
};

export const cacheStats = (): Record<string, unknown> => {
  return getInMemoryCache().getStats();
};

export const cleanupExpiredKeys = (): number => {
  const before = getInMemoryCache().size();
  getInMemoryCache().removeExpiredItems();
  const after = getInMemoryCache().size();
  return before - after;
};

// Default export with all cache operations
export default {
  getCache: getInMemoryCache,
  set: cacheSet,
  get: cacheGet,
  delete: cacheDelete,
  stats: cacheStats,
  cleanup: cleanupExpiredKeys
};
