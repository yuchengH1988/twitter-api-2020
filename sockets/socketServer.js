const db = require('../models')
const Chat = db.Chat
const User = db.User
const { userIndex, authenticated, formatMessage, historyMsg, getPublicUsers, historyMsgForOneUser, getUnreadMsg } = require('./utils')

// dayjs
const dayjs = require('dayjs')
require('dayjs/locale/zh-tw')
dayjs.locale('zh-tw')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
dayjs.extend(utc)
dayjs.extend(timezone)

const users = []
const botName = 'Chat Bot'
const connectionCount = {}

module.exports = (io) => {
  // 驗證身分
  io.use(authenticated)

  // 連線
  io.on('connection', (socket) => {
    // 監聽 outOfRoom 事件
    socket.on('outOfRoom', async () => {
      // 加入 '' channel
      socket.join('')
      // 發送 user 資訊給前端
      socket.emit('userInfo', socket.user)
      // 更新未讀訊息給前端
      const message = await getUnreadMsg(socket.user.id)
      const id = socket.user.id
      socket.emit('unreadMsg', { message, id })
      // 更新歷史訊息列表給前端
      const historyMsgList = await historyMsgForOneUser(socket.user.id)
      const UserId = socket.user.id
      const receivedUserId = 0
      socket.emit('historyMsgForOneUser', { historyMsgList, UserId, receivedUserId })
    })

    // 監聽 openPublicRoom 事件
    socket.on('openPublicRoom', async () => {
      // 加入 'publicRoom' channel
      socket.join('publicRoom')
      // 更換使用者頻道
      socket.user.channel = 'publicRoom'
      // 發送 user 資訊給前端
      socket.emit('userInfo', socket.user)
      // 找出歷史訊息，發送給前端
      const chatRecords = await historyMsg(socket.user.channel)
      socket.emit('historyMsg', chatRecords)
      // 若使用者第一次進來聊天室，則加入 users，並傳送系統歡迎訊息
      if (userIndex(users, socket.user.id) === -1) {
        // 把 user 放進 users 清單中
        users.push(socket.user)
        // 計算單一 user connection 次數
        connectionCount[socket.user.id] = 1
        // 加入聊天室訊息
        socket.to('publicRoom').emit('userOnline', formatMessage(botName, `${socket.user.name} 上線`, 'userOnline'))
      } else {
        // 改變 users 裡面的 channel
        users[userIndex(users, socket.user.id)].channel = 'publicRoom'
        // 計算單一 user connection 次數
        connectionCount[socket.user.id] ++
      }
      // 傳送 onlineCount、userList 給前端
      io.emit('onlineCount', getPublicUsers(users).length)
      io.emit('userList', getPublicUsers(users))
    })

    // 監聽 userMsg 事件
    socket.on('userMsg', async msg => {
      // 找出 receivedUserId
      const userList = socket.user.channel.split('-')
      let receivedUserId = userList.find(userId => Number(userId) !== socket.user.id)
      // 判斷在 channel 裡的人
      const userInChannel = users.filter(user => user.channel === socket.user.channel)
      const isRead = userInChannel.some(user => user.id === receivedUserId)
      // 存到資料庫
      const chat = await Chat.create({
        UserId: socket.user.id,
        receivedUserId: socket.user.channel === 'publicRoom' ? 0 : receivedUserId,
        message: msg,
        time: dayjs().tz('Asia/Taipei').format('h:mm a'),
        channel: socket.user.channel,
        isRead: socket.user.channel === 'publicRoom' ? null : isRead
      })
      const msgData = {
        ChatId: chat.id,
        UserId: chat.UserId,
        receivedUserId: chat.receivedUserId,
        username: socket.user.name,
        avatar: socket.user.avatar,
        text: msg,
        time: chat.time,
        isRead: chat.isRead,
        msgType: ''
      }
      // 發送訊息資訊給前端
      if (socket.user.channel === 'publicRoom') {
        io.to('publicRoom').emit('chatMsg', msgData)
      } else {
        // 訊息發送給前端
        io.to(socket.user.channel).emit('privateChatMsg', msgData)
        // 更新歷史訊息列表
        const historyMsgList = await historyMsgForOneUser(receivedUserId)
        const UserId = socket.user.id
        receivedUserId = Number(receivedUserId)
        io.to('').to(socket.user.channel).emit('historyMsgForOneUser', { historyMsgList, UserId, receivedUserId })
      }
      // 更新未讀訊息給前端
      const message = await getUnreadMsg(receivedUserId)
      const id = Number(receivedUserId)
      socket.to('').emit('unreadMsg', { message, id })
    })

    // listen for privateUser
    socket.on('privateUser', async (userId) => {
      // 找出 user
      const user = await User.findOne({ where: { id: userId } })
      if (user) {
        // 告訴前端 user存在
        socket.emit('findUser', `userId: ${userId} has been found~`)
        // 建立房間
        const roomName = user.id < socket.user.id ? `${user.id}-${socket.user.id}` : `${socket.user.id}-${user.id}`
        // 切換房間
        socket.join(roomName)
        // 更換使用者頻道
        socket.user.channel = roomName
        // 改變 users 裡面的 channel
        const index = userIndex(users, socket.user.id)
        if (index !== -1) {
          users[index].channel = roomName
        } else {
          users.push(socket.user)
        }
        // online count & user list
        io.emit('onlineCount', getPublicUsers(users).length)
        io.emit('userList', getPublicUsers(users))
        // 找出歷史訊息，發送給前端
        const chatRecords = await historyMsg(socket.user.channel)
        socket.emit('privateHistoryMsg', chatRecords)
        // 更新歷史訊息列表
        const historyMsgList = await historyMsgForOneUser(socket.user.id)
        const UserId = socket.user.id
        const receivedUserId = 0
        socket.emit('historyMsgForOneUser', { historyMsgList, UserId, receivedUserId })
        // 把未讀訊息變成已讀
        await Chat.update(
          { isRead: true },
          { where: { receivedUserId: socket.user.id, channel: roomName, isRead: false } }
        )
        // 更新未讀訊息給前端
        const message = await getUnreadMsg(socket.user.id)
        const id = Number(socket.user.id)
        socket.emit('unreadMsg', { message, id })
      } else {
        // 告訴前端 user 不存在
        socket.emit('findUser', `can not find userId: ${userId}!`)
      }
    })

    // run when client disconnect
    socket.on('disconnect', () => {
      if (socket.user.channel === 'publicRoom') {
        // 計算單一 user connection 次數
        connectionCount[socket.user.id] --
        if (connectionCount[socket.user.id] === 0) {
        // take userInfo to users
          users.splice(userIndex(users, socket.user.id), 1)
          // 離開聊天室訊息
          // if (socket.user.channel === 'publicRoom') {
          socket.to('publicRoom').emit('userOffline', formatMessage(botName, `${socket.user.name} 下線`, 'userOffline'))
          // }
        }
      }

      // online count & user list
      io.emit('onlineCount', getPublicUsers(users).length)
      io.emit('userList', getPublicUsers(users))
    })
  })
}
