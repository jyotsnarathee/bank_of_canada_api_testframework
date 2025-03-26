Cypress.Commands.add('getObservations', (series, recentWeeks = 10, options = {}) => {
  return cy.request({
    method: 'GET',
    url: `/valet/observations/${series}/json`,
    qs: { recent_weeks: recentWeeks },
    ...options
  });
});