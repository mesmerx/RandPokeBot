const bot = require('./newapi.js')
const token = ''

const call = new bot();
call.connect(token)
call.on('result',msg => test(msg))
function test(msg){
    console.log(msg)
}
call.sendMessage('177711260','oi')
