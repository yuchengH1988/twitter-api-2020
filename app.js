const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
// .env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const app = express()
const port = process.env.PORT || 3000
const httpServer = require('http').createServer(app)
// const options = {}
//socket需要掛在伺服器上

// 載入 cors
app.use(cors())

// 載入 bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 載入 routes
require('./routes')(app)

const io = require('socket.io')(httpServer)
require('./sockets/socketServer')(io)
const Msg = require('./models').Msg

app.get('/socketchat', (req, res) => {
  res.sendFile(__dirname + '/sockets/index.html');
});
//測試用
app.get('/socketchat/:userId', (req, res) => {
  res.sendFile(__dirname + '/sockets/index.html');
});

httpServer.listen(port)

module.exports = app
