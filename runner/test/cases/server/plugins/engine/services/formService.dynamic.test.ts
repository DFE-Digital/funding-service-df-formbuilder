import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FormDefinition } from "@xgovformbuilder/model";
import { RedisService } from "../../../../../../src/server/services";
import config from "../../../../../../src/server/config";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, afterEach, describe, it } = lab;

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

describe("Form Service - Dynamic Imports", () => {
    let getCacheStub: any;
    let formService: any;

    beforeEach(async () => {
        getCacheStub = sinon.stub(RedisService, "getCache");

        sinon.stub(config, "fetchFromRedis").value(true);

        formService = await import(
            "../../../../../../src/server/plugins/engine/services/formService"
        );
    });

    afterEach(() => {
        sinon.restore();
        const formServicePath = require.resolve(
            "../../../../../../src/server/plugins/engine/services/formService"
        );

        delete require.cache[formServicePath];
    });

    describe("Repeatable Sections", () => {
        it("creates repeatable sections data successfully", async () => {
            sinon.stub(global, "fetch").resolves({
                json: () => Promise.resolve(true),
            });

            const result = await formService.createRepeatableSectionsData(
                mockFormDefinition
            );

            expect(result).to.be.true();
        });

        it("gets repeatable sections data successfully", async () => {
            sinon.stub(global, "fetch").resolves({
                ok: true,
                json: () => Promise.resolve(mockFormDefinition),
            });

            const result = await formService.getRepeatableSectionsData(
                "test-id"
            );

            expect(result).to.equal(mockFormDefinition);
        });

        it("gets repeatable sections data from Redis successfully", async () => {
            getCacheStub.resolves(JSON.stringify(mockFormDefinition));

            const request = {
                yar: {
                    get: sinon
                        .stub()
                        .withArgs("redisID")
                        .returns("test-form-abc-1"),
                },
            };

            const result = await formService.getRepeatableSectionsData(
                "test-form",
                request as any,
                { abc: 3 },
                mockFormDefinition,
                "test-form"
            );

            expect(result).to.equal(mockFormDefinition);
        });
    });

    describe("verifyInRedis", () => {
        it("should return parsed form definition from Redis if found", async () => {
            getCacheStub.resolves(JSON.stringify(mockFormDefinition));

            const request = {
                yar: {
                    get: sinon
                        .stub()
                        .withArgs("redisID")
                        .returns("test-form-abc-1"),
                },
            };

            const result = await formService.verifyInRedis(
                { abc: 3 },
                request as any,
                "test-form"
            );

            expect(result).to.equal(mockFormDefinition);
            expect(getCacheStub.calledWith("test-form-abc-3")).to.be.true();
        });

        it("should return parsed form definition from Redis if found with multiple key value pairs", async () => {
            getCacheStub.resolves(JSON.stringify(mockFormDefinition));

            const request = {
                yar: {
                    get: sinon
                        .stub()
                        .withArgs("redisID")
                        .returns("test-form-abc-1-def-2"),
                },
            };

            const result = await formService.verifyInRedis(
                { abc: 3, def: 5 },
                request as any,
                "test-form"
            );

            expect(result).to.equal(mockFormDefinition);
            expect(
                getCacheStub.calledWith("test-form-abc-1-def-5")
            ).to.be.true();
        });

        it("should return null if Redis cache is empty", async () => {
            getCacheStub.resolves(null);

            const request = {
                yar: {
                    get: sinon
                        .stub()
                        .withArgs("redisID")
                        .returns("test-form-abc-1"),
                },
            };

            const result = await formService.verifyInRedis(
                { abc: 3 },
                request as any,
                "form"
            );

            expect(result).to.be.null();
        });

        it("should return null if sectionTriggers is undefined", async () => {
            const result = await formService.verifyInRedis(
                {},
                {} as any,
                "form"
            );
            expect(result).to.be.null();
        });

        it("should return null and not throw on error", async () => {
            getCacheStub.rejects(new Error("Redis error"));

            const request = {
                yar: {
                    get: sinon
                        .stub()
                        .withArgs("redisID")
                        .returns("test-form-abc-1"),
                },
            };

            const result = await formService.verifyInRedis(
                { abc: 3 },
                request as any,
                "form"
            );
            expect(result).to.be.null();
        });
    });
});
