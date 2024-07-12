import Ship from './ship'

export default class Gameboard {
    constructor() {
        this.grids = new Array(100).fill(null); // 2D array illustrated by 1D (10x10)
        this.shot = [];
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
}