'use strict'

const processValueForURI = string =>
  string.indexOf(' ') > -1
    ? `${encodeURIComponent('"' + string + '"')}`
    : string

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
      .map(value => `${this.inclusion ? '' : '-'}${this.key}:${processValueForURI(value || '')}`)
      .map(value => value.replace(/author:(.*)\/(.*)/g, 'team:$1/$2'))
      .join(' ')
  }
}

module.exports = Condition
