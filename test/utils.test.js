const Parser = require('../src/Parser')
const utils = require('../src/utils')


describe('utils', () => {
  describe('generatesGitHubListURL', () => {
    it('generates the expected URL', () => {
      const conditions = new Parser(`label:"Team:Elasticsearch UI" repo:elastic/kibana at. team-review-requested:elastic/some-team`).parse()

      const filters = utils.getFiltersFromConditions(conditions)

      expect(utils.generateGitHubListURL(filters)).toBe('https://github.com/pulls?utf8=✓&q=is%3Apr%20is%3Aopen%20repo%3Aelastic%2Fkibana%20label%3A%22Team%3AElasticsearch%20UI%22%20team-review-requested%3Aelastic%2Fsome-team')

    })
  })
})
