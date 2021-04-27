const { relativeTimeRounding } = require('moment')
const helpers = require('../_helpers')
const db = require('../models')
const User = db.User
const username = "userxxx"
const jwt = require('jsonwebtoken')
module.exports = (io) => {
  // 
  io.use(async (socket, next) => {
    // if (!socket.handshake.query.token) return
    try {
      // const token = socket.handshake.query.token
      // const { id } = jwt.verify(token, process.env.JWT_SECRET)
      let user = await User.findByPk('2', {
        attributes: ['id', 'name', 'account', 'avatar'],
        raw: true
      })
      console.log(user)
      if (user) {
        socket.user = user
        socket.user.socketId = socket.id
      }
      next()
    } catch (err) {
      console.log(err)
    }
  })

  io.on('connection', socket => {
    console.log("user connected to socket:" + socket.user.name)
    //傳送至client歡迎訊息
    io.emit("chat message", helpers.formatMessage(socket.user.name, "Welcome to the chatroom."))
    //傳給聊天室其他人，有人進來聊天室了
    socket.broadcast.emit('chat message', helpers.formatMessage(socket.user.name, " has joined this room."))
    //socket打開接收器的狀態 接收data =msg
    socket.on('chat message', msg => {
      io.emit('chat message', helpers.formatMessage(socket.user.name, msg))
    })
    // 離線顯示訊息
    socket.on('disconnect', () => {
      console.log('user :' + socket.user.name + ' is disconnected')
      io.emit('chat message', helpers.formatMessage(socket.user.name, " has left this room."))
    })
  })
}