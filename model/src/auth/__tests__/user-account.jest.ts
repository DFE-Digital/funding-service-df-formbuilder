import { UserAccount } from "../user-account";

describe("UserAccount", () => {
  //This is mainly for coverage
  test("Initialise object", () => {
    const classUnderTest = new UserAccount("UserName", "Id", "HomeAccountId");

    expect(classUnderTest.UserName).toEqual("UserName");
    expect(classUnderTest.UserId).toEqual("Id");
    expect(classUnderTest.HomeAccountId).toEqual("HomeAccountId");
  });
});
