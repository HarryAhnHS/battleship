import Gameboard from "./gameboard";
import Ship from "./ship";
import Player from "./player";
import { pl } from "date-fns/locale";

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

        // TODO Select Ship Location - random for computer
        // Sample for now
        player.gameboard.placeShip(new Ship(3), [1,2,3]);
        computer.gameboard.placeShip(new Ship(3), [21,31,41]);

        gameLogic(player, computer);
    }

    function gameLogic(player, computer) {
        const grids = document.querySelectorAll(".gameboard.c > grid-units");
        grids.forEach((grid) => {
            grid.onclick(() => {
            })
        })
    }

    function playRound(player, computer, input) {
        // Player turn
        // Update Grid Display
        // Check if winner
        // Computer Attack Random move
        // Update Grid Display
        // Check if winner
        if (!computer.gameboard.attacks.includes(input)) {
            computer.gameboard.receiveAttack(input);
            updateComputerDisplay(computer);
            if (computer.gameboard.isGameOver()) return;

            AIAttack();
            updatePlayerDisplay(player);
            if (computer.gameboard.isGameOver()) return;
        }
    }

    function AIAttack(player) {
        // Complete Randomization
        let options = player.gameboard.getRemaining();
        player.gameboard.receiveAttack(Math.floor(Math.random() * options.length));
    }

    function updatePlayerDisplay(player) {
        // Update player grids
        const playerGrids = document.querySelectorAll(".gameboard.p > .grid-units");
        let playerMisses = player.gameboard.getMisses();
        playerGrids.forEach((grid) => {
            if (player.gameboard.grids[grid.id] && player.gameboard.attacks.includes[grid.id]) {
                grid.classList.add("grid-found");
            }
            else if (playerMisses.includes(grid.id)) {
                grid.classList.add("grid-missed");
            }
        });
    }

    function updateComputerDisplay(computer) {
        // Update player grids
        const compGrids = document.querySelectorAll(".gameboard.c > .grid-units");
        let compMisses = computer.gameboard.getMisses();
        compGrids.forEach((grid) => {
            if (computer.gameboard.grids[grid.id] && computer.gameboard.attacks.includes[grid.id]) {
                grid.classList.add("grid-found");
            }
            else if (compMisses.includes(grid.id)) {
                grid.classList.add("grid-missed");
            }
        });
    }

    return {
        displayGrids,
        initGame,

    }

})();

export default UI;