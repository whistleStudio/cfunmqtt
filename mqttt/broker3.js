const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883
const db = require('./db/connect')
const User = require('./db/model/User')
const Device = require('./db/model/Device')
const Topic = require('./db/model/Topic')
const WebSvId = 'cfweb1013'

server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

// aedes.on('publish', res => {console.log('pub - ', res)})
// aedes.on('subscrible', res => {console.log('sub - ', res)})

/* 客户端连接时验证（按序）
1 密码
2 web服务器直接放行；硬件设备检测当前用户是否注册
*/
aedes.authenticate = function (client, username, password, callback) {
  var did = client.id
  var auth = false
  if (password.toString()==='123') {
    if (did === WebSvId) {
      callback(null, true)
    } else {
      ;(async () => {
        let doc1 = await User.findOne({name: username})
        if (doc1) {
          let user = doc1.mail
          let doc2 = await Device.findOne({user, did})
          if (doc2) {
            auth = true 
            console.log(`${new Date()}:${username}-${client.id} connected`)
          }
        }
        callback(null,auth)
      })().catch(e => console.log('broker: authenticate error'))
    }
  } else callback(null,auth) 
}

/* 发布频率限制 */
aedes.authorizePublish = function (client, packet, cb) {
  let reg = /cfun\/public\/.+\/.+\/data/
  let freq = 2000
  let topType = reg.test(packet.topic) ? 3 : 1
  ;(async () => {
    let auth = await freqLimit(client.id, topType, freq)
    cb(auth)
  })().catch(e => {console.log('broker: authorizePublish error')})
}

/* 订阅频率限制 */
aedes.authorizeSubscribe = function (client, sub, cb) {
  ;(async () => {
    let freq = 2000, topType = 2
    let auth = await freqLimit(client.id, topType, freq)
    cb(auth, sub)
  })().catch(e => {console.log('broker: authorizeSubscribe error')})
}


/* 限制客户端发布订阅主题频率
topType: 1表示私有发布，2表示订阅, 3表示公共发布
freq（ms）  
*/
async function freqLimit (client, topType, freq) {
  if (client === WebSvId) {
    let doc = await Topic.findOne({client, topType})
    console.log('publimit',doc)
    if (!doc) {
      Topic.create({client, topType})
      return null
    }else {
      let curDate = new Date()
      let preT = doc.regDate.getTime(), curT = curDate.getTime()
      console.log(curT, '-', preT, '=', curT-preT)
      if (curT - preT > freq) {
        let doc = await Topic.updateOne({client, topType}, {regDate: curDate})
        return null
      }else {
        return 'over pub frequence limit'  
      }
    }
  }
}