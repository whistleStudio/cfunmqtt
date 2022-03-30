const mongoose = require('mongoose')
var hash = require('object-hash')

const userSchema = new mongoose.Schema({
  name: String,
  pwd: String,
  mail: String,
  regDate: {type: Date, default: new Date()},
  logDate: Date,
  authority: {type: Number, default: 0},
  authDate: {type: Date, default: new Date()},
  tel: Number,
  role: Number,
  score: Number,
  code: {type: String, default: genCode()},
  avatar: {type: Number, default: 0}
})

function genCode () {
  var reg = /\/|\+|=/g
  var code = new Date()
  var code = hash(code, { algorithm: 'md5', encoding: 'base64' }).replace(reg, '')
  return code
}

const User = mongoose.model('users', userSchema)

module.exports = User