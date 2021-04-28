const jwt = require('jsonwebtoken')
const moment = require('moment')
const User = require('../models').User

async function authenticated(socket, next) {
  if (!socket.handshake.auth.token) return
  try {
    const token = socket.handshake.auth.token
    const { id } = jwt.verify(token, process.env.JWT_SECRET)
    let user = await User.findByPk(id, {
      attributes: ['id', 'name', 'account', 'avatar'],
      raw: true
    })
    if (user) {
      socket.user = user
      socket.user.socketId = socket.id
    }
    next()
  } catch (e) {
    console.log(e)
    next(e)
  }
}

function userIndex(users, userId) {
  let index = users.findIndex(user => user.id === userId)
  return index
}

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  }
}

module.exports = { authenticated, userIndex, formatMessage }