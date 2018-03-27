const bot = require('./newapi.js')
const token = '458733904:AAH-Fq8ABp5xVpLHf32uxKAbP-nMCLf4mgU'

const call = new bot();
call.connect(token)
call.on('result',msg => test(msg))
function test(msg){
    console.log(msg)
}
call.sendMessage('177711260','oi')
