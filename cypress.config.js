const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.bankofcanada.ca',
    setupNodeEvents(on, config) {
      // implement node event listeners if needed
    },
  },
});
