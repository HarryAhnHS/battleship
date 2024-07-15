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
        // DOM for prep stage
        document.querySelector(".header-helper").textContent = "Assemble your fleet";
        document.querySelector(".gameboard.c").style['pointer-events'] = "none";

        displayGrids();
        let player = new Player;
        let computer = new Player;

        placeRandomShips(player);
        placeRandomShips(computer);
        // TODO - drag+drop select playerShipSelect(player)
        initDisplayShips(player,computer);
        playerShipSelect(player);

        document.querySelector("#start").onclick = (e) => {
            // DOM for battle
            document.querySelector(".header-helper").textContent = "Begin the battle";
            document.querySelector(".gameboard.c").style['pointer-events'] = "auto";

            DragDrop.terminate(); // Terminate grid events
            gameLogic(player, computer);           
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
        if (computer) {
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

        // document.querySelector(".gameboard.c").style['pointer-events'] = "none";
        // await delay(1000);
        // document.querySelector(".gameboard.c").style['pointer-events'] = "auto";

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
        // Queue: Array to hold all currently actionable grids
        const hitsNotSunk = player.gameboard.attacks.filter((hit) => 
            player.gameboard.grids[hit] && !player.gameboard.grids[hit].isSunk);

        if (hitsNotSunk.length > 0) { 
            // 0. Action - at least 1 hit to act upon
            // Set unsunk ship obj with max hits to work on as target
            let target = {ship: new Ship(0), coords: []}; // Dummy variable to update as loop
            player.gameboard.ships.forEach((shipObj) => {
                if (!shipObj.ship.isSunk && shipObj.ship.hits > target.ship.hits) {
                    // find max hit, unsunk ship
                    target = shipObj;
                }
            })
            console.log("Target = ", target);

            // Get target's already hit coords and store in array
            let targetHits = hitsNotSunk.filter((hit) => {
                return player.gameboard.grids[hit] == target.ship && target.coords.includes(hit);
            });
            console.log("Target's already hit coords = ", targetHits);
            
            if (target.ship.hits == 1) {
                // 2. If only 1 hit is max, then must randomize left right top or right
                const NWSE = [-10, -1, +10, 1];
                const base = targetHits[0];
                let next = base + NWSE[Math.floor(Math.random() * 4)];

                // Bounds check (edgecase: if horizontal must be in same y-axis) + not already attacked = cycle
                while (player.gameboard.attacks.includes(next) || next < 0 || next > 99 
                        || !Math.floor(next/10) == Math.floor(base/10)) {
                    next = base + NWSE[Math.floor(Math.random() * 4)];
                }

                player.gameboard.receiveAttack(next);
                console.log("Step 2 attacked cell: ", next);

                return;
            }
            else {
                // 3. If 2 hits or more is max, then can deduce the ship axis and guess left-1 or right+1 until done

                // Determine axis - from 2 hits can assume 
                // (Reference: Slight imperfection in logic) If 2,3,4,5 hits can technically be 2,3,4,5 ships
                const axis = target.ship.axis;

                if (axis == 0) {
                    // If horizontal, random left or right
                    const WE = [Math.min(...targetHits) - 1, Math.max(...targetHits) + 1];
                    let next = WE[Math.floor(Math.random() * 2)];

                    // Bounds check (edgecase: if horizontal must be in same y-axis) + not already attacked = cycle
                    while (player.gameboard.attacks.includes(next) || next < 0 || next > 99 
                        || !Math.floor(next/10) == Math.floor(Math.min(...targetHits)/10)) {
                        next = WE[Math.floor(Math.random() * 2)];
                    }

                    player.gameboard.receiveAttack(next);
                    console.log("Step 3 attacked cell: ", next);
                    return;
                }
                else {
                    // If vertical, random top or bottom
                    const NS = [Math.min(...targetHits) - 10, Math.max(...targetHits) + 10];
                    let next = NS[Math.floor(Math.random() * 2)];

                    // Bounds check + not already attacked = cycle
                    while (player.gameboard.attacks.includes(next) || next < 0 || next > 99 
                        || !Math.floor(next/10) == Math.floor(Math.min(...targetHits)/10)) {
                        next = NS[Math.floor(Math.random() * 2)];
                    }

                    player.gameboard.receiveAttack(next);
                    console.log("Step 3 attacked cell: ", next);
                    return;
                }
            }
        } 
        else {
            // 0. No hits to act upon - Complete random out of remaining grids
            const options = player.gameboard.getRemaining();
            let next = Math.floor(Math.random() * options.length);
            
            console.log("Step 1 attacked cell: ", next);
            player.gameboard.receiveAttack(next);
            return;
        }
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
        initGame,
        updatePlacedShips
    }

})();

export default UI;