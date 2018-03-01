const math = require('mathjs')
const fs = require('fs')
const naturalSort = require('node-natural-sort')
const TelegramBot = require('node-telegram-bot-api')
const dict = require('./dicts')
const strings =  require('./strings')
const mainKeyboard = {
    reply_markup: {
        keyboard: [
            ['\u2694 Attack', '\ud83d\udee1 Defend'],
            ['\ud83c\udf81 Use an Item', 
                '\ud83c\udfb2 Roll a Dice'],
        ]
    }, parse_mode: 'HTML',
}
const IntRand = (x, y) => {
    return math.randomInt(x, y)
}
// Recebe um array ou um mapa
// Retorna um elemento aleatorio
// randNth({1: 'foo', 2: 'bar'}) vai retornar 'foo' ou 'bar'
// randNth(['foo', 'bar']) vai retornar 'foo' ou 'bar'
// ;)
const randNth = coll => {
    const xs = Object.entries(coll || [])
    const max = xs.length
    const nth = Math.floor(Math.random() * max)
    const [, v] = xs[nth] || [null, null]
    return v
}

const checkPlayer = ({player1, player2, msg, bot}) => {
    let chatId = msg.chat.id
    if (player1.id === undefined) {
        player1.id = msg.from.id
        player1.name = msg.from.first_name
        player1.username = msg.from.username
        player1.p = 1
    } else if (player2.id === undefined && player1.id !== msg.from.id) {
        player2.id = msg.from.id
        player2.name = msg.from.first_name
        player2.username = msg.from.username
        player2.p = 2
    } else if ((msg.from.id !== player1.id) && (msg.from.id !== player2.id)) {
        bot.sendMessage(chatId, strings.p3Err)		
    }
}

const rollDice = ({match, player1, player2, bot, msg, writeRank}) => {
    if (match.value === 1) {
        bot.sendMessage(chatId, strings.rollDiceMatch({msg}), {parse_mode: 'html'})
        return null
    }
    let chatId = msg.chat.id   
    checkPlayer({player1, player2, bot, msg})
    if (player1.id === msg.from.id && player1.num === undefined) {
        player1.num = IntRand(1, 20)
        bot.sendMessage(chatId, strings.pRollDice({player: player1}), {parse_mode: 'HTML'})
        player1.life = 10
        player1.item = 1
        player1.turnAtk = 0
        player1.turnDef = 0
        writeRank(player1)
        console.log(`Player 1 = ${player1.name} , ID = ${player1.id} , Dice: ${player1.num}`)
    } else if (player1.id === msg.from.id) {
        bot.sendMessage(chatId, strings.RollDiceAgain({player: player1}))
    } else {
        if (player2.id === msg.from.id && player2.num === undefined) {
            player2.num = IntRand(1, 20)
            bot.sendMessage(chatId, strings.pRollDice({player: player2}), {parse_mode: 'HTML'})
            player2.life = 10
            player2.item = 1
            player2.turnAtk = 0
            player2.turnDef = 0
            writeRank(player2)
            console.log(`Player 2 = ${player2.name} , ID = ${player2.id} , Dice: ${player2.num}`)
        }
    }
    if (player1.num === player2.num && player1.id !== undefined) {
        bot.sendMessage(chatId, strings.SameRollDice)
        player1.num = undefined
        player2.num = undefined
    } else if (player1.num > player2.num && match.value === undefined) {
        bot.sendMessage(chatId, strings.pFst({player: player1}))
        player1.turnAtk = 1
        match.value = 1
    } else if (player2.num > player1.num && match.value === undefined) {
        bot.sendMessage(chatId, strings.pFst({player: player2}))
        player2.turnAtk = 1
        match.value = 1
    }
}

const onMessage = ({msg, bot, match, player1, player2, loser}) => {
    let chatId = msg.chat.id
    // Functions Declaration - START //
    const restartGame = () => {
        match.value = undefined
        loser.id = undefined
        loser.name = undefined
        loser.username = undefined
        player1.life = 10
        player1.id = undefined
        player1.item = 1
        player1.num = undefined
        player1.turnAtk = 0
        player1.turnDef = 0
        player2.life = 10
        player2.id = undefined
        player2.item = 1
        player2.num = undefined
        player2.turnAtk = 0
        player2.turnDef = 0
        bot.sendMessage(chatId, strings.restartGame)
        showRank()
    }
    const autoRestart = () => setTimeout(function() {
        restartGame()
    },3000)

    const readFile = ({file}) => {          
        return new Promise(function(resolve, reject) {  
            fs.readFile(file, (err, data) => {      
                if (err)   
                    reject(err);             
                else
                    resolve(data);
            });
        })                                           
    }
                                                
    const CheckRankChanges = (player, loser, arr) => {
        //If player name || player username!=Ranking
        if(arr.toString().match(`\\|${player.name}\\|`) !== player.name || arr.toString().match(`${player.username}`) !== player.username){
            for(let i=0;i<arr.length;i++){
                if(arr[i].match(`\\(${player.id}\\)`)){
                    let score = arr[i].match(/\{\d+\}/)
                    let match = arr[i].match(/\[\d+\/\d+\]/)
                    arr[i] = `${score} |${player.name}| - ${player.username} (${player.id}) ${match}`
                }
            }
        }
        //If loser name || loser username != ranking
        if(arr.toString().match(`\\|${loser.name}\\|`) !== loser.name || arr.toString().match(`${loser.username}`) !== loser.username){
            for(let i=0;i<arr.length;i++){
                if(arr[i].match(`\\(${loser.id}\\)`)){
                    let score = arr[i].match(/\{\d+\}/)
                    let match = arr[i].match(/\[\d+\/\d+\]/)
                    arr[i] = `${score} |${loser.name}| - ${loser.username} (${loser.id}) ${match}`
                }
            }
        }
    }
    //Rank Function 
    const writeRank = (player, loser) => { 
        readFile({file: 'rank.txt'}).then(data => {
            let arr = data.toString().split('\n')		
            if(arr.toString().match(`\\(${player.id}\\)`)){
                if(player.username === undefined){
                    player.username = 'NoUserName'}
                if(loser !== undefined){
                    if(arr.toString().match(`\\(${loser.id}\\)`) && loser.username === undefined){ 
                        loser.username = 'NoUserName'
                    }
                    CheckRankChanges(player,loser,arr)
                    RegExp.escape = function(string) { return string.replace(/[-/\\^@!$*+?.()|[\]{}]/g, '\\$&')};
                    let userWin = new RegExp(`\\{\\d+\\} \\|${RegExp.escape(player.name)}\\| \\- ${RegExp.escape(player.username)} \\(\\d+\\) \\[\\d+\\/\\d+\\]`)
                    let userLose = new RegExp(`\\{\\d+\\} \\|${RegExp.escape(loser.name)}\\| \\- ${RegExp.escape(loser.username)} \\(\\d+\\) \\[\\d+\\/\\d+\\]`)															    								      
                    let matchWin = arr.toString().match(userWin)
                    let matchLose = arr.toString().match(userLose)
                    console.log(`matchLose: ${matchLose}`)						
                    console.log(`matchWin: ${matchWin}`)																																
                    let scoreWin = matchWin.toString().replace(/\d+/, function(scoreWin){return player.life+parseInt(scoreWin) }) 
                    let scoreLose = matchLose.toString().replace(/\d+/, function(scoreLose){
                        if(matchLose.toString().match(/\d+/)-player.life <= 0){ return scoreLose = 0}else{ return parseInt(scoreLose)-player.life } })
                    let mCountWin = scoreWin.toString().replace(/(\d+)\//, function(fullMatch, mCountWin){return (Number(mCountWin)+1) + '/'}) 
                    let mCountLose = scoreLose.toString().replace(/\/(\d+)/, function(fullMatch, mCountLose){return '/' + (Number(mCountLose)+1) })
                    let result = arr.toString().replace(userWin,mCountWin).replace(userLose,mCountLose)																   
                    result = result.split(',').join('\n')
                    fs.writeFile('rank.txt', result, function (err) {
                        if (err) return console.log(err)
                    });
                }
            }else{
                if(player.username === undefined){
                    fs.appendFile('rank.txt', `{${player.life}} |${player.name}| - NoUserName (${player.id}) [0/0]\n`, function (err) {
                        if (err) return console.log(err)
                    });
                }else{
                    fs.appendFile('rank.txt', `{${player.life}} |${player.name}| - ${player.username} (${player.id}) [0/0]\n`, function (err) {
                        if(err) return console.log(err)
                    });
                }
            }
        });
    }
    const showRank = () => {
        readFile({file: 'rank.txt'}).then(data => {
            let arr = data.toString().split('\n')
            arr = arr.sort(naturalSort({order: 'DESC'}))
            let str = ''
            let score, name, userName, match
            let regex = /\|.+\|/
            let regUserName = /- \w+/
            let regMatch = /\[\d+\/\d+\]/
            for(let i=0;i<arr.length-1;i++){
                if(i === 0){
                    name = `\ud83e\udd47 ${arr[0].match(regex)}`
                    userName = `${arr[0].match(regUserName)}`
                    userName = userName.toString().split('-').join('').split(' ').join('')
                    userName = userName.toString().replace(/.+/ , function(userName) { if(userName !== 'NoUserName'){ userName = ` - (${userName})`}else{ userName = ` - ${userName}`} return userName })
                    score = arr[0].match(/\d+/)
                    match = arr[0].match(regMatch)
                    /* teste aproveitamento
																  let w,l    
																  w = match.toString().match(/(\d+)\//)
																  w = w.toString().split('/')
																  l = match.toString().match(/\/(\d+)/)
                  l = l.toString().split('/').join('')
																  let apv = parseInt(w) - parseInt(l)
																  console.log(apv)
																		*/
                    str = `${str}${name}${userName} : <b>${score} - ${match}</b>\n`
                }else if(i === 1){
                    name = `\ud83e\udd48 ${arr[1].match(regex)}`
                    userName = `${arr[1].match(regUserName)}`
                    userName = userName.toString().split('-').join('').split(' ').join('')
                    userName = userName.toString().replace(/.+/ , function(userName) { if(userName !== 'NoUserName'){ userName = ` - (${userName})`}else{ userName = ` - ${userName}`} return userName })
                    score = arr[1].match(/\d+/)
                    match = arr[1].match(regMatch)
                    str = `${str}${name}${userName} : <b>${score} - ${match}</b>\n`  
                }else if(i === 2){
                    name = `\ud83e\udd49 ${arr[2].match(regex)}`
                    userName = `${arr[2].match(regUserName)}`
                    userName = userName.toString().split('-').join('').split(' ').join('')
                    userName = userName.toString().replace(/.+/ , function(userName) { if(userName !== 'NoUserName'){ userName = ` - (${userName})`}else{ userName = ` - ${userName}`} return userName })
                    score = arr[2].match(/\d+/)
                    match = arr[2].match(regMatch)
                    str = `${str}${name}${userName} : <b>${score} - ${match}</b>\n`
                }else{                   
                    name = ` ${i+1}. ${arr[i].match(regex)}`
                    userName = `${arr[i].match(regUserName)}`
                    userName = userName.toString().split('-').join('').split(' ').join('')
                    userName = userName.toString().replace(/.+/ , function(userName) { if(userName !== 'NoUserName'){ userName = ` - (${userName})`}else{ userName = ` - ${userName}`} return userName })
                    score = arr[i].match(/\d+/)
                    match = arr[i].match(regMatch)
                    str = `${str}${name}${userName} : <b>${score} - ${match}</b>\n`
                } 
            }
            str = str.toString().split(/\|/).join('').split(/\|/).join('')
            const msgRank = bot.sendMessage(chatId, `\ud83c\udfc6 <b>Ranking\nName - (username) : Score - [W/L]</b>\n\n${str}`,{parse_mode: 'html'})
            msgRank.then(msg => {
                bot.pinChatMessage(chatId, msg.message_id, {disable_notification: true})
            })
        });

    }
    //Status Function - Not deployed yet
    /*
    const statusFunc = (player,i) => {
        //Sleep
        if(i === 53){
								  if(player.statAtk === undefined){
                bot.sendMessage(chatId, `${player.name}, <b>Your Hypnosis has successful</b>, opponent will sleep by <b>two turns.</b>`, {parse_mode: 'html'})
                player.turnAtk = 2
                player.statAtk = 'sleep'
                player.statCount = 2
            }else{
                bot.sendMessage(chatId, `Sorry, ${player.name}. Your opponent is already sleeping\nYour attack failed.`)
            }
        }
    }
				*/
    //Attack Function
    const randAttack = () => {
        readFile({file: 'fileId.txt'}).then(data => {
            let lines = data.toString().split('\n')
            let max = lines.length - 2
            let randLine = lines[math.floor(math.random() * max)]
            let i = lines.indexOf(randLine)
            bot.sendDocument(chatId, randLine,{caption: `${dict.dictAttack[i]}`})
            //statusFunc(player,i)
        })
    }
    const checkAtkTurn = (player1, player2) => {
        if (msg.from.id === player1.id && player1.turnAtk >= 1) {
            player1.turnAtk--
            player2.turnDef++
            randAttack(player1)
        } else if (msg.from.id === player1.id && player1.turnAtk <= 0) {
            bot.sendMessage(chatId, strings.pWaitAtk({player: player1}))
        } else if (msg.from.id === player2.id && player2.turnAtk >= 1) {
            player2.turnAtk--
            player1.turnDef++
            randAttack(player2)
        } else if (msg.from.id === player2.id && player2.turnAtk <= 0) {
            bot.sendMessage(chatId, strings.pWaitAtk({player: player2}))
        }
    }
    //Def Function
    const msgDef = (player, x,loser) => {
        if (x === 5) {//FLINCH
            player.dano = 1		
            if (msg.from.id === player1.id) {
                player1.turnAtk--
                player2.turnAtk++
            } else {
                player2.turnAtk--
                player1.turnAtk++
            }
        } else if (x === 7) {//COUNTER
            player.dano = 0
            if (msg.from.id === player1.id) {
                player1.turnAtk++
                player2.turnAtk--
            } else {
                player2.turnAtk++
                player1.turnAtk--
            }							
        } else {
            player.dano = x
        }
        if (player.xDef === 1 && x !== 7){
            player.dano -= 2
            player.xDef = undefined
            if(player.dano <= 0){
                x = 8
            }	
        }
        //X-Atk rule
        if (msg.from.id === player1.id && player2.xAtk === 1 && x !== 7) {
            player.dano = player1.dano
            if(x === 0) {
                x = 2
                player.dano = x
            } else {
                player.dano += 2     
            }
            player2.xAtk = undefined
        } else if (msg.from.id === player2.id && player1.xAtk === 1 && x !== 7) {
            player.dano = player2.dano
            if(x === 0) {
                x = 2
                player.dano = x
            } else {
                player.dano += 2     
            }
            player1.xAtk = undefined
        }
        player.life = player.life - player.dano
        if (player.life <= 0) {
            match.value = 0
            console.log(`${player.name} FAINTED`)
            bot.sendMessage(chatId, strings.pFainted({player: player}), {parse_mode: 'HTML'})
            if (player.id === player1.id) {
                bot.sendMessage(chatId, strings.pWin({player: player2}), {parse_mode: 'HTML'})
                loser.name = player1.name
                loser.id = player1.id
                loser.username = player1.username
                writeRank(player2,loser)
                autoRestart()           
            } else {
                bot.sendMessage(chatId, strings.pWin({player: player1}), {parse_mode: 'HTML'}) 
                loser.name = player2.name
                loser.id = player2.id
                loser.username = player2.username
                writeRank(player1,loser)
                autoRestart()
            }
        } else {
            const dictDamage = dict.FuncDictDamage({x: player.dano})
            bot.sendMessage(chatId, dictDamage[x] + strings.damageMsg({player: player}), {parse_mode: 'HTML'})
            console.log(player,x)
        }
    }
    const defFunc = (player,loser) => {
        const n = IntRand(0, 37)
        let x = dict.arrayDamage[n]
        if (player.life === undefined) {
            player.life = 10
        }
        msgDef(player, x,loser)
    }

    const checkDefTurn = (player1,player2,loser) => {
        if (msg.from.id === player1.id && player1.turnDef >= 1) {
            player1.turnDef--
            player1.turnAtk++
            defFunc(player1,loser)
            console.log(`Player 1: ${player1.name} executou Defend. HP atual: ${player1.life}`)
        } else if (msg.from.id === player1.id && player1.turnDef <= 0) {
            bot.sendMessage(chatId, strings.pWaitDef({player: player1}))
        } else if (msg.from.id === player2.id && player2.turnDef >= 1) {
            player2.turnDef--
            player2.turnAtk++
            defFunc(player2,loser)
            console.log(`Player 2: ${player2.name} executou Defend. HP atual: ${player2.life}`)
        } else if (msg.from.id === player2.id && player2.turnDef <= 0) {
            bot.sendMessage(chatId, strings.pWaitDef({player: player2}))
        }
    }

    //Item Function
    const msgItem = (player, j,loser) => {
        if (j === 4) {
            player.life -= 3
        }
        else if (j === 0) {
            player.life += 0
        } else if (j === 5) {
            player.life += 0
            if (msg.from.id === player1.id) {
                player1.turnAtk++
                player2.turnAtk--
            } else {
                player2.turnAtk++
                player1.turnAtk--
            }
            //X-Def Item
        } else if (j === 6) {
            player.xDef = 1
            player.life += 0
            //X-Atk Item
        } else if (j === 7) {
            player.xAtk = 1
            player.life += 0
        } else {
            player.life += j
            if(player.life > 10)
            {player.life =10}
        }
        if (player.life <= 0) {
            match.value = 0
            console.log(`${player.name} FAINTED`)
            bot.sendMessage(chatId, dict.itemDict[j] + '\n' + strings.pFainted({player: player}), {parse_mode: 'HTML'})
            if (player.id === player1.id) {
                bot.sendMessage(chatId, strings.pWin({player: player2}), {parse_mode: 'HTML'})  
                loser.name = player1.name
                loser.id = player1.id
                loser.username = player1.username
                writeRank(player2,loser)
                autoRestart()
            } else {
                bot.sendMessage(chatId, strings.pWin({player: player1}), {parse_mode: 'HTML'})  
                loser.name = player2.name
                loser.id = player2.id
                loser.username = player2.username
                writeRank(player1,loser)
                autoRestart()
            }
        } else {
            bot.sendMessage(chatId, dict.itemDict[j] + strings.itemMsg({player: player}), {parse_mode: 'HTML'})
        }
    }
    const itemFunc = (player,loser) => {
        player.item -= 1
        if (player.life === undefined) {
            player.life = 10
        }
        let j = IntRand(0, 8)
        msgItem(player, j,loser)
    }
    // Functions Declaration END //
    //Welcome msg and Menu
    const welcome = '/start'
    const welcome2= '/start@Bertinnnbot'
    if (msg.text === welcome || msg.text === welcome2) {
        bot.sendMessage(chatId, strings.welcome({msg}), mainKeyboard)}
    // Debug
    let adminId = 318475027
    if(msg.text === '/debug' && msg.from.id === adminId){
        loser.name = 'Bert'
        loser.id = 318475027
        loser.username = 'Bertinnn'
        player1.life = 2
        player1.name = 'João'
        player1.username = undefined
        player1.id = 533923287
        //console.log(player1)
        writeRank(player1, loser)
        //restartGame()
    }
    //Admin reset
    if(msg.text === '/reset' && msg.from.id === adminId){ 
        restartGame()
    }
    //Roll a dice
    let dice = '\ud83c\udfb2 Roll a Dice'
    if (msg.text === dice) {
        if (match.value === 1) {
            bot.sendMessage(chatId, strings.RollDiceInMatch({msg}), {parse_mode: 'html'})
        } else {
            rollDice({player1, player2, match, msg, bot, writeRank})
        }
    }
    //Attack
    const atk = '\u2694 Attack'
    if (msg.text === atk) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, strings.PlayAloneMsg({msg}))
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, strings.pNotInMatch({msg}))
        } else {
            checkAtkTurn(player1,player2)
        }
    }
    //Defend
    let def = '\ud83d\udee1 Defend'
    if (msg.text === def) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, strings.PlayAloneMsg({msg}))
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, strings.pNotInMatch({msg}))
        } else {
            checkDefTurn(player1, player2,loser)
        }
    }
    //Use an Item
    let item = '\ud83c\udf81 Use an Item'
    if (msg.text === item) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, strings.PlayAloneMsg({msg}))
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, strings.pNotInMatch({msg}))
        } else {
            if (msg.from.id === player1.id && player1.turnAtk >= 1) {
                if (player1.item === 1) {
                    itemFunc(player1,loser)
                    console.log('Player 1 usou item')
                } else {
                    bot.sendMessage(chatId, strings.pNoItem({player: player1}))
                }
            } else if (msg.from.id === player1.id && player1.turnAtk <= 0 && match.value === 1) {
                bot.sendMessage(chatId, strings.pNoItemTurn({player: player1}))
            }
            if (msg.from.id === player2.id && player2.turnAtk >= 1) {
                if (player2.item === 1) {
                    itemFunc(player2,loser)
                    console.log('Player 2 usou item')
                } else {
                    bot.sendMessage(chatId, strings.pNoItem({player: player2})) 
                }
            } else if (msg.from.id === player2.id && player2.turnAtk <= 0 && match.value === 1) {
                bot.sendMessage(chatId, strings.pNoItemTurn({player: player2}))
            }
        }
    }


}
const Player = {}
//MAIN FUNCTION - START
const main = ({token}) => {
    const bot = new TelegramBot(token, {polling: true})
    let loser = {id: undefined, username: undefined, name: undefined}
    let match = {value: undefined} 
    let player1 = Object.create(Player)
    let player2 = Object.create(Player)
    bot.on('message', msg => onMessage({msg, bot, match, player1, player2, loser}))
}

exports.main = main
exports.checkPlayer = checkPlayer
exports.Player = Player
exports.rollDice = rollDice
exports.onMessage = onMessage
exports.randNth = randNth
