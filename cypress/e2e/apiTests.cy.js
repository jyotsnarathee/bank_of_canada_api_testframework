import { isWithinTenWeeks } from '../support/utils';

describe('Bank of Canada Valet API Tests', () => { 
  //Load the excel data using cy.task
  // Load the schema using cy.fixture in test files and use it with JSON schema validation assertions.
  let forexSchema;
  let seriesData;
  before(() =>  {
    // Chain the tasks so that both operations complete before tests run
    return cy.task('readExcel').then((data) => {
      seriesData = data;
      cy.log('Excel data loaded: ' + JSON.stringify(seriesData));
    }).then(() => {
      return cy.fixture('forexSchema.json').then((schema) => {
        forexSchema = schema;
        cy.log('Loaded schema: ' + JSON.stringify(schema));
      });
    });
  });

  it('Positive: Calculate average for series for the recent 10 weeks', () => {
    
      // Ensure the Excel data has been loaded
      if (!seriesData || !seriesData.length) {
        throw new Error('No data loaded from Excel file');
      }

      // Iterate over each row in the Excel file to run tests
    seriesData.forEach((row) => {
      cy.log(`Testing series: ${row.series}`);

    cy.getObservations(row.series, 10).then((response) => {
      // Validate status and that observations exist
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('observations');
       // Validate the response using the schema loaded from fixtures
       expect(response.body).to.be.jsonSchema(forexSchema);
      
      const observations = response.body.observations;
      expect(observations).to.be.an('array');

      // Use the utility function to check if the date range is within 10 weeks
      const withinTenWeeks = isWithinTenWeeks(observations);
      cy.log(`Date range within 10 weeks for ${row.series}: ${withinTenWeeks}`);
      expect(withinTenWeeks).to.be.true;
      
      // Calculate average rate over all returned observations
      let sum = 0;
      observations.forEach((obs) => {
        expect(obs).to.have.property(row.series);
        // Each observation for the series is expected in the format: { v: "value" }
        const rateStr = obs[row.series].v;
        const rate = parseFloat(rateStr);
        expect(rate).to.be.a('number').and.to.be.gt(0);
        sum += rate;
      });

      const averageRate = sum / observations.length;
      cy.log(`Average for ${row.series} for recent 10 weeks: ${averageRate}`);

      // Assertion: check that the average is within a realistic range (adjust as needed)
     expect(averageRate).to.be.within(parseFloat(row.minRange), parseFloat(row.maxRange));
    });
  });
});
});


describe('Bank of Canada Valet API Negative Tests', () => {

    const invalidSeries = 'INVALID_SERIES';

    it('Negative: Handle invalid series code gracefully', () => {
      cy.getObservations(invalidSeries, 10, { failOnStatusCode: false }).then((response) => {
        // Assert that the status is not 200 and that an error is returned
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property("message");
        const valuetest = response.body.message;
        expect(valuetest).to.eq("Series INVALID_SERIES not found.")
      });
    });

    it('Negative: Should return an error for invalid recent_weeks value (string)', () => {
      cy.getObservations('FXCADUSD', 'ten', { failOnStatusCode: false })
        .then((response) => {
          // Expecting an error status or message indicating invalid input type
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property("message");
          const valuetest = response.body.message;
          expect(valuetest).to.eq("Bad recent observations request parameters, must be numeric")      
        });
    });
  
    it('Negative: Should return an error for recent_weeks set to negative number', () => {
      cy.getObservations('FXCADUSD', -5, { failOnStatusCode: false })
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property("message");
          const valuetest = response.body.message;
          expect(valuetest).to.eq("Bad recent observations request parameters, you cannot have a recent value less than one")  
        });
    });
  
    it('Negative: Should handle request with missing recent_weeks parameter gracefully', () => {
      // Construct a request without the query parameter; you may need a custom command or direct cy.request.
      cy.request({
        method: 'GET',
        url: `/valet/observations/FXCADUSD/json`,
        failOnStatusCode: false // Allow non-2xx responses
      }).then((response) => {
        // Depending on API behavior, assert on the expected error/default behavior
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('observations');
        const observations = response.body.observations;
        expect(observations).to.be.an('array');
      });
    });
  
    it('Negative: Should return error for malformed endpoint', () => {
      cy.request({
        method: 'GET',
        url: `/valet/observation/FXCADUSD/json`, // Note the missing 's' in "observations"
        qs: { recent_weeks: 10 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property("message");
          const valuetest = response.body.message;
          expect(valuetest).to.eq("The page you are looking for is unavailable.") 
      });
    });

    it('Negative: Should return 500 Internal Server Error via simulation', () => {
      // Intercept the API request and simulate a 500 error
      cy.request({
        method: 'GET',
        url: '/valet/observations/FXCADUSD/json',
        qs: { recent_weeks: 10 },
        failOnStatusCode: false,
        simulate500: true  // custom flag to trigger the simulation
      }).then((response) => {
        expect(response.status).to.eq(500);
        expect(response.body).to.have.property('error', 'Internal Server Error');
      });
    });
/*
    it('should return error when using POST instead of GET', () => {
      cy.request({
        method: 'POST',
        url: `/valet/observations/FXCADUSD/json`,
        qs: { recent_weeks: 10 },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(405); // Expect 405 Method Not Allowed, or another appropriate error
      });
    });
*/
  });  

