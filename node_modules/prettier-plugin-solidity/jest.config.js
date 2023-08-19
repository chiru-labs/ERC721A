const FULL_TEST = Boolean(process.env.FULL_TEST);
const TEST_STANDALONE = Boolean(process.env.TEST_STANDALONE);

module.exports = {
  collectCoverage: FULL_TEST,
  collectCoverageFrom: [
    'scripts/**/*.js',
    '!scripts/generateIndexes.js',
    'src/**/*.js',
    '!<rootDir>/node_modules/',
    '!src/prettier-comments/**/*.js'
  ],
  coverageDirectory: './coverage/',
  coveragePathIgnorePatterns: ['/node_modules/', '/scripts/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  moduleNameMapper: {
    '^prettier$': TEST_STANDALONE
      ? '<rootDir>/node_modules/prettier/standalone'
      : '<rootDir>/node_modules/prettier'
  },
  setupFiles: ['<rootDir>/tests/config/setup.js'],
  snapshotSerializers: [
    'jest-snapshot-serializer-raw',
    'jest-snapshot-serializer-ansi'
  ],
  testEnvironment: 'node',
  testRegex: 'jsfmt\\.spec\\.js$|tests/unit/.*\\.js$',
  transform: {},
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
