import config from "../config";
import { getOrCreateCookiePassword } from "server/utils/generateCookiePassword";
import CatboxRedis from "@hapi/catbox-redis";
import CatboxMemory from "@hapi/catbox-memory";
import Redis from "ioredis";
import { trackEvent } from "src/server/logging/customTracker";
import { setExpiry } from "src/server/utils/commonUtils";

const partition = "cache";

const ExpirySeconds = setExpiry() ?? 86399; // Default to 23:59 if unset

export const catboxProvider = () => {
  // In test mode prefer an in-memory provider to avoid network calls to Redis in CI/dev
  // (some developers have REDIS_* env vars set locally which cause timeouts).
  if (config.appEnv === "local") {
    return {
      name: "session_cache",
      provider: {
        constructor: CatboxMemory,
        options: { partition },
      },
    };
  }
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6380;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisTls = process.env.REDIS_TLS === "true";

  if (!redisHost) {
    return {
      name: "session_cache",
      provider: {
        constructor: CatboxMemory,
        options: { partition },
      },
    };
  }

  const redisClient =
    process.env.REDIS_CLUSTER === "true"
      ? new Redis.Cluster(
          [{ host: redisHost, port: redisPort }],
          { redisOptions: { password: redisPassword, tls: redisTls ? { servername: redisHost } : undefined } }
        )
      : new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          tls: redisTls ? { servername: redisHost } : undefined,
        });

  return {
    name: "session_cache",
    provider: {
      constructor: CatboxRedis,
      options: {
        partition,
        client: redisClient, // must pass client here
       // ttl: ExpirySeconds * 1000, // Convert seconds to milliseconds for Catbox
      },
    },
  };
};

// Note: yar options (specifically cookie password) are created at registration
// time so we can asynchronously obtain a shared password from Redis if needed.

// Export a Hapi plugin which first registers the catbox provider then yar.
export default {
  name: "session-plugin",
  register: async (server: any) => {
    // Ensure the cache provider object is available to the server.
    // Calling `server.register(catboxProvider())` is invalid because Hapi expects a plugin
    // object; instead, add the provider into the server's cache provision list or settings.cache
    // so the cache named `session_cache` exists for yar to reference.
    try {
      const provider = catboxProvider();

      // Prefer to provision the cache via the server core (creates Catbox client and registers it)
      if (server._core && typeof server._core._createCache === "function") {
        try {
          // _createCache expects an array of cache configs (same shape as server settings.cache)
          server._core._createCache([provider]);
        } catch (createErr) {
          // Fallback to attempting to append to settings.cache if provisioning fails
          if (server.settings && Array.isArray((server as any).settings.cache)) {
            (server as any).settings.cache.push(provider);
          } else {
            try {
              (server as any).settings = { ...(server as any).settings, cache: [(provider as any)] };
            } catch (ignore) {
              // Give up - yar registration may fail and tests will reveal it
            }
          }
        }
      } else if (server.settings && Array.isArray((server as any).settings.cache)) {
        // If server was created with options, append to settings.cache
        (server as any).settings.cache.push(provider);
      } else {
        // As a last resort, attempt to set server.settings.cache to an array containing provider
        try {
          (server as any).settings = { ...(server as any).settings, cache: [(provider as any)] };
        } catch (ignore) {
          // If we can't mutate settings, keep going; yar registration may still work if the
          // server has a default memory provider. Tests that rely on session_cache should
          // create servers with that cache or use the createServer helper which already
          // includes the cache via options.
        }
      }

      // Create yar options at runtime so we can asynchronously obtain a
      // shared cookie password from Redis (or fall back to an in-process value).
      // Instance-specific: uses PREVIEW_MODE to select password
      const instanceMode = config.previewMode ? "PREVIEW" : "LIVE";
      trackEvent(`Session plugin: Starting registration`, { instanceMode }, false);
      
      const cookiePassword =
        config.sessionCookiePassword || (await getOrCreateCookiePassword());

      if (config.sessionCookiePassword) {
        trackEvent(`Session plugin: Using explicit SESSION_COOKIE_PASSWORD from config`, { instanceMode }, false);
      } else {
        trackEvent(`Session plugin: Using password from Redis/in-process fallback`, { instanceMode }, false);
      }

      const yarPluginOptions = {
        cache: {
          cache: "session_cache",
        },
        expiresIn: ExpirySeconds * 1000, // Use REDIS_KEY_EXPIRY from .env
        cookieOptions: {
          password: cookiePassword,
          isSecure: !config.isDev,
          isHttpOnly: true,
          isSameSite: "Lax",
        },
      };

      // then register yar with the options that reference the cache
      await server.register({ plugin: require("@hapi/yar"), options: yarPluginOptions });
      trackEvent(`Session plugin: Successfully registered`, { instanceMode }, false);
    } catch (err) {
      // Re-throw to make failures visible in tests, but annotate for easier debugging
      (err as any).message = `session-plugin registration failed: ${(err as any).message}`;
      throw err;
    }
  },
};
