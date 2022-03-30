const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883
const db = require('./db/connect')
const User = require('./db/model/User')
const Device = require('./db/model/Device')
const Topic = require('./db/model/Topic')
const WebSvId = 'cfweb1013'
const WebPwd = 'cfunworld666'

server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

// aedes.on('publish', res => {console.log('pub - ', res)})
// aedes.on('subscrible', res => {console.log('sub - ', res)})
/* 设备状态：在线 */
aedes.on('clientReady', client => {
  if (client.id !== WebSvId) {
    if (client.connected) {
      changeDevState(client, 1).catch(e => {console.log('clientReady: error')})
    }
  }
})

/* 设备状态：离线 */
aedes.on('clientDisconnect', client => {
  if (client.id !== WebSvId) {
    if (!client.connected) {
      changeDevState(client, 0).catch(e => {console.log('clientDisconnect: error')})
    }
  }
})


/* 客户端连接时验证（按序）
1 用户名和通讯秘钥匹配
2 用户已注册对应设备
*/
aedes.authenticate = function (client, username, password, callback) {
  var clientInfo = client.id.split('/')
  var auth = false
  if(password) {
    console.log(client.id, password.toString())
    if (client.id === WebSvId && password.toString() === WebPwd) {
      callback(null, true)
      console.log('web connect')
    }  
    else {
      try {
        var name = clientInfo[0], did = clientInfo[1], code = password.toString() 
        ;(async () => {
          let doc = await User.findOne({name, code})
          if (doc) {
            let doc2 = await Device.findOne({user:doc.mail, did:did})
            if (doc2) {
              auth = true
              console.log(`${new Date()}: ${username} - ${client.id} connected`)
            }
          }
          callback(null, auth)
        })()
      } catch(e) {console.log(e)}
    }
  } else callback(null, auth)
}

/* 发布频率限制 */
aedes.authorizePublish = function (client, packet, cb) {
  if (client.id !== WebSvId) {
    console.log(client.id, packet.topic)
    let freq = 1000, topType = 1
    ;(async () => {
      let auth = await freqLimit(client.id, topType, freq)
      cb(auth) 
    })().catch(e => {console.log('broker: authorizePublish error')})
  } else cb(null)
}

/* 订阅频率限制 */
aedes.authorizeSubscribe = function (client, sub, cb) {
  if (client.id !== WebSvId) {
    ;(async () => {
      let freq = 1000, topType = 2
      let auth = await freqLimit(client.id, topType, freq)
      cb(auth, sub)
    })().catch(e => {console.log('broker: authorizeSubscribe error')})
  } else cb(null, sub)
}


/* 限制客户端发布订阅主题频率
topType: 1表示私有发布，2表示订阅
freq（ms）  
*/
async function freqLimit (client, topType, freq) {
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
      await Topic.updateOne({client, topType}, {regDate: curDate})
      return null
    }else {
      return 'over pub frequence limit'  
    }
  }
}

/* 更改设备状态 */
async function changeDevState(client, sta) {
  var clientInfo = client.id.split('/')
  try {
    var name = clientInfo[0], did = clientInfo[1]
    let doc = await User.findOne({name})
    if (doc) {
      await Device.updateOne({user: doc.mail, did: did}, {state: sta, Cnum1: [0,0,0,0], Cnum2: [0,0,0,0], Cmsg: "hello cfunworld"})
    }
  } catch(e) {console.log(e)}
}

