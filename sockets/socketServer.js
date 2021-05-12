const db = require('../models')
const Chat = db.Chat
const User = db.User
const UnreadChat = db.UnreadChat
const { userIndex, authenticated, formatMessage, historyMsg, getPublicUsers, historyMsgForOneUser, getUnreadMsg } = require('./utils')
// const moment = require('moment')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const users = []
const botName = 'Chat Bot'
const connectionCount = {}

module.exports = (io) => {
  // 驗證身分
  io.use(authenticated)

  // run when connect
  io.on('connection', async (socket) => {
    // 加入房間 (預設進入 publicRoom)
    socket.join(socket.user.channel)
    // 發送 user 資訊給前端
    socket.emit('userInfo', socket.user)
    // 找出歷史訊息，發送給前端
    const chatRecords = await historyMsg(socket.user.channel, Chat)
    socket.emit('historyMsg', chatRecords)
    // 若使用者第一次進來聊天室，則加入 users，並傳送系統歡迎訊息
    if (userIndex(users, socket.user.id) === -1) {
      // put userInfo to users
      users.push(socket.user)
      // 計算單一 user connection 次數
      connectionCount[socket.user.id] = 1
      // 加入聊天室訊息
      socket.to(socket.user.channel).emit('userOnline', formatMessage(botName, `${socket.user.name} 上線`, 'userOnline'))
    } else {
      // 計算單一 user connection 次數
      connectionCount[socket.user.id] ++
    }

    // online count & user list
    io.emit('onlineCount', getPublicUsers(users).length)
    io.emit('userList', getPublicUsers(users))

    // listen for userMsg
    socket.on('userMsg', async (msg) => {
      // 找出 receivedUserId
      const userList = socket.user.channel.split('-')
      const receivedUserId = userList.find(userId => Number(userId) !== socket.user.id)
      // 存到資料庫
      const chat = await Chat.create({
        UserId: socket.user.id,
        receivedUserId: socket.user.channel === 'publicRoom' ? 0 : receivedUserId,
        message: msg,
        // time: moment.utc().locale('zh_TW').utcOffset('+08:00').format('h:mm a'),
        time: dayjs.utc().local().format('h:mm a'),
        channel: socket.user.channel
      })
      const msgData = {
        ChatId: chat.id,
        UserId: chat.UserId,
        receivedUserId: chat.receivedUserId,
        username: socket.user.name,
        avatar: socket.user.avatar,
        text: msg,
        time: chat.time,
        msgType: ''
      }
      // 發送訊息資訊給前端
      if (socket.user.channel === 'publicRoom') {
        io.to(socket.user.channel).emit('chatMsg', msgData)
      } else {
        // 訊息發送給前端
        io.to(socket.user.channel).emit('privateChatMsg', msgData)
        // 更新歷史訊息列表
        const historyMsgList = await historyMsgForOneUser(socket.user.id)
        socket.emit('historyMsgForOneUser', historyMsgList)
        // 如果對方不在channel裡，未讀訊息存入 UnreadChat
        const userCount = users.filter(user => user.channel === socket.user.channel).length
        if (userCount <= 1) {
          await UnreadChat.create({
            ChatId: chat.id,
            UserId: receivedUserId,
            channel: socket.user.channel
          })
        }
        // 更新未讀訊息給前端
        const msg = await getUnreadMsg(receivedUserId)
        const id = Number(receivedUserId)
        socket.to('publicRoom').emit('unreadMsg', { msg, id })
      }
    })

    // listen for privateUser
    socket.on('privateUser', async (userId) => {
      // 找出 user
      const user = await User.findOne({ where: { id: userId } })
      if (user) {
        // 告訴前端 user存在
        socket.emit('findUser', `userId: ${userId} has been found~`)
        // 建立房間
        const userList = []
        userList.push(user.id, socket.user.id)
        userList.sort()
        const roomName = userList.join('-')
        // 切換房間
        socket.join(roomName)
        // 更換使用者頻道
        socket.user.channel = roomName
        // 改變 users 裡面的 channel
        const index = users.findIndex(user => user.id === socket.user.id)
        users[index].channel = roomName
        // online count & user list
        io.emit('onlineCount', getPublicUsers(users).length)
        io.emit('userList', getPublicUsers(users))
        // 更新歷史訊息列表
        const historyMsgList = await historyMsgForOneUser(socket.user.id)
        socket.emit('historyMsgForOneUser', historyMsgList)
        // 刪掉已讀訊息
        await UnreadChat.destroy({ where: { UserId: socket.user.id, channel: socket.user.channel } })
        // 更新未讀訊息給前端
        const msg = await getUnreadMsg(socket.user.id)
        const id = socket.user.id
        socket.emit('unreadMsg', { msg, id })
        // 找出歷史訊息，發送給前端
        const chatRecords = await historyMsg(socket.user.channel, Chat)
        socket.emit('privateHistoryMsg', chatRecords)
      } else {
        // 告訴前端 user 不存在
        socket.emit('findUser', `can not find userId: ${userId}!`)
      }
    })

    // 更新歷史訊息列表
    const historyMsgList = await historyMsgForOneUser(socket.user.id)
    socket.emit('historyMsgForOneUser', historyMsgList)

    // 更新未讀訊息
    const msg = await getUnreadMsg(socket.user.id)
    const id = socket.user.id
    socket.emit('unreadMsg', { msg, id })

    // run when client disconnect
    socket.on('disconnect', () => {
      // 計算單一 user connection 次數
      connectionCount[socket.user.id] --
      if (connectionCount[socket.user.id] === 0) {
        // take userInfo to users
        users.splice(userIndex(users, socket.user.id), 1)
        // 離開聊天室訊息
        if (socket.user.channel === 'publicRoom') {
          io.to(socket.user.channel).emit('userOffline', formatMessage(botName, `${socket.user.name} 下線`, 'userOffline'))
        }
      }

      // online count & user list
      io.emit('onlineCount', getPublicUsers(users).length)
      io.emit('userList', getPublicUsers(users))
    })
  })
}
