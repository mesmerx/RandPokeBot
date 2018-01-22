const math = require("mathjs")
const fs = require("fs")
const TelegramBot = require("node-telegram-bot-api")

const arrayDano = ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "3", "3", "3", "4", "4", "6", "0", "0", "0", "0", "0", "0", "0", "0", "5", "5", "7", "7"]
const dictDano = {
    0: ["Your opponent missed the attack!"],
    1: ["It was effective! You lose 1 HP."],
    2: ["It was effective! <b>CRITICAL HIT!</b> You lose 2 HP."],
    3: ["It was ultra effective! You lose 3 HP."],
    4: ["It was super effective! <b>CRITICAL HIT!</b> You lose 4 HP."],
    5: ["It was effective! You lose 1 HP. You flinched! Opponent attacks again."],
    6: ["It was ultra effective! <b>CRITICAL HIT!</b> You lose 6 HP."],
    7: ["COUNTER! You take no damage and have an extra attack!"],
}
//Dict item
const itemDict = {
    0: ["You found nothing!"],
    1: ["You found a Potion and recovered 1 HP!"],
    2: ["You found a Super Potion and recovered 2 HP!"],
    3: ["You found a Hyper Potion and recovered 3 HP!"],
    4: ["You found a Flame Orb and lost 3 HP."],
    5: ["You found a Quick Claw and can attack twice!"],
}


const mainKeyboard = {
    reply_markup: {
        keyboard: [
            ["Attack", "Defend"],
            ["Use an Item", "Roll a Dice"],
            ["Restart"],
        ]
    }, parse_mode: "HTML",
}

const IntRand = (x, y) => math.randomInt(x, y)

const checkPlayer = (msg, player1, player2, bot) => {
    let chatId = msg.chat.id
    if (player1.id === undefined) {
        player1.id = msg.from.id
        player1.name = msg.from.first_name
        console.log(`Player 1 = ${player1.name} , ID = ${player1.id}`)
    } else if (player2.id === undefined && player1.id !== msg.from.id) {
        player2.id = msg.from.id
        player2.name = msg.from.first_name
        console.log(`Player 2 = ${player2.name} , ID = ${player2.id}`)
    } else if ((msg.from.id !== player1.id) && (msg.from.id !== player2.id)) {
        bot.sendMessage(chatId, "There are already two players in the game. Please, wait until the current match is over!")
    }
}

const rollDice = ({msg, player1, player2, bot}) => {
    let chatId = msg.chat.id
    checkPlayer(msg, player1, player2, bot)
    if (player1.id === msg.from.id) {
        bot.sendMessage(chatId, `Player 1 = ${player1.name} , <pre>You got: ${IntRand(1, 21)} </pre>`, {parse_mode: "HTML"})
    } else if (player2.id === msg.from.id) {
        bot.sendMessage(chatId, `Player 2 = ${player2.name} , <pre>You got: ${IntRand(1, 21)} </pre>`, {parse_mode: "HTML"})
    }
}

const restartGame = (msg, player1, player2, bot) => {
    let chatId = msg.chat.id
    player1.life = 10
    player1.id = undefined
    player1.item = 1
    player2.life = 10
    player2.id = undefined
    player2.item = 1
    bot.sendMessage(chatId, "Game restarted! Please ROLL A DICE.")
}

const writeRank = (player1, player2) => {
    if (player1.life <= 0) {
        fs.writeFile("rank.txt", `${player2.name}\n`, {flag: "a"}, function (err) {
            if (err) throw err
        })
    } else if (player2.life <= 0) {
        fs.writeFile("rank.txt", `${player1.name}\n`, {flag: "a"}, function (err) {
            if (err) throw err
        })
    }
}

const randAttack = (msg, bot) => {
    let chatId = msg.chat.id
    fs.readFile("fileId.txt", function (err, data) {
        if (err) throw err
        let lines = data.toString().split("\n")
        let randLine = lines[math.floor(math.random() * lines.length)]
        bot.sendDocument(chatId, randLine)
    })
}

const msgDef = (player, x, bot, msg) => {
    let chatId = msg.chat.id
    if (x === 5) {
        player.dano = 1
    }
    else if (x === 7) {
        player.dano = 0
    }
    else {
        player.dano = x
    }
    player.life = player.life - player.dano
    if (player.life <= 0) {
        console.log(`${player.name} FAINTED`)
        bot.sendMessage(chatId, `${player.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>`, {parse_mode: "HTML"})
    } else {
        bot.sendMessage(chatId, ` ${dictDano[x]}\n${player.name} has ${player.life} HP!`, {parse_mode: "HTML"})
    }
}

const defFunc = (player) => {
    const n = IntRand(0, 37)
    IntRand(0, 37, arrayDano[n])
    let x = parseInt(arrayDano[n])
    if (player.life === undefined) {
        player.life = 10
    }
    console.log(`x = ${x}`)
    msgDef(player, x)
}

const msgItem = (msg, bot, player, j) => {
    let chatId = msg.chat.id
    if (j === 4) {
        player.life -= 3
    }
    else if (j === 0 || j === 5) {
        player.life += 0
    } else {
        player.life += j
    }
    if (player.life <= 0) {
        console.log(`${player.name} FAINTED`)
        bot.sendMessage(chatId, `${itemDict[j]}\n${player.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>`, {parse_mode: "HTML"})
    } else {
        bot.sendMessage(chatId, `${itemDict[j]}\nYour HP is ${player.life}.`, {parse_mode: "HTML"})
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

const menuStart = ({msg, bot}) => {
    let chatId = msg.chat.id
    return bot.sendMessage(chatId, `Hello,<b> ${msg.from.first_name}!</b>\nWelcome to PokeRand Game\nTap Roll a Dice to start`, mainKeyboard)
}

const menuRestart = ({msg, bot, player1, player2}) => {
    let adminId = 318475027
    let chatId = msg.chat.id
    if (msg.from.id === adminId) {
        restartGame(msg, player1, player2, bot)
    } else if ((player1.life >= 1) && (player2.life >= 1) && !(player1.id === undefined)) {
        bot.sendMessage(chatId, `${msg.from.first_name}, you cannot Restart a game in progress!`)
    } else if ((player1.id === undefined) || (player2.id === undefined)) {
        bot.sendMessage(chatId, `${msg.from.first_name}, there is no match happening right now. Please roll a Dice to start!`)
    } else {
        restartGame(msg, player1, player2, bot)
    }
}

const menuAttack = ({msg, bot, player1, player2}) => {
    let chatId = msg.chat.id
    if ((player1.id === undefined) || (player2.id === undefined)) {
        bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
    } else {
        checkPlayer(msg, player1, player2, bot)
        if ((msg.from.id === player1.id) || (msg.from.id === player2.id)) {
            randAttack()
        }
    }
}

const menuDeffend = ({msg, bot, player1, player2}) => {
    let chatId = msg.chat.id
    if ((player1.id === undefined) || (player2.id === undefined)) {
        bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
    } else {
        if (msg.from.id === player1.id) {
            defFunc(player1)
            writeRank(player1.life, player2.life)
            console.log(`Player 1: ${player1.name} executou Defend. HP atual: ${player1.life}`)
        } else if (msg.from.id === player2.id) {
            defFunc(player2)
            writeRank(player1.life, player2.life)
            console.log(`Player 2: ${player2.name} executou Defend. HP atual: ${player2.life}`)
        } else {
            bot.sendMessage(chatId, `${msg.from.first_name}, you"re not playing. Please wait, until the current match is over!`)
        }
    }
}

const menuUseItem = ({msg, bot, player1, player2}) => {
    let chatId = msg.chat.id
    if ((player1.id === undefined) || (player2.id === undefined)) {
        bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`)
    } else {
        if (msg.from.id === player1.id) {
            if (player1.item === 1) {
                itemFunc(player1)
                console.log("Player 1 usou item")
            } else {
                bot.sendMessage(chatId, `${msg.from.first_name}, you"ve already used an item. You cannot use it twice, in the same match`)
            }
        } else if (msg.from.id === player2.id) {
            if (player2.item === 1) {
                itemFunc(player2)
                console.log("Player 2 usou item")
            } else {
                bot.sendMessage(chatId, `${msg.from.first_name}, you"ve already used an item. You cannot use it twice, in the same match`)
            }
        } else {
            bot.sendMessage(chatId, `${msg.from.first_name}, you"re not playing. Please wait, until the current match is over!`)
        }
    }
}


const main = ({token}) => {
    const bot = new TelegramBot(token, {polling: true})
    const Player = {}
    let player1 = Object.create(Player)
    let player2 = Object.create(Player)
    //  MAIN FUNCTION - START
    bot.on("message", (msg) => {
        console.log(JSON.stringify(msg))
        //Welcome msg and Menu
        const welcome = "/start"
        if (msg.text.indexOf(welcome) === 0) {
            menuStart({msg, bot})
        }
        //Roll a dice
        let dice = "Roll a Dice"
        if (msg.text.indexOf(dice) === 0) {
            rollDice({msg, player1, player2, bot})
        }
        //Restart
        let restart = "Restart"
        if (msg.text.indexOf(restart) === 0) {
            menuRestart({msg, bot, player1, player2})
        }
        //Attack
        const atk = "Attack"
        if (msg.text.indexOf(atk) === 0) {
            menuAttack({msg, bot, player1, player2})
        }
        //Defend
        let def = "Defend"
        if (msg.text.indexOf(def) === 0) {
            menuDeffend({msg, bot, player1, player2})
        }
        //Use an Item
        let item = "Use an Item"
        if (msg.text.indexOf(item) === 0) {
            menuUseItem({msg, bot, player1, player2})
        }
    })
}

exports.main = main
