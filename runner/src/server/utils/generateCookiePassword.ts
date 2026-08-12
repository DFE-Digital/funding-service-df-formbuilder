import crypto from "crypto";
import { RedisService } from "server/services/redisService";
import { trackEvent } from "src/server/logging/customTracker";

// Key used to persist the generated cookie password in Redis so all
// processes can reuse the same secret. Instance-specific to prevent
// cross-instance session sharing when different passwords are used.
function getRedisKeyForCookiePassword(): string {
  const isPreview = process.env.PREVIEW_MODE === "true";
  return isPreview ? "session:cookie_password:preview" : "session:cookie_password:live";
}

// In-process singleton fallback for when Redis isn't available. This ensures
// repeated calls within the same process return the same value.
// Instance-specific to prevent cross-instance session sharing.
const singletonPasswords: Map<string, string> = new Map();

function getSingletonPassword(): string | undefined {
  const key = getRedisKeyForCookiePassword();
  return singletonPasswords.get(key);
}

function setSingletonPassword(password: string): void {
  const key = getRedisKeyForCookiePassword();
  singletonPasswords.set(key, password);
}

/**
 * Wait for Redis to be connected with timeout
 * @param timeoutMs Maximum milliseconds to wait (default 5000ms)
 */
async function waitForRedisConnection(timeoutMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (RedisService.isConnected()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

/**
 * Synchronous generator that returns a fresh random 32-character password
 * each time it is called. Tests rely on this behaviour (two successive
 * calls should return different values). For cross-process sharing at
 * runtime use the async `getOrCreateCookiePassword()` exported below.
 */
const generateCookiePassword = (): string => crypto.randomBytes(16).toString("hex");

/**
 * Async getter that attempts to share the password across processes using Redis.
 * Falls back to the in-process singleton when Redis isn't available.
 * Instance-specific: Uses PREVIEW_MODE to select appropriate password env var
 * and stores in instance-specific Redis keys.
 */
export async function getOrCreateCookiePassword(): Promise<string> {
  const isPreview = process.env.PREVIEW_MODE === "true";
  const envPassword = isPreview 
    ? process.env.SESSION_COOKIE_PASSWORD_PREVIEW || process.env.SESSION_COOKIE_PASSWORD
    : process.env.SESSION_COOKIE_PASSWORD;

  // 1) Respect explicit env var if provided (instance-specific)
  if (envPassword && envPassword.length >= 32) {
    trackEvent(`getOrCreateCookiePassword: Using explicit ${isPreview ? 'PREVIEW' : 'LIVE'} password from environment`, { isPreview, source: 'env', pwLength: envPassword.length }, false);
    return envPassword;
  }

  const redisKey = getRedisKeyForCookiePassword();

  // 2) If Redis client is available, try to fetch (instance-specific key)
  try {
    // Wait for Redis to be connected (with 5 second timeout)
    const isConnected = await waitForRedisConnection(5000);
    
    if (isConnected) {
      trackEvent(`getOrCreateCookiePassword: Waiting for Redis connection`, { isPreview, redisKey }, false);
      const existing = await RedisService.getCache(redisKey);
      if (existing) {
        setSingletonPassword(existing);
        trackEvent(`getOrCreateCookiePassword: Found password in Redis`, { isPreview, redisKey }, false);
        return existing;
      }

      // 3) Not present in Redis: generate and persist (instance-specific)
      const generated = crypto.randomBytes(16).toString("hex");
      try {
        await RedisService.setCache(redisKey, generated);
        trackEvent(`getOrCreateCookiePassword: Generated and cached password in Redis`, { isPreview, redisKey }, false);
      } catch (err) {
        setSingletonPassword(generated);
        trackEvent(`getOrCreateCookiePassword: Failed to cache in Redis, using in-process fallback`, { isPreview, redisKey, error: (err as any)?.message }, false);
        return generated;
      }

      setSingletonPassword(generated);
      return generated;
    }
  } catch (err) {
    trackEvent(`getOrCreateCookiePassword: Redis error, falling back to in-process singleton`, { isPreview, error: (err as any)?.message }, true);
    // If Redis calls throw, fall through to in-process generation
  }

  // 4) Fallback: in-process singleton. Ensure we reuse the same generated
  // value for the lifetime of this process so multiple calls remain stable (instance-specific).
  let singletonPassword = getSingletonPassword();
  if (!singletonPassword) {
    singletonPassword = crypto.randomBytes(16).toString("hex");
    setSingletonPassword(singletonPassword);
    trackEvent(`getOrCreateCookiePassword: Generated password in-process`, { isPreview, redisKey }, false);
  }

  return singletonPassword;
}

export default generateCookiePassword;
