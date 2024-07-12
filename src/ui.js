import Gameboard from "./gameboard";
import Ship from "./ship";
import Player from "./player";
import { pl } from "date-fns/locale";

const UI = (() => {
    function displayGrids() {
        let gameboardP = document.querySelector(".gameboard.p");
        gameboardP.innerHTML = ""; // Clear existing
        for (let i = 0; i < 100; i++) {
            const gridUnit = document.createElement('div');
            gridUnit.classList.add('grid-unit');
            gridUnit.id = `p${i}`; // assign each an id from 0 to n*n-1
    
            gridUnit.style.width = `10%`;
            gridUnit.style.height = `10%`;
    
            gameboardP.appendChild(gridUnit);
        };

        let gameboardC = document.querySelector(".gameboard.c");
        gameboardC.innerHTML = ""; // Clear existing
        for (let i = 0; i < 100; i++) {
            const gridUnit = document.createElement('div');
            gridUnit.classList.add('grid-unit');
            gridUnit.id = `c${i}`; // assign each an id from 0 to n*n-1
    
            gridUnit.style.width = `10%`;
            gridUnit.style.height = `10%`;
    
            gameboardC.appendChild(gridUnit);
        };

    }

    function initGame() {
        displayGrids();
        let player = new Player;
        let computer = new Player;

        // TODO Select Ship Location - random for computer
        // Sample for now
        player.gameboard.placeShip(new Ship(3), [1,2,3]);
        computer.gameboard.placeShip(new Ship(3), [21,31,41]);

        displayShips(player);

        gameLogic(player, computer);
    }

    function displayShips(player) {
        const playerGrids = document.querySelectorAll(".gameboard.p > .grid-unit");
        playerGrids.forEach((grid) => {
            if (player.gameboard.grids[grid.id.slice(1)]) {
                grid.classList.add("grid-ship");
            }
        });
    }

    function gameLogic(player, computer) {
        const grids = document.querySelectorAll(".gameboard.c > .grid-unit");
        grids.forEach((grid) => {
            grid.onclick(() => {
                console.log("hi");
                playRound(player, computer, grid.id.slice(1));
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
        playerAttack(computer, input);
        updateComputerDisplay(computer);
        if (computer.gameboard.isGameOver()) return "Player wins";

        AIAttack(player);
        updatePlayerDisplay(player);
        if (player.gameboard.isGameOver()) return "Computer wins";
    }

    function playerAttack(computer, input) {
        if (!computer.gameboard.attacks.includes(input)) {
            computer.gameboard.receiveAttack(input);
        }
    }

    function AIAttack(player) {
        // Complete Randomization
        let options = player.gameboard.getRemaining();
        player.gameboard.receiveAttack(Math.floor(Math.random() * options.length));
    }

    function updatePlayerDisplay(player) {
        // Update player grids
        const playerGrids = document.querySelectorAll(".gameboard.p > .grid-unit");
        let playerMisses = player.gameboard.getMisses();
        playerGrids.forEach((grid) => {
            if (player.gameboard.grids[grid.id.slice(1)] && player.gameboard.attacks.includes[grid.id.slice(1)]) {
                grid.classList.add("grid-found");
            }
            else if (playerMisses.includes(grid.id.slice(1))) {
                grid.classList.add("grid-missed");
            }
        });
    }

    function updateComputerDisplay(computer) {
        // Update player grids
        const compGrids = document.querySelectorAll(".gameboard.c > .grid-unit");
        let compMisses = computer.gameboard.getMisses();
        compGrids.forEach((grid) => {
            if (computer.gameboard.grids[grid.id.slice(1)] && computer.gameboard.attacks.includes[grid.id.slice(1)]) {
                grid.classList.add("grid-found");
            }
            else if (compMisses.includes(grid.id.slice(1))) {
                grid.classList.add("grid-missed");
            }
        });
    }

    return {
        displayGrids,
        initGame
    }

})();

export default UI;