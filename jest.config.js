module.exports = require('@darkobits/ts').jest({
  coveragePathIgnorePatterns: [
    'src/bin',
    'src/etc'
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 30,
      functions: 40,
      lines: 35
    }
  }
});
