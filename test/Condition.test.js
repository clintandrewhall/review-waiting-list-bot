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

  test('properly encodes white spaces', () => {
    const condition = new Condition('label', ['Team:With a space in it', 'Something with spaces'], false)
    expect(condition.toQuery()).toEqual('-label:%22Team%3AWith%20a%20space%20in%20it%22 -label:%22Something%20with%20spaces%22')

    const condition2 = new Condition('author', ['Friedrich Nietzsche', 'Spongebob Squarepants'], true)
    expect(condition2.toQuery()).toEqual('author:%22Friedrich%20Nietzsche%22 author:%22Spongebob%20Squarepants%22')
  })
})
