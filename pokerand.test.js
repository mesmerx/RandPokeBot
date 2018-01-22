const {checkPlayer, Player} = require('./pokerand')

// const mock_msg = {"message_id":7205,"from":{"id":116632598,"is_bot":false,"first_name":"Enzzo","username":"souenzzo","language_code":"en"},"chat":{"id":-209063185,"title":"RandPokeBot - Project Lab","type":"group","all_members_are_administrators":true},"date":1516237642,"reply_to_message":{"message_id":7164,"from":{"id":458733904,"is_bot":true,"first_name":"PokeRand Games","username":"Bertinnnbot"},"chat":{"id":-209063185,"title":"RandPokeBot - Project Lab","type":"group","all_members_are_administrators":true},"date":1516237493,"text":"Hello, Enzzo!\nWelcome to PokeRand Game\nTap Roll a Dice to start","entities":[{"offset":6,"length":7,"type":"bold"}]},"text":"Attack"}


test('checkPlayer - primeiro player entra',
    () => {
        const player1 = Object.create(Player)
        const player2 = Object.create(Player)
        const msg = {from: {id: 123, first_name: 'Tester'}, chat: {id: 123}}
        const bot = {}
        checkPlayer({player1, player2, msg, bot})
        expect(player1).toEqual({id: 123, name: 'Tester'})
        expect(player2).toEqual({})
    }
)

test('checkPlayer - segundo jogador entra',
    () => {
        const player1 = Object.create(Player)
        const player2 = Object.create(Player)
        const msg1 = {from: {id: 123, first_name: 'Tester 1'}, chat: {id: 123}}
        const msg2 = {from: {id: 321, first_name: 'Tester 2'}, chat: {id: 123}}
        const bot = {chat: {id: 0}}
        // jogador 1 entra
        checkPlayer({player1, player2, msg: msg1, bot})
        // jogador 2 entra
        checkPlayer({player1, player2, msg: msg2, bot})
        expect(player1).toEqual({id: 123, name: 'Tester 1'})
        expect(player2).toEqual({id: 321, name: 'Tester 2'})
    }
)

test('checkPlayer - terceiro jogador TENTA entrar',
    () => {
        const player1 = Object.create(Player)
        const player2 = Object.create(Player)
        const msg1 = {from: {id: 123, first_name: 'Tester 1'}, chat: {id: 123}}
        const msg2 = {from: {id: 321, first_name: 'Tester 2'}, chat: {id: 123}}
        const msg3 = {from: {id: 333, first_name: 'Tester 3'}, chat: {id: 123}}
        let botState = []
        const bot = {chat: {id: 0}, sendMessage: (id, msg) => botState.push({id, msg})}
        // jogador 1 entra
        checkPlayer({player1, player2, msg: msg1, bot})
        // jogador 2 entra
        checkPlayer({player1, player2, msg: msg2, bot})
        // jogador 3 tenta entrar
        checkPlayer({player1, player2, msg: msg3, bot})
        expect(player1).toEqual({id: 123, name: 'Tester 1'})
        expect(player2).toEqual({id: 321, name: 'Tester 2'})
        expect(botState).toEqual([{
            id: 123,
            msg: 'There are already two players in the game. Please, wait until the current match is over!'
        }])
    }
)
