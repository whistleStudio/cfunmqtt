const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883


server.listen(port, function () {
  console.log('server started and listening on port ', port)
})
// aedes.on('client', (res) => {console.log('client', res.conneced)})
// cfun/wsh/21jaouhuo/jiojiji/btn1
aedes.authenticate = function (client, username, password, callback) {
  let reg = /browser/
  var auth
  if (reg.test(client.id)) {
    auth = username==='wsh'&&password.toString()==='999'
  } else {auth = username==='cfunworld'&&password.toString()==='123'}
  if(auth) {console.log(`--- ${client.id} connected --- ${client}`)}
  // console.log(`--- ${client.id} connected ---`)
  callback(null,auth)  
}
aedes.on('publish', res => {console.log(res)})

const httpServer = require('http').createServer()
const ws = require('websocket-stream')
const port2 = 1884

ws.createServer({ server: httpServer }, aedes.handle)

httpServer.listen(port2, function () {
  console.log('websocket server listening on port ', port2)
})