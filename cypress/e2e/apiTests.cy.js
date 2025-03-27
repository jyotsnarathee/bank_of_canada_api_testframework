describe('Bank of Canada Valet API Tests', () => { 
  // Load the schema using cy.fixture in test files and use it with JSON schema validation assertions.
  let forexSchema;

  before(() => {
    cy.fixture('forexSchema.json').then((schema) => {
      forexSchema = schema;
    });
  });

  const validseriesData = [
    { series: 'FXCADUSD', range: [0.5, 1.5] },
    { series: 'FXEURCAD', range: [1.0, 2.0] },
    { series: 'FXAUDCAD', range: [0.5, 1.5] }
    // You can add more series as needed
  ];

  validseriesData.forEach(({ series, range }) => {
  it('Positive: Calculate average for series ${series} for the recent 10 weeks', () => {
    cy.getObservations(series, 10).then((response) => {
      // Validate status and that observations exist
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('observations');
       // Validate the response using the schema loaded from fixtures
       expect(response.body).to.be.jsonSchema(forexSchema);
      
      const observations = response.body.observations;
      expect(observations).to.be.an('array');
      
      // Calculate average rate over all returned observations
      let sum = 0;
      observations.forEach((obs) => {
        expect(obs).to.have.property(series);
        // Each observation for the series is expected in the format: { v: "value" }
        const rateStr = obs[series].v;
        const rate = parseFloat(rateStr);
        expect(rate).to.be.a('number').and.to.be.gt(0);
        sum += rate;
      });

      const averageRate = sum / observations.length;
      cy.log(`Average for ${series} for recent 10 weeks: ${averageRate}`);

      // Assertion: check that the average is within a realistic range (adjust as needed)
      expect(averageRate).to.be.within(range[0], range[1]);
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
  });  

