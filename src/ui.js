import Gameboard from "./gameboard";
import Ship from "./ship";
import Player from "./player";
import DragDrop from "./dragDrop";
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

        placeRandomShips(player);
        placeRandomShips(computer);
        // TODO - drag+drop select playerShipSelect(player)
        initDisplayShips(player,computer);

        playerShipSelect(player);

        gameLogic(player, computer);
    }

    function playerShipSelect(player) {
        DragDrop.drag(player);
    }

    // Helper function - Return array of random coordinate placement based on ship's length
    function randomCoordinates(ship) {
        let pos = Math.floor(Math.random() * 100);
        let axis = Math.floor(Math.random( )* 2) // 0 is horizantal, 1 is vertical
        let coords = [...new Array(ship.length).keys()]; // Start with coord array of [0...n]
        if (axis == 0) {
            // Horizontal
            coords = coords.map((x) => x + pos);
            // Error check + Cycle until valid - must all have same x//10 value to be in same y-axis
            while (!coords.every((x) => Math.floor(x/10) == Math.floor(coords[0]/10))) {
                let pos = Math.floor(Math.random() * 100);
                coords = coords.map((x) => x + pos);
                console.log("Horizontal zigzag - Cycling")
            }
        }
        else if (axis == 1) {
            // Vertical - must all have same x%10 value to be in same x-axis
            coords = coords.map((x) => pos + (10 * x));
        }
        return {array: coords, axis};
    }

    function placeRandomShips(player) {
        let fleet = [new Ship(2), new Ship(3), new Ship(3), new Ship(4), new Ship(5)];

        fleet.forEach((ship) => {
            let coords = randomCoordinates(ship);
            // Error check cycle until valid - then place
            while (!player.gameboard.isValidPlacement(ship, coords.array)) {
                coords = randomCoordinates(ship);
                console.log("Invalid randomization - Cycling")
            }
            player.gameboard.placeShip(ship, coords.array);
            ship.setAxis(coords.axis);
        })
        console.log(player);
    }

    function initDisplayShips(player, computer) {
        // Mark each ship with class to distinguish
        let i = 1;
        let j = 1;
        player.gameboard.ships.forEach((shipObj) => {
            shipObj.coords.forEach((coord) => {
                document.querySelector(`.gameboard.p > #p${coord}`).classList.add(`ship-${i}`);
                document.querySelector(`.gameboard.p > #p${coord}`).classList.add("player-ship");
            })
            i++;
        })

        // Mark each ship with class to distinguish
        computer.gameboard.ships.forEach((shipObj) => {
            shipObj.coords.forEach((coord) => {
                document.querySelector(`.gameboard.c > #c${coord}`).classList.add(`ship-${j}`);
                document.querySelector(`.gameboard.c > #c${coord}`).classList.add("grid-hidden");
            })
            j++;
        })
    }

    function updateGrids(player, computer) {
        // Update player grids
        let playerAttacks = player.gameboard.attacks;
        playerAttacks.forEach((idx) => {
            if (player.gameboard.grids[idx]) {
                document.querySelector(`#p${idx}`).classList.add("grid-found");
            }
            else {
                document.querySelector(`#p${idx}`).classList.add("grid-missed");
            }
        })

        // Update computer grids
        let compAttacks = computer.gameboard.attacks;
        compAttacks.forEach((idx) => {
            if (computer.gameboard.grids[idx]) {
                document.querySelector(`#c${idx}`).classList.add("grid-found");
                document.querySelector(`#c${idx}`).classList.remove("grid-hidden");
            }
            else {
                document.querySelector(`#c${idx}`).classList.add("grid-missed");
            }
        })
    }

    function updateShips(player, computer) {
        player.gameboard.ships.forEach((shipObj) => {
            shipObj.coords.forEach((coord) => {
                if (shipObj.ship.isSunk) {
                    document.querySelector(`.gameboard.p > #p${coord}`).classList.add("grid-sunk");
                    document.querySelector(`.gameboard.p > #p${coord}`).classList.remove("grid-found");
                    document.querySelector(`.gameboard.p > #p${coord}`).innerHTML = "&#10005;";
                }
            })
        })
        computer.gameboard.ships.forEach((shipObj) => {
            shipObj.coords.forEach((coord) => {
                if (shipObj.ship.isSunk) {
                    document.querySelector(`.gameboard.c > #c${coord}`).classList.add("grid-sunk");
                    document.querySelector(`.gameboard.c > #c${coord}`).classList.remove("grid-found");
                    document.querySelector(`.gameboard.c > #c${coord}`).innerHTML = "&#10005;";
                }
            })
        })
    }

    function gameLogic(player, computer) {
        const grids = document.querySelectorAll(".gameboard.c > .grid-unit");
        grids.forEach((grid) => {
            grid.onclick = (() => {
                if (!computer.gameboard.attacks.includes(parseInt(grid.id.slice(1)))) {
                    playRound(player, computer, parseInt(grid.id.slice(1)));
                }
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
        updateGrids(player, computer);
        updateShips(player, computer);
        if (computer.gameboard.isGameOver()) gameOver("Player", player);

        AIAttack(player);
        updateGrids(player, computer);
        updateShips(player, computer);
        if (player.gameboard.isGameOver()) gameOver("Computer", computer);; //TODO - Handle game over
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

    // Helper function to delay
    function delay(ms) {    
        return new Promise((res, rej) => {
            setTimeout(res, ms)
        });
    }

    async function gameOver(winnerText, winner) {
        const dialog = document.querySelector(".result");
        const text = document.querySelector(".result-text");
        const restart = document.querySelector(".restart");
        const gameboard = document.querySelector(".gameboard.c");


        // TODO - create game over styling transition in winning player grid
        gameboard.style['pointer-events'] = 'none'; //Disable gameboard interface while awaiting
        await delay(1000);


        dialog.showModal();
        dialog.classList.add(".result-displayed");
        text.textContent = `${winnerText} wins!`

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