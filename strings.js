const p3Err = 'There are already two players in the game. Please, wait until the current match is over!'
const rollDiceMatch = ({msg}) => `<b>Sorry, ${msg.from.first_name}!</b>\nYou cannot roll a dice while a match is in progress`
const pRollDice = ({player}) => `Player ${player.p} = ${player.name} , <pre>You got: ${player.num} </pre>`
const RollDiceAgain = ({player}) => `${player.name}, you cannot roll a dice again. Wait for another player!`
const SameRollDice = 'Players got the same result. Please roll a dice again!'
const pFst = ({player}) =>`${player.name} will attack first!`
const restartGame = 'Game restarted! Please ROLL A DICE.'
const pWaitAtk = ({player}) => `${player.name}, wait for your turn to attack!`
const pFainted = ({player}) => `${player.name} <b>FAINTED!</b>`
const pWin = ({player}) => `Congratulations ${player.name}, <b>YOU WIN!</b>`
const damageMsg = ({player}) => `\n${player.name} has ${player.life} HP!`
const pWaitDef = ({player}) => `${player.name}, wait for your turn to defend!`
const itemMsg = ({player}) => `\nYour HP is ${player.life}.`
//function's strings ends
const welcome = ({msg}) => `Hello,<b> ${msg.from.first_name}!</b>\nWelcome to PokeRand Game\nTap Roll a Dice to start`
const RollDiceInMatch = ({msg}) => `<b>Sorry, ${msg.from.first_name}!</b>\nYou cannot roll a dice while a match is in progress.`
const PlayAloneMsg = ({msg}) => `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`
const pNotInMatch = ({msg}) => `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`
const pNoItem = ({player}) => `${player.name}, you've already used an item. You cannot use it twice, in the same match`
const pNoItemTurn = ({player}) => `${player.name}, you cannot use an item right now. Wait your attack turn!`





exports.p3Err = p3Err
exports.rollDiceMatch = rollDiceMatch
exports.pRollDice = pRollDice
exports.RollDiceAgain = RollDiceAgain
exports.SameRollDice = SameRollDice
exports.pFst = pFst
exports.restartGame = restartGame
exports.pWaitAtk = pWaitAtk
exports.pFainted = pFainted
exports.pWin = pWin
exports.damageMsg = damageMsg
exports.pWaitDef = pWaitDef
exports.itemMsg = itemMsg
//function's strings ends
exports.welcome = welcome
exports.RollDiceInMatch = RollDiceInMatch
exports.PlayAloneMsg = PlayAloneMsg
exports.pNotInMatch = pNotInMatch
exports.pNoItem = pNoItem
exports.pNoItemTurn = pNoItemTurn
