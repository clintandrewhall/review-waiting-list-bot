'use strict'

const SlackBot = require('./SlackBot')
const GitHubApiClient = require('./GitHubApiClient')
const PullRequests = require('./PullRequests')
const Parser = require('./Parser')
const utils = require('./utils')
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

    controller.hears(
      'ls (.+)',
      ['direct_message', 'direct_mention', 'mention'],
      this.ls
    )
  }

  static ls(bot, message) {
    const conditions = new Parser(message.match[1]).parse()

    const filters = utils.getFiltersFromConditions(conditions)

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

            const listUrl = utils.generateGitHubListURL(filters)
            convo.say('View the list: ' + listUrl)
          } else {
            convo.say(`:ship: Nothing to ship! 🍾`)
          }

          convo.next()
        })
      })
      .catch(reason => {
        bot.startConversation(message, (err, convo) => {
          convo.say(
            `I'm really sorry, but I screwed up somewhere. Ask @clintandrewhall to check on me. (${
              reason && reason.code
            }, ${err && err.message})`
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
