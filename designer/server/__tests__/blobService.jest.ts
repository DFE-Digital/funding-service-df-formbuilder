describe(`Blob Service`, () => {
  const OLD_ENV = process.env;
  const connectionString = "test-connection-string";
  const blobName = "test-blob-name";

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("Blob Upload", async () => {
    process.env.AZURE_STORAGE_CONNECTION_STRING = connectionString;
    process.env.BLOB_STORAGE_CONTAINER_NAME = blobName;
    jest.mock("@azure/storage-blob", () => {
      return {
        BlobServiceClient: {
          fromConnectionString: (_str) => {
            return {
              listContainers: function* () {
                yield { name: "sample 1" };
                yield { name: "test-blob-name" };
              },
              getContainerClient: () => {
                return {
                  getBlockBlobClient: () => ({
                    upload: () => true,
                  }),
                };
              },
            };
          },
        },
      };
    });
    const { blobUpload } = await import("../lib/blobService");
    const blobUploadResponse = await blobUpload("test", { title: "test" });
    expect(blobUploadResponse).toBeTruthy();
  });

  test("Download Blob To String", async () => {
    process.env.AZURE_STORAGE_CONNECTION_STRING = connectionString;
    process.env.BLOB_STORAGE_CONTAINER_NAME = blobName;
    jest.mock("@azure/storage-blob", () => {
      return {
        BlobServiceClient: {
          fromConnectionString: (_str) => {
            return {
              listContainers: function* () {
                yield { name: "sample 1" };
                yield { name: "test-blob-name" };
              },
              getContainerClient: () => {
                return {
                  getBlobClient: () => ({
                    download: () => {
                      const Readable = require("stream").Readable;
                      var s = new Readable();
                      s.push("test"); // the string you want
                      s.push(null); // indicates end-of-file basically - the end of the stream
                      return {
                        readableStreamBody: s,
                      };
                    },
                  }),
                };
              },
            };
          },
        },
      };
    });
    const { downloadBlobToString } = await import("../lib/blobService");
    const response = await downloadBlobToString("test");
    expect(response).toEqual("test");
  });
});
