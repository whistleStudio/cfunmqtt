const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const port = 1883
// const db = require('./db/connect')
// const User = require('./db/model/User')
// const Device = require('./db/model/Device')
// const Topic = require('./db/model/Topic')
// const WebSvId = 'cfweb1013'

server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

aedes.authenticate = function (client, username, password, callback) {
  var auth = true  
  console.log(`${new Date()}:${username}-${client.id} connected`)
  callback(null,auth) 
}




