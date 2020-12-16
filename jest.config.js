module.exports = require('@darkobits/ts').jest({
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 30,
      functions: 40,
      lines: 35
    }
  }
});
