module.exports = {
  testEnvironment: 'node',
  moduleNameMapping: {
    '^../../../db$': '<rootDir>/../db.js'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
};

// module.exports = {
//   testEnvironment: 'node',
//   collectCoverage: true,
//   coverageDirectory: 'coverage',
//   coverageReporters: ['text', 'lcov', 'html'],
//   testMatch: ['**/tests/**/*.test.js'],
//   collectCoverageFrom: [
//     'src/**/*.js',
//     '!src/server.js',
//     '!src/**/*.test.js'
//   ]
// };