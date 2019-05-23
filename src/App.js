'use strict'

const SlackBot = require('./SlackBot')
const GitHubApiClient = require('./GitHubApiClient')
const PullRequests = require('./PullRequests')
const Parser = require('./Parser')
const _ = require('lodash')

class App {
  static start() {
    this.beforeValidate()

    const controller = new SlackBot().getController()

    controller.hears(
      'ls (.+)',
      ['direct_message', 'direct_mention', 'mention'],
      this.ls
    )
  }

  static ls(bot, message) {
    const conditions = new Parser(message.match[1]).parse()

    const filters = Object.values(conditions)
      .map(filter => filter.toQuery())
      .filter(filter => !!filter)
      .map(filter => filter.replace(/ /g, '+'))
      .join('+')

    const client = new GitHubApiClient()
    client
      .getAllPullRequests(conditions)
      .then(prs => {
        bot.startConversation(message, (err, convo) => {
          const messages = new PullRequests(
            prs,
            conditions
          ).convertToSlackMessages()

          if (messages.length > 0) {
            convo.say(`:ship: ${messages.length} unshipped Pull Requests:`)
            _.each(messages, pr => convo.say(pr))

            convo.say(
              'View the list: https://github.com/pulls?utf8=✓&q=is:pr+is:open+' +
                filters
            )
          } else {
            convo.say(`:memo: Nothing to ship! 🍾`)
          }

          convo.next()
        })
      })
      .catch(reason => {
        bot.startConversation(message, (err, convo) => {
          convo.say(
            `I'm really sorry, but I screwed up somewhere. Ask @clintandrewhall to check on me. (${
              reason.code
            })`
          )
        })
      })
  }

  static beforeValidate() {
    let errors = []

    if (!process.env.GITHUB_AUTH_TOKEN) {
      errors.push('Error: GITHUB_AUTH_TOKEN is missing.')
    }
    if (!process.env.SLACK_BOT_TOKEN) {
      errors.push('Error: SLACK_BOT_TOKEN is missing.')
    }

    if (errors.length > 0) {
      errors.forEach(error => console.error(error))
      console.error(
        'Cannot continue to start the bot due to critical lack of parameters.'
      )
      process.exit(1)
    }
  }
}

module.exports = App
