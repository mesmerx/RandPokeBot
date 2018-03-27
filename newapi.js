const https = require('https');
const EventEmitter = require('events');
const querystring = require('querystring');

class Pokebot extends EventEmitter {
    constructor() {
        super();
    }

    connect(token) {
        global.token=token
        EventEmitter.call(this);
        function pooling(parent){
            https.get('https://api.telegram.org/bot'+token+'/getUpdates', (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    data=JSON.parse(data)
                    if (data.ok && data.result[0] !== undefined ){
                        parent.emit('result', data.result[0]);
                        parent.emit('update-id', data.result[0].update_id);
                        parent.emit('message', data.result[0].message);
                        parent.emit('message-id', data.result[0].message.message_id);
                        parent.emit('from', data.result[0].message.from);
                        parent.emit('from_id', data.result[0].message.from.id);
                        parent.emit('from_is-bot', data.result[0].message.from.is_bot);
                        parent.emit('from_first-name', data.result[0].message.from.first_name);
                        parent.emit('from_username', data.result[0].message.from.username);
                        parent.emit('from_language-code', data.result[0].message.from.language_code);
                        parent.emit('chat', data.result[0].message.chat);
                        parent.emit('chat_id', data.result[0].message.chat.id);
                        parent.emit('chat_first-name', data.result[0].message.chat.first_name);
                        parent.emit('chat_username', data.result[0].message.chat.username);
                        parent.emit('chat_type', data.result[0].message.chat.type);
                        parent.emit('date', data.result[0].message.date);
                        parent.emit('text', data.result[0].message.text);
                    }
                    pooling(parent);
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });
       
        }
        pooling(this);
    }
    sendMessage(chat_id,text,parse_mode=null,disable_web_page_preview=null,disable_notification=null,reply_to_message_id=null,reply_markup=null){
            params={chat_id:chat_id,text:text}
            if (parse_mode){params.parse_mode=parse_mode}
            if (disable_web_page_preview){params.disable_web_page_preview=disable_web_page_preview}
            if (disable_notification){params.disable_notification=disable_notification}
            if (reply_to_message_id){params.reply_to_message_id=reply_to_message_id}
            if (reply_markup){params.reply_markup=reply_markup}
            var params=querystring.stringify(params);
            var url='https://api.telegram.org/bot'+token+'/sendMessage?'+params
            console.log(url)
            https.get(url, (resp) => {
                 let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                   data=JSON.parse(data)
                    if (data.ok && data.result[0] !== undefined ){
                        parent.emit('result', data.result);
                        parent.emit('message-id', data.result.message_id);
                        parent.emit('from', data.result.from);
                        parent.emit('from_id', data.result.from.id);
                        parent.emit('from_is-bot', data.result.from.is_bot);
                        parent.emit('from_first-name', data.result.from.first_name);
                        parent.emit('from_username', data.result.from.username);
                        parent.emit('chat', data.result.chat);
                        parent.emit('chat_id', data.result.chat.id);
                        parent.emit('chat_first-name', data.result.chat.first_name);
                        parent.emit('chat_username', data.result.chat.username);
                        parent.emit('chat_type', data.result.chat.type);
                        parent.emit('date', data.result.date);
                        parent.emit('text', data.result.text);
                    }
                }).on("error", (err) => {
                console.log("Error: " + err.message);
            });

            })
    }
}



module.exports = Pokebot

