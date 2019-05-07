'use strict'

const _ = require('lodash')
const { distanceInWordsToNow } = require('date-fns')

class PullRequests {
  constructor(prs, { label, reviewer, assignee }) {
    this.prs = prs
    this.label = label
    this.reviewer = reviewer
    this.assignee = assignee

    _.bindAll(this, [
      'matchesLabel',
      'matchesReviewer',
      'matchesAssignee',
      'formatPullRequest',
      'reviewersText',
    ])
  }

  isIgnorable(pr) {
    const ignoreWords = ['wip', 'dontmerge', 'donotmerge']
    const regex = new RegExp(`(${ignoreWords.join('|')})`, 'i')
    const sanitizedTitle = pr.title.replace(/'|\s+/g, '')
    return !!sanitizedTitle.match(regex)
  }

  matchesLabel(pr) {
    const labels = pr.labels.nodes.map(v => v.name)
    return this.label.values.every(v => labels.includes(v))
  }

  matchesReviewer(pr) {
    if (this.reviewer.values.length > 0) {
      const result = _.some(this.reviewer.values, _reviewer => {
        // Reviewer could be a user or a team
        const matched = _reviewer.match(/^.+\/(.+)$/)
        const usernameOrTeamName = matched ? matched[1] : _reviewer

        return _.flatMap(pr.reviewRequests.nodes, request => {
          return (
            request.requestedReviewer.login || request.requestedReviewer.name
          )
        }).includes(usernameOrTeamName)
      })
      return this.reviewer.inclusion ? result : !result
    } else {
      return true
    }
  }

  matchesAssignee(pr) {
    if (this.assignee.values.length > 0) {
      const result = _.some(this.assignee.values, _assignee => {
        const matched = _assignee.match(/^.+\/(.+)$/)
        const username = matched ? matched[1] : _assignee

        return _.flatMap(pr.assignees.nodes, assignee => {
          return assignee.login
        }).includes(username)
      })
      return this.assignee.inclusion ? result : !result
    } else {
      return true
    }
  }

  formatPullRequest(pr, index) {
    return `${index + 1}. \`${pr.title}\` by \`${
      pr.author.login
    }\` ${this.distanceText(pr)}`
  }

  reviewersText(reviewRequests) {
    const reviewers = _.map(
      reviewRequests,
      rr => rr.requestedReviewer.login || rr.requestedReviewer.name
    )
    return reviewers.length > 0
      ? `(reviewer: ${reviewers.join(', ')})`
      : '(no reviewer assigned)'
  }

  distanceText(pr) {
    return `${distanceInWordsToNow(new Date(pr.createdAt))} ago`
  }

  convertToSlackMessages() {
    return _(this.prs)
      .reject(this.isIgnorable)
      .filter(this.matchesLabel)
      .filter(this.matchesReviewer)
      .filter(this.matchesAssignee)
      .sortBy(['createdAt'])
      .map(this.formatPullRequest)
      .value()
  }
}

module.exports = PullRequests
