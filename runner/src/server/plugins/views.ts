import path from "path";
import resolve from "resolve";
import nunjucks from "nunjucks";
import vision from "vision";
import { capitalize } from "lodash";

import pkg from "../../../package.json";
import config from "../config";
import { HapiRequest } from "../types";

// Try a set of likely basedirs to make module resolution robust inside containers
const basedirCandidates = [
    path.join(process.cwd(), ".."),
    process.cwd(),
    path.join(process.cwd(), "app"),
    path.join(__dirname, "../../.."),
];

function resolveFrom(pkgName: string) {
    // Try each candidate silently, fall back to normal resolve which will throw if not found
    for (const b of basedirCandidates) {
        try {
            return resolve.sync(pkgName, { basedir: b });
        } catch (err) {
            // ignore and try next
        }
    }
    return resolve.sync(pkgName);
}

/**
 * Pages the system sends the browser to (not the user typing a URL). The
 * client-side URL guard in layout.html must not bounce these back to the last
 * form page.
 *  - terminal: the session has ended, so the last form page is dead.
 *  - info: stateless/error pages; the last form page is still valid to return to.
 */
const SYSTEM_PAGE_KINDS: Record<string, "terminal" | "info"> = {
    "/clear-session": "terminal",
    "/timeout": "terminal",
    "/service-unavailable": "info",
    "/cookies": "info",
    "/help/cookies": "info",
    "/accessibility-statement": "info",
};

function getSystemPageKind(request: HapiRequest): string {
    // Error views (404/403/500) render at whatever URL failed, so
    // errorPages.ts flags them on request.app instead of by path.
    return (
        (request?.app as any)?.systemPage ??
        SYSTEM_PAGE_KINDS[request?.path?.replace(/\/$/, "") ?? ""] ??
        ""
    );
}

export default {
    plugin: vision,
    options: {
        engines: {
            html: {
                compile: (src, options) => {
                    const template = nunjucks.compile(src, options.environment);

                    return (context) => {
                        if (context.nonce) {
                            delete Object.assign(context, {
                                script_nonce: context["script-nonce"],
                            })["script-nonce"];
                            delete Object.assign(context, {
                                style_nonce: context.style_nonce,
                            }).style_nonce;
                        }

                        const html = template.render(
                            context /* , function (err, value) {
              console.error(err)
            } */
                        );
                        return html;
                    };
                },
                prepare: (options, next) => {
                    const environment = nunjucks.configure(options.path, {
                        autoescape: true,
                        watch: false,
                    });
                    environment.addFilter("isArray", (x) => Array.isArray(x));
                    options.compileOptions.environment = environment;

                    return next();
                },
            },
        },
        path: [
            /**
             * Array of directories to check for nunjucks templates.
             */
            `${path.join(__dirname, "..", "views")}`,
            `${path.join(__dirname, "engine", "views")}`,
            `${path.dirname(resolveFrom("govuk-frontend"))}`,
            `${path.dirname(resolveFrom("govuk-frontend"))}/components`,
            `${path.dirname(resolveFrom("govuk-frontend"))}/govuk`,
            `${path.dirname(resolveFrom("govuk-frontend"))}/govuk/components`,
            `${path.dirname(resolveFrom("hmpo-components"))}/components`,
        ],
        isCached: !config.isDev,
        context: (request: HapiRequest) => ({
            appVersion: pkg.version,
            assetPath: "/assets",
            cookiesPolicy: request?.state?.cookies_policy,
            serviceName: capitalize(config.serviceName),
            feedbackLink: config.feedbackLink,
            pageTitle: config.serviceName
                ? config.serviceName + " - GOV.UK"
                : "GOV.UK Site - Digital Form Builder",
            analyticsAccount: config.analyticsAccount,
            gtmId1: config.gtmId1,
            gtmId2: config.gtmId2,
            location: request?.app.location,
            matomoId: config.matomoId,
            matomoUrl: config.matomoUrl,
            BROWSER_REFRESH_URL: config.browserRefreshUrl,
            runnerTimeoutSeconds: config.runnerTimeoutSeconds,
            sessionTimeout: config.sessionTimeout,
            skipTimeoutWarning: false,
            serviceStartPage: config.serviceStartPage || "#",
            privacyPolicyUrl: config.privacyPolicyUrl || "#",
            phaseTag: config.phaseTag,
            isAuthenticated: request?.auth.isAuthenticated,
            systemPage: getSystemPageKind(request),
            loadTesting: config.loadTesting || false,
            navigation: request?.auth.isAuthenticated
                ? [{ text: "Sign out", href: "/logout" }]
                : null,
        }),
    },
};
