import { UserAccountHelper } from "../userAccount.helper";

describe("UserAccount Helper tests", () => {
  beforeEach(() => {});
  describe("parseName", () => {
    const nameTestCases = [
      { input: "SingleName1,", output: "Singlename" },
      { input: "LastName1, FirstName24", output: "FirstName Lastname" },
      {
        input: "LastName1, FirstName24-SecondName134",
        output: "FirstName-SecondName Lastname",
      },
      {
        input: "SECONDNAME134-LastName1, FirstName24",
        output: "FirstName Secondname-lastname",
      },
    ];
    test("Undefined input should return undefined", () => {
      expect(UserAccountHelper.parseName(undefined)).toBeUndefined();
    });
    test("Empty string input should return empty string", () => {
      expect(UserAccountHelper.parseName("")).toEqual("");
    });
    test.each(nameTestCases)(
      "Variety of names should be formatted correctly",
      ({ input, output }) => {
        expect(UserAccountHelper.parseName(input)).toEqual(output);
      }
    );
  });
});
