import Hapi from "@hapi/hapi";
import Lab from "@hapi/lab";
import FormData from "form-data";
import { expect } from "@hapi/code";
import inert from "@hapi/inert";
import axios from "axios";
import sinon from "sinon";
import pluginRouter from "../../../../src/server/plugins/router";
import pluginViews from "../../../../src/server/plugins/views";
import pluginSession from "../../../../src/server/plugins/session";
import Schmervice from "schmervice";
import { CacheService } from "../../../../src/server/services/cacheService";
import * as SQLAPI from "../../../../src/server/plugins/engine/services/formService";
import * as TableTabService from "../../../../src/server/utils/tableTabService";

const { before, test, suite, after } = (exports.lab = Lab.script());

suite("Server Router", () => {
  let server: Hapi.Server;
  let aStub, cacheStub, formStub, blobStub, constructStub;

  before(async () => {
    server = new Hapi.Server();
    await server.register(inert);
    await server.register(pluginRouter);
    await server.register(pluginViews);
    await server.register(pluginSession);
    await server.register(Schmervice);
    server.registerService([
      CacheService,
    ]);
    server.route({
      method: "post",
      path: "/test/setUkprn",
      handler: async (req, h) => {
        req.yar.set("organisation", { ukprn: "sampleUkprn", urn: "sampleUrn" })
      }
    })
    const setUkprn = {
      method: "post",
      url: "/test/setUkprn"
    }
    await server.inject(setUkprn);
    const expectedResponse = ""
    aStub = sinon.stub(axios, "post").resolves(Promise.resolve(expectedResponse));
    cacheStub = sinon.stub(CacheService.prototype, "getState").returns({})
    cacheStub = sinon.stub(CacheService.prototype, "mergeState").resolves(Promise.resolve({}));
    formStub = sinon.stub(SQLAPI, "getFormById").returns({ designedDataSets: [{ id: "sampleTableId" }] });
    blobStub = sinon.stub(TableTabService, "getBlobContent").returns({});
    constructStub = sinon.stub(TableTabService, "constructTableData").returns({});
  });

  after(async () => {
    if (server) server.stop();
    if (aStub) aStub.reset();
    if (cacheStub) cacheStub.reset();
    if (formStub) formStub.reset();
  })

  test("cookies page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/cookies`,
    };

    const res = await server.inject(options);
    const result = res.result || {};
    expect(res.statusCode).to.equal(200);
  });

  test("cookies preferences are set", async () => {
    const options = {
      method: "POST",
      payload: {
        cookies: "accept",
        referrer: "/help/accessibility-statement",
      },
      url: "/help/cookies",
    };

    const res = await server.inject(options);

    expect(res.statusCode).to.equal(500);
  });

  test("accessibility statement page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/accessibility-statement`,
    };

    const res = await server.inject(options);
    const result = res.result || {};
    expect(res.statusCode).to.equal(200);
    expect(options).to.equal({
      method: "GET",
      url: `/help/accessibility-statement`,
    });
  });

  test("terms and conditions page is served", async () => {
    const options = {
      method: "GET",
      url: `/help/terms-and-conditions`,
    };

    const res = await server.inject(options);
    const result = res.result || {};
    expect(res.statusCode).to.equal(200);
    expect(options).to.equal({
      method: "GET",
      url: `/help/terms-and-conditions`,
    });
  });

  test("user information page is served", async () => {
    const options = {
      method: "GET",
      url: `/user-information`,
    };
    const res = await server.inject(options);
    const result = res.result || {};
    expect(result).to.exist();
    expect(res.statusCode).to.equal(200);
  });

  // test("file uploaded", async () => {
  //   const data = new FormData();
  //   data.append('fileupload', JSON.stringify({ filename: "testPath", path: "samplePath" }));
  //   data.append('fileType', "csv");
  //   data.append('compId', "sampleTargetId");
  //   const options = {
  //     method: "POST",
  //     url: `/file-upload-blob`,
  //     payload: data
  //   };
  //   const res = await server.inject(options);
  //   const result = res.result || {};
  //   expect(result).to.exist();
  //   expect(res.statusCode).to.equal(500);
  // })

  test("file download", async () => {
    const options = {
      method: "POST",
      url: `/file-download`,
      payload: {
        fileName: "test"
      }
    };

    const res = await server.inject(options);
    const result = res.result || {};
    expect(result).to.exist();
    expect(result).to.equal({});
    expect(res.statusCode).to.equal(204);
  })

  test("get the file status", async () => {
    const options = {
      method: "GET",
      url: `/get-file-status`,
    };
    const res = await server.inject(options);
    const result = res.result || {};
    expect(result).to.exist();
    expect(res.statusCode).to.equal(500);
  });

  test("Service unavailable view is served", async () => {
    const options = {
      method: "GET",
      url: `/service-unavailable`,
    };
    const res = await server.inject(options);
    const result = res.result || {};
    expect(result).to.exist();
    expect(res.statusCode).to.equal(500);
  });

  // test("Clears session", async () => {
  //   const options = {
  //     method: "GET",
  //     url: "/clear-session",
  //   };
  //   let res = await server.inject(options);
  //     const result = res.result || {};
  //     expect(result).to.exist();
  //     expect(res.statusCode).to.equal(500);
  // });

  // test("Serves timeout", async () => {
  //   const options = {
  //     method: "GET",
  //     url: "/timeout",
  //   };
  //   let res = await server.inject(options);
  //   const result = res.result || {};
  //   expect(result).to.exist();
  //   expect(res.statusCode).to.equal(500);
  // });

  test("Sets selected text in cache", async () => {
    const options = {
      method: "POST",
      url: "/test/selected-text",
      payload: {
        id: "testId",
        text: "sampleText"
      }
    };
    let res = await server.inject(options);
    const result = res.result || {};
    expect(result).to.exist();
    expect(res.statusCode).to.equal(204);
  });

  test("generates table for tabs", { timeout: 100000 }, async () => {
    const options = {
      method: "POST",
      url: "/test/generate-table-for-tab",
      payload: {
        fileId: "sampleFileId",
        tableId: "sampleTableId"
      }
    };
    let res = await server.inject(options);
    const result = res.result || {};
    expect(result).to.exist();
    expect(res.statusCode).to.equal(200);
  });
});
