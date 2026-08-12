import {
  generateAuthToken,
  generateFormattedDate,
  HttpVerbs,
  parseHostName,
} from "../cosmosRequestHelper";
const mockToken =
  "sdgrdh$7sH$a4a5m8QXbAbzyC4PtDBhZZ7xsdfgdsfGDfgfg$h82ZCpxQw7nFdsdfdsfgdsfgfgd£ds==";
describe("CosmosRequestHelper tests", () => {
  describe("generateAuthToken", () => {
    test("If one or more params are empty, throw error", () => {
      expect(() => generateAuthToken("", "", HttpVerbs.GET, "")).toThrow(Error);
    });
    test("Expect generateAuthToken to generate toekn", () => {
      expect(
        generateAuthToken(
          mockToken,
          generateFormattedDate(),
          HttpVerbs.GET,
          "https://thisIsAUrl.com/1/2/3"
        )
      ).toMatch(/type%3Dmaster%26ver%3D1.0%26sig%/);
    });
  });
  describe("generateFormattedDate", () => {
    test("Expect generateAuthToken to generate token", () => {
      const date = new Date().toUTCString();
      expect(generateFormattedDate()).toEqual(date);
    });
  });
  describe("parseHostName", () => {
    test("Expect hostname to be parsed from url", () => {
      const url =
        "https://b102d01cdb-df-shared.documents.azure.com:443/dbs/df-forms/colls/forms/docs/SCqk8QTNZK";
      expect(parseHostName(url)).toEqual(
        "b102d01cdb-df-shared.documents.azure.com"
      );
    });
  });
});
