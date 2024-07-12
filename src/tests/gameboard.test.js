import Ship from '../ship';
import Gameboard from '../gameboard';

let gb;
let vessel;
let boat;

beforeEach(() => {
    gb = new Gameboard();
    vessel = new Ship(5);
    boat = new Ship(2);
})

it('create initial gameboard size', () => {
    expect(gb.grids.length).toBe(100);
})

it('initial gameboard to be filled false', () => {
    let empty = [];
    for (let i = 0; i < 100; i++) {
        empty.push(null);
    }
    expect(gb.grids).toEqual(empty);
})

it('place ship in gameboard', () => {
    gb.placeShip(vessel, [4,5,6,7,8]);
    expect(gb.grids[4]).toBe(vessel);
    expect(gb.grids[5]).toBe(vessel);
    expect(gb.grids[6]).toBe(vessel);
    expect(gb.grids[7]).toBe(vessel);
    expect(gb.grids[8]).toBe(vessel);
})

it('place multiple ships in gameboard', () => {
    gb.placeShip(vessel, [4,5,6,7,8]);
    gb.placeShip(boat, [1,2]);
    expect(gb.grids[4]).toBe(vessel);
    expect(gb.grids[5]).toBe(vessel);
    expect(gb.grids[6]).toBe(vessel);
    expect(gb.grids[7]).toBe(vessel);
    expect(gb.grids[8]).toBe(vessel);

    expect(gb.grids[1]).toBe(boat);
    expect(gb.grids[2]).toBe(boat);
})


it('OOB coordinates - ignore place ship in gameboard', () => {
    gb.placeShip(vessel, [-1,2,3,4,5]);
    expect(gb.grids[2]).not.toEqual(vessel);
})

it('Occupied coordinates - ignore place ship in gameboard', () => {
    gb.placeShip(vessel, [1,2,3,4,5]);
    gb.placeShip(boat, [5,6]);

    expect(gb.grids[5]).toEqual(vessel);
    expect(gb.grids[6]).toEqual(null);
})

it('recieve attack and determine hit or miss', () => {
    
})

it('determine if all ships sunk', () => {
    
})