import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { RedisService } from "../../../../../../src/server/services";
import config from "../../../../../../src/server/config";
import * as formService from "../../../../../../src/server/plugins/engine/services/formService";
import { FormDefinition } from "@xgovformbuilder/model";
import { FormSubmissionState } from "../../../../../../src/server/plugins/engine/types";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, describe, it } = lab;

const mockFormDefinition: FormDefinition = {
    id: "test-form",
    key: "test-key",
    displayName: "Test Form",
    lastModified: new Date().toISOString(),
    lastDownloaded: new Date().toISOString(),
    pages: [],
    conditions: [],
    lists: [],
    sections: [],
    startPage: "start",
    confirmationMsg: "",
    fees: [],
    calculations: [],
};

describe("Form Service - Static Imports", () => {
    afterEach(() => {
        sinon.restore();
        const formServicePath = require.resolve(
            "../../../../../../src/server/plugins/engine/services/formService"
        );
        delete require.cache[formServicePath];
    });

    describe("getFormById", () => {
        it("fetches form from DB when Redis is disabled", async () => {
            sinon.stub(config, "fetchFromRedis").value(false);
            sinon.stub(global, "fetch").resolves({
                ok: true,
                json: () => Promise.resolve(mockFormDefinition),
            });

            const result = await formService.getFormById("test-form");

            expect(result).to.equal(mockFormDefinition);
        });

        it("caches form in Redis when not found", async () => {
            sinon.stub(config, "fetchFromRedis").value(true);
            sinon.stub(RedisService, "getCache").resolves(null);
            const setCacheStub = sinon
                .stub(RedisService, "setCache")
                .resolves();
            sinon.stub(global, "fetch").resolves({
                ok: true,
                json: () => Promise.resolve(mockFormDefinition),
            });

            const result = await formService.getFormById("test-form");

            expect(result).to.equal(mockFormDefinition);
        });
    });

    describe("getAllForms", () => {
        it("returns all forms successfully", async () => {
            const mockForms: FormDefinition[] = [
                { ...mockFormDefinition, id: "form1" },
                { ...mockFormDefinition, id: "form2" },
            ];
            sinon.stub(global, "fetch").resolves({
                json: () => Promise.resolve(mockForms),
            });

            const result = await formService.getAllForms();

            expect(result).to.equal(mockForms);
        });

        it("returns empty array on error", async () => {
            sinon.stub(global, "fetch").rejects(new Error("Network error"));

            const result = await formService.getAllForms();

            expect(result).to.be.an.array();
            expect(result).to.be.empty();
        });
    });

    describe("createDocument", () => {
        it("creates document successfully", async () => {
            sinon.stub(global, "fetch").resolves({
                json: () => Promise.resolve(true),
            });

            const result = await formService.createDocument(
                "test-id",
                mockFormDefinition,
                false
            );

            expect(result).to.be.true();
        });

        it("handles creation failure", async () => {
            sinon.stub(global, "fetch").resolves({
                json: () =>
                    Promise.resolve({ status: 400, message: "Bad Request" }),
            });

            const result = await formService.createDocument(
                "test-id",
                mockFormDefinition,
                false
            );

            expect(result).to.be.false();
        });
    });

    describe("CheckProvidersMappingById", () => {
        it("checks provider mapping successfully", async () => {
            sinon.stub(global, "fetch").resolves({
                json: () => Promise.resolve(true),
            });

            const result = await formService.CheckProvidersMappingById(
                "test-id",
                12345
            );

            expect(result).to.be.true();
        });

        it("handles mapping check failure", async () => {
            sinon.stub(global, "fetch").rejects(new Error("Network error"));

            const result = await formService.CheckProvidersMappingById(
                "test-id"
            );

            expect(result).to.be.false();
        });
    });

    describe("SQL Cache Operations", () => {
        it("gets SQL cache by ID successfully", async () => {
            sinon.stub(global, "fetch").resolves({
                json: () => Promise.resolve(mockFormDefinition),
            });

            const result = await formService.getSqlCacheById("test-id");

            expect(result).to.equal(mockFormDefinition);
        });

        it("sets SQL cache by ID successfully", async () => {
            const mockState: FormSubmissionState = {
                progress: [],
                result: {},
                dataImportStatus: { status: "NOT_STARTED" },
            };
            sinon.stub(global, "fetch").resolves({
                json: () => Promise.resolve({ success: true }),
            });

            const result = await formService.setSqlCacheById(
                "test-id",
                mockState
            );

            expect(result).to.equal({ success: true });
        });
    });
});
