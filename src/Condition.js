'use strict'

class Condition {
  constructor(key, values = [], inclusion = true) {
    this.key = key
    this.values = values
    this.inclusion = inclusion
  }

  static get ACCEPTABLE_CONDITIONS() {
    return ['author', 'user', 'repo', 'label', 'reviewer', 'assignee']
  }

  toQuery() {
    return this.values
      .map(value => `${this.inclusion ? '' : '-'}${this.key}:${value}`)
      .map(value => value.replace(/author:(.*)\/(.*)/g, 'team:$1/$2'))
      .join(' ')
  }
}

module.exports = Condition
