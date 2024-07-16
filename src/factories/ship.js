export default class Ship {
    constructor(length, axis=0) {
        this.length = length,
        this.hits = 0;
        this.isSunk = false;
        this.axis = axis; // 0 horizontal, 1 vertical
    }

    setAxis(axis) {
        this.axis = axis;
    }

    getAxis() {
        return this.axis;
    }

    hit() {
        this.hits++; 
        if (this.hits >= this.length) this.isSunk = true;
    }
}