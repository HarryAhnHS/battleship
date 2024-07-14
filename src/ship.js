export default class Ship {
    constructor(length) {
        this.length = length,
        this.hits = 0;
        this.isSunk = false;
        this.axis = 0; // 0 horizontal, 1 vertical
    }

    hit() {
        this.hits++; 
        if (this.hits >= this.length) this.isSunk = true;
    }
}