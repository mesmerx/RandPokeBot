const math = require('mathjs')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')

const mainKeyboard = {
    reply_markup: {
        keyboard: [
            ['Attack', 'Defend'],
            ['Use an Item', 'Roll a Dice'],
            ['Restart'],
        ]
    }, parse_mode: 'HTML',
}

const arrayDano = ['1', '1', '1', '1', '1', '1', '1', '1', '1', '1', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '3', '3', '3', '4', '4', '6', '0', '0', '0', '0', '0', '0', '0', '0', '5', '5', '7', '7']

const dictDano = {
    0: ['Your opponent missed the attack!'],
    1: ['It was effective! You lose 1 HP.'],
    2: ['It was effective! <b>CRITICAL HIT!</b> You lose 2 HP.'],
    3: ['It was ultra effective! You lose 3 HP.'],
    4: ['It was super effective! <b>CRITICAL HIT!</b> You lose 4 HP.'],
    5: ['It was effective! You lose 1 HP. You flinched! Opponent attacks again.'],
    6: ['It was ultra effective! <b>CRITICAL HIT!</b> You lose 6 HP.'],
    7: ['COUNTER! You take no damage and have an extra attack!'],
}

const itemDict = {
    0: ['You found nothing!'],
    1: ['You found a Potion and recovered 1 HP!'],
    2: ['You found a Super Potion and recovered 2 HP!'],
    3: ['You found a Hyper Potion and recovered 3 HP!'],
    4: ['You found a Flame Orb and lost 3 HP.'],
    5: ['You found a Quick Claw and can attack twice!'],
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
    } else if (player2.id === undefined && player1.id !== msg.from.id) {
        player2.id = msg.from.id
        player2.name = msg.from.first_name
    } else if ((msg.from.id !== player1.id) && (msg.from.id !== player2.id)) {
        bot.sendMessage(chatId, 'There are already two players in the game. Please, wait until the current match is over!')
    }
}

const rollDice = ({match, player1, player2, bot, msg}) => {
    if (match.value === 1) {
        bot.sendMessage(chatId, `<b>Sorry, ${msg.from.first_name}!</b>\nYou cannot roll a dice while a match is in progress`, {parse_mode: 'html'})
        return null
    }
    let chatId = msg.chat.id
    checkPlayer({player1, player2, bot, msg})
    if (player1.id === msg.from.id && player1.num === undefined) {
        player1.num = IntRand(1, 20)
        bot.sendMessage(chatId, `Player 1 = ${player1.name} , <pre>You got: ${player1.num} </pre>`, {parse_mode: 'HTML'})
        player1.life = 10
        player1.item = 1
        player1.turnAtk = 0
        player1.turnDef = 0
        console.log(`Player 1 = ${player1.name} , ID = ${player1.id} , Dice: ${player1.num}`)
    } else if (player1.id === msg.from.id) {
        bot.sendMessage(chatId, `${player1.name}, you cannot roll a dice again. Wait for another player!`)
    } else {
        if (player2.id === msg.from.id && player2.num === undefined) {
            player2.num = IntRand(1, 20)
            bot.sendMessage(chatId, `Player 2 = ${player2.name} , <pre>You got: ${player2.num} </pre>`, {parse_mode: 'HTML'})
            player2.life = 10
            player2.item = 1
            player2.turnAtk = 0
            player2.turnDef = 0
            console.log(`Player 2 = ${player2.name} , ID = ${player2.id} , Dice: ${player2.num}`)
        }else if (player2.id === msg.from.id)
	    {
        	bot.sendMessage(chatId, `${player2.name}, you cannot roll a dice again. Wait for another player!`)
    	} 
    }
    if (player1.num === player2.num && player1.id !== undefined) {
        bot.sendMessage(chatId, 'Players got the same result. Please roll a dice again!')
        player1.num = undefined
        player1.turnAtk = 0
        player1.turnDef = 0
        player1.item = 1
        player2.num = undefined
        player2.turnAtk = 0
        player2.turnDef = 0
        player2.item = 1
    } else if (player1.num > player2.num && match.value === undefined) {
        bot.sendMessage(chatId, `${player1.name} will attack first!`)
        player1.turnAtk = 1
        match.value = 1
    } else if (player2.num > player1.num && match.value === undefined) {
        bot.sendMessage(chatId, `${player2.name} will attack first!`)
        player2.turnAtk = 1
        match.value = 1
    }
}

const onMessage = ({msg, bot, match, player1, player2}) => {
    let chatId = msg.chat.id
    // Functions Declaration - START //
    const restartGame = () => {
        match.value = undefined
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
        bot.sendMessage(chatId, 'Game restarted! Please ROLL A DICE.')
    }

    //Rank Function - not deployed yet
    /*
    const writeRank = () => {
        if (player1.life <= 0) {
            fs.writeFile('rank.txt', `${player2.name}\n`, {flag: 'a'}, function (err) {
                if (err) throw err
            })
        } else if (player2.life <= 0) {
            fs.writeFile('rank.txt', `${player1.name}\n`, {flag: 'a'}, function (err) {
                if (err) throw err
            })
        }
    }
    */
    //Attack Function
    const randAttack = () => {
        fs.readFile('fileId.txt', function (err, data) {
            let lines = data.toString().split('\n')
            let randLine = lines[math.floor(math.random() * lines.length - 2)]
            bot.sendDocument(chatId, randLine)
            if(err) console.log(randLine)
        })
    }

    const checkAtkTurn = () => {
        if (msg.from.id === player1.id && player1.turnAtk >= 1) {
            player1.turnAtk--
            player2.turnDef++
            randAttack()
        } else if (msg.from.id === player1.id && player1.turnAtk <= 0) {
            bot.sendMessage(chatId, `${player1.name}, wait for your turn to attack!`)
        } else if (msg.from.id === player2.id && player2.turnAtk >= 1) {
            player2.turnAtk--
            player1.turnDef++
            randAttack()
        } else if (msg.from.id === player2.id && player2.turnAtk <= 0) {
            bot.sendMessage(chatId, `${player2.name}, wait for your turn to attack!`)
        }
    }
    //Def Function

    const msgDef = (player, x) => {
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
                //	console.log(`Player 1 usou COUNTER. tem ATK: ${player1.turnAtk} e P2 tem ATK: ${player2.turnAtk}`);
            } else {
                player2.turnAtk++
                player1.turnAtk--
                //	console.log(`Player 2 usou COUNTER. tem ATK: ${player2.turnAtk} e P1 tem ATK: ${player1.turnAtk}`);
            }
        } else {
            player.dano = x
        }
        player.life = player.life - player.dano
        if (player.life <= 0) {
            	match.value = 0
            	console.log(`${player.name} FAINTED`)
            	bot.sendMessage(chatId, `${player.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>`, {parse_mode: 'HTML'})
            if(player.id === player1.id){
                	bot.sendMessage(chatId, `Congratulations ${player2.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'}) 
            	}else{
                	bot.sendMessage(chatId, `Congratulations ${player1.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'}) 
            	}
        } else {
            bot.sendMessage(chatId, ` ${dictDano[x]}\n${player.name} has ${player.life} HP!`, {parse_mode: 'HTML'})
        }
    }

    const defFunc = (player) => {
        const n = IntRand(0, 37)
        let x = parseInt(arrayDano[n])
        if (player.life === undefined) {
            player.life = 10
        }
        msgDef(player, x)
    }

    const checkDefTurn = () => {
        if (msg.from.id === player1.id && player1.turnDef >= 1) {
            player1.turnDef--
            player1.turnAtk++
            defFunc(player1)
            console.log(`Player 1: ${player1.name} executou Defend. HP atual: ${player1.life}`)
        } else if (msg.from.id === player1.id && player1.turnDef <= 0) {
            bot.sendMessage(chatId, `${player1.name}, wait for your turn to defend!`)
        } else if (msg.from.id === player2.id && player2.turnDef >= 1) {
            player2.turnDef--
            player2.turnAtk++
            defFunc(player2)
            console.log(`Player 2: ${player2.name} executou Defend. HP atual: ${player2.life}`)
        } else if (msg.from.id === player2.id && player2.turnDef <= 0) {
            bot.sendMessage(chatId, `${player2.name}, wait for your turn to defend!`)
        }
    }

    //Item Function
    const msgItem = (player, j) => {
        let id = player.id
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
        } else {
            player.life += j
        }
        if (player.life <= 0) {
            match.value = 0
            console.log(`${player.name} FAINTED`)
            bot.sendMessage(chatId, `${itemDict[j]}\n${player.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>`, {parse_mode: 'HTML'})
            if(player.id === player1.id){
                bot.sendMessage(chatId, `Congratulations ${player2.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'}) 
            }else{
                bot.sendMessage(chatId, `Congratulations ${player1.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'}) 
            }
        } else {
            bot.sendMessage(chatId, `${itemDict[j]}\nYour HP is ${player.life}.`, {parse_mode: 'HTML'})
        }
    }
    const itemFunc = (player) => {
        player.item -= 1
        if (player.life === undefined) {
            player.life = 10
        }
        let j = IntRand(0, 6)
        msgItem(player, j)
    }
    // Functions Declaration END //

    //Damage array and Dict Damage
    //Welcome msg and Menu
    const welcome = '/start'
    if (msg.text.indexOf(welcome) === 0) {
        bot.sendMessage(chatId, `Hello,<b> ${msg.from.first_name}!</b>\nWelcome to PokeRand Game\nTap Roll a Dice to start`, mainKeyboard)
    }

    //Roll a dice
    let dice = 'Roll a Dice'
    if (msg.text.indexOf(dice) === 0) {
	    if (match.value === 1) {
		    bot.sendMessage(chatId, `<b>Sorry, ${msg.from.first_name}!</b>\nYou cannot roll a dice while a match is in progress`, {parse_mode: 'html'})                    
	    }else if(match.value === 0){
		    bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)    
	    }else {
            rollDice({player1, player2, match, msg, bot})
	    }
    }
    //Restart
    let restart = 'Restart'
    let adminId = 318475027
    if (msg.text.indexOf(restart) === 0) {
        if (msg.from.id === adminId) {
            restartGame()
        } else if (match.value === 1) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you cannot Restart a game in progress!`)
        } else if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, `${msg.from.first_name}, there is no match happening right now. Please roll a Dice to start!`)
        } else {
            restartGame()
        }
    }
    //Attack
    const atk = 'Attack'
    if (msg.text.indexOf(atk) === 0) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`)
        } else {
            if(match.value === 0){
                bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
            }else{
            		checkAtkTurn(player1, player2)
            }
            //	console.log(`Player 1 Atk: ${player1.turnAtk}`);
            //	console.log(`Player 2 Atk: ${player2.turnAtk}`);
        }
    }
    //Defend
    let def = 'Defend'
    if (msg.text.indexOf(def) === 0) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`)
        } else {
            if(match.value === 0){
                bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
            }else{
            		checkDefTurn(player1, player2)
            }
            // console.log(`Player 1 Def: ${player1.turnDef}`);
            // console.log(`Player 2 Def: ${player2.turnDef}`);
        }
    }
    //Use an Item
    let item = 'Use an Item'
    if (msg.text.indexOf(item) === 0) {
	    if ((player1.id === undefined) || (player2.id === undefined)) {
		    bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
	    } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
		    bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`)
	    } else if(match.value === 0){
		    bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
	    }else{
		    if (msg.from.id === player1.id && player1.turnAtk >= 1) {
			    if (player1.item === 1) {
				    itemFunc(player1)
				    console.log('Player 1 usou item')
			    } else {
				    bot.sendMessage(chatId, `${player1.name}, you've already used an item. You cannot use it twice, in the same match`)
			    }
		    } else if (msg.from.id === player1.id && player1.turnAtk <= 0 && match.value === 1) {
				    bot.sendMessage(chatId, `${player1.name}, you cannot use an item right now. Wait your attack turn!`)
			    }
		    if (msg.from.id === player2.id && player2.turnAtk >= 1) {
			    if (player2.item === 1) {
				    itemFunc(player2)
				    console.log('Player 2 usou item')
			    } else {
				    bot.sendMessage(chatId, `${player2.name}, you've already used an item. You cannot use it twice, in the same match`)
			    }
		    } else if (msg.from.id === player2.id && player2.turnAtk <= 0 && match.value === 1) {
			    bot.sendMessage(chatId, `${player2.name}, you cannot use an item right now. Wait your attack turn!`)
		    }
	    }
    }

}
const Player = {}

//MAIN FUNCTION - START
const main = ({token}) => {
    const bot = new TelegramBot(token, {polling: true})
    let match = {value: undefined}
    let player1 = Object.create(Player)
    let player2 = Object.create(Player)
    bot.on('message', msg => onMessage({msg, bot, match, player1, player2}))
}

exports.main = main
exports.checkPlayer = checkPlayer
exports.Player = Player
exports.rollDice = rollDice
exports.onMessage = onMessage
exports.randNth = randNth
