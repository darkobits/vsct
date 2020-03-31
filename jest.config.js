module.exports = require('@darkobits/ts-unified/dist/config/jest')({
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 30,
      functions: 40,
      lines: 35
    }
  }
});
