const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://wsh:19930304wsh@localhost:27017/test');
  console.log('db connected!')
}