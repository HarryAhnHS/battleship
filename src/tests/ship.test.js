import Ship from '../ship';

let a;
beforeEach(() => {
    a = new Ship(5);
})

it('Ship takes hit', () => {
    a.hit();
    expect(a.hits).toBe(1);
})


it('Check if ship not sunk', () => {
    a.hit();
    a.hit();
    a.hit();
    a.hit();

    a.checkIsSunk();

    expect(a.isSunk).toBe(false);
})

it('Check if ship sunk', () => {
    a.hit();
    a.hit();
    a.hit();
    a.hit();
    a.hit();

    a.checkIsSunk();

    expect(a.isSunk).toBe(true);
})