const db = require('../models')
const { get } = require('../routes/apis')
const { Notify, User } = db
const { getUser } = require('../_helpers')

const notifyController = {
  // getNotifies:顯示通知頁面
  getNotifies: async (req, res, next) => {
    try {
      let notifies = await Notify.findAll({
        raw: true,
        nest: true,
        limit: 20,
        where: {
          receiverId: getUser(req).id,
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'Sender' }]
      })
      //  新的通知數量
      // let newNoticeCount = 0
      // notifies.forEach( notify =>{
      //   if (notify.readStatus){
      //     newNoticeCount ++
      //   }
      // }) 

      notifies = notifies.map(notify => {
        return {
          id: notify.id,
          readStatus: notify.readStatus,
          objectId: notify.objectId,
          objectType: notify.objectType,
          objectText: notify.objectText,
          createdAt: notify.createdAt,
          Sender: {
            id: notify.Sender.id,
            account: notify.Sender.account,
            name: notify.Sender.name,
            avatar: notify.Sender.avatar
          }
        }
      })
      if (!notifies) {
        return res.json({ message: "There aren't notification to this User." })
      } else {
        return (res.status(201).json({ notifies }), next())
      }

    } catch (e) { return next(e) }
  }
}
module.exports = notifyController