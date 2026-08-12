import { Redis as RedisClient, Cluster as RedisCluster } from "ioredis";
import { trackEvent } from "../logging/customTracker";

type RedisInstance = RedisClient | RedisCluster;

export class RedisService {
  private static client: RedisInstance | null = null;

  /**
   * Set the shared Redis client instance
   * Supports Redis and Redis.Cluster
   */
  static setClient(client: RedisInstance) {
    RedisService.client = client;
  }

  /**
   * Set a key in Redis with optional expiration
   * @param key Redis key (must be non-empty)
   * @param value Value to store as string (must be non-empty)
   * @param expiryMethod Optional: 'EX' (seconds) or 'PX' (milliseconds)
   * @param expiryValue Optional: expiration time in seconds (EX) or milliseconds (PX)
   * @returns "OK" on success, throws on error
   * @throws Error if Redis client not initialized or command fails
   */
  static async setCache(
    key: string,
    value: string,
    expiryMethod?: "EX" | "PX",
    expiryValue?: number
  ): Promise<string> {
    if (!RedisService.client) {
      throw new Error("RedisService.client not initialized");
    }

    // Validate inputs
    if (!key || typeof key !== "string" || key.trim() === "") {
      trackEvent("❌ RedisService.setCache error: Redis key cannot be empty", true);
      throw new Error("Redis key cannot be empty");
    }

    if (!value || typeof value !== "string") {
      trackEvent("❌ Redis value cannot be empty or non-string", true);
      throw new Error("Redis value cannot be empty or non-string");
    }

    try {
      // ioredis v5 uses positional arguments for expiry: set(key, value, 'EX', seconds)
      if (expiryMethod && typeof expiryValue === "number" && expiryValue > 0) {
        if (expiryMethod === "EX") {
          return await (RedisService.client as any).set(key, value, "EX", expiryValue);
        } else if (expiryMethod === "PX") {
          return await (RedisService.client as any).set(key, value, "PX", expiryValue);
        }
      }

      // Set without expiration
      return await (RedisService.client as any).set(key, value);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error(`❌ RedisService.setCache error for key "${key}": ${errorMsg}`);
      trackEvent("❌ RedisService.setCache error for key", { key, errorMsg }, true);
      throw new Error(`Failed to set Redis cache: ${errorMsg}`);
    }
  }

  /**
   * Get a value from Redis
   * @param key Redis key (must be non-empty)
   * @returns Value as string if found, null if key doesn't exist
   * @throws Error if Redis client not initialized or command fails
   */
  static async getCache(key: string): Promise<string | null> {
    if (!RedisService.client) {
      trackEvent("❌ RedisService.client not initialized", true);
      throw new Error("RedisService.client not initialized");
    }

    // Validate input
    if (!key || typeof key !== "string" || key.trim() === "") {
      trackEvent("❌ Redis key cannot be empty", true);
      throw new Error("Redis key cannot be empty");
    }

    try {
      return await RedisService.client.get(key);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      trackEvent("❌ RedisService.getCache error for key ", { key: errorMsg }, true);
      console.error(`❌ RedisService.getCache error for key "${key}": ${errorMsg}`);
      throw new Error(`Failed to get Redis cache: ${errorMsg}`);
    }
  }

  /**
   * Delete a key from Redis
   * @param key Redis key (must be non-empty)
   * @returns Number of keys deleted (0 or 1)
   * @throws Error if Redis client not initialized or command fails
   */
  static async deleteCache(key: string): Promise<number> {
    if (!RedisService.client) {
      trackEvent("❌ RedisService.client not initialized", true);
      throw new Error("RedisService.client not initialized");
    }

    // Validate input
    if (!key || typeof key !== "string" || key.trim() === "") {
      trackEvent("❌ Redis key cannot be empty", true);
      throw new Error("Redis key cannot be empty");
    }

    try {
      return await RedisService.client.del(key);
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      trackEvent("❌ RedisService.deleteCache error for key", { key: errorMsg }, true);
      console.error(`❌ RedisService.deleteCache error for key "${key}": ${errorMsg}`);
      throw new Error(`Failed to delete Redis cache: ${errorMsg}`);
    }
  }

  /**
   * Check if the client is connected
   */
  static isConnected(): boolean {
    if (!RedisService.client) return false;
    return RedisService.client.status === "ready";
  }

  /**
   * Close Redis connection
   */
  static async disconnect(): Promise<void> {
    if (RedisService.client) {
      await RedisService.client.quit();
      RedisService.client = null;
    }
  }
}
