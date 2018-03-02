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
const HornLeechMsg = ({player,recLvl}) => `${player.name} recovered ${recLvl} HP due to Horn Leech, and now has ${player.life} HP.`
//function's strings end
const welcome = ({msg}) => `Hello,<b> ${msg.from.first_name}!</b>\nWelcome to PokeRand Game\nTap Roll a Dice to start`
const RollDiceInMatch = ({msg}) => `<b>Sorry, ${msg.from.first_name}!</b>\nYou cannot roll a dice while a match is in progress.`
const PlayAloneMsg = ({msg}) => `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`
const pNotInMatch = ({msg}) => `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`
const pNoItem = ({player}) => `${player.name}, you've already used an item. You cannot use it twice, in the same match`
const pNoItemTurn = ({player}) => `${player.name}, you cannot use an item right now. Wait your attack turn!`





module.exports = {
    p3Err, rollDiceMatch, pRollDice, RollDiceAgain, SameRollDice, pFst, restartGame, pWaitAtk, pFainted, pWin, damageMsg, pWaitDef, itemMsg, HornLeechMsg,
    //function's strings end
    welcome, RollDiceInMatch, PlayAloneMsg, pNotInMatch, pNoItem, pNoItemTurn
}
