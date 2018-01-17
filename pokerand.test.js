const sum = (a, b) => ({a, b})

test("fact",
    () => {
        expect(sum(1, 2)).toEqual({a: 1, b: 2})
    }
)
