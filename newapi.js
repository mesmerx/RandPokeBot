const https = require('https');
const EventEmitter = require('events');

class Pokebot extends EventEmitter {
    constructor() {
        super();
    }

    connect(token,method,) {
        EventEmitter.call(this);
        function pooling(parent){
            https.get('https://api.telegram.org/bot'+token+'/'+method, (resp) => {
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

}



module.exports = Pokebot

