const { createDefaultPreset, pathsToModuleNameMapper } = require("ts-jest");
const tsConfig = require("./tsconfig.json");
const { compilerOptions } = tsConfig;

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>",
  })
};