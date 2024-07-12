export default class Ship {
    constructor(length) {
        this.length = length,
        this.hits = 0;
        this.isSunk = false;
    }

    hit() {
        this.hits++; 
        if (this.hits >= this.length) this.isSunk = true;
    }
}