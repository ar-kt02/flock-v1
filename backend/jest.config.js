/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
   preset: "ts-jest",
   testEnvironment: "node",
   testPathIgnorePatterns: ["<rootDir>/src/config"],
   setupFilesAfterEnv: ["<rootDir>/src/config/test.ts"],
   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
   transform: {
      "^.+\\.(ts|tsx)?$": "ts-jest",
   },
};
