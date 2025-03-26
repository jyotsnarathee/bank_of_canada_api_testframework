describe('Bank of Canada Valet API Tests', () => {
  const validSeries = 'FXCADUSD';

  it('Positive: Calculate average CAD to USD rate for the recent 10 weeks', () => {
    cy.request({
      method: 'GET',
      url: `/valet/observations/${validSeries}/json`,
      qs: { recent_weeks: 10 }
    }).then((response) => {
      // Validate status and that observations exist
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('observations');
      
      const observations = response.body.observations;
      expect(observations).to.be.an('array');
      
      // Calculate average rate over all returned observations
      let sum = 0;
      observations.forEach((obs) => {
        expect(obs).to.have.property(validSeries);
        // Each observation for the series is expected in the format: { v: "value" }
        const rateStr = obs[validSeries].v;
        const rate = parseFloat(rateStr);
        expect(rate).to.be.a('number').and.to.be.gt(0);
        sum += rate;
      });

      const averageRate = sum / observations.length;
      cy.log(`Average CAD to USD rate for recent 10 weeks: ${averageRate}`);

      // Assertion: check that the average is within a realistic range (adjust as needed)
      expect(averageRate).to.be.within(0.5, 1.5);
    });
  });

  it('Negative: Handle invalid series code gracefully', () => {
    cy.request({
      method: 'GET',
      url: `/valet/observations/INVALID_SERIES/json`,
      qs: { recent_weeks: 10 },
      failOnStatusCode: false // Allow the request to complete even if it fails
    }).then((response) => {
      // Assert that the status is not 200 and that an error is returned
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property("message");
      const valuetest = response.body.message;
      expect(valuetest).to.eq("Series INVALID_SERIES not found.")
    });
  });
});
