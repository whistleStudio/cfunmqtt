const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const PORT = 1883
const db = require('./db/connect')
const User = require('./db/model/User')
const Device = require('./db/model/Device')
const Topic = require('./db/model/Topic')

server.listen(PORT, function () {
  console.log('server started and listening on port ', PORT)
})
// aedes.on('client', (res) => {console.log('client', res.conneced)})
// cfun/wsh/21jaouhuo/jiojiji/btn1
aedes.authenticate = function (client, username, password, callback) {
  var auth = username==='wsh'&&password.toString()==='999'
  if(auth) {console.log(`--- ${client.id} connected ---`)}
  callback(null,auth)  
}
/* 发布验证*/
aedes.authorizePublish = function (client, packet, cb) {
  console.log('pub:   ',packet.topic)
  var tp = packet.topic.split('/')
  ;(async () => {
    var auth1 = await verTopic(tp)
    console.log(auth1)
    var auth2 = await pubLimit(client.id, packet.topic, 1, 3000)
    console.log(auth2)
    if (!(auth1||auth2)) cb(null)
    else cb('pub fail')
  })()
}

/* 订阅验证*/
aedes.authorizeSubscribe = function (client, sub, cb) {
  console.log('sub:   ',sub.topic)
  var tp = sub.topic.split('/')
//  console.log(tp)
  ;(async () => {
    var auth = await verTopic(tp)
    cb(auth, sub)
  })().catch(e => console.log('verTopic:database error'))
}

/* 匹配用户名和通讯秘钥， 用户名和设备 */
async function verTopic (tp) {
  var auth1 = tp[0] === 'cfun'
  var auth2 = await User.findOne({mail: tp[1], code: tp[2]})
  // console.log('------', auth2)
  var auth3 = await Device.findOne({user: tp[1], did: tp[3]})
  // console.log('++++', auth3)
  if(auth1&&auth2&&auth3) return null 
  else return 'unauth topic'
}
/* 限制客户端发布主题频率,freq(ms) */
async function pubLimit (client, top, topType, freq) {
  let doc = await Topic.findOne({client, topType})
  console.log('publimit',doc)
  if (!doc) {
    Topic.create({client, top, topType})
    return null
  }else {
    let curDate = new Date()
    let preT = doc.regDate.getTime(), curT = curDate.getTime()
    console.log(curT, '-', preT, '=', curT-preT)
    if (curT - preT > freq) {
      // let doc1 = await Topic.findOne({client, topType})
      let doc = await Topic.updateOne({client, topType}, {top:top, regDate: curDate})
      // console.log('update', doc)
      return null
    }else {
      return 'over pub frequence limit'  
    }
  }
}

// User.findOne({name: 'whistle'}, (err, doc) => {
//   console.log(doc)
// }) 
// ;(async () => {
//   let a = await User.findOne({name: 'whistle', code: 'Rk6xHshLXN8AAJNHgpiuYg'})
//   console.log(a)   
// })()