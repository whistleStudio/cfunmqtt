const mongoose = require('mongoose')

const topicSchema = new mongoose.Schema({
  client: String,
  topType: Number,
  regDate: {type: Date, default: new Date(), expires: 60}
})

const Topic = mongoose.model('topics', topicSchema)

module.exports = Topic