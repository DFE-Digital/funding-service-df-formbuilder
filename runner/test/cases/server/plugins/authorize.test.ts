import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import Hapi from "@hapi/hapi"
import FormAuthorization from "../../../../src/server/plugins/authorize";
import * as SQLAPI from "../../../../src/server/plugins/engine/services/formService";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

suite("Authorize", () => {
    let providerStub;
    before(async () => {
        providerStub = sinon.stub(SQLAPI, "CheckProvidersMappingById").resolves(Promise.resolve(true))
    })
    after(async () => {
        if (providerStub) providerStub.reset()
    })
    test("check if form is authorized", async () => {
        const yar = {
            organisations: {
                ukprn: "sampleUkprn",
                urn: "sampleUrn",
                DistrictAdministrative_code: "sampleDistrictAdministrative_code"
            },
            formId: "sampleId"
        }
        const result = await FormAuthorization({
            yar: {
                get: (str) => yar[str]
            },
            server: {
                logger: { debug: (obj, str) => null }
            }
        })
        expect(result).to.be.undefined();
    });
})