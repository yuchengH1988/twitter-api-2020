const db = require('../models')
const { get } = require('../routes/apis')
const { Notify, Tweet, Subscript, User, Reply, Like, Followship } = db
const { getUser } = require('../_helpers')

const notifyService = {

  // 建立 tweet 通知 
  addTweetNotice: async (req, res, callback) => {
    try {
      // 抓出新建立的tweet
      let newTweet = req.newTweet.dataValues
      const subscripts = await Subscript.findAll({
        raw: true,
        nest: true,
        where: { authorId: newTweet.UserId }
      })
      // 建立notify
      if (subscripts) {
        await subscripts.forEach(subscript => Notify.create({
          receiverId: subscript.subscriberId,
          senderId: getUser(req).id,
          objectId: newTweet.id,
          objectType: 'tweets',
          objectText: newTweet.description
        }))
        callback({ status: 'success', message: 'Notification have been built.' })
      }
      else { callback({ message: 'no subscription for notification' }) }
    } catch (e) {
      console.log(e)
    }
  },
  // 建立 Reply 通知
  addReplyNotice: async (req, res, callback) => {
    try {
      // 抓出Reply相關資料
      let newReply = req.newReply.dataValues

      const tweet = await Tweet.findByPk(newReply.TweetId, {
        raw: true,
        nest: true
      })
      // 建立Notify , 當回覆者跟作者相同則不建立
      if (tweet.UserId !== getUser(req).id) {
        await Notify.create({
          receiverId: tweet.UserId,
          senderId: getUser(req).id,
          objectId: newReply.id,
          objectType: 'replies',
          objectText: newReply.comment
        })
        callback({ status: 'success', message: 'Notification have been built.' })
      } else {
        callback({ message: 'no notification' })
      }
    } catch (e) { console.log(e) }
  }
  ,
  // 建立 Like 通知
  addLikeNotice: async (req, res, callback) => {
    try {
      // 抓出Like相關資料
      const newLike = req.newLike.dataValues
      const tweet = await Tweet.findByPk(newLike.TweetId, {
        raw: true,
        nest: true
      })
      // 建立Notify , 當Like者跟作者相同則不建立
      if (tweet.UserId !== getUser(req).id) {
        await Notify.create({
          receiverId: tweet.UserId,
          senderId: getUser(req).id,
          objectId: newLike.id,
          objectType: 'likes',
          objectText: null
        })
        callback({ status: 'success', message: 'Notification have been built.' })
      } else {
        callback({ message: 'no notification' })
      }
    } catch (e) { console.log(e) }
  }
  ,
  //建立Follow 通知
  addFollowNotice: async (req, res, callback) => {
    try {// 抓出Follow相關資料
      const newFollowship = req.newFollowship.dataValues
      await Notify.create({
        receiverId: newFollowship.followingId,
        senderId: getUser(req).id,
        objectId: newFollowship.id,
        objectType: 'followships',
        objectText: null
      })
      callback({ status: 'success', message: 'Notification have been built.' })
    } catch (e) { console.log(e) }
  }
  ,
  haveRead: async (req, res, next) => {
    try {
      let notifies = await Notify.findAll({
        where: { receiverId: getUser(req).id }
      })
      notifies.forEach((notify) => {
        notify.update({ readStatus: true })
      })
    } catch (e) { return next(e) }
  }

}
module.exports = notifyService