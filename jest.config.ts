import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/?(*.)+(test).ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // IMPORTANT:
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};

export default config;