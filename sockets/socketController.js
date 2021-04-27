const helpers = require('../_helpers')

module.exports.respond = function (socket) {
  const username = "userxxx"
  console.log("user connected to socket:" + socket.id)
  //傳送至client歡迎訊息
  socket.emit("chat message", helpers.formatMessage(username, "Welcome to the chatroom."))
  //傳給聊天室其他人，有人進來聊天室了
  socket.broadcast.emit('chat message', helpers.formatMessage(username, " has joined this room."))
  //socket打開接收器的狀態 接收data =msg
  socket.on('chat message', msg => {
    socket.emit('chat message', helpers.formatMessage(username, msg))
  })
  // 離線顯示訊息
  socket.on('disconnect', () => {
    console.log('user :' + socket.id + ' is disconnected')
    socket.emit('chat message', helpers.formatMessage(username, " has left this room."))
  })
}