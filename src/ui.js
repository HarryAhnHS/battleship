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
            if (player.gameboard.grids[parseInt(grid.id.slice(1))]) {
                grid.classList.add("grid-ship");
            }
        });
    }

    function gameLogic(player, computer) {
        const grids = document.querySelectorAll(".gameboard.c > .grid-unit");
        grids.forEach((grid) => {
            grid.onclick = (() => {
                console.log(grid);
                playRound(player, computer, parseInt(grid.id.slice(1)));
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
        if (computer.gameboard.isGameOver()) gameOver("Player");


        AIAttack(player);
        updatePlayerDisplay(player);
        if (player.gameboard.isGameOver()) gameOver("Computer");; //TODO - Handle game over
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
        console.log(playerMisses);
        playerGrids.forEach((grid) => {
            if (player.gameboard.grids[parseInt(grid.id.slice(1))] && player.gameboard.attacks.includes(parseInt(grid.id.slice(1)))) {
                grid.classList.add("grid-found");
            }
            else if (playerMisses.includes(parseInt(grid.id.slice(1)))) {
                grid.classList.add("grid-missed");
            }
        });
    }

    function updateComputerDisplay(computer) {
        // Update player grids
        const compGrids = document.querySelectorAll(".gameboard.c > .grid-unit");
        let compMisses = computer.gameboard.getMisses();
        compGrids.forEach((grid) => {
            if (computer.gameboard.grids[parseInt(grid.id.slice(1))] && computer.gameboard.attacks.includes(parseInt(grid.id.slice(1)))) {
                grid.classList.add("grid-found");
            }
            else if (compMisses.includes(parseInt(grid.id.slice(1)))) {
                grid.classList.add("grid-missed");
            }
        });
    }

    // Helper function to delay
    function delay(ms) {    
        return new Promise((res, rej) => {
            setTimeout(res, ms)
        });
    }

    async function gameOver(winner) {
        const dialog = document.querySelector(".result");
        const text = document.querySelector(".result-text");
        const restart = document.querySelector(".restart");
        const gameboard = document.querySelector(".gameboard.c");

        gameboard.style['pointer-events'] = 'none'; //Disable gameboard interface while awaiting
        await delay(1000);


        dialog.showModal();
        dialog.classList.add(".result-displayed");
        text.textContent = `${winner} wins!`

        restart.onclick = () => {
            // Restart game
            dialog.close();
            dialog.classList.remove(".result-displayed");
            initGame();
            gameboard.style['pointer-events'] = 'auto'; //Enable gameboard interface
        }
    }

    return {
        displayGrids,
        initGame
    }

})();

export default UI;