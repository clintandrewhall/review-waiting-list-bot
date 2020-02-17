/**
 * @param {Record<string, Condition>} conditions An object containing conditions
 */
const getFiltersFromConditions = (conditions) => Object.values(conditions)
      .map(filter => filter.toQuery())
      .filter(filter => !!filter)
      .join(' ')

/**
 * Generate the URL that gets posted to Slack
 *
 * @param {string} filters String of all filters to pass in to GitHub
 */
const generateGitHubListURL = (filters) => `https://github.com/pulls?utf8=✓&q=${encodeURIComponent(
  'is:pr is:open ' + filters
)}`


module.exports = {
  getFiltersFromConditions,
  generateGitHubListURL,
}