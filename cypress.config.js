const { defineConfig } = require('cypress');
const ExcelJS = require('exceljs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.bankofcanada.ca',
    env: {
      // Absolute path to the Excel file in the fixtures folder
      excelFilePath: path.join(__dirname, 'cypress', 'fixtures', 'seriesData.xlsx'),
      excelSheetName: 'Sheet1'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners if needed
     // Add the cypress-mochawesome-reporter plugin
     require('cypress-mochawesome-reporter/plugin')(on);

      // Define a task to read Excel file using ExcelJS
      on('task', {
        readExcel() {
          return new Promise((resolve, reject) => {
            const filePath = config.env.excelFilePath;
            const sheetName = config.env.excelSheetName;
            const workbook = new ExcelJS.Workbook();
            workbook.xlsx.readFile(filePath)
              .then(() => {
                const worksheet = workbook.getWorksheet(sheetName);
                if (!worksheet) {
                  return reject(`Worksheet "${sheetName}" not found`);
                }
                const data = [];
                // Assume the first row is the header row
                const headerRow = worksheet.getRow(1);
                const headers = headerRow.values; // Note: this is a 1-indexed array
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                  if (rowNumber === 1) return; // Skip header row
                  const rowData = {};
                  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    const header = headers[colNumber];
                    if (header) {
                      rowData[header] = cell.value;
                    }
                  });
                  data.push(rowData);
                });
                resolve(data);
              })
              .catch((error) => {
                reject(error);
              });
          });
        }
      });
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
