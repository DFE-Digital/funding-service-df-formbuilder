/* eslint-disable prettier/prettier */
import * as config from "config";
import * as appInsights from "applicationinsights";
import * as telemetryProcessors from "./telemetryProcessors";
import { Logger } from "@hmcts/nodejs-logging";
import conf from "./../config";

const logger = Logger.getLogger("customEventTracker");

export class AppInsights {
    private connectionString: string;
    private client: appInsights.TelemetryClient;

    constructor(
        connectionString?: string,
        client?: appInsights.TelemetryClient
    ) {
        if (conf !== undefined) {
            this.connectionString = conf.connectionString;
            this.client = client || appInsights.defaultClient;
        }
    }

    enable() {
        if (conf !== undefined) {
            this.setup();
            this.prepareClientContext(conf && conf.authClientId);
            this.prepareTelemetryProcessors();
            this.start();
        }
    }

    setup(): typeof appInsights.Configuration {
        this.connectionString = conf.connectionString;
        return appInsights
            .setup(this.connectionString)
            .setDistributedTracingMode(
                appInsights.DistributedTracingModes.AI_AND_W3C
            )
            .setSendLiveMetrics(true)
            .setAutoCollectConsole(true, true)
            .setAutoDependencyCorrelation(true)
            .setAutoCollectRequests(true)
            .setAutoCollectPerformance(true, true)
            .setAutoCollectExceptions(true)
            .setAutoCollectDependencies(true)
            .setUseDiskRetryCaching(true)
            .setSendLiveMetrics(false);
    }

    getClient() {
        if (!this.client) {
            this.client = appInsights.defaultClient;
        }
        return this.client;
    }

    prepareClientContext(cloudRole: string) {
        this.getClient().context.tags[
            this.client.context.keys.cloudRole
        ] = cloudRole;
    }

    prepareTelemetryProcessors() {
        this.getClient().addTelemetryProcessor(
            telemetryProcessors.operationNameUUIDHider()
        );
        if (this.connectionString === "STDOUT") {
            this.client.addTelemetryProcessor(
                telemetryProcessors.errorLogger(logger)
            );
        }
    }

    start() {
        appInsights.start();
    }
    flush() {
        this.client.flush();
    }
}
