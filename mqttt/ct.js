const mqtt = require('mqtt')
const brokerPort = 1883
// const ip = '106.54.66.50'
const ip = '127.0.0.1'
// 服务器clientId可以复杂点
var client  = mqtt.connect(`mqtt://${ip}:${brokerPort}`, {clientId: 'whistle/2', username:'whistle', password:'fnjd4Pc8Fx'})

let arr = [5.5, 2.2 ,5, 4]
let floatBuf = new Float32Array(arr)
let floatArrBuf = floatBuf.buffer
let uintBuf = Buffer.from(floatArrBuf, 'utf8')
console.log('uintBuf: ', uintBuf)
console.log(uintBuf.buffer)
console.log([].slice.call(new Float32Array(uintBuf.buffer)))

client.publish('whistle/2/Cnum2', uintBuf)
// client.publish('whistle/1/Cnum', uintBuf)