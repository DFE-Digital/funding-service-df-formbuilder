import { BlobPersistenceService } from "../blobPersistenceService";

describe("BlobPersistenceService tests", () => {
  let service: BlobPersistenceService;
  beforeEach(() => {
    service = new BlobPersistenceService();
  });
  test("listAllConfigurations should return undefined", async () => {
    expect(await service.listAllConfigurations()).toEqual([]);
  });
  test("uploadConfiguration should return undefined", async () => {
    expect(await service.uploadConfiguration("", "")).toBeUndefined();
  });
  test("addConfiguration should return undefined", async () => {
    expect(await service.addConfiguration("", "")).toBeUndefined();
  });
  test("getConfiguration should return undefined", async () => {
    expect(await service.getConfiguration("")).toEqual("");
  });
  test("copyConfigurations should return undefined", async () => {
    expect(await service.copyConfiguration("", "")).toEqual("");
  });
  test("deleteConfigurations should return undefined", async () => {
    expect(await service.deleteConfiguration("")).toEqual("");
  });
});
