// Utility function to check if observations span 10 weeks or less
export function isWithinTenWeeks(observations) {
    // Convert the date strings to Date objects
    const dates = observations.map(obs => new Date(obs.d));
    // Find the earliest and latest dates
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    // Calculate the difference in days
    const diffDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    // Return true if the difference is 70 days or less (10 weeks)
    return diffDays <= 70;
  }