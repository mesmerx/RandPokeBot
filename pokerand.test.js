const sum = (a, b) => ({a, b})

const mock_msg = {"message_id":7205,"from":{"id":116632598,"is_bot":false,"first_name":"Enzzo","username":"souenzzo","language_code":"en"},"chat":{"id":-209063185,"title":"RandPokeBot - Project Lab","type":"group","all_members_are_administrators":true},"date":1516237642,"reply_to_message":{"message_id":7164,"from":{"id":458733904,"is_bot":true,"first_name":"PokeRand Games","username":"Bertinnnbot"},"chat":{"id":-209063185,"title":"RandPokeBot - Project Lab","type":"group","all_members_are_administrators":true},"date":1516237493,"text":"Hello, Enzzo!\nWelcome to PokeRand Game\nTap Roll a Dice to start","entities":[{"offset":6,"length":7,"type":"bold"}]},"text":"Attack"}


test("fact",
    () => {
        expect(sum(1, 2)).toEqual({a: 1, b: 2})
    }
)
