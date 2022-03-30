const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
  user: String,
  name: String,
  did: Number,
  Cnum1: {type:Array, default:[0, 0, 0, 0]},
  Cnum2: {type:Array, default:[0, 0, 0, 0]}, 
  Cmsg: {type: String, default: 'hello cfunworld'},
  regDate: {type: Date, default: new Date()},
  logDate: Date,
  state: {type:Number, default:0} ,
  comment: {type:String, default:'add comment ...(markdown supported)'}
})
deviceSchema.set('versionKey', false)

const Device = mongoose.model('devices', deviceSchema)

module.exports = Device