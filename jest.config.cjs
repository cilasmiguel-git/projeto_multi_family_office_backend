// jest.config.cjs
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],

  // Trata .ts como ES Modules
  extensionsToTreatAsEsm: ['.ts'],

  // Transpila .ts com ts-jest usando o tsconfig de testes
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { useESM: true, tsconfig: 'tsconfig.jest.json' }
    ],
  },

  // Mapeia imports com sufixo .js (do seu código ESM) para .ts nos testes
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  clearMocks: true,
  verbose: true
};

