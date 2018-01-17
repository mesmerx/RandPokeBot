const math = require('mathjs');
const fs = require('fs');
const TelegramBot = require ('node-telegram-bot-api');

const url = 'https://api.telegram.org/bot';
const TOKEN = ('458733904:AAH-Fq8ABp5xVpLHf32uxKAbP-nMCLf4mgU');

const bot = new TelegramBot( TOKEN, { polling: true } );

const Player={};
let player1 = Object.create(Player);
let player2 = Object.create(Player);

//MAIN FUNCTION - START
bot.on('message', (msg) => {
	let chatId = msg.chat.id;


const mainKeyboard = {
      reply_markup: {
        keyboard: [
          ['Attack','Defend'],
          ['Use an Item','Roll a Dice'],
          ['Restart'],
        ]
      }, parse_mode: 'HTML',
}
// Functions Declaration - START //
const IntRand  = () => {
	n = math.randomInt(1 , 11);
	return n;
}
const IntRandDano  = () => {
          n = math.randomInt(0, 37);
          return n;
}
const IntRandItem  = () => {
          n = math.randomInt(0, 6);
          return n;
}
const checkPlayer = () => {
 if(player1.id === undefined){
	player1.id = msg.from.id;
	player1.name = msg.from.first_name;
	console.log(`Player 1 = ${player1.name} , ID = ${player1.id}`);
} else if (player2.id === undefined && player1.id !== msg.from.id){
	player2.id = msg.from.id;
	player2.name = msg.from.first_name;
	console.log(`Player 2 = ${player2.name} , ID = ${player2.id}`);
}else if((msg.from.id !== player1.id) && (msg.from.id !== player2.id)){
	bot.sendMessage(chatId, 'There are already two players in the game. Please, wait until the current match is over!');
}
}
const rollDice = () => {
        checkPlayer(player1.id,player1.name,player2.id,player2.name);
	if(player1.id === msg.from.id){
	bot.sendMessage(chatId , `Player 1 = ${player1.name} , <pre>You got: ${IntRand()} </pre>`, {parse_mode: 'HTML'});
}else if (player2.id === msg.from.id){
        bot.sendMessage(chatId , `Player 2 = ${player2.name} , <pre>You got: ${IntRand()} </pre>`, {parse_mode: 'HTML'});
}
}
const restartGame = () => {
  player1.life = 10;
  player1.id = undefined;
  player1.item = 1;
  player2.life = 10;  
  player2.id = undefined;
  player2.item = 1;
  bot.sendMessage (chatId, 'Game restarted! Please ROLL A DICE.');
}
const writeRank = () => {
  if(player1.life <= 0){
     fs.writeFile('rank.txt' , `${player2.name}\n` ,{ flag: "a" } , function(err){
  if(err) throw err;                          
  });
  }else if(player2.life <= 0){
     fs.writeFile('rank.txt' , `${player1.name}\n` ,{ flag: "a" } , function(err){
  if(err) throw err; 
  });
  }
}
//Attack Function
const randAttack = () => {                    
 fs.readFile('fileId.txt', function(err, data){
   if(err) throw err;  
     let lines = data.toString().split('\n');  
     let randLine = lines[math.floor(math.random()*lines.length)];            
bot.sendDocument(chatId, randLine);  
});     
}

//Function Def - Player 11121

const msgchat = (player,x) => {
    console.log(player,x)
        if (x==5){
        player.dano=1}
    else if(x==7){
        player.dano=0
    }
    else{
       	player.dano = x;
    }
   	player.life = player.life - player.dano;
   	if(player.life <= 0) {
     	    console.log(`${player.name} FAINTED`);
     	    bot.sendMessage(chatId, `${player.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>` , { parse_mode: 'HTML'});
        }else{
    	    bot.sendMessage(chatId,` ${dictDano[x]}\n${player.name} has ${player.life} HP!` ,{parse_mode: 'HTML'});
   }
	

}

const defp = (player) => {
   IntRandDano(arrayDano[n]);
   let x = parseInt(arrayDano[n]);
   if (player.life==undefined){
	player.life=10;
   }
    console.log(player,x)
    msgchat(player,x)
}

//Item Function - Player 1
const item1 = () => {
	player1.item -= 1;
	let j = IntRandItem();
	switch (j) {
		case 1:
		case 2:
		case 3:
	  player1.life = player1.life + j;
          bot.sendMessage(chatId, `${itemDict[j]}\nCongratulations, your HP is ${player1.life}.`, {parse_mode: 'HTML'});
		break;
		case 4:
	  player1.life = player1.life - 3;
          if(player1.life <= 0) {
	     console.log(`${player1.name} FAINTED`);
    	     bot.sendMessage(chatId, `${itemDict[j]}\n${player1.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>` , { parse_mode: 'HTML'});
   }else{
          bot.sendMessage(chatId, `${itemDict[j]}\nDamn! Your HP is ${player1.life}.`, {parse_mode: 'HTML'});
   }
		break;
		case 0:
		case 5:
          bot.sendMessage(chatId, `${itemDict[j]}`, {parse_mode: 'HTML'});	
		break;
	}
}
//Function Item - Player 2
const item2 = () => {
	player2.item -= 1;
	let j = IntRandItem();
	switch (j) {
		case 1:
		case 2:
		case 3:
	  player2.life = player2.life + j;
          bot.sendMessage(chatId, `${itemDict[j]}\nCongratulations, your HP is ${player2.life}.`, {parse_mode: 'HTML'});
		break;
		case 4:
	  player2.life = player2.life - 3;
          if(player2.life <= 0) {
	     console.log(`${player2.name} FAINTED`);
    	     bot.sendMessage(chatId, `${itemDict[j]}\n${player2.name} <b>FAINTED!</b>\n<pre>Tap Restart.</pre>` , { parse_mode: 'HTML'});
   }else{
          bot.sendMessage(chatId, `${itemDict[j]}\nDamn! Your HP is ${player2.life}.`, {parse_mode: 'HTML'});
   }
		break;
		case 0:
		case 5:
          bot.sendMessage(chatId, `${itemDict[j]}`, {parse_mode: 'HTML'});	
		break;
	}
}
// Functions Declaration END //

//Damage array and Dict Damage
let arrayDano = ['1','1','1','1','1','1','1','1','1','1','2','2','2','2','2','2','2','2','2','2','3','3','3','4','4','6','0','0','0','0','0','0','0','0','5','5','7','7'];                                
let dictDano = {                              
0: ['Your opponent missed the attack!'],      
1: ['It was effective! You lose 1 HP.'],     
2: ['It was effective! <b>CRITICAL HIT!</b> You lose 2 HP.'],                              
3:['It was ultra effective! You lose 3 HP.'],
4:['It was super effective! <b>CRITICAL HIT!</b> You lose 4 HP.'],
5:['It was effective! You lose 1 HP. You flinched! Opponent attacks again.'],
6:['It was ultra effective! <b>CRITICAL HIT!</b> You lose 6 HP.'],
7:['COUNTER! You take no damage and have an extra attack!'],
};
//Dict item
let itemDict = { 
0:['You found nothing!'], 
1:['You found a Potion and recovered 1 HP!'],
2:['You found a Super Potion and recovered 2 HP!'],
3:['You found a Hyper Potion and recovered 3 HP!'],
4:['You found a Flame Orb and lost 3 HP.'],
5:['You found a Quick Claw and can attack twice!'],
};

//Welcome msg and Menu
const welcome = '/start';
if(msg.text.indexOf(welcome) === 0){
    bot.sendMessage (chatId , `Hello,<b> ${msg.from.first_name}!</b>\nWelcome to PokeRand Game\nTap Roll a Dice to start` ,mainKeyboard );
}

//Roll a dice
let dice = "Roll a Dice";
if (msg.text.indexOf(dice) === 0){
	rollDice();
}

//Restart
let restart = "Restart";
let adminId = 318475027;
if (msg.text.indexOf(restart) === 0){
	if(msg.from.id === adminId){
		restartGame();
	}else if((player1.life >= 1) && (player2.life >=1) && !(player1.id === undefined)){
   bot.sendMessage(chatId, `${msg.from.first_name}, you cannot Restart a game in progress!`);
}else if((player1.id === undefined) || (player2.id === undefined)){
       bot.sendMessage(chatId, `${msg.from.first_name}, there is no match happening right now. Please roll a Dice to start!`);
	}else{
	restartGame();
}
}
//Attack	
const atk = "Attack"; 
if (msg.text.indexOf(atk) === 0) {
if((player1.id === undefined) || (player2.id === undefined)){
	bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`);
}else{
  checkPlayer(player1.id,player1.name,player2.id,player2.name);
  if((msg.from.id === player1.id) || (msg.from.id === player2.id)){
	  randAttack();
	}
}
}
//Defend
let def = "Defend"; 
if (msg.text.indexOf(def) === 0) {
if((player1.id === undefined) || (player2.id === undefined)){
	bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`);
}else{
	if (msg.from.id === player1.id){
	   defp(player1);
	   writeRank(player1.life,player2.life);
	   console.log(`Player 1: ${player1.name} executou Defend. HP atual: ${player1.life}`);
	}else if (msg.from.id === player2.id){
	   defp(player2);
	   writeRank(player1.life,player2.life);
	   console.log(`Player 2: ${player2.name} executou Defend. HP atual: ${player2.life}`);
	}else{
		bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`);
}
}
}
//Use an Item
let item = "Use an Item";
if(msg.text.indexOf(item) === 0){
if((player1.id === undefined) || (player2.id === undefined)){
	bot.sendMessage(chatId, `${msg.from.first_name}, you cannot play alone. Please, call a friend to join the game!`);
}else{
  if (msg.from.id === player1.id){
          if(player1.item === 1){
	    item1();
	    console.log(`Player 1 usou item`);
	  }else{		
	    bot.sendMessage(chatId, `${msg.from.first_name}, you've already used an item. You cannot use it twice, in the same match`);
	  }
  }else if(msg.from.id === player2.id){
             if(player2.item === 1){
	       item2();
	       console.log(`Player 2 usou item`);
	     }else{
	    bot.sendMessage(chatId, `${msg.from.first_name}, you've already used an item. You cannot use it twice, in the same match`);
	     }
 }else{
     bot.sendMessage(chatId, `${msg.from.first_name}, you're not playing. Please wait, until the current match is over!`);
	}
}
}
});//MAIN FUNCTION - END
