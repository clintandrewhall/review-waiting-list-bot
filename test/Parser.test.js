const Parser = require('../src/Parser')
const Condition = require('../src/Condition')

test('.parse() works with simple arguments', () => {
  const parser = new Parser(
    'author:cat owner:host repo:pethouse label:meow assignee:nyan -reviewer:dog team-review-requested:elephant'
  )
  expect(parser.parse()).toEqual({
    author: new Condition('author', ['cat'], true),
    user: new Condition('user', ['host'], true),
    repo: new Condition('repo', ['pethouse'], true),
    label: new Condition('label', ['meow'], true),
    reviewer: new Condition('reviewer', ['dog'], false),
    assignee: new Condition('assignee', ['nyan'], true),
    'team-review-requested': new Condition('team-review-requested', ['elephant'], true),
  })
})

test('.parse() works even when arguments have quotations', () => {
  const parser = new Parser(
    `author:cat owner:'host' repo:"pethouse/watchdog" label:"good first","bug" assignee:"nyan" -reviewer:“dog”`
  )
  expect(parser.parse()).toEqual({
    author: new Condition('author', ['cat'], true),
    user: new Condition('user', ['host'], true),
    repo: new Condition('repo', ['pethouse/watchdog'], true),
    label: new Condition('label', ['good first', 'bug'], true),
    reviewer: new Condition('reviewer', ['dog'], false),
    assignee: new Condition('assignee', ['nyan'], true),
    'team-review-requested': new Condition('team-review-requested', [], true),
  })
})

test('.parse() works even when arguments have quotations with colons', () => {
  const parser = new Parser(
    `label:"Team:My Cool Team","Team:Another Cool Team" repo:elastic/kibana`
  )
  expect(parser.parse()).toEqual({
    author: new Condition('author', [], true),
    assignee: new Condition('assignee', [], true),
    reviewer: new Condition('reviewer', [], true),
    user: new Condition('user', [], true),
    'team-review-requested': new Condition('team-review-requested', [], true),

    label: new Condition(
      'label',
      ['Team:My Cool Team', 'Team:Another Cool Team'],
      true
    ),
    repo: new Condition('repo', ['elastic/kibana'], true),
  })
})

test('.parse() with multiple values per label', () => {
  const parser = new Parser(`label:Team:Canvas,review repo:elastic/kibana`)
  expect(parser.parse()).toEqual({
    author: new Condition('author', [], true),
    assignee: new Condition('assignee', [], true),
    reviewer: new Condition('reviewer', [], true),
    user: new Condition('user', [], true),
    'team-review-requested': new Condition('team-review-requested', [], true),

    label: new Condition('label', ['Team:Canvas', 'review'], true),
    repo: new Condition('repo', ['elastic/kibana'], true),
  })
})

test('.parse() works when the statement ends with a period', () => {
  const parser = new Parser(`label:Team:Canvas,review repo:elastic/kibana.`)
  expect(parser.parse()).toEqual({
    author: new Condition('author', [], true),
    assignee: new Condition('assignee', [], true),
    reviewer: new Condition('reviewer', [], true),
    user: new Condition('user', [], true),
    'team-review-requested': new Condition('team-review-requested', [], true),

    label: new Condition('label', ['Team:Canvas', 'review'], true),
    repo: new Condition('repo', ['elastic/kibana'], true),
  })
})
