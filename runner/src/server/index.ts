import fs from "fs";
import hapi, { ServerOptions } from "@hapi/hapi";

import Scooter from "@hapi/scooter";
import inert from "@hapi/inert";
import Schmervice from "schmervice";
import blipp from "blipp";

import config from "server/config";
import { configureRateLimitPlugin } from "./plugins/rateLimit";
import pluginPulse from "./plugins/pulse";
import pluginLogging from "./plugins/logging";
import pluginAuth from "./plugins/auth";
import pluginLocale from "./plugins/locale";
import pluginViews from "./plugins/views";
import pluginApplicationStatus from "./plugins/applicationStatus";
import pluginRouter from "./plugins/router";
import pluginErrorPages from "./plugins/errorPages";
import { configureBlankiePlugin } from "./plugins/blankie";
import { configureCrumbPlugin } from "./plugins/crumb";
import { configureEnginePlugin } from "./plugins/engine/configureEnginePlugin";

import {
  AddressService,
  CacheService,
  EmailService,
  NotifyService,
  PayService,
  StatusService,
  UploadService,
  WebhookService,
  UserService,
  RedisService,
} from "./services";

import { HapiRequest, HapiResponseToolkit, RouteConfig } from "./types";
import getRequestInfo from "./utils/getRequestInfo";
import { AppInsights } from "./logging";
import { catboxProvider } from "./plugins/session";
import { trackEvent } from "./logging/customTracker";
import { max } from "mathjs";

const insights = new AppInsights();
// Only enable App Insights in non-dev environments
if (config.appEnv != undefined) {
  insights.enable();
} else {
  console.log("⚠️ App Insights disabled in non-prod environment");
}
export async function createServer(routeConfig: RouteConfig) {
  // Initialize session cache
  const sessionCache = catboxProvider();

  // Diagnostic log in dev
  // if (config.appEnv === "dev") {
  //   const seen = new WeakSet();
  //   const safeJson = JSON.stringify(
  //     sessionCache,
  //     (key, value) => {
  //       if (typeof value === "object" && value !== null) {
  //         if (seen.has(value)) return "[Circular]";
  //         seen.add(value);
  //       }
  //       return value;
  //     },
  //     2
  //   );
  //   console.log("🧠 Hapi cache configuration:\n", safeJson);
  // }

  // Server options
  const hasCertificate = config.sslKey && config.sslCert;
  const options: ServerOptions = {
    debug: { request: [`${config.isDev}`] },
    port: config.port,
    routes: {
      validate: { options: { abortEarly: false } },
      security: {
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: false },
        xss: "disabled",
        noSniff: true,
        xframe: true,
      },
    },
    cache: [sessionCache],
  };

  const server = hapi.server({
    ...options,
    ...(hasCertificate
      ? {
          tls: {
            key: fs.readFileSync(config.sslKey),
            cert: fs.readFileSync(config.sslCert),
          },
        }
      : {}),
  });

  // Initialize Redis for services (direct use)
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6380;
  const redisPassword = process.env.REDIS_PASSWORD;
  const redisTls = process.env.REDIS_TLS === "true";
  let redisClient: any;

  if (redisHost) {
    redisClient =
      process.env.REDIS_CLUSTER === "true"
        ? new (require("ioredis").Cluster)([{ host: redisHost, port: redisPort }], {
            redisOptions: { password: redisPassword, tls: redisTls ? { servername: redisHost } : undefined },
          })
        : new (require("ioredis"))({
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            tls: redisTls ? { servername: redisHost } : undefined,
          });

    redisClient.on("error", (err: any) => console.error("Redis - error", err?.message || err));

    RedisService.setClient(redisClient);
    
    // Wait for Redis connection to be established before proceeding with plugin registration
    // This ensures that getOrCreateCookiePassword() and form operations can use Redis
    try {
      trackEvent("⏳ Waiting for Redis connection to be established...", false);
      let connectionAttempts = 0;
      const maxAttempts = 50; // 5 seconds total (50 * 100ms)
      
      while (connectionAttempts < maxAttempts) {
        if (RedisService.isConnected()) {
          trackEvent("✅ Redis connection established successfully", false);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        connectionAttempts++;
      }
      
      if (connectionAttempts === maxAttempts) {
        trackEvent("⚠️ Redis connection timeout (5s). Proceeding with in-process fallback for session cookie password.", maxAttempts, false);
      }
    } catch (err) {
      trackEvent("❌ Error while waiting for Redis connection:", (err as any)?.message || err, true);
    }
  }

  // -------------------------------
  // Register Hapi plugins
  // -------------------------------
  if (config.rateLimit) await server.register(configureRateLimitPlugin(routeConfig));

  await server.register(require("./plugins/session").default);
  await server.register([
    pluginPulse,
    inert,
    Scooter,
    configureBlankiePlugin(config),
    configureCrumbPlugin(config, routeConfig),
    pluginLogging,
    Schmervice,
    pluginAuth,
    pluginLocale,
    pluginViews,
    configureEnginePlugin(),
    pluginApplicationStatus,
    pluginRouter,
    pluginErrorPages,
  ]);

  if (!config.isTest) await server.register(blipp);

  // -------------------------------
  // Register services
  // -------------------------------
  server.registerService([
    CacheService,
    NotifyService,
    PayService,
    UploadService,
    EmailService,
    WebhookService,
    UserService,
    StatusService,
    AddressService,
  ]);

  // -------------------------------
  // Hapi extensions
  // -------------------------------
  server.ext("onPreResponse", (request: HapiRequest, h: HapiResponseToolkit) => {
    const { response } = request;

    insights.getClient().trackNodeHttpRequest({ request, response });
    insights.getClient().commonProperties = { url: request.path };
    insights.flush();

    if ("isBoom" in response && response.isBoom) return h.continue;

    if ("header" in response && response.header) {
      response.header("X-Robots-Tag", "noindex, nofollow");
      const WEBFONT_EXTENSIONS = /\.(?:eot|ttf|woff|svg|woff2)$/i;
      if (!WEBFONT_EXTENSIONS.test(request.url.toString())) {
        response.header("cache-control", "private, no-cache, no-store, must-revalidate, max-age=0");
        response.header("pragma", "no-cache");
        response.header("expires", "0");
      } else {
        response.header("cache-control", "public, max-age=604800, immutable");
      }
      response.header(
        "Content-Security-Policy",
        "default-src * data:; script-src * data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval'; script-src-elem * data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval'; script-src-attr * data: 'unsafe-inline' 'unsafe-hashes' 'unsafe-eval'; style-src * data: 'unsafe-inline' 'unsafe-hashes'; style-src-elem * data: 'unsafe-inline' 'unsafe-hashes'; style-src-attr * data: 'unsafe-inline' 'unsafe-hashes'; img-src * data:; connect-src * data:"
      );
    }

    return h.continue;
  });

  server.ext("onRequest", (request: HapiRequest, h: HapiResponseToolkit) => {
    const { pathname } = getRequestInfo(request);
    request.app.location = pathname;
    return h.continue;
  });

  // -------------------------------
  // Cookies
  // -------------------------------
  server.state("cookies_policy", { encoding: "base64json" });

  // -------------------------------
  // Debug registered caches
  // -------------------------------
  console.log("✅ Registered cache providers:", server.cache.provision);

  return server;
}

export default createServer;
