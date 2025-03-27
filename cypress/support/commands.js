Cypress.Commands.add('getObservations', (series, recentWeeks = 10, options = {}) => {
  return cy.request({
    method: 'GET',
    url: `/valet/observations/${series}/json`,
    qs: { recent_weeks: recentWeeks },
    ...options
  });
});

Cypress.Commands.overwrite('request', (originalFn, ...args) => {
  const options = args[0];
  // Check for a custom flag in options to simulate a 500 error.
  if (options.simulate500) {
    // Return a fake 500 error response.
    return Promise.resolve({
      status: 500,
      body: { error: 'Internal Server Error' }
    });
  }
  // Otherwise, proceed with the actual request.
  return originalFn(...args);
});