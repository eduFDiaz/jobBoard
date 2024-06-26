import { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  automock: true,
//   collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!**/node_modules/**",
  ],
  coverageProvider: "babel",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  maxConcurrency: 4,
  verbose: true,
  modulePaths: [compilerOptions.baseUrl, compilerOptions.outDir],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
};

export default config;
