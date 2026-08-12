import config from "../config";
import pino from "hapi-pino";

export default {
    plugin: pino,
    options: {
        prettyPrint: config.serviceUrl.includes("localhost"),
        level: config.logLevel,
        formatters: {
            level: (label) => {
                return { level: label };
            },
        },
        logRequestComplete: config.isDev,
        ignorePaths: [
            "/assets/images/favicon.ico",
            "/assets/images/govuk-apple-touch-icon-180x180.png",
            "/assets/upload-dialog.js",
            "/assets/dialog-polyfill.0.4.3.js",
            "/assets/modal-dialog.js",
            "/assets/govuk-template.js",
            "/assets/jquery-3.7.1.min.js",
            "/assets/stylesheets/application.css",
            "/assets/stylesheets/accessibility.css",
            "/assets/accessible-autocomplete.min.js",
            
        ],
    },
};
