import UI from './ui'
import Player from './player'
import Gameboard from './gameboard'
import Ship from './ship'

const DragDrop = (() => {

    function click(player) {
        document.querySelectorAll(".gameboard.p > .player-ship").forEach((grid) => {
            grid.onclick = (e) => {
                // extract shipIdx from grid
                const classes = [...grid.classList];
                let shipIdx = classes.find(value => {
                    return value.startsWith("ship-");
                });
                shipIdx = shipIdx.slice(5)-1;
                // Find class associated with ship + use as hashmap to reference exact ship object used in gameboard
                const shipObj = player.gameboard.ships[shipIdx].ship;
                const oldCoords = player.gameboard.ships[shipIdx].coords;
                // Get head (smallest idx)
                console.log(oldCoords);
                let head = Math.min(...oldCoords);

                // Attempt rotation
                if (shipObj.axis == 0) {
                    // Horizontal --> Vertical
                    let newCoords = [...new Array(shipObj.length).keys()].map((x) => head + (x * 10)); // Coords array of vertical from head
                    
                    if (isDroppable(player, shipObj, newCoords)) {
                        // Check if droppable - then rotate
                        replaceShip(player, shipIdx, oldCoords, newCoords, 1);
                        init(player);
                    }
                }
                else if (shipObj.axis == 1) {
                    // Vertical --> Horizontal
                    let newCoords = [...new Array(shipObj.length).keys()].map((x) => x + head); // Coords array of horizontal ship from head
                    if (newCoords.every((x) => Math.floor(x/10) == Math.floor(newCoords[0]/10))
                        && isDroppable(player, shipObj, newCoords)) {
                        replaceShip(player, shipIdx, oldCoords, newCoords, 0); 
                        init(player);
                    }
                }    
            }
        });
    }

    function init(player) {
        reset();
        setDraggableArea();
        dragStart(player);
        click(player);
    }

    // reset all drag/click event listeners
    function reset() {
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
            grid.ondragstart = ((e) => {
            }) 
            grid.ondragenter = ((e) => {
                e.preventDefault();
            }) 
            grid.ondragend = ((e) => {
            }) 
            grid.ondragover = ((e) => {
                e.preventDefault();
            })
            grid.onclick = ((e) => {
            })
        })
    }


    // Reset and set all ships to be draggable 
    function setDraggableArea() {
        // Reset draggable content
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
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

    function dragStart(player) {
        let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");

        playerShips.forEach((grid) => {
            grid.ondragstart = (e) => {
                // Dragging ship - need to extract Ship object from the grid
                const classes = [...grid.classList];
                let shipIdx = classes.find(value => {
                    return value.startsWith("ship-");
                });
                shipIdx = shipIdx.slice(5)-1;
                // Find class associated with ship + use as hashmap to reference exact ship object used in gameboard
                const shipObj = player.gameboard.ships[shipIdx].ship;

                // Style current dragged ship
                player.gameboard.ships[shipIdx].coords.forEach((idx) => {
                    document.getElementById(`p${idx}`).classList.add("dragging");
                });

                setDroppableArea(player, shipObj, shipObj.axis);

                dragEnter(player, shipObj, shipObj.axis, shipIdx);
                dragEnd(player);
            }
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

    // Reset and set droppable areas with class 'grid-droppable' 
    function setDroppableArea(player, ship, axis) {
        // Reset droppable grids to have class "grid-droppable"
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
            grid.classList.remove('grid-droppable');
            grid.classList.remove('ship-droppable');
        })

        let playerGrids = document.querySelectorAll(".gameboard.p > .grid-unit");
        // Valid check if head is dropped in grid - 
        playerGrids.forEach((grid) => {
            let head = parseInt(grid.id.slice(1));
            if (axis == 0) {
                // Horizontal case 
                // Validation - head must have empty n length to the right
                let coords = [...new Array(ship.length).keys()].map((x) => x + head); // Coords array of horizontal ship from head
                if (coords.every((x) => Math.floor(x/10) == Math.floor(coords[0]/10))
                    && isDroppable(player, ship, coords)) {
                    //  Then valid - set droppable
                    grid.classList.add('grid-droppable');

                    // Set entire ship droppable grids
                    coords.forEach((idx) => {
                        document.getElementById(`p${idx}`).classList.add('ship-droppable');
                    })
                }
            }
            else if (axis == 1) {
                // Vertical case
                // Validation - head must have empty n length grids below within bounds
                let coords = [...new Array(ship.length).keys()].map((x) => head + (x*10)); // Coords array of vertical from head
                if (isDroppable(player, ship, coords)) {
                    grid.classList.add('grid-droppable');

                    // Set entire ship droppable grids
                    coords.forEach((idx) => {
                        document.getElementById(`p${idx}`).classList.add('ship-droppable');
                    })
                }
            }
        })
    }
    
    // Drag ship enters droppable area - offer preview of how ship would look placed
    function dragEnter(player, ship, axis, shipIdx) {
        const droppableHeads = document.querySelectorAll(".grid-droppable");

        droppableHeads.forEach((grid) => {
            grid.ondragenter = (e) => {
                e.preventDefault();
                // Reset preview grids
                document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
                    grid.classList.remove('grid-preview');
                })

                // Get head value 
                let head = parseInt(grid.id.slice(1));
                if (axis == 0) {
                    // Horizontal case 
                    let coords = [...new Array(ship.length).keys()].map((x) => x + head); // Potential coords array of horizontal ship from head
                    coords.forEach((idx) => {
                        document.querySelector(`#p${idx}`).classList.add('grid-preview');
                    })
                    dragDrop(player, ship, shipIdx, coords);
                }
                else if (axis == 1) {
                    // Vertical case
                    // Validation - head must have empty n length grids below within bounds
                    let coords = [...new Array(ship.length).keys()].map((x) => head + (x * 10)); // Coords array of vertical from head
                    coords.forEach((idx) => {
                        document.querySelector(`#p${idx}`).classList.add('grid-preview');
                    })
                    dragDrop(player, ship, shipIdx, coords);
                }
            }
        })
    }

    // Drag end - regardless of successful drop or not
    function dragEnd(player) {
        let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");

        playerShips.forEach((grid) => {
            grid.ondragend = (e) => {
                e.preventDefault();
                // Reset preview grids
                // Reset droppable grids to have class "grid-droppable"
                // Reset dragging class
                document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
                    grid.classList.remove('grid-preview');
                    grid.classList.remove('grid-droppable');
                    grid.classList.remove('ship-droppable');
                    grid.classList.remove("dragging");
                })


                init(player); // At each drag-end reset draggable, droppable content and rerun
            };
        })
    }

    // Drag place in valid grid - target as potential coords at each drag enter
    function dragDrop(player, ship, shipIdx, potentialCoords) {       
        // Coords to be ship-droppable area 
        potentialCoords.forEach((idx) => {
            // Get head of placement - always minimum value of coords
            document.getElementById(`p${idx}`).ondrop = (e) => {
                const oldCoords = player.gameboard.ships[shipIdx].coords;
                // Update gameboard ships[] array and grids[] array
                replaceShip(player, shipIdx, oldCoords, potentialCoords, ship.axis);
                console.log(player);
            };
        })
    }
    function replaceShip(player, shipIdx, oldCoords, newCoords, newAxis) {
        // Storage changes
        // Update gameboard grids[]
        oldCoords.forEach((idx) => {
            player.gameboard.grids[idx] = null;
        })
        newCoords.forEach((idx) => {
            player.gameboard.grids[idx] = player.gameboard.ships[shipIdx].ship;
        })
        // Change coords in gameboard ships[] object
        player.gameboard.ships[shipIdx].coords = newCoords;

        // Update axis
        player.gameboard.ships[shipIdx].ship.axis = newAxis;

        // Front-End changes
        UI.updatePlacedShips(oldCoords, newCoords, shipIdx);
    }

    function terminate() {
        reset();
        // Reset draggable content
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach((grid) => {
            grid.setAttribute("draggable", false);
            grid.style['cursor'] = 'auto';
        });
    }

    return {
        init,
        terminate
    }
})();

export default DragDrop;