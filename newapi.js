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
        function pooling(that){
            https.get('https://api.telegram.org/bot'+token+'/getUpdates', (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    data=JSON.parse(data)
                    if (data.ok && data.result[0] !== undefined ){
                        that.emit('result', data.result[0]);
                        that.emit('update-id', data.result[0].update_id);
                        that.emit('message', data.result[0].message);
                        that.emit('message-id', data.result[0].message.message_id);
                        that.emit('from', data.result[0].message.from);
                        that.emit('from_id', data.result[0].message.from.id);
                        that.emit('from_is-bot', data.result[0].message.from.is_bot);
                        that.emit('from_first-name', data.result[0].message.from.first_name);
                        that.emit('from_username', data.result[0].message.from.username);
                        that.emit('from_language-code', data.result[0].message.from.language_code);
                        that.emit('chat', data.result[0].message.chat);
                        that.emit('chat_id', data.result[0].message.chat.id);
                        that.emit('chat_first-name', data.result[0].message.chat.first_name);
                        that.emit('chat_username', data.result[0].message.chat.username);
                        that.emit('chat_type', data.result[0].message.chat.type);
                        that.emit('date', data.result[0].message.date);
                        that.emit('text', data.result[0].message.text);
                    }
                    pooling(that);
                });

            }).on('error', (err) => {
                console.log('Error: ' + err.message);
            });

        }
        pooling(this);
    }
    sendMessage(chat_id,text,parse_mode=null,disable_web_page_preview=null,disable_notification=null,reply_to_message_id=null,reply_markup=null){
        EventEmitter.call(this);
        params={chat_id:chat_id,text:text}
        var token=global.token
        if (parse_mode){params.parse_mode=parse_mode}
        if (disable_web_page_preview){params.disable_web_page_preview=disable_web_page_preview}
        if (disable_notification){params.disable_notification=disable_notification}
        if (reply_to_message_id){params.reply_to_message_id=reply_to_message_id}
        if (reply_markup){params.reply_markup=reply_markup}
        var params=querystring.stringify(params);
        var url='https://api.telegram.org/bot'+token+'/sendMessage?'+params
        https.get(url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                data=JSON.parse(data)
                if (data.ok && data.result[0] !== undefined ){
                    this.emit('result', data.result);
                    this.emit('message-id', data.result.message_id);
                    this.emit('from', data.result.from);
                    this.emit('from_id', data.result.from.id);
                    this.emit('from_is-bot', data.result.from.is_bot);
                    this.emit('from_first-name', data.result.from.first_name);
                    this.emit('from_username', data.result.from.username);
                    this.emit('chat', data.result.chat);
                    this.emit('chat_id', data.result.chat.id);
                    this.emit('chat_first-name', data.result.chat.first_name);
                    this.emit('chat_username', data.result.chat.username);
                    this.emit('chat_type', data.result.chat.type);
                    this.emit('date', data.result.date);
                    this.emit('text', data.result.text);
                }
            }).on('error', (err) => {
                console.log('Error: ' + err.message);
            });

        })
    }
}



module.exports = Pokebot

