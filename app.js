const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helpers = require('./_helpers')
// .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const app = express()
const port = process.env.PORT || 3000
const httpServer = require('http').createServer(app)
const options = {}
//socket需要掛在伺服器上
const io = require('socket.io')(httpServer, options)
// 載入 cors
app.use(cors())

// 載入 bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 載入 routes
require('./routes')(app)
app.get('/socketchat', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const username = "userxxx"

io.on('connection', (socket) => {
  //伺服器端顯示
  console.log("user connected to socket:" + socket.id)
  //傳送至client歡迎訊息
  socket.emit("chat message", helpers.formatMessage(username, "Welcome to the chatroom."))
  //傳給聊天室其他人，有人進來聊天室了
  socket.broadcast.emit('chat message', helpers.formatMessage(username, " has joined this room."))
  //socket打開接收器的狀態 接收data =msg
  socket.on('chat message', msg => {
    io.emit('chat message', helpers.formatMessage(username, msg))
  })
  // 離線顯示訊息
  socket.on('disconnect', () => {
    console.log('user :' + socket.id + ' is disconnected')
    io.emit('chat message', helpers.formatMessage(username, " has left this room."))
  })
})
// io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' })

// io.on('connection', (socket) => {
//   socket.broadcast.emit('hi');
// });

// io.on('connection', (socket) => {
//   socket.on('chat message', (msg) => {
//     io.emit('chat message', msg);
//   });
// });

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))


httpServer.listen(port)

module.exports = app
