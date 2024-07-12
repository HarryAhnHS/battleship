import Ship from './ship'

export default class Gameboard {
    constructor() {
        this.grids = new Array(100).fill(null); // 2D array illustrated by 1D (10x10)
        this.attacks = [];
    }

    placeShip(ship, coords) {
        let isValid = true;
        coords.forEach((idx) => {
            if (this.grids[idx] != null || idx < 0 || idx > 99) {
                // Bounds check placement idx and if not empty
                isValid = false;
            }
        })

        if (isValid) {
            coords.forEach((idx) => {
                this.grids[idx] = ship;
            })
        }
    }

    receiveAttack(coord) {
        // Register attack only if valid
        if (!this.attacks.includes(coord) && coord >= 0 && coord <= 99) {
            this.attacks.push(coord);
            if (this.grids[coord]) {
                // Ship hit - register hit to corresponding ship object
                this.grids[coord].hit();
            }
        }
    }


}