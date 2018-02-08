const math = require('mathjs')
const fs = require('fs')
const naturalSort = require('node-natural-sort')
const TelegramBot = require('node-telegram-bot-api')

const mainKeyboard = {
    reply_markup: {
        keyboard: [
            ['\u2694 Attack', '\ud83d\udee1 Defend'],
            ['\ud83c\udf81 Use an Item', 
								    '\ud83c\udfb2 Roll a Dice'],
								    ['\ud83c\udfc6 Ranking'],        
            ['\ud83d\udd04 Restart'],
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

const dictAttack = {

    0: ['Typhlosion used Flamethrower'],
    1: ['Breloom used Energy Ball'],
    2: ['Noctowl used Fly'],
    3: ['Hydreigon used Tri-Attack'],
    4: ['Shedinja used Confuse Ray'],
    5: ['Cinccino used Tail Slap'],
    6: ['Leavanny used Razor Leaf'],
    7: ['Electrode used Explosion'],
    8: ['Vulpix and Ninetales used Flamethrower'],
    9: ['Eevee used Iron Tail'],
    10: ['Gallade used Close Combat'],
    11: ['Articuno used Ice Beam'],
    12: ['Glaceon used Blizzard'],
    13: ['Greninja used Water Shuriken'],
    14: ['Milotic used Water Pulse'],
    15: ['Marowak used Bonemerang'],
    16: ['Alakazam used Telekinesis'],
    17: ['Glameow used Shadow Claw'],
    18: ['Buizel used Water Pulse'],
    19: ['Pikachu used Volt Tackle'],
    20: ['Eevee used Trump Card'],
    21: ['Garbodor used Acid Spray'],
    22: ['Gyarados used Hyper Beam'],
    23: ['Eevee used Quick Attack'],
    24: ['Keldeo used Water Gun'],
    25: ['Vaporeon used Bubble'],
    26: ['Mewtwo used Swift'],
    27: ['Mewtwo used Shadow Ball'],
    28: ['Machamp used Brick Break'],
    29: ['Rayquaza used Ice Beam'],
    30: ['Pikachu used Quick Attack'],
    31: ['Lucario used Bone Rush'],
    32: ['Bulbasaur used Solar Beam'],
    33: ['Lucario used Metal Claw'],
    34: ['Rayquaza used Hyper Beam'],
    35: ['Volcanion used Steam Eruption'],
    36: ['Deoxys used Psycho Boost'],
    37: ['Slugma, Rapidash, Magmortar and Heatran used Flamethrower'],
    38: ['Rayquaza used Dragon Ascent'],
    39: ['Pikachu used Electric Ball'],
    40: ['Groudon used Hyper Beam'],
    41: ['Mega Charizard X used Dragon Claw'],
    42: ['Pikachu used Quick Attack'],
    43: ['Clefairy used Metronome'],
    44: ['Dewgong used Aurora Beam'],
    45: ['Magearna used Fleur Cannon'],
    46: ['Giratina used Stomp'],
    47: ['Magikarp used Splash'],
    48: ['Scizor used Metal Claw'],
    49: ['Charizard used Heat Wave'],
    50: ['Liepard used Shadow Ball'],
    51: ['Bisharp used Iron Head'],
    52: ['Golem used Rollout'],
    53: ['Gengar used Hypnosis'],
    54: ['Bayleef used Vine Whip'],
    55: ['Mightyena used Shadow Ball'],
    56: ['Ninetales used Fire Blast'],
    57: ['Mandibuzz used Shadow Ball'],
    58: ['Charizard used Flamethrower'],
    59: ['Espeon used Hidden Power'],
    60: ['Arceus used Hyper Beam'],
    61: ['Blastoise used Hydro Pump'],
    62: ['Mega Charizard X used Fire Blast'],
    63: ['Hoopa used Hyperspace Hole'],
    64: ['Scyther used Fury Cutter'],
    65: ['Greninja used Water Shuriken'],
    66: ['Lucario used Swords Dance'],
    67: ['Articuno used Ice Beam'],
    68: ['Mr. Mime used Reflect'],
    69: ['Moltres used Flamethrower'],
    70: ['Greninja used Double Team'],
    71: ['Beedril used Twineedle'],
    72: ['Serperior used Dragon Tail'],
    73: ['Mew used Psycho Boost'],
    74: ['Hydreigon used Ice Beam'],
    75: ['Gengar used Hyper Beam'],
    76: ['Jolteon used Thunderbolt'],
    77: ['Lucario used Aura Sphere'],
    78: ['Infernape used Flare Blitz'],
    79: ['Landorus used Extrasensory'],
    80: ['Gliscor used X-Scissor'],
    81: ['Venusaur used Razor Leaf'],
    82: ['Noivern used Air Slash'],
    83: ['Galvantula used Electro Web'],
    84: ['Yanmega used Sonic Boom'],
    85: ['Sawsbuck used Horn Leech'],
    86: ['Dragonite used Hyper Beam'],
    87: ['Flygon used Aerial Ace'],
    88: ['Chimecho used Uproar'],
    89: ['Nidoking used Thunderbolt'],
 
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
        } else if (player2.id === msg.from.id) {
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

    //Rank Function 
    const writeRank = (player) => {            
        fs.readFile('rank.txt', function(err, data){
            if(err) throw err 
            let user = player.name
								    let hp = player.life
								    let id = player.id
            let reg = '[0-9]?([0-9])?([0-9])'
            let arr = data.toString().split('\n')
            if(arr.toString().match(`(${id})`)){
								     if(arr.toString().match(user)){
																    user = new RegExp(`${reg}: ${user}`, 'g')
                    let a = arr.toString().match(user)
                    a = a.toString().split('[').join('')
                    let n = a.replace(/\d+/, function(n){return hp+parseInt(n) })
                
                    let result = data.toString().replace(user,n)
                    fs.writeFile('rank.txt', result, function (err) {
                        if (err) return console.log(err)
                    });
                }else{
                    console.log(`user ${id} trocou nome para ${user}`)
                }
            }else{
                fs.appendFile('rank.txt', `${player.life}: ${player.name} (${player.id})\n`, function (err) {
                    if (err) return console.log(err)
                });
            }
        });
    }
    const showRank = () => {
        fs.readFile('rank.txt', function(err,data){
            let arr = data.toString().split('\n')
								    arr = arr.sort(naturalSort({order: 'DESC'}))
								    let str = ''
								    let score, name;
								    
								    for(let i=0;i<arr.length-1;i++){
                if(i === 0){
																  name = `\ud83e\udd47 ${arr[0].match(/[A-z√Å-√ ]+/)}`
																  score = arr[0].match(/\d+/)
																  str = `${str}${name} : <b>${score}</b>\n`
                }else if(i === 1){
																  name = `\ud83e\udd48 ${arr[1].match(/[A-z√Å-√ ]+/)}`

																  score = arr[1].match(/\d+/)
															   str = `${str}${name} : <b>${score}</b>\n`  
                }else if(i === 2){
																  name = `\ud83e\udd49 ${arr[2].match(/[A-z√Å-√ ]+/)}`

																  score = arr[2].match(/\d+/)
																  str = `${str}${name} : <b>${score}</b>\n`
                }else{
                    score = arr[i].match(/\d+/)
                    name = ` ${i+1}. ${arr[i].match(/[A-z√Å-√ ]+/)}`
                    str = `${str}${name} : <b>${score}</b>\n`
                } 
            }
								    
								    bot.sendMessage(chatId, `${str}`,{parse_mode: 'html'})
        });
    }    
    //Attack Function
    const randAttack = () => {
        fs.readFile('fileId.txt', function (err, data) {
            let lines = data.toString().split('\n')
            let max = lines.length - 2
            let randLine = lines[math.floor(math.random() * max)]
            let i = lines.indexOf(randLine)
            bot.sendDocument(chatId, randLine, {caption: `${dictAttack[i]}`})
            if (err) throw err
        })
    }

    const checkAtkTurn = (player1, player2) => {
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
            } else {
                player2.turnAtk++
                player1.turnAtk--
            }
        } else {
            player.dano = x
        }
        player.life = player.life - player.dano
        if (player.life <= 0) {
            match.value = 0
            console.log(`${player.name} FAINTED`)
            bot.sendMessage(chatId, `${player.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>`, {parse_mode: 'HTML'})
            if (player.id === player1.id) {
                bot.sendMessage(chatId, `Congratulations ${player2.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'})
                writeRank(player2)
            } else {
                bot.sendMessage(chatId, `Congratulations ${player1.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'})
                writeRank(player1)
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
            if (player.id === player1.id) {
                bot.sendMessage(chatId, `Congratulations ${player2.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'})
                writeRank(player2)
            } else {
                bot.sendMessage(chatId, `Congratulations ${player1.name}, <b>YOU WIN!</b>`, {parse_mode: 'HTML'})
                writeRank(player1)
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
    const welcome2= '/start@Bertinnnbot'
    if (msg.text === welcome || msg.text === welcome2) {
        bot.sendMessage(chatId, `Hello,<b> ${msg.from.first_name}!</b>\nWelcome to PokeRand Game\nTap Roll a Dice to start`, mainKeyboard)
    }
    //Ranking
    const ranking = '\ud83c\udfc6 Ranking'
    if (msg.text === ranking) {
        showRank();
    }   
    //Roll a dice
    let dice = '\ud83c\udfb2 Roll a Dice'
    if (msg.text === dice) {
        if (match.value === 1) {
            bot.sendMessage(chatId, `<b>Sorry, ${msg.from.first_name}!</b>\nYou cannot roll a dice while a match is in progress`, {parse_mode: 'html'})
        } else if (match.value === 0) {
            bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
        } else {
            rollDice({player1, player2, match, msg, bot})
        }
    }
    //Restart
    let restart = '\ud83d\udd04 Restart'
    let adminId = 318475027
    if (msg.text === restart) {
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
    const atk = '\u2694 Attack'
    if (msg.text === atk) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`)
        } else {
            if (match.value === 0) {
                bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
            } else {
                checkAtkTurn(player1,player2)
            }
            
            //	console.log(`Player 1 Atk: ${player1.turnAtk}`);
            //	console.log(`Player 2 Atk: ${player2.turnAtk}`);
        }
    }
    //Defend
    let def = '\ud83d\udee1 Defend'
    if (msg.text === def) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`)
        } else {
            if (match.value === 0) {
                bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
            } else {
                checkDefTurn(player1, player2)
            }
            // console.log(`Player 1 Def: ${player1.turnDef}`);
            // console.log(`Player 2 Def: ${player2.turnDef}`);
        }
    }
    //Use an Item
    let item = '\ud83c\udf81 Use an Item'
    if (msg.text === item) {
        if ((player1.id === undefined) || (player2.id === undefined)) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
        } else if (msg.from.id !== player1.id && msg.from.id !== player2.id) {
            bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`)
        } else if (match.value === 0) {
            bot.sendMessage(chatId, `${msg.from.first_name}, the match has over. Tap Restart.`)
        } else {
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
