import { StubPersistenceService } from "../persistenceService";

describe("StubPersistenceService tests", () => {
  let service: StubPersistenceService;
  beforeEach(() => {
    service = new StubPersistenceService();
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
  test("listAllConfigurations should return undefined", async () => {
    expect(await service.copyConfiguration("", "")).toEqual("");
  });
  test("deleteConfigurations should return undefined", async () => {
    expect(await service.deleteConfiguration("")).toEqual("");
  });
});
