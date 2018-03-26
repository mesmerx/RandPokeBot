const bot = require('./bot.js')
const token = '458733904:AAH-Fq8ABp5xVpLHf32uxKAbP-nMCLf4mgU'

const call = new bot();
call.connect(token,'getUpdates')
call.on('result',msg => test(msg))
call.on('update-id',msg => test(msg))
call.on('message',msg => test(msg))
call.on('message-id',msg => test(msg))
call.on('from',msg => test(msg))
call.on('from_id',msg => test(msg))
call.on('from_is-bot',msg => test(msg))
call.on('from_first-name',msg => test(msg))
call.on('from_username',msg => test(msg))
call.on('from_language-code',msg => test(msg))
call.on('chat',msg => test(msg))
call.on('chat_id',msg => test(msg))
call.on('chat_first-name',msg => test(msg))
call.on('chat_username',msg => test(msg))
call.on('chat_type',msg => test(msg))
call.on('date',msg => test(msg))
call.on('text',msg => test(msg))
call.on('result',msg => test(msg)) 
function test(msg){
    console.log(msg)
}

