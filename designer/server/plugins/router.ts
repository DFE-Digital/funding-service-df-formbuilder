import { healthCheckRoute } from "./routes";
import config from "../config";

const routes = [
    healthCheckRoute,
    // Explicitly block access to _core endpoint and any internal paths
    {
        method: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        path: "/app/designer/_core/{p*}",
        options: {
            handler: (_request, h) => {
                _request.logger.warn(
                    `Blocked attempt to access restricted path: ${_request.path}`
                );
                return h
                    .view(`help/404`, {
                        phase: config.phase,
                        env: config.deploymentEnvironment,
                        previewUrl: config.previewUrl,
                        preprodPreviewUrl: config.preprodPreviewUrl,
                        footerText: config.footerText,
                        feedbackLink: config.feedbackLink,
                        providerChunkSize: config.providerChunkSize,
                    })
                    .code(404);
            },
            auth: false,
        },
    },
    {
        method: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        path: "/app/designer/{id}/_core/{p*}",
        options: {
            handler: (_request, h) => {
                _request.logger.warn(
                    `Blocked attempt to access restricted path: ${_request.path}`
                );
                return h
                    .view(`help/404`, {
                        phase: config.phase,
                        env: config.deploymentEnvironment,
                        previewUrl: config.previewUrl,
                        preprodPreviewUrl: config.preprodPreviewUrl,
                        footerText: config.footerText,
                        feedbackLink: config.feedbackLink,
                        providerChunkSize: config.providerChunkSize,
                    })
                    .code(404);
            },
            auth: false,
        },
    },
    {
        method: "GET",
        path: "/robots.txt",
        options: {
            handler: {
                file: "server/public/static/robots.txt",
            },
        },
    },
    {
        method: "GET",
        path: "/assets/{path*}",
        options: {
            handler: {
                directory: {
                    path: "./dist/client/assets",
                },
            },
        },
    },
    {
        method: "GET",
        path: "/help/{filename}",
        handler: function (request, h) {
            return h.view(`help/${request.params.filename}`);
        },
    },
];

export default {
    plugin: {
        name: "router",
        register: (server, _options) => {
            server.route(routes);
        },
    },
};
