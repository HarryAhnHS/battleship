import UI from './ui'
import Player from './player'
import Gameboard from './gameboard'
import Ship from './ship'

const dragDrop = (() => {
    function dragStart() {
        // Draggable content = any grid with ship class
        let playerShipGrids = document.querySelectorAll(".gameboard.p > .grid-ship");

        playerShipGrids.forEach((grid) => {
            grid.addEventListener('dragstart', (e) => {
                console.log(grid + "Draggin")
            })
        })


    }

    return {

    }
})();