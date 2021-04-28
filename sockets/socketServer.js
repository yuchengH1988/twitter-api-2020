const { relativeTimeRounding } = require('moment')
const helpers = require('../_helpers')
const authenticated = require('./auth')
const { userIndex } = require('../_helpers')
const users = []
module.exports = (io) => {
  // 聊天室使用者驗證
  io.use(authenticated)

  io.on('connection', socket => {

    // 若使用者不存在 則加入userList 並傳送系統歡迎訊息
    if (userIndex(users, socket.user.id) === -1) {
      //傳送至client歡迎訊息
      io.emit("chatMsg", helpers.formatMessage(socket.user.name, " . Welcome to the chatroom."))
      //傳給聊天室其他人，有人進來聊天室了
      socket.broadcast.emit('chatMsg', helpers.formatMessage(socket.user.name, "  has joined this room."))
    }
    users.push(socket.user)
    console.log(users)

    //socket打開接收器的狀態 接收data =msg
    socket.on('userMsg', msg => {
      // 存入DATA
      // 
      io.emit('chatMsg', helpers.formatMessage(socket.user.name, msg))
    })
    // 離線顯示訊息
    socket.on('disconnect', () => {
      const userId = socket.user.id

      // 刪掉使用者
      if (userIndex(users, userId) !== -1) {
        users.splice(userIndex, 1)
      }
      // 若使用者Id已不再清單內傳出離開訊息
      if (userIndex(users, userId) === -1) {
        io.emit('chatMsg', helpers.formatMessage(socket.user.name, " has left this room."))
      }
    })
  })
}