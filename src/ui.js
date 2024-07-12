import Gameboard from "./gameboard";
import Ship from "./ship";
import Player from "./player"

const UI = (() => {
    function displayGrids() {
        let gameboards = document.querySelectorAll(".gameboard");
        gameboards.forEach((gameboard) => {
            gameboard.innerHTML = ""; // Clear existing
    
            // Add n*n grids into container, assign each an id from 0 to n*n-1
            for (let i = 0; i < 100; i++) {
                const gridUnit = document.createElement('div');
                gridUnit.classList.add('grid-unit');
                gridUnit.id = i; // assign each an id from 0 to n*n-1
        
                gridUnit.style.width = `10%`;
                gridUnit.style.height = `10%`;
                
                gameboard.appendChild(gridUnit);
            };
        })
    }

    function initGame() {
        let player = new Player;
        let computer = new Player;
    }

    function gameLogic(player, computer) {
        const grids = document.querySelectorAll(".gameboard.c > grid-units");
        grids.forEach((grid) => {
            grid.onclick(() => {
                if (!computer.gameboard.attacks.includes(grid.id)) {
                    computer.gameboard.receiveAttack(grid.id);
                }
                // Update Grid Display
                // Check if winner

                // Computer Attack Random move
                // Update Grid Display
                // Check if winner
            })
        })
    }

    function updateGrids(player, computer) {
        


    }

    return {
        displayGrids,
        initGame,
    }

})();

export default UI;