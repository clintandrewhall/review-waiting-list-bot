const Condition = require('../src/Condition')

describe('.toQuery', () => {
  test('works with inclusive single arguments', () => {
    const condition = new Condition('author', ['cat'], true)
    expect(condition.toQuery()).toEqual('author:cat')
  })

  test('works with inclusive multiple arguments', () => {
    const condition = new Condition('author', ['cat', 'dog'], true)
    expect(condition.toQuery()).toEqual('author:cat author:dog')
  })

  test('works with exclusive single arguments', () => {
    const condition = new Condition('author', ['cat'], false)
    expect(condition.toQuery()).toEqual('-author:cat')
  })

  test('works with exclusive multiple arguments', () => {
    const condition = new Condition('author', ['cat', 'dog'], false)
    expect(condition.toQuery()).toEqual('-author:cat -author:dog')
  })

  test('properly wraps white spaces', () => {
    const condition = new Condition('label', ['Team:With a space in it', 'Something with spaces'], false)
    expect(condition.toQuery()).toEqual('-label:"Team:With a space in it" -label:"Something with spaces"')

    const condition2 = new Condition('label', ['v5.2.0', 'Feature:Logstash Pipelines', '[zube]: Backlog'], true)
    expect(condition2.toQuery()).toEqual('label:v5.2.0 label:"Feature:Logstash Pipelines" label:"[zube]: Backlog"')
  })

  test('works with teams', () => {
    const condition = new Condition('team-review-requested', ['elastic/logs-metrics-ui'], true)
    expect(condition.toQuery()).toEqual('team-review-requested:elastic/logs-metrics-ui')
  })
})
