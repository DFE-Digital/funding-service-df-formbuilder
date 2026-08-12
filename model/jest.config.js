module.exports = {
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["<rootDir>/**/__tests__/*.(j|t)est.(ts|ts)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coverageDirectory: "test-coverage",
  testPathIgnorePatterns: ["__tests__/helpers"],
  coverageThreshold: {
    global: {
      branches: 79,
      functions: 74,
      lines: 88,
      statements: 88,
    },
  },
};
