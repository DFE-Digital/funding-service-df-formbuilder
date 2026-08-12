module.exports = {
  roots: ["<rootDir>/client"],
  displayName: "client",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/", "<rootDir>/client/api/", "<rootDir>/client/pages/Playground"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
  },
  testEnvironment: "jest-environment-jsdom",
  coverageDirectory: "test-coverage/client/jest",
  coveragePathIgnorePatterns: [
    "<rootDir>/test/",
    "<rootDir>/client/api/",
    "<rootDir>/client/components/CustomValidationMessage",
    "<rootDir>/client/components/Dashboard",
    "<rootDir>/client/pages/dashboard/utils",
    "<rootDir>/client/components/Icons",
    // "<rootDir>/client/conditions",
    "<rootDir>/client/reducers",
  ],
  coverageThreshold: {
    global: {
      branches: 33,
      functions: 35,
      lines: 40,
      statements: 40,
    },
  },
};
