const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.bankofcanada.ca',
    setupNodeEvents(on, config) {
      // implement node event listeners if needed
     // Add the cypress-mochawesome-reporter plugin
     require('cypress-mochawesome-reporter/plugin')(on);
     return config;
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    charts: true,
    reportPageTitle: 'Cypress Test Report',
    embeddedScreenshots: true,
    inlineAssets: true
  }
});
