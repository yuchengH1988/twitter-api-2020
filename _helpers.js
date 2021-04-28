const moment = require('moment')
const { useFakeServer } = require('sinon')

function repliesInfos(tweet) {
  const infos = tweet.Replies.map(r => ({
    id: r.id,
    tweetId: r.TweetId,
    comment: r.comment,
    updatedAt: r.updatedAt,
    User: {
      id: r.User.id,
      avatar: r.User.avatar,
      name: r.User.name,
      account: r.User.account
    }
  }))
  return infos
}

function getUser(req) {
  return req.user
}

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  }
}

function userIndex(users, userId) {
  let index = users.findIndex(user => user.id === userId)
  return index
}
module.exports = {
  getUser, repliesInfos, formatMessage, userIndex
}
