import Ship from "../factories/ship";
import Player from "../factories/player";
import DragDrop from "./dragDrop";
import ScoreBoard from "./scoreboard";

const BattleshipAI = (() => {
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
                let offset = NWSE[Math.floor(Math.random() * 4)];
                let next = base + offset;
    
                console.log(base)
                console.log(next)

                // Edge case handling - (assume worst case scenario)
                // Check current smallest remaining ship
                //  -> check if this ship can fit
                let min = 5; // dummy to replace
                const remainingShips = player.gameboard.ships.filter((shipObj) => {
                    return !(shipObj.ship.isSunk);
                })
                remainingShips.forEach((shipObj) => {
                    if (shipObj.ship.length <= min) min = shipObj.ship.length;
                })
                // Return true if ship fits at base / false if not
                function checkIfFit(player, base, offset, shipLength) {
                    let coords = [];
                    // Coords to store all potential coords from base of shipLength in offset direction
                    for (let i = (-1 * shipLength) + 1; i < shipLength; i++) {
                        coords.push(base + (offset * i));
                    }
                    console.log("Check: " + coords);
                    // While looping through coords, 'shipLength' coords in a row must be valid to return true
                    // Potenital coords based on base, offset, shipLength - exclude base (already attacked and valid)
                    let consecutive = 0;
                    for (const idx of coords) {
                        console.log("testing " + idx);
                        if (idx != base) {
                            // Coord is not base
                            if (player.gameboard.attacks.includes(idx) || idx < 0 || idx > 99 
                                || ((offset == -1 || offset == 1) && !(Math.floor(idx/10) == Math.floor(base/10)))) {    
                                    // If coord is not base and invalid, then reset consecutive count
                                    consecutive = 0;
                                    console.log("consecutiveReset = " + consecutive);
                            }
                            else {
                                // Valid - add to consecutive and check if can fit
                                consecutive += 1;
                                console.log("Valid -> consecutive++ = " + consecutive);
                            }
                        } 
                        else {
                            // If current idx is base - skip over and add 1 to consecutive count
                            consecutive++;
                            console.log("baseCase = " + consecutive);
                        }

                        // At each iteration - check if consecutive 'shipLength' coords in a row are valid to return true
                        console.log("comparing:" + consecutive + "with ship length:" + shipLength);
                        if (consecutive == shipLength) {
                            console.log("True");
                            return true; 
                        }
                    }
                        
                    console.log("Step 2: ship of length " + shipLength + " can fit into " + base, coords + "?" + consecutive);
                    return false; // Otherwise, no match
                }
    
                // Bounds check (edgecase: if horizontal must be in same y-axis) + not already attacked = cycle
                while (player.gameboard.attacks.includes(next) || next < 0 || next > 99 
                        || ((offset == -1 || offset == 1) && !(Math.floor(next/10) == Math.floor(base/10)))
                        || !checkIfFit(player, base, offset, min)) {
                    offset = NWSE[Math.floor(Math.random() * 4)];
                    next = base + offset;
                    console.log("Debugging: newnext = ", next);
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
                        || !(Math.floor(next/10) == Math.floor(Math.min(...targetHits)/10))) {
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
                    while (player.gameboard.attacks.includes(next) || next < 0 || next > 99) {
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
            let next = options[Math.floor(Math.random() * options.length)];
            console.log("Step 1 attacked cell: ", next);
            player.gameboard.receiveAttack(next);
            return;
        }
    }

    return {
        AIAttack
    }
})();

export default BattleshipAI;