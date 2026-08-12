/* eslint-disable prettier/prettier */
import * as appInsights from "applicationinsights";
import { Logger } from "@hmcts/nodejs-logging";
import config from "../config";

const logger = Logger.getLogger("customEventTracker");
const { isDebugging } = config;

export function trackEvent(
    eventName: any,
    trackingProperties: {},
    mustLog?: boolean
) {
    try {
        if (appInsights.defaultClient) {
            if (isDebugging || !!mustLog) {
                appInsights.defaultClient.trackEvent({
                    name: eventName,
                    properties: trackingProperties,
                });
            }
        }
    } catch (err: any) {
        logger.error(err.stack);
    }
}
export function trackTrace(
    message: any,
    trackingProperties: {},
    mustLog?: boolean
) {
    try {
        if (appInsights.defaultClient && isDebugging) {
            if (isDebugging || !!mustLog) {
                appInsights.defaultClient.trackTrace({
                    message: message,
                    severity: appInsights.Contracts.SeverityLevel.Information,
                    properties: trackingProperties,
                });
            }
        }
    } catch (err: any) {
        logger.error(err.stack);
    }
}

export function trackException(exception: Error) {
    try {
        if (appInsights.defaultClient) {
            appInsights.defaultClient.trackException({
                exception: exception,
                severity: appInsights.Contracts.SeverityLevel.Error,
            });
        }
    } catch (err: any) {
        logger.error(err.stack);
    }
}
