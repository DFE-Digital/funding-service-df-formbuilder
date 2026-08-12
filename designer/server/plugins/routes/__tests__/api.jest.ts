import { createServer } from "../../../createServer";

jest.mock("@hapi/wreck", () => ({
  get: async () => ({
    payload: {
      toString: () => "{}",
    },
  }),
}));

jest.mock("../../../config", () => ({
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  previewUrl: process.env.PREVIEW_URL || "http://localhost:3009",
  publishUrl: process.env.PUBLISH_URL || "http://localhost:3009",
  persistentBackend: "preview",
  s3Bucket: process.env.S3_BUCKET,
  logLevel: process.env.LOG_LEVEL || "error",
  phase: process.env.PHASE || "alpha",
  footerText: process.env.FOOTER_TEXT,
  lastCommit: process.env.LAST_COMMIT || process.env.LAST_COMMIT_GH,
  lastTag: process.env.LAST_TAG || process.env.LAST_TAG_GH,
  sessionTimeout: process.env.SESSION_TIMEOUT,
  sessionCookiePassword: process.env.SESSION_COOKIE_PASSWORD,
  //endpoint: process.env.ENDPOINT,
  //key: process.env.KEY,
  blobServiceConnectionString:
    process.env.AZURE_STORAGE_CONNECTION_STRING || "sample",
  blobStorageContainer:
    process.env.BLOB_STORAGE_CONTAINER_NAME || "df-datasets",
}));

describe("Server API", () => {
  const startServer = async (): Promise<hapi.Server> => {
    const server = await createServer();
    await server.start();
    return server;
  };

  let server;

  beforeAll(async () => {
    server = await startServer();
    const { persistenceService } = server.services();
    persistenceService.listAllConfigurations = () => {
      return Promise.resolve([]);
    };
    persistenceService.copyConfiguration = () => {
      return Promise.resolve([]);
    };
    persistenceService.uploadConfiguration = () => {
      return Promise.resolve([]);
    };
  });

  afterAll(async () => {
    await server.stop();
  });

  test("Failure to communicate with Runner should place error on session", async () => {
    const options = {
      method: "put",
      url: "/api/test-form-id/data",
      payload: {
        metadata: {},
        startPage: "/first-page",
        pages: [
          {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
              {
                path: "/summary",
              },
            ],
          },
          {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
          },
        ],
        lists: [],
        sections: [],
        conditions: [],
        fees: [],
        outputs: [],
        version: 2,
      },
    };

    const result = await server.inject(options);
    expect(result.statusCode).toEqual(401);

    const optionsCrash = {
      method: "get",
      url: "/error/crashreport/test-form-id",
    };
    const resultCrash = await server.inject(optionsCrash);
    expect(resultCrash.headers["content-disposition"]).toContain(
      "attachment; filename=test-form-id-crash-report"
    );
  });

  test("Schema validation failures should return 401", async () => {
    const options = {
      method: "put",
      url: "/api/test-form-id/data",
      payload: {
        metadata: {},
        startPage: "/first-page",
        pages: [
          {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
              {
                path: "/summary",
              },
            ],
          },
          {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
          },
        ],
        lists: [],
        conditions: [],
        fees: [],
        outputs: [],
        version: 2,
      },
    };

    const result = await server.inject(options);
    expect(result.statusCode).toEqual(401);
    expect(result.result.err.message).toMatch("Schema validation failed");
  });

  test("persistence service errors should return 401", async () => {
    //Given
    const { persistenceService } = server.services();
    persistenceService.uploadConfiguration = () => {
      return Promise.reject(new Error("Error in persistence service"));
    };

    const options = {
      method: "put",
      url: "/api/test-form-id/data",
      payload: {
        metadata: {},
        startPage: "/first-page",
        pages: [
          {
            title: "First page",
            path: "/first-page",
            components: [],
            next: [
              {
                path: "/summary",
              },
            ],
          },
          {
            title: "Summary",
            path: "/summary",
            controller: "./pages/summary.js",
            components: [],
          },
        ],
        lists: [],
        sections: [],
        conditions: [],
        fees: [],
        outputs: [],
        version: 2,
      },
    };

    //When
    const result = await server.inject(options);

    //Then
    expect(result.statusCode).toEqual(401);
    expect(result.result.err.message).toEqual("Error in persistence service");
  });
});
