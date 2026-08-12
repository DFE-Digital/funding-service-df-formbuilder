module.exports = {
  roots: ["<rootDir>/server"],
  displayName: "server",
  setupFilesAfterEnv: ["<rootDir>/jest-server-setup.js"],
  testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: [
    "<rootDir>/test/"
  ],
  coverageDirectory: "test-coverage/server/jest",
  globals: {
    fetch: global.fetch,
  },
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 48,
      lines: 51,
      statements: 50,
    },
  },
};
