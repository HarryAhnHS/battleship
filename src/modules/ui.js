import Ship from "../factories/ship";
import Player from "../factories/player";
import DragDrop from "./dragDrop";
import BattleshipAI from "./battleshipAI";
import ScoreBoard from "./scoreboard";

const UI = (() => {
    function displayGrids() {
        let gameboardP = document.querySelector(".gameboard.p");
        gameboardP.innerHTML = ""; // Clear existing
        for (let i = 0; i < 100; i++) {
            const gridUnit = document.createElement('div');
            gridUnit.classList.add('grid-unit');
            gridUnit.id = `p${i}`; // assign each an id from 0 to n*n-1
    
            gridUnit.style.width = `calc(10% - 3px)`;
            gridUnit.style.height = `calc(10% - 3px)`;
    
            gameboardP.appendChild(gridUnit);
        };

        let gameboardC = document.querySelector(".gameboard.c");
        gameboardC.innerHTML = ""; // Clear existing
        for (let i = 0; i < 100; i++) {
            const gridUnit = document.createElement('div');
            gridUnit.classList.add('grid-unit');
            gridUnit.id = `c${i}`; // assign each an id from 0 to n*n-1
    
            gridUnit.style.width = `calc(10% - 3px)`;
            gridUnit.style.height = `calc(10% - 3px)`;
    
            gameboardC.appendChild(gridUnit);
        };
    }

    function initGame() {
        // DOM for prep stage
        document.querySelector("#start").style['display'] = 'flex'
        document.querySelector("#restart").style['display'] = 'none'
        document.querySelector(".header-helper").textContent = "Assemble the fleet";
        document.querySelector(".header-desc").textContent = "Drag to Move and Click to Rotate";

        // Set display for player to move/rotate ships -> show player grid, lock computer grid
        document.querySelector(".gameboard.p").classList.remove("locked");
        document.querySelector(".gameboard.c").classList.add("locked");

        let player = new Player;
        let computer = new Player;

        // Create DOM grids and display 
        displayGrids();

        // Place player + computer ships randomly
        placeRandomShips(player);
        placeRandomShips(computer);
        initDisplayShips(player,computer);

        // Create DOM scoreboard
        ScoreBoard.createScoreboard(player, computer);

        // Allow player to move/rotate ship locations
        playerShipSelect(player);

        // Start - Ships selected
        document.querySelector("#start").onclick = (e) => {
            // DOM for battle
            document.querySelector("#start").style['display'] = 'none';
            document.querySelector("#restart").style['display'] = 'flex';
            document.querySelector(".header-helper").textContent = "Let the battle begin!";
            document.querySelector(".header-desc").textContent = "Keep an eye on the scoreboard";

            // Set display to Player Attack -> lock player grid, show computer grid for player attack
            document.querySelector(".gameboard.p").classList.add("locked");
            document.querySelector(".gameboard.c").classList.remove("locked");

            DragDrop.terminate(); // Terminate grid events
            gameLogic(player, computer);  
        }

        // Restart button once game begins
        document.querySelector("#restart").onclick = (e) => {
            initGame();
        }
    }

    function playerShipSelect(player) {
        DragDrop.init(player);
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

    function updatePlacedShips(oldCoords, newCoords, shipIdx) {
        // Replace classes `ship-${shipIdx}` + 'player-ship'
        oldCoords.forEach((idx) => {
            document.querySelector(`#p${idx}`).classList.remove(`ship-${shipIdx+1}`);
            document.querySelector(`#p${idx}`).classList.remove(`player-ship`);
        })
        newCoords.forEach((idx) => {
            document.querySelector(`#p${idx}`).classList.add(`ship-${shipIdx+1}`);
            document.querySelector(`#p${idx}`).classList.add(`player-ship`);
        })
    }

    function updateGrids(player, computer) {
        // Update player grids
        let playerAttacks = player.gameboard.attacks;
        playerAttacks.forEach((idx) => {
            if (player.gameboard.grids[idx]) {
                document.querySelector(`#p${idx}`).classList.add("grid-found");
                document.querySelector(`.gameboard.p > #p${idx}`).innerHTML = "&#10005;";
            }
            else {
                document.querySelector(`#p${idx}`).classList.add("grid-missed");
                document.querySelector(`.gameboard.p > #p${idx}`).innerHTML = "&#x2022;";
            }
        })

        // Update computer grids
        let compAttacks = computer.gameboard.attacks;
        compAttacks.forEach((idx) => {
            if (computer.gameboard.grids[idx]) {
                document.querySelector(`#c${idx}`).classList.add("grid-found");
                document.querySelector(`#c${idx}`).classList.remove("grid-hidden");
                document.querySelector(`.gameboard.c > #c${idx}`).innerHTML = "&#10005;";
            }
            else {
                document.querySelector(`#c${idx}`).classList.add("grid-missed");
                document.querySelector(`.gameboard.c > #c${idx}`).innerHTML = "&#x2022;";
            }
        })
    }

    function updateShips(player, computer) {
        player.gameboard.ships.forEach((shipObj) => {
            shipObj.coords.forEach((coord) => {
                if (shipObj.ship.isSunk) {
                    document.querySelector(`.gameboard.p > #p${coord}`).classList.add("grid-sunk");
                    document.querySelector(`.gameboard.p > #p${coord}`).classList.remove("grid-found");
                }
            })
        })
        if (computer) {
            computer.gameboard.ships.forEach((shipObj) => {
                shipObj.coords.forEach((coord) => {
                    if (shipObj.ship.isSunk) {
                        document.querySelector(`.gameboard.c > #c${coord}`).classList.add("grid-sunk");
                        document.querySelector(`.gameboard.c > #c${coord}`).classList.remove("grid-found");
                    }
                })
            })
        }
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

    async function playRound(player, computer, input) {
        // ATP got input -> show player grid for AI attack, lock computer grid
        document.querySelector(".gameboard.p").classList.remove("locked");
        document.querySelector(".gameboard.c").classList.add("locked");

        // Handle player's input -> Update Grid Display -> Check if winner
        playerAttack(computer, input);
        updateGrids(player, computer);
        updateShips(player, computer);
        ScoreBoard.updateScoreboard(player, computer);
        if (computer.gameboard.isGameOver()) gameOver("Player", player);

        // Computer Attack -> Update Grid Display -> Check if winner
        await delay(500);

        BattleshipAI.AIAttack(player);
        updateGrids(player, computer);
        updateShips(player, computer);
        ScoreBoard.updateScoreboard(player, computer);
        if (player.gameboard.isGameOver()) gameOver("Computer", computer);; //TODO - Handle game over

        // Revert display to Player Attack -> lock player grid, show computer grid for player attack
        document.querySelector(".gameboard.p").classList.add("locked");
        document.querySelector(".gameboard.c").classList.remove("locked");
    }

    function playerAttack(computer, input) {
        if (!computer.gameboard.attacks.includes(input)) {
            computer.gameboard.receiveAttack(input);
        }
    }

    // Helper function to delay
    function delay(ms) {    
        return new Promise((res, rej) => {
            setTimeout(res, ms)
        });
    }

    // If gameover, pop modal and show winner until restart
    async function gameOver(winnerText) {
        const dialog = document.querySelector(".result");
        const text = document.querySelector(".result-text");
        const restart = document.querySelector("#play-agin");

        // TODO - create game over styling transition in winning player grid
        document.querySelector(".gameboard.c").classList.add("locked");
        await delay(1000);

        dialog.showModal();
        dialog.classList.add("result-displayed");
        text.textContent = `${winnerText} wins!`

        restart.onclick = () => {
            // Restart game
            dialog.close();
            dialog.classList.remove("result-displayed");
            initGame();
        }
    }

    return {
        displayGrids,
        initGame,
        updatePlacedShips
    }

})();

export default UI;