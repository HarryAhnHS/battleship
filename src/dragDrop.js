import UI from './ui'
import Player from './player'
import Gameboard from './gameboard'
import Ship from './ship'

const DragDrop = (() => {
    function main(player) {
        setDraggableContent();
        dragStart(player, );
    }

    function setDraggableContent() {
        let playerGrids = document.querySelectorAll(".gameboard.p > .grid-unit");

        // Reset draggable content
        playerGrids.forEach((grid) => {
            grid.setAttribute("draggable", false);
            grid.style['cursor'] = 'auto';
        })

        // Draggable content = any grid with ship class
        let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");
        playerShips.forEach((grid) => {
            grid.setAttribute("draggable", true);
            grid.style['cursor'] = 'pointer';
        })
    }

    // Helper bool - Valid droppable place for head - ignore current ship's position when checking validity
    function isDroppable(player, ship, coords) {
        let isValid = true;
        coords.forEach((idx) => {
            if ((player.gameboard.grids[idx] != null && player.gameboard.grids[idx] != ship) || coords.length != ship.length || idx < 0 || idx > 99) {
                // Bounds check placement idx and if not empty
                isValid = false; 
            }
        })
        return isValid;
    }

    function setDroppableArea(player, ship, axis) {
        // Reset droppable grids to have class "grid-droppable"
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
            grid.classList.remove('grid-droppable');
        })

        let emptyGrids = document.querySelectorAll(".gameboard.p > :not(.player-ship)");
        // Valid check if head is dropped in grid - 
        emptyGrids.forEach((grid) => {
            let head = parseInt(grid.id.slice(1));
            if (axis == 0) {
                // Horizontal case 
                // Validation - head must have empty n length to the right
                let coords = [...new Array(ship.length).keys()].map((x) => x+head); // Coords array of ship
                console.log('grid-droppable');
                if (coords.every((x) => Math.floor(x/10) == Math.floor(coords[0]/10))
                    && isDroppable(player, ship, coords)) {
                    //  Then valid - set droppable
                    grid.classList.add('grid-droppable');
                    console.log('grid-droppable');
                }
            }
            else if (axis == 1) {
                // Vertical case
                // Validation - head must have empty n length grids below within bounds
                let coords = [...new Array(ship.length).keys()].map((x) => head + (x*10)); // Coords array of vertical from head
                if (isDroppable(player, ship, coords)) {
                    grid.classList.add('grid-droppable');
                }
            }
        })
    }

    function dragStart(player) {
        console.log("drag")
        let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");

        playerShips.forEach((grid) => {
            grid.addEventListener('dragstart', (e) => {
                // Dragging ship - need to extract Ship object from the grid
                const classes = [...grid.classList];
                console.log(classes);
                let shipIdx = classes.find(value => {
                    return value.startsWith("ship-");
                });
                // Find class associated with ship + use as hashmap to reference exact ship object used in gameboard
                const ship = player.gameboard.ships[shipIdx.slice(5)-1];
                console.log(ship);

                // setDroppableArea(player, new Ship(5), 0);
            })
        })
    }

    return {
        main,
        dragStart
    }
})();

export default DragDrop;