'use strict'

const _ = require('lodash')
const { differenceInCalendarDays } = require('date-fns')

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

  formatPullRequest(pr) {
    const { reviews } = pr
    let reviewText = ''

    if (reviews) {
      const { edges } = reviews
      if (edges) {
        const reviewTexts = {
          COMMENTED: 0,
          APPROVED: 0,
          CHANGES_REQUESTED: 0,
        }

        edges.forEach(edge => {
          reviewTexts[edge.node.state]++
        })

        if (reviewTexts.CHANGES_REQUESTED > 0) {
          reviewText += reviewTexts.CHANGES_REQUESTED + ' change request'
          reviewText += reviewTexts.CHANGES_REQUESTED > 1 ? 's' : ''
        }

        if (reviewTexts.APPROVED > 0) {
          reviewText += reviewText.length > 0 ? ', ' : ''
          reviewText += reviewTexts.APPROVED + ' approval'
          reviewText += reviewTexts.APPROVED > 1 ? 's' : ''
        }

        if (reviewTexts.COMMENTED > 0) {
          reviewText += reviewText.length > 0 ? ', ' : ''
          reviewText += reviewTexts.COMMENTED + ' comment'
          reviewText += reviewTexts.COMMENTED > 1 ? 's' : ''
        }
      }
    }

    if (reviewText) {
      reviewText = 'with ' + reviewText
    } else {
      reviewText = 'with no review'
    }

    return `${this.distanceText(pr)}: \`${pr.title}\` by \`${
      pr.author.login
    }\` ${reviewText}`
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
    // let text = `${distanceInWordsToNow(new Date(pr.createdAt))}`
    let days = differenceInCalendarDays(new Date(), new Date(pr.createdAt))
    return '*' + days + ' day' + (days === 1 ? '' : 's') + '*'
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
