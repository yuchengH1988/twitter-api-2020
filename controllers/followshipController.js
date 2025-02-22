const db = require('../models')
const Followship = db.Followship
const helpers = require('../_helpers')
const { addFollowNotice } = require('../services/notifyService')
const followshipController = {
  addFollowing: async (req, res, next) => {
    try {
      const followerId = helpers.getUser(req).id
      const followingId = req.body.id

      if (!followerId || !followingId) {
        return res.status(404).json({ status: 'error', message: "Can't find followerId." })
      }
      req.newFollowship = await Followship.create({
        followerId, followingId
      })
      // 建立通知
      let notifyMsg = []
      await addFollowNotice(req, res, (data) => { notifyMsg = data })
      return (res.status(201).json({ status: 'success', message: 'Followship has built successfully!', notifyMsg }), next())

    } catch (e) {
      console.log(e)
      return next(e)
    }

  },

  removeFollowing: async (req, res, next) => {
    try {
      let followship = await Followship.findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.userId
        }
      })
      if (followship === null) {
        return res.status(404).json({ status: 'error', message: "Can't find followships." })
      }
      followship.destroy()
      return res.status(200).json({ status: 'success', message: 'Followship has removed successfully!' })
    } catch (e) {
      console.log(e)
      return next(e)
    }
  }
}

module.exports = followshipController