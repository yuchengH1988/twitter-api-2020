const moment = require('moment')

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
module.exports = {
  getUser, repliesInfos, formatMessage
}
