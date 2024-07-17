/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/factories/gameboard.js":
/*!************************************!*\
  !*** ./src/factories/gameboard.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Gameboard)
/* harmony export */ });
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ship */ "./src/factories/ship.js");

class Gameboard {
  constructor() {
    this.grids = new Array(100).fill(null); // 2D array illustrated by 1D (10x10)
    this.attacks = [];
    this.ships = [];
  }
  isValidPlacement(ship, coords) {
    let isValid = true;
    coords.forEach(idx => {
      if (this.grids[idx] != null || coords.length != ship.length || idx < 0 || idx > 99) {
        // Bounds check placement idx and if not empty
        isValid = false;
      }
    });
    return isValid;
  }
  placeShip(ship, coords) {
    if (this.isValidPlacement(ship, coords)) {
      coords.forEach(idx => {
        this.grids[idx] = ship;
      });
      this.ships.push({
        ship,
        coords
      });
    }
  }
  receiveAttack(coord) {
    // Register attack only if valid
    if (!this.attacks.includes(coord) && coord >= 0 && coord <= 99) {
      this.attacks.push(coord);
      if (this.grids[coord]) {
        // Ship hit - register hit to corresponding ship object
        this.grids[coord].hit();
      }
    }
  }
  getMisses() {
    let misses = [];
    this.attacks.forEach(attack => {
      if (this.grids[attack] == null) {
        misses.push(attack);
      }
    });
    return misses;
  }
  getRemaining() {
    let remaining = [];
    for (let i = 0; i < 100; i++) {
      if (!this.attacks.includes(i)) remaining.push(i);
    }
    return remaining;
  }
  isGameOver() {
    let gameover = true;
    this.ships.forEach(shipObj => {
      if (!shipObj.ship.isSunk) gameover = false;
    });
    return gameover;
  }
}

/***/ }),

/***/ "./src/factories/player.js":
/*!*********************************!*\
  !*** ./src/factories/player.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Player)
/* harmony export */ });
/* harmony import */ var _gameboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameboard */ "./src/factories/gameboard.js");
/* harmony import */ var _ship__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ship */ "./src/factories/ship.js");


class Player {
  constructor() {
    this.gameboard = new _gameboard__WEBPACK_IMPORTED_MODULE_0__["default"]();
  }
}

/***/ }),

/***/ "./src/factories/ship.js":
/*!*******************************!*\
  !*** ./src/factories/ship.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Ship)
/* harmony export */ });
class Ship {
  constructor(length) {
    let axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    this.length = length, this.hits = 0;
    this.isSunk = false;
    this.axis = axis; // 0 horizontal, 1 vertical
  }
  setAxis(axis) {
    this.axis = axis;
  }
  getAxis() {
    return this.axis;
  }
  hit() {
    this.hits++;
    if (this.hits >= this.length) this.isSunk = true;
  }
}

/***/ }),

/***/ "./src/modules/battleshipAI.js":
/*!*************************************!*\
  !*** ./src/modules/battleshipAI.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _factories_ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../factories/ship */ "./src/factories/ship.js");
/* harmony import */ var _factories_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../factories/player */ "./src/factories/player.js");
/* harmony import */ var _dragDrop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dragDrop */ "./src/modules/dragDrop.js");
/* harmony import */ var _scoreboard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scoreboard */ "./src/modules/scoreboard.js");




const BattleshipAI = (() => {
  function AIAttack(player) {
    // Queue: Array to hold all currently actionable grids
    const hitsNotSunk = player.gameboard.attacks.filter(hit => player.gameboard.grids[hit] && !player.gameboard.grids[hit].isSunk);
    if (hitsNotSunk.length > 0) {
      // 0. Action - at least 1 hit to act upon
      // Set unsunk ship obj with max hits to work on as target
      let target = {
        ship: new _factories_ship__WEBPACK_IMPORTED_MODULE_0__["default"](0),
        coords: []
      }; // Dummy variable to update as loop
      player.gameboard.ships.forEach(shipObj => {
        if (!shipObj.ship.isSunk && shipObj.ship.hits > target.ship.hits) {
          // find max hit, unsunk ship
          target = shipObj;
        }
      });
      console.log("Target = ", target);

      // Get target's already hit coords and store in array
      let targetHits = hitsNotSunk.filter(hit => {
        return player.gameboard.grids[hit] == target.ship && target.coords.includes(hit);
      });
      console.log("Target's already hit coords = ", targetHits);
      if (target.ship.hits == 1) {
        // 2. If only 1 hit is max, then must randomize left right top or right
        const NWSE = [-10, -1, +10, 1];
        const base = targetHits[0];
        let offset = NWSE[Math.floor(Math.random() * 4)];
        let next = base + offset;
        console.log(base);
        console.log(next);

        // Edge case handling - (assume worst case scenario)
        // Check current smallest remaining ship
        //  -> check if this ship can fit
        let min = 5; // dummy to replace
        const remainingShips = player.gameboard.ships.filter(shipObj => {
          return !shipObj.ship.isSunk;
        });
        remainingShips.forEach(shipObj => {
          if (shipObj.ship.length <= min) min = shipObj.ship.length;
        });
        // Return true if ship fits at base / false if not
        function checkIfFit(player, base, offset, shipLength) {
          let coords = [];
          // Coords to store all potential coords from base of shipLength in offset direction
          for (let i = -1 * shipLength + 1; i < shipLength; i++) {
            coords.push(base + offset * i);
          }
          console.log("Check: " + coords);
          // While looping through coords, 'shipLength' coords in a row must be valid to return true
          // Potenital coords based on base, offset, shipLength - exclude base (already attacked and valid)
          let consecutive = 0;
          for (const idx of coords) {
            console.log("testing " + idx);
            if (idx != base) {
              // Coord is not base
              if (player.gameboard.attacks.includes(idx) || idx < 0 || idx > 99 || (offset == -1 || offset == 1) && !(Math.floor(idx / 10) == Math.floor(base / 10))) {
                // If coord is not base and invalid, then reset consecutive count
                consecutive = 0;
                console.log("consecutiveReset = " + consecutive);
              } else {
                // Valid - add to consecutive and check if can fit
                consecutive += 1;
                console.log("Valid -> consecutive++ = " + consecutive);
              }
            } else {
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
        while (player.gameboard.attacks.includes(next) || next < 0 || next > 99 || (offset == -1 || offset == 1) && !(Math.floor(next / 10) == Math.floor(base / 10)) || !checkIfFit(player, base, offset, min)) {
          offset = NWSE[Math.floor(Math.random() * 4)];
          next = base + offset;
          console.log("Debugging: newnext = ", next);
        }
        player.gameboard.receiveAttack(next);
        console.log("Step 2 attacked cell: ", next);
        return;
      } else {
        // 3. If 2 hits or more is max, then can deduce the ship axis and guess left-1 or right+1 until done

        // Determine axis - from 2 hits can assume 
        // (Reference: Slight imperfection in logic) If 2,3,4,5 hits can technically be 2,3,4,5 ships
        const axis = target.ship.axis;
        if (axis == 0) {
          // If horizontal, random left or right
          const WE = [Math.min(...targetHits) - 1, Math.max(...targetHits) + 1];
          let next = WE[Math.floor(Math.random() * 2)];

          // Bounds check (edgecase: if horizontal must be in same y-axis) + not already attacked = cycle
          while (player.gameboard.attacks.includes(next) || next < 0 || next > 99 || !(Math.floor(next / 10) == Math.floor(Math.min(...targetHits) / 10))) {
            next = WE[Math.floor(Math.random() * 2)];
          }
          player.gameboard.receiveAttack(next);
          console.log("Step 3 attacked cell: ", next);
          return;
        } else {
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
    } else {
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
  };
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BattleshipAI);

/***/ }),

/***/ "./src/modules/dragDrop.js":
/*!*********************************!*\
  !*** ./src/modules/dragDrop.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ui */ "./src/modules/ui.js");

const DragDrop = (() => {
  function init(player) {
    resetEvents();
    setDraggableArea();
    drag(player);
    click(player);
  }

  // reset all drag/click event listeners
  function resetEvents() {
    document.querySelectorAll(".gameboard.p > .grid-unit").forEach(grid => {
      grid.ondragstart = e => {};
      grid.ondragenter = e => {
        e.preventDefault();
      };
      grid.ondragend = e => {};
      grid.ondragover = e => {
        e.preventDefault();
      };
      grid.onclick = e => {};
    });
  }

  // Reset and set all ships to be draggable 
  function setDraggableArea() {
    // Reset draggable content
    document.querySelectorAll(".gameboard.p > .grid-unit").forEach(grid => {
      grid.setAttribute("draggable", false);
      grid.style['cursor'] = 'auto';
    });
    // Draggable content = any grid with ship class
    let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");
    playerShips.forEach(grid => {
      grid.setAttribute("draggable", true);
      grid.style['cursor'] = 'pointer';
    });
  }

  // Helper bool - Valid droppable place for head - ignore current ship's position when checking validity
  function isDroppable(player, ship, coords) {
    let isValid = true;
    coords.forEach(idx => {
      if (player.gameboard.grids[idx] != null && player.gameboard.grids[idx] != ship || coords.length != ship.length || idx < 0 || idx > 99) {
        // Bounds check placement idx and if not empty
        isValid = false;
      }
    });
    return isValid;
  }

  // Reset and set droppable areas with class 'grid-droppable' 
  function setDroppableArea(player, ship, axis, shipOffset) {
    // Reset droppable grids to have class "grid-droppable"
    document.querySelectorAll(".gameboard.p > .grid-unit").forEach(grid => {
      grid.classList.remove('grid-droppable');
      grid.classList.remove('ship-droppable');
    });
    const playerGrids = document.querySelectorAll(".gameboard.p > .grid-unit");
    // Valid check if head is dropped in grid - 
    playerGrids.forEach(grid => {
      const head = parseInt(grid.id.slice(1));
      if (axis == 0) {
        // Horizontal case 
        // Validation - head must have empty n length to the right
        let coords = [...new Array(ship.length).keys()].map(x => x + head - shipOffset); // Coords array of horizontal ship from head + Account for offset in potential coords
        if (coords.every(x => Math.floor(x / 10) == Math.floor(coords[0] / 10)) && isDroppable(player, ship, coords)) {
          //  Then valid - set droppable
          grid.classList.add('grid-droppable');

          // Set entire ship droppable grids
          coords.forEach(idx => {
            document.getElementById(`p${idx}`).classList.add('ship-droppable');
          });
        }
      } else if (axis == 1) {
        // Vertical case
        // Validation - head must have empty n length grids below within bounds
        let coords = [...new Array(ship.length).keys()].map(x => head + (x - shipOffset) * 10); // Coords array of vertical from head
        if (isDroppable(player, ship, coords)) {
          grid.classList.add('grid-droppable');

          // Set entire ship droppable grids
          coords.forEach(idx => {
            document.getElementById(`p${idx}`).classList.add('ship-droppable');
          });
        }
      }
    });
  }
  function drag(player) {
    let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");
    playerShips.forEach(grid => {
      grid.ondragstart = e => {
        e.dataTransfer.effectAllowed = "move";

        // Dragging ship - need to extract Ship object from the grid
        const classes = [...grid.classList];
        let shipIdx = classes.find(value => {
          return value.startsWith("ship-");
        });
        shipIdx = shipIdx.slice(5) - 1;
        // Find class associated with ship + use as hashmap to reference exact ship object used in gameboard
        const shipObj = player.gameboard.ships[shipIdx].ship;

        // Get grid position of current dragged ship - Sort ship coords lowest to highest

        const shipOffset = player.gameboard.ships[shipIdx].coords.sort((a, b) => a > b).findIndex(x => x == parseInt(grid.id.slice(1)));
        console.log(shipOffset);
        setDroppableArea(player, shipObj, shipObj.axis, shipOffset);
        dragEnter(player, shipObj, shipObj.axis, shipIdx, shipOffset);
        dragEnd(player);
      };
    });
  }

  // Drag ship enters droppable area - offer preview of how ship would look placed
  function dragEnter(player, ship, axis, shipIdx, shipOffset) {
    const droppable = document.querySelectorAll(".grid-droppable");
    droppable.forEach(grid => {
      grid.ondragenter = e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none";
        // Reset preview grids
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach(grid => {
          grid.classList.remove(`preview-ship-1`);
          grid.classList.remove(`preview-ship-2`);
          grid.classList.remove(`preview-ship-3`);
          grid.classList.remove(`preview-ship-4`);
          grid.classList.remove(`preview-ship-5`);
        });

        // Get head value 
        if (axis == 0) {
          // Horizontal case 
          const head = parseInt(grid.id.slice(1)) - shipOffset; // Update head value to be offsetted
          let preview = [...new Array(ship.length).keys()].map(x => x + head); // Potential coords array of horizontal ship from head
          preview.forEach(idx => {
            document.querySelector(`#p${idx}`).classList.add(`preview-ship-${shipIdx + 1}`);
          });
          dragDrop(player, ship, shipIdx, preview);
        } else if (axis == 1) {
          // Vertical case
          const head = parseInt(grid.id.slice(1)) - 10 * shipOffset; // Update head value to be offsetted
          let preview = [...new Array(ship.length).keys()].map(x => head + x * 10); // Coords array of vertical from head
          preview.forEach(idx => {
            document.querySelector(`#p${idx}`).classList.add(`preview-ship-${shipIdx + 1}`);
          });
          dragDrop(player, ship, shipIdx, preview);
        }
      };
    });
  }

  // Drag end - regardless of successful drop or not
  function dragEnd(player) {
    let playerShips = document.querySelectorAll(".gameboard.p > .player-ship");
    playerShips.forEach(grid => {
      grid.ondragend = e => {
        e.preventDefault();
        // Reset preview grids
        // Reset droppable grids to have class "grid-droppable"
        document.querySelectorAll(".gameboard.p > .grid-unit").forEach(grid => {
          grid.classList.remove(`preview-ship-1`);
          grid.classList.remove(`preview-ship-2`);
          grid.classList.remove(`preview-ship-3`);
          grid.classList.remove(`preview-ship-4`);
          grid.classList.remove(`preview-ship-5`);
          grid.classList.remove('grid-droppable');
          grid.classList.remove('ship-droppable');
        });
        init(player); // At each drag-end reset draggable+droppable content and reset all listeners
      };
    });
  }

  // Drag place in valid grid - target as potential coords at each drag enter
  function dragDrop(player, ship, shipIdx, potentialCoords) {
    // Coords to be ship-droppable area 
    potentialCoords.forEach(idx => {
      // Get head of placement - always minimum value of coords
      document.getElementById(`p${idx}`).ondrop = e => {
        const oldCoords = player.gameboard.ships[shipIdx].coords;
        // Update gameboard ships[] array and grids[] array
        replaceShip(player, shipIdx, oldCoords, potentialCoords, ship.axis);
        console.log(player);
      };
    });
  }
  function replaceShip(player, shipIdx, oldCoords, newCoords, newAxis) {
    // Storage changes
    // Update gameboard grids[]
    oldCoords.forEach(idx => {
      player.gameboard.grids[idx] = null;
    });
    newCoords.forEach(idx => {
      player.gameboard.grids[idx] = player.gameboard.ships[shipIdx].ship;
    });
    // Change coords in gameboard ships[] object
    player.gameboard.ships[shipIdx].coords = newCoords;

    // Update axis
    player.gameboard.ships[shipIdx].ship.axis = newAxis;

    // Front-End changes
    _ui__WEBPACK_IMPORTED_MODULE_0__["default"].updatePlacedShips(oldCoords, newCoords, shipIdx);
  }
  function click(player) {
    document.querySelectorAll(".gameboard.p > .player-ship").forEach(grid => {
      grid.onclick = e => {
        console.log("clicked");
        // extract shipIdx from grid
        const classes = [...grid.classList];
        let shipIdx = classes.find(value => {
          return value.startsWith("ship-");
        });
        shipIdx = shipIdx.slice(5) - 1;
        // Find class associated with ship + use as hashmap to reference exact ship object used in gameboard
        const shipObj = player.gameboard.ships[shipIdx].ship;
        const oldCoords = player.gameboard.ships[shipIdx].coords;
        const head = Math.min(...oldCoords);

        // Attempt rotation
        if (shipObj.axis == 0) {
          // Horizontal --> Vertical
          let newCoords = [...new Array(shipObj.length).keys()].map(x => head + x * 10); // Coords array of vertical from head

          if (isDroppable(player, shipObj, newCoords)) {
            // Check if droppable - then rotate
            replaceShip(player, shipIdx, oldCoords, newCoords, 1);
            init(player);
          } else {
            shake(oldCoords);
          }
        } else if (shipObj.axis == 1) {
          // Vertical --> Horizontal
          let newCoords = [...new Array(shipObj.length).keys()].map(x => x + head); // Coords array of horizontal ship from head
          if (newCoords.every(x => Math.floor(x / 10) == Math.floor(newCoords[0] / 10)) && isDroppable(player, shipObj, newCoords)) {
            replaceShip(player, shipIdx, oldCoords, newCoords, 0);
            init(player);
          } else {
            shake(oldCoords);
          }
        }
      };
    });
  }

  // Helper function - animate coords using keyframes object
  function shake(coords) {
    console.log("shake");
    coords.forEach(idx => {
      let grid = document.getElementById(`p${idx}`);
      grid.animate([{
        transform: "translate3d(-1px, 0, 0)"
      }, {
        transform: "translate3d(2px, 0, 0)"
      }, {
        transform: "translate3d(-4px, 0, 0)"
      }, {
        transform: "translate3d(4px, 0, 0)"
      }, {
        transform: "translate3d(-4px, 0, 0)"
      }, {
        transform: "translate3d(4px, 0, 0)"
      }, {
        transform: "translate3d(-4px, 0, 0)"
      }, {
        transform: "translate3d(2px, 0, 0)"
      }, {
        transform: "translate3d(-1px, 0, 0)"
      }], 500);
    });
  }
  function terminate() {
    resetEvents();
    // Reset draggable content
    document.querySelectorAll(".gameboard.p > .grid-unit").forEach(grid => {
      grid.setAttribute("draggable", false);
      grid.style['cursor'] = 'auto';
    });
  }
  return {
    init,
    terminate
  };
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DragDrop);

/***/ }),

/***/ "./src/modules/scoreboard.js":
/*!***********************************!*\
  !*** ./src/modules/scoreboard.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const ScoreBoard = (() => {
  function createScoreboard(player, computer) {
    console.log("creating");
    document.querySelectorAll(".scoreboard > div").forEach(score => {
      score.innerHTML = "";
      score.classList.remove("score-sunk");
    });
    document.querySelectorAll(".scoreboard").forEach(scoreboard => {
      if (scoreboard.classList.contains('p')) {
        // Player's scoreboard
        [...scoreboard.children].forEach(score => {
          // Use score div ID as hashcode to gather data
          const shipIdx = score.id.slice(-1);
          for (let i = 0; i < player.gameboard.ships[shipIdx - 1].ship.length; i++) {
            let box = document.createElement("div");
            box.classList.add("box");
            box.classList.add(`ship-${shipIdx}`);
            score.appendChild(box);
          }
        });
      } else {
        // Computer scoreboard
        [...scoreboard.children].forEach(score => {
          // Use score div ID as hashcode to gather data
          const shipIdx = score.id.slice(-1);
          for (let i = 0; i < computer.gameboard.ships[shipIdx - 1].ship.length; i++) {
            let box = document.createElement("div");
            box.classList.add("box");
            box.classList.add(`ship-${shipIdx}`);
            score.appendChild(box);
          }
        });
      }
    });
  }
  function updateScoreboard(player, computer) {
    document.querySelectorAll(".scoreboard").forEach(scoreboard => {
      if (scoreboard.classList.contains('p')) {
        // Player scoreboard
        [...scoreboard.children].forEach(score => {
          // Use score div ID as hashcode to gather data
          const shipIdx = parseInt(score.id.toString().slice(-1));
          if (player.gameboard.ships[shipIdx - 1].ship.isSunk) score.classList.add("score-sunk");
        });
      } else {
        // Computer scoreboard
        [...scoreboard.children].forEach(score => {
          // Use score div ID as hashcode to gather data
          const shipIdx = parseInt(score.id.toString().slice(-1));
          if (computer.gameboard.ships[shipIdx - 1].ship.isSunk) score.classList.add("score-sunk");
        });
      }
    });
  }
  return {
    createScoreboard,
    updateScoreboard
  };
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ScoreBoard);

/***/ }),

/***/ "./src/modules/ui.js":
/*!***************************!*\
  !*** ./src/modules/ui.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _factories_ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../factories/ship */ "./src/factories/ship.js");
/* harmony import */ var _factories_player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../factories/player */ "./src/factories/player.js");
/* harmony import */ var _dragDrop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dragDrop */ "./src/modules/dragDrop.js");
/* harmony import */ var _battleshipAI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./battleshipAI */ "./src/modules/battleshipAI.js");
/* harmony import */ var _scoreboard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scoreboard */ "./src/modules/scoreboard.js");
/* harmony import */ var _assets_github_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../assets/github.png */ "./src/assets/github.png");
/* harmony import */ var _assets_favicon_png__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../assets/favicon.png */ "./src/assets/favicon.png");







const UI = (() => {
  function setup() {
    document.querySelector("#github").src = _assets_github_png__WEBPACK_IMPORTED_MODULE_5__;
    document.querySelector('#favicon').setAttribute('href', _assets_favicon_png__WEBPACK_IMPORTED_MODULE_6__);
  }
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
    }
    ;
    let gameboardC = document.querySelector(".gameboard.c");
    gameboardC.innerHTML = ""; // Clear existing
    for (let i = 0; i < 100; i++) {
      const gridUnit = document.createElement('div');
      gridUnit.classList.add('grid-unit');
      gridUnit.id = `c${i}`; // assign each an id from 0 to n*n-1

      gridUnit.style.width = `calc(10% - 3px)`;
      gridUnit.style.height = `calc(10% - 3px)`;
      gameboardC.appendChild(gridUnit);
    }
    ;
  }
  function initGame() {
    // DOM for prep stage
    document.querySelector("#start").style['display'] = 'flex';
    document.querySelector("#restart").style['display'] = 'none';
    document.querySelector(".header-helper").textContent = "Assemble the fleet";
    document.querySelector(".header-desc").textContent = "Drag to Move and Click to Rotate";

    // Set display for player to move/rotate ships -> show player grid, lock computer grid
    document.querySelector(".gameboard.p").classList.remove("locked");
    document.querySelector(".gameboard.c").classList.add("locked");
    let player = new _factories_player__WEBPACK_IMPORTED_MODULE_1__["default"]();
    let computer = new _factories_player__WEBPACK_IMPORTED_MODULE_1__["default"]();

    // Create DOM grids and display 
    displayGrids();

    // Place player + computer ships randomly
    placeRandomShips(player);
    placeRandomShips(computer);
    initDisplayShips(player, computer);

    // Create DOM scoreboard
    _scoreboard__WEBPACK_IMPORTED_MODULE_4__["default"].createScoreboard(player, computer);

    // Allow player to move/rotate ship locations
    playerShipSelect(player);

    // Start - Ships selected
    document.querySelector("#start").onclick = e => {
      // DOM for battle
      document.querySelector("#start").style['display'] = 'none';
      document.querySelector("#restart").style['display'] = 'flex';
      document.querySelector(".header-helper").textContent = "Let the battle begin!";
      document.querySelector(".header-desc").textContent = "Keep an eye on the scoreboard";

      // Set display to Player Attack -> lock player grid, show computer grid for player attack
      document.querySelector(".gameboard.p").classList.add("locked");
      document.querySelector(".gameboard.c").classList.remove("locked");
      _dragDrop__WEBPACK_IMPORTED_MODULE_2__["default"].terminate(); // Terminate grid events
      gameLogic(player, computer);
    };

    // Restart button once game begins
    document.querySelector("#restart").onclick = e => {
      initGame();
    };
  }
  function playerShipSelect(player) {
    _dragDrop__WEBPACK_IMPORTED_MODULE_2__["default"].init(player);
  }

  // Helper function - Return array of random coordinate placement based on ship's length
  function randomCoordinates(ship) {
    let pos = Math.floor(Math.random() * 100);
    let axis = Math.floor(Math.random() * 2); // 0 is horizantal, 1 is vertical
    let coords = [...new Array(ship.length).keys()]; // Start with coord array of [0...n]
    if (axis == 0) {
      // Horizontal
      coords = coords.map(x => x + pos);
      // Error check + Cycle until valid - must all have same x//10 value to be in same y-axis
      while (!coords.every(x => Math.floor(x / 10) == Math.floor(coords[0] / 10))) {
        let pos = Math.floor(Math.random() * 100);
        coords = coords.map(x => x + pos);
        console.log("Horizontal zigzag - Cycling");
      }
    } else if (axis == 1) {
      // Vertical - must all have same x%10 value to be in same x-axis
      coords = coords.map(x => pos + 10 * x);
    }
    return {
      array: coords,
      axis
    };
  }
  function placeRandomShips(player) {
    let fleet = [new _factories_ship__WEBPACK_IMPORTED_MODULE_0__["default"](2), new _factories_ship__WEBPACK_IMPORTED_MODULE_0__["default"](3), new _factories_ship__WEBPACK_IMPORTED_MODULE_0__["default"](3), new _factories_ship__WEBPACK_IMPORTED_MODULE_0__["default"](4), new _factories_ship__WEBPACK_IMPORTED_MODULE_0__["default"](5)];
    fleet.forEach(ship => {
      let coords = randomCoordinates(ship);
      // Error check cycle until valid - then place
      while (!player.gameboard.isValidPlacement(ship, coords.array)) {
        coords = randomCoordinates(ship);
        console.log("Invalid randomization - Cycling");
      }
      player.gameboard.placeShip(ship, coords.array);
      ship.setAxis(coords.axis);
    });
    console.log(player);
  }
  function initDisplayShips(player, computer) {
    // Mark each ship with class to distinguish
    let i = 1;
    let j = 1;
    player.gameboard.ships.forEach(shipObj => {
      shipObj.coords.forEach(coord => {
        document.querySelector(`.gameboard.p > #p${coord}`).classList.add(`ship-${i}`);
        document.querySelector(`.gameboard.p > #p${coord}`).classList.add("player-ship");
      });
      i++;
    });

    // Mark each ship with class to distinguish
    computer.gameboard.ships.forEach(shipObj => {
      shipObj.coords.forEach(coord => {
        document.querySelector(`.gameboard.c > #c${coord}`).classList.add(`ship-${j}`);
        document.querySelector(`.gameboard.c > #c${coord}`).classList.add("grid-hidden");
      });
      j++;
    });
  }
  function updatePlacedShips(oldCoords, newCoords, shipIdx) {
    // Replace classes `ship-${shipIdx}` + 'player-ship'
    oldCoords.forEach(idx => {
      document.querySelector(`#p${idx}`).classList.remove(`ship-${shipIdx + 1}`);
      document.querySelector(`#p${idx}`).classList.remove(`player-ship`);
    });
    newCoords.forEach(idx => {
      document.querySelector(`#p${idx}`).classList.add(`ship-${shipIdx + 1}`);
      document.querySelector(`#p${idx}`).classList.add(`player-ship`);
    });
  }
  function updateGrids(player, computer) {
    // Update player grids
    let playerAttacks = player.gameboard.attacks;
    playerAttacks.forEach(idx => {
      if (player.gameboard.grids[idx]) {
        document.querySelector(`#p${idx}`).classList.add("grid-found");
        document.querySelector(`.gameboard.p > #p${idx}`).innerHTML = "&#10005;";
      } else {
        document.querySelector(`#p${idx}`).classList.add("grid-missed");
        document.querySelector(`.gameboard.p > #p${idx}`).innerHTML = "&#x2022;";
      }
    });

    // Update computer grids
    let compAttacks = computer.gameboard.attacks;
    compAttacks.forEach(idx => {
      if (computer.gameboard.grids[idx]) {
        document.querySelector(`#c${idx}`).classList.add("grid-found");
        document.querySelector(`#c${idx}`).classList.remove("grid-hidden");
        document.querySelector(`.gameboard.c > #c${idx}`).innerHTML = "&#10005;";
      } else {
        document.querySelector(`#c${idx}`).classList.add("grid-missed");
        document.querySelector(`.gameboard.c > #c${idx}`).innerHTML = "&#x2022;";
      }
    });
  }
  function updateShips(player, computer) {
    player.gameboard.ships.forEach(shipObj => {
      shipObj.coords.forEach(coord => {
        if (shipObj.ship.isSunk) {
          document.querySelector(`.gameboard.p > #p${coord}`).classList.add("grid-sunk");
          document.querySelector(`.gameboard.p > #p${coord}`).classList.remove("grid-found");
        }
      });
    });
    if (computer) {
      computer.gameboard.ships.forEach(shipObj => {
        shipObj.coords.forEach(coord => {
          if (shipObj.ship.isSunk) {
            document.querySelector(`.gameboard.c > #c${coord}`).classList.add("grid-sunk");
            document.querySelector(`.gameboard.c > #c${coord}`).classList.remove("grid-found");
          }
        });
      });
    }
  }
  function gameLogic(player, computer) {
    const grids = document.querySelectorAll(".gameboard.c > .grid-unit");
    grids.forEach(grid => {
      grid.onclick = () => {
        if (!computer.gameboard.attacks.includes(parseInt(grid.id.slice(1)))) {
          playRound(player, computer, parseInt(grid.id.slice(1)));
        }
      };
    });
  }
  async function playRound(player, computer, input) {
    // ATP got input -> show player grid for AI attack, lock computer grid
    document.querySelector(".gameboard.p").classList.remove("locked");
    document.querySelector(".gameboard.c").classList.add("locked");

    // Handle player's input -> Update Grid Display -> Check if winner
    playerAttack(computer, input);
    updateGrids(player, computer);
    updateShips(player, computer);
    _scoreboard__WEBPACK_IMPORTED_MODULE_4__["default"].updateScoreboard(player, computer);
    if (computer.gameboard.isGameOver()) {
      // TODO - create game over styling transition in winning player grid
      document.querySelector(".gameboard.c").classList.add("locked");
      gameOver("Player", player);
    }

    // Computer Attack -> Update Grid Display -> Check if winner
    await delay(500);
    _battleshipAI__WEBPACK_IMPORTED_MODULE_3__["default"].AIAttack(player);
    updateGrids(player, computer);
    updateShips(player, computer);
    _scoreboard__WEBPACK_IMPORTED_MODULE_4__["default"].updateScoreboard(player, computer);
    if (player.gameboard.isGameOver()) {
      // TODO - create game over styling transition in winning player grid
      document.querySelector(".gameboard.c").classList.add("locked");
      gameOver("Computer", computer);
    }
    ; //TODO - Handle game over

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
      setTimeout(res, ms);
    });
  }

  // If gameover, pop modal and show winner until restart
  async function gameOver(winnerText) {
    const dialog = document.querySelector(".result");
    const text = document.querySelector(".result-text");
    const restart = document.querySelector("#play-again");
    await delay(1000);
    dialog.showModal();
    dialog.classList.add("result-displayed");
    text.textContent = `${winnerText} wins!`;
    restart.onclick = () => {
      // Restart game
      dialog.close();
      dialog.classList.remove("result-displayed");
      initGame();
    };
  }
  return {
    setup,
    displayGrids,
    initGame,
    updatePlacedShips
  };
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UI);

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style/style.css":
/*!*******************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style/style.css ***!
  \*******************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Arsenal+SC:ital,wght@0,400;0,700;1,400;1,700&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Font + meta */

img {
    max-width: 100%;
}

body {
    display: flex;
    flex-direction: column;
    margin: 0;

    font-family: "Arsenal SC", sans-serif;
    font-weight: 400;
    font-style: normal;
}

/* Header */
.header {
    height: 120px;
    
    font-size: 42px;
    margin-top: 15px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.header-desc {
    font-size: 16px;
    font-style: italic;
}
/* Start/restart button */
/* CSS */
.head-btn {
  align-items: center;
  background-color: #fff;
  border: 1px solid #000;
  box-sizing: border-box;
  color: #000;
  cursor: pointer;
  display: flex;
  fill: #000;
  font-family: "Arsenal SC", sans-serif;
  font-size: 18px;
  font-weight: 400;
  justify-content: center;
  letter-spacing: -.8px;
  line-height: 24px;
  min-width: 180px;
  outline: 0;
  padding: 8px 10px;
  text-align: center;
  text-decoration: none;
  transition: all .3s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  margin-top: 25px;
}

.head-btn:focus {
  color: #171e29;
}

.head-btn:hover {
  border-color: #06f;
  color: #06f;
  fill: #06f;
}

.head-btn:active {
  border-color: #06f;
  color: #06f;
  fill: #06f;
}

.main {
    flex: 1;

    margin: auto;
    width: 80%;

    display: flex;

    align-items: center;
    justify-content: center;
}

.player, .computer {
    height: 100%;
    min-width: 44%;

    padding-top: 5px;
    padding-bottom: 75px;

    display: flex;
    flex-direction: column;

    align-items: center;
}

.gameboard-label {
    margin: 10px;
    text-decoration: underline;
}

/* Gameboard styling */
.gameboard {
    height: 420px;
    width: 420px;

    /* outline: 1px solid black; */

    display: flex;
    flex-wrap: wrap;

    transition: all 0.3s;
}

.locked,
.gameboard-label:has(+ .locked) {
    opacity: 0.4;
    pointer-events: none;
}

/* Grid-units styling - all states */
/* Empty Grid - default */
.grid-unit {
    outline: rgb(92, 158, 173) solid 0.5px;
    box-sizing: border-box;
    margin: 1.5px; /* coupled with UI.displayGrids()*/

    display: flex;
    justify-content: center;
    align-items: center;
}

.gameboard.c {
    cursor: crosshair;
}

.grid-missed {
    font-size: 24px;
    outline: rgb(220,36,31) solid 0.5px;
    background-color: rgba(220,36,31, 0.3);
}

/* Priority State Styling -> Any 3 of these will not be mutually applied at any point*/
.grid-hidden {
    outline: rgb(92, 158, 173) solid 0.5px !important;
    background-color: white !important;    
}

.grid-found {
    font-size: 12px;
    outline: rgb(23,159,102) solid 0.5px !important;
    background-color: rgba(23,159,102, 0.3) !important;
}

.grid-sunk {
    font-size: 12px;
    outline: rgb(92, 158, 173) solid 0.5px !important;
    background-color: rgb(92, 158, 173, 0.1) !important;
}

/* Grid-ship individual styling*/
.ship-1 {
    outline: rgb(0,20,255) solid 1px;
    background-color: rgba(0,20,255, 0.3);
}

.ship-2 {
    outline: rgb(20,50,255) solid 1px;
    background-color: rgba(20,50,255, 0.3);
}

.ship-3 {
    outline: rgb(51,102,255) solid 1px;
    background-color: rgba(51,102,255, 0.3);
}

.ship-4 {
    outline: rgb(85,136,255) solid 1px;
    background-color: rgba(85,136,255, 0.3);
}

.ship-5 {
    outline: rgb(119,170,255) solid 1px;
    background-color: rgba(119,170,255, 0.3);
}

/* Drag drop preview styling for each ship*/
.preview-ship-1 {
    outline: rgb(0,20,255) solid 1px !important;
    background-color: rgba(0,20,255, 0.3) !important;
}

.preview-ship-2 {
    outline: rgb(20,50,255) solid 1px !important;
    background-color: rgba(20,50,255, 0.3) !important;
}

.preview-ship-3 {
    outline: rgb(51,102,255) solid 1px !important;
    background-color: rgba(51,102,255, 0.3) !important;
}

.preview-ship-4 {
    outline: rgb(85,136,255) solid 1px !important;
    background-color: rgba(85,136,255, 0.3) !important;
}

.preview-ship-5 {
    outline: rgb(119,170,255) solid 1px !important;
    background-color: rgba(119,170,255, 0.3) !important;
}

.ship-droppable {
    outline: rgb(92, 158, 173) solid 0.5px;
    background-color: rgba(231,245,244,0.6);
}

/* Scoreboard Styling */

.scoreboard-label {
    margin-top: 20px;
    margin-bottom: 10px;
}

.scoreboard {
    display: flex;
    justify-content: center;

    gap: 10px;
}

.scoreboard > div {
    display: flex;
    gap: 1px;
}

.scoreboard > div.score-sunk {
    display: none;
}

.box {
    outline: 0px !important;
    width: 15px;
    height: 15px;
}


/* results modal styling */
dialog::backdrop {
    opacity: 0.9;
}

.result {
    width: 40%;
    height: 40vh;

    border: 1px solid black;
}

/* result modal flex to be run only when displayed */
.result-displayed {
    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
}

.result-text {
    margin-bottom: 30px;
    font-size: 42px;
}

#play-again {
  background-color: #FFFFFF;
  border: 1px solid #222222;
  box-sizing: border-box;
  color: #222222;
  cursor: pointer;
  display: inline-block;
  font-family: 'Arsenal SC',-apple-system,BlinkMacSystemFont,Roboto,"Helvetica Neue",sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  margin: 0;
  outline: none;
  padding: 13px 23px;
  position: relative;
  text-align: center;
  text-decoration: none;
  touch-action: manipulation;
  transition: box-shadow .2s,-ms-transform .1s,-webkit-transform .1s,transform .1s;
  user-select: none;
  -webkit-user-select: none;
  width: auto;
}

#play-again:active {
  background-color: #F7F7F7;
  border-color: #000000;
  transform: scale(.96);
}

#play-again:disabled {
  border-color: #DDDDDD;
  color: #DDDDDD;
  cursor: not-allowed;
  opacity: 1;
}

.footer {
    font-family: "Arsenal SC", sans-serif;

    background-color: white;
    color: black;
    height: 100px;

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 16px;
}

.github-logo {
    margin-left: 10px;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.github-a img{
    opacity: 0.5;
    transition: all 300ms;
}

.github-a img:hover {
    opacity: 1;
    transform: rotate(360deg) scale(1.1);
}

/* Media query */

@media only screen and (max-width: 1300px) {
    .main {
        width: 100%;
    }
}

@media only screen and (max-width: 1000px) {
    .gameboard {
        width: 350px;
        height: 350px;
    }
    .main {
        width: 100%;
    }
}

@media only screen and (max-width: 800px) {
    .main {
        display: flex;
        flex-direction: column;
    }
    .header {
        height: 200px;
        margin-bottom: 20px;
    }
    .gameboard {
        width: 470px;
        height: 470px;
    }
}

@media only screen and (max-width: 480px) {
    .gameboard {
        width: 350px;
        height: 350px;
    }
}`, "",{"version":3,"sources":["webpack://./src/style/style.css"],"names":[],"mappings":"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","sourcesContent":["/* Font + meta */\n@import url('https://fonts.googleapis.com/css2?family=Arsenal+SC:ital,wght@0,400;0,700;1,400;1,700&display=swap');\n\nimg {\n    max-width: 100%;\n}\n\nbody {\n    display: flex;\n    flex-direction: column;\n    margin: 0;\n\n    font-family: \"Arsenal SC\", sans-serif;\n    font-weight: 400;\n    font-style: normal;\n}\n\n/* Header */\n.header {\n    height: 120px;\n    \n    font-size: 42px;\n    margin-top: 15px;\n\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n}\n\n.header-desc {\n    font-size: 16px;\n    font-style: italic;\n}\n/* Start/restart button */\n/* CSS */\n.head-btn {\n  align-items: center;\n  background-color: #fff;\n  border: 1px solid #000;\n  box-sizing: border-box;\n  color: #000;\n  cursor: pointer;\n  display: flex;\n  fill: #000;\n  font-family: \"Arsenal SC\", sans-serif;\n  font-size: 18px;\n  font-weight: 400;\n  justify-content: center;\n  letter-spacing: -.8px;\n  line-height: 24px;\n  min-width: 180px;\n  outline: 0;\n  padding: 8px 10px;\n  text-align: center;\n  text-decoration: none;\n  transition: all .3s;\n  user-select: none;\n  -webkit-user-select: none;\n  touch-action: manipulation;\n\n  margin-top: 25px;\n}\n\n.head-btn:focus {\n  color: #171e29;\n}\n\n.head-btn:hover {\n  border-color: #06f;\n  color: #06f;\n  fill: #06f;\n}\n\n.head-btn:active {\n  border-color: #06f;\n  color: #06f;\n  fill: #06f;\n}\n\n.main {\n    flex: 1;\n\n    margin: auto;\n    width: 80%;\n\n    display: flex;\n\n    align-items: center;\n    justify-content: center;\n}\n\n.player, .computer {\n    height: 100%;\n    min-width: 44%;\n\n    padding-top: 5px;\n    padding-bottom: 75px;\n\n    display: flex;\n    flex-direction: column;\n\n    align-items: center;\n}\n\n.gameboard-label {\n    margin: 10px;\n    text-decoration: underline;\n}\n\n/* Gameboard styling */\n.gameboard {\n    height: 420px;\n    width: 420px;\n\n    /* outline: 1px solid black; */\n\n    display: flex;\n    flex-wrap: wrap;\n\n    transition: all 0.3s;\n}\n\n.locked,\n.gameboard-label:has(+ .locked) {\n    opacity: 0.4;\n    pointer-events: none;\n}\n\n/* Grid-units styling - all states */\n/* Empty Grid - default */\n.grid-unit {\n    outline: rgb(92, 158, 173) solid 0.5px;\n    box-sizing: border-box;\n    margin: 1.5px; /* coupled with UI.displayGrids()*/\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.gameboard.c {\n    cursor: crosshair;\n}\n\n.grid-missed {\n    font-size: 24px;\n    outline: rgb(220,36,31) solid 0.5px;\n    background-color: rgba(220,36,31, 0.3);\n}\n\n/* Priority State Styling -> Any 3 of these will not be mutually applied at any point*/\n.grid-hidden {\n    outline: rgb(92, 158, 173) solid 0.5px !important;\n    background-color: white !important;    \n}\n\n.grid-found {\n    font-size: 12px;\n    outline: rgb(23,159,102) solid 0.5px !important;\n    background-color: rgba(23,159,102, 0.3) !important;\n}\n\n.grid-sunk {\n    font-size: 12px;\n    outline: rgb(92, 158, 173) solid 0.5px !important;\n    background-color: rgb(92, 158, 173, 0.1) !important;\n}\n\n/* Grid-ship individual styling*/\n.ship-1 {\n    outline: rgb(0,20,255) solid 1px;\n    background-color: rgba(0,20,255, 0.3);\n}\n\n.ship-2 {\n    outline: rgb(20,50,255) solid 1px;\n    background-color: rgba(20,50,255, 0.3);\n}\n\n.ship-3 {\n    outline: rgb(51,102,255) solid 1px;\n    background-color: rgba(51,102,255, 0.3);\n}\n\n.ship-4 {\n    outline: rgb(85,136,255) solid 1px;\n    background-color: rgba(85,136,255, 0.3);\n}\n\n.ship-5 {\n    outline: rgb(119,170,255) solid 1px;\n    background-color: rgba(119,170,255, 0.3);\n}\n\n/* Drag drop preview styling for each ship*/\n.preview-ship-1 {\n    outline: rgb(0,20,255) solid 1px !important;\n    background-color: rgba(0,20,255, 0.3) !important;\n}\n\n.preview-ship-2 {\n    outline: rgb(20,50,255) solid 1px !important;\n    background-color: rgba(20,50,255, 0.3) !important;\n}\n\n.preview-ship-3 {\n    outline: rgb(51,102,255) solid 1px !important;\n    background-color: rgba(51,102,255, 0.3) !important;\n}\n\n.preview-ship-4 {\n    outline: rgb(85,136,255) solid 1px !important;\n    background-color: rgba(85,136,255, 0.3) !important;\n}\n\n.preview-ship-5 {\n    outline: rgb(119,170,255) solid 1px !important;\n    background-color: rgba(119,170,255, 0.3) !important;\n}\n\n.ship-droppable {\n    outline: rgb(92, 158, 173) solid 0.5px;\n    background-color: rgba(231,245,244,0.6);\n}\n\n/* Scoreboard Styling */\n\n.scoreboard-label {\n    margin-top: 20px;\n    margin-bottom: 10px;\n}\n\n.scoreboard {\n    display: flex;\n    justify-content: center;\n\n    gap: 10px;\n}\n\n.scoreboard > div {\n    display: flex;\n    gap: 1px;\n}\n\n.scoreboard > div.score-sunk {\n    display: none;\n}\n\n.box {\n    outline: 0px !important;\n    width: 15px;\n    height: 15px;\n}\n\n\n/* results modal styling */\ndialog::backdrop {\n    opacity: 0.9;\n}\n\n.result {\n    width: 40%;\n    height: 40vh;\n\n    border: 1px solid black;\n}\n\n/* result modal flex to be run only when displayed */\n.result-displayed {\n    display: flex;\n    flex-direction: column;\n\n    align-items: center;\n    justify-content: center;\n}\n\n.result-text {\n    margin-bottom: 30px;\n    font-size: 42px;\n}\n\n#play-again {\n  background-color: #FFFFFF;\n  border: 1px solid #222222;\n  box-sizing: border-box;\n  color: #222222;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Arsenal SC',-apple-system,BlinkMacSystemFont,Roboto,\"Helvetica Neue\",sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  line-height: 20px;\n  margin: 0;\n  outline: none;\n  padding: 13px 23px;\n  position: relative;\n  text-align: center;\n  text-decoration: none;\n  touch-action: manipulation;\n  transition: box-shadow .2s,-ms-transform .1s,-webkit-transform .1s,transform .1s;\n  user-select: none;\n  -webkit-user-select: none;\n  width: auto;\n}\n\n#play-again:active {\n  background-color: #F7F7F7;\n  border-color: #000000;\n  transform: scale(.96);\n}\n\n#play-again:disabled {\n  border-color: #DDDDDD;\n  color: #DDDDDD;\n  cursor: not-allowed;\n  opacity: 1;\n}\n\n.footer {\n    font-family: \"Arsenal SC\", sans-serif;\n\n    background-color: white;\n    color: black;\n    height: 100px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    font-size: 16px;\n}\n\n.github-logo {\n    margin-left: 10px;\n    width: 24px;\n    height: 24px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.github-a img{\n    opacity: 0.5;\n    transition: all 300ms;\n}\n\n.github-a img:hover {\n    opacity: 1;\n    transform: rotate(360deg) scale(1.1);\n}\n\n/* Media query */\n\n@media only screen and (max-width: 1300px) {\n    .main {\n        width: 100%;\n    }\n}\n\n@media only screen and (max-width: 1000px) {\n    .gameboard {\n        width: 350px;\n        height: 350px;\n    }\n    .main {\n        width: 100%;\n    }\n}\n\n@media only screen and (max-width: 800px) {\n    .main {\n        display: flex;\n        flex-direction: column;\n    }\n    .header {\n        height: 200px;\n        margin-bottom: 20px;\n    }\n    .gameboard {\n        width: 470px;\n        height: 470px;\n    }\n}\n\n@media only screen and (max-width: 480px) {\n    .gameboard {\n        width: 350px;\n        height: 350px;\n    }\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/style/style.css":
/*!*****************************!*\
  !*** ./src/style/style.css ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./src/assets/favicon.png":
/*!********************************!*\
  !*** ./src/assets/favicon.png ***!
  \********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "5625e0d09310cad210c0.png";

/***/ }),

/***/ "./src/assets/github.png":
/*!*******************************!*\
  !*** ./src/assets/github.png ***!
  \*******************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "7615be16eed41f806def.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style/style.css */ "./src/style/style.css");
/* harmony import */ var _modules_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/ui */ "./src/modules/ui.js");


_modules_ui__WEBPACK_IMPORTED_MODULE_1__["default"].setup();
_modules_ui__WEBPACK_IMPORTED_MODULE_1__["default"].initGame();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7O0FBRW5CO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLE9BQU8sOEZBQThGLE1BQU0sVUFBVSxPQUFPLEtBQUssVUFBVSxZQUFZLFlBQVksWUFBWSxhQUFhLGFBQWEsT0FBTyxVQUFVLEtBQUssV0FBVyxVQUFVLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLE1BQU0sWUFBWSxXQUFXLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxjQUFjLGFBQWEsT0FBTyxLQUFLLFVBQVUsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLE1BQU0sS0FBSyxZQUFZLFdBQVcsVUFBVSxNQUFNLEtBQUssV0FBVyxVQUFVLFdBQVcsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsV0FBVyxZQUFZLGNBQWMsV0FBVyxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLFlBQVksTUFBTSxVQUFVLFdBQVcsYUFBYSxXQUFXLFdBQVcsWUFBWSxPQUFPLE1BQU0sVUFBVSxZQUFZLE9BQU8sWUFBWSxhQUFhLE1BQU0sWUFBWSxhQUFhLHdCQUF3QixXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxZQUFZLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxZQUFZLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxZQUFZLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLGFBQWEsTUFBTSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsYUFBYSxXQUFXLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFFBQVEsWUFBWSxNQUFNLFVBQVUsT0FBTyxLQUFLLFVBQVUsV0FBVyxZQUFZLE9BQU8sWUFBWSxNQUFNLFVBQVUsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsWUFBWSxXQUFXLE1BQU0sS0FBSyxhQUFhLGFBQWEsV0FBVyxXQUFXLFVBQVUsWUFBWSxjQUFjLFdBQVcsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLGFBQWEsTUFBTSxLQUFLLFVBQVUsS0FBSyxNQUFNLEtBQUssS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsS0FBSyxNQUFNLEtBQUssS0FBSyxVQUFVLFlBQVksTUFBTSxLQUFLLFVBQVUsWUFBWSxNQUFNLEtBQUssVUFBVSxVQUFV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O1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ2xCQTs7Ozs7Ozs7Ozs7QUNBMkI7QUFDRTtBQUU3QkEsbURBQUUsQ0FBQzhFLEtBQUssQ0FBQyxDQUFDO0FBQ1Y5RSxtREFBRSxDQUFDc0YsUUFBUSxDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JsYW5rLy4vc3JjL2ZhY3Rvcmllcy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvZmFjdG9yaWVzL3BsYXllci5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9mYWN0b3JpZXMvc2hpcC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL2JhdHRsZXNoaXBBSS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL2RyYWdEcm9wLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL21vZHVsZXMvc2NvcmVib2FyZC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL3VpLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL3N0eWxlL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9zdHlsZS9zdHlsZS5jc3M/YzlmMCIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNoaXAgZnJvbSAnLi9zaGlwJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lYm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmdyaWRzID0gbmV3IEFycmF5KDEwMCkuZmlsbChudWxsKTsgLy8gMkQgYXJyYXkgaWxsdXN0cmF0ZWQgYnkgMUQgKDEweDEwKVxuICAgICAgICB0aGlzLmF0dGFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5zaGlwcyA9IFtdO1xuICAgIH1cblxuICAgIGlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHNbaWR4XSAhPSBudWxsIHx8IGNvb3Jkcy5sZW5ndGggIT0gc2hpcC5sZW5ndGggfHwgaWR4IDwgMCB8fCBpZHggPiA5OSkge1xuICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayBwbGFjZW1lbnQgaWR4IGFuZCBpZiBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBwbGFjZVNoaXAoc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzKSkge1xuICAgICAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHNbaWR4XSA9IHNoaXA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdGhpcy5zaGlwcy5wdXNoKHtzaGlwLCBjb29yZHN9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlY2VpdmVBdHRhY2soY29vcmQpIHtcbiAgICAgICAgLy8gUmVnaXN0ZXIgYXR0YWNrIG9ubHkgaWYgdmFsaWRcbiAgICAgICAgaWYgKCF0aGlzLmF0dGFja3MuaW5jbHVkZXMoY29vcmQpICYmIGNvb3JkID49IDAgJiYgY29vcmQgPD0gOTkpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNrcy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRzW2Nvb3JkXSkge1xuICAgICAgICAgICAgICAgIC8vIFNoaXAgaGl0IC0gcmVnaXN0ZXIgaGl0IHRvIGNvcnJlc3BvbmRpbmcgc2hpcCBvYmplY3RcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzW2Nvb3JkXS5oaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE1pc3NlcygpIHtcbiAgICAgICAgbGV0IG1pc3NlcyA9IFtdO1xuICAgICAgICB0aGlzLmF0dGFja3MuZm9yRWFjaCgoYXR0YWNrKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1thdHRhY2tdID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtaXNzZXMucHVzaChhdHRhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gbWlzc2VzO1xuICAgIH1cblxuICAgIGdldFJlbWFpbmluZygpIHtcbiAgICAgICAgbGV0IHJlbWFpbmluZyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXR0YWNrcy5pbmNsdWRlcyhpKSkgcmVtYWluaW5nLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlbWFpbmluZztcbiAgICB9XG5cbiAgICBpc0dhbWVPdmVyKCkge1xuICAgICAgICBsZXQgZ2FtZW92ZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIGlmICghc2hpcE9iai5zaGlwLmlzU3VuaykgZ2FtZW92ZXIgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGdhbWVvdmVyO1xuICAgIH1cbn0iLCJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmdhbWVib2FyZCA9IG5ldyBHYW1lYm9hcmQ7XG4gICAgfVxufVxuXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTaGlwIHtcbiAgICBjb25zdHJ1Y3RvcihsZW5ndGgsIGF4aXM9MCkge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aCxcbiAgICAgICAgdGhpcy5oaXRzID0gMDtcbiAgICAgICAgdGhpcy5pc1N1bmsgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5heGlzID0gYXhpczsgLy8gMCBob3Jpem9udGFsLCAxIHZlcnRpY2FsXG4gICAgfVxuXG4gICAgc2V0QXhpcyhheGlzKSB7XG4gICAgICAgIHRoaXMuYXhpcyA9IGF4aXM7XG4gICAgfVxuXG4gICAgZ2V0QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXhpcztcbiAgICB9XG5cbiAgICBoaXQoKSB7XG4gICAgICAgIHRoaXMuaGl0cysrOyBcbiAgICAgICAgaWYgKHRoaXMuaGl0cyA+PSB0aGlzLmxlbmd0aCkgdGhpcy5pc1N1bmsgPSB0cnVlO1xuICAgIH1cbn0iLCJpbXBvcnQgU2hpcCBmcm9tIFwiLi4vZmFjdG9yaWVzL3NoaXBcIjtcbmltcG9ydCBQbGF5ZXIgZnJvbSBcIi4uL2ZhY3Rvcmllcy9wbGF5ZXJcIjtcbmltcG9ydCBEcmFnRHJvcCBmcm9tIFwiLi9kcmFnRHJvcFwiO1xuaW1wb3J0IFNjb3JlQm9hcmQgZnJvbSBcIi4vc2NvcmVib2FyZFwiO1xuXG5jb25zdCBCYXR0bGVzaGlwQUkgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIEFJQXR0YWNrKHBsYXllcikge1xuICAgICAgICAvLyBRdWV1ZTogQXJyYXkgdG8gaG9sZCBhbGwgY3VycmVudGx5IGFjdGlvbmFibGUgZ3JpZHNcbiAgICAgICAgY29uc3QgaGl0c05vdFN1bmsgPSBwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3MuZmlsdGVyKChoaXQpID0+IFxuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5ncmlkc1toaXRdICYmICFwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2hpdF0uaXNTdW5rKTtcbiAgICBcbiAgICAgICAgaWYgKGhpdHNOb3RTdW5rLmxlbmd0aCA+IDApIHsgXG4gICAgICAgICAgICAvLyAwLiBBY3Rpb24gLSBhdCBsZWFzdCAxIGhpdCB0byBhY3QgdXBvblxuICAgICAgICAgICAgLy8gU2V0IHVuc3VuayBzaGlwIG9iaiB3aXRoIG1heCBoaXRzIHRvIHdvcmsgb24gYXMgdGFyZ2V0XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0ge3NoaXA6IG5ldyBTaGlwKDApLCBjb29yZHM6IFtdfTsgLy8gRHVtbXkgdmFyaWFibGUgdG8gdXBkYXRlIGFzIGxvb3BcbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc2hpcE9iai5zaGlwLmlzU3VuayAmJiBzaGlwT2JqLnNoaXAuaGl0cyA+IHRhcmdldC5zaGlwLmhpdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBtYXggaGl0LCB1bnN1bmsgc2hpcFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBzaGlwT2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRhcmdldCA9IFwiLCB0YXJnZXQpO1xuICAgIFxuICAgICAgICAgICAgLy8gR2V0IHRhcmdldCdzIGFscmVhZHkgaGl0IGNvb3JkcyBhbmQgc3RvcmUgaW4gYXJyYXlcbiAgICAgICAgICAgIGxldCB0YXJnZXRIaXRzID0gaGl0c05vdFN1bmsuZmlsdGVyKChoaXQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxheWVyLmdhbWVib2FyZC5ncmlkc1toaXRdID09IHRhcmdldC5zaGlwICYmIHRhcmdldC5jb29yZHMuaW5jbHVkZXMoaGl0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUYXJnZXQncyBhbHJlYWR5IGhpdCBjb29yZHMgPSBcIiwgdGFyZ2V0SGl0cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0YXJnZXQuc2hpcC5oaXRzID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyAyLiBJZiBvbmx5IDEgaGl0IGlzIG1heCwgdGhlbiBtdXN0IHJhbmRvbWl6ZSBsZWZ0IHJpZ2h0IHRvcCBvciByaWdodFxuICAgICAgICAgICAgICAgIGNvbnN0IE5XU0UgPSBbLTEwLCAtMSwgKzEwLCAxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlID0gdGFyZ2V0SGl0c1swXTtcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gTldTRVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV07XG4gICAgICAgICAgICAgICAgbGV0IG5leHQgPSBiYXNlICsgb2Zmc2V0O1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGJhc2UpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV4dClcblxuICAgICAgICAgICAgICAgIC8vIEVkZ2UgY2FzZSBoYW5kbGluZyAtIChhc3N1bWUgd29yc3QgY2FzZSBzY2VuYXJpbylcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBjdXJyZW50IHNtYWxsZXN0IHJlbWFpbmluZyBzaGlwXG4gICAgICAgICAgICAgICAgLy8gIC0+IGNoZWNrIGlmIHRoaXMgc2hpcCBjYW4gZml0XG4gICAgICAgICAgICAgICAgbGV0IG1pbiA9IDU7IC8vIGR1bW15IHRvIHJlcGxhY2VcbiAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdTaGlwcyA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZmlsdGVyKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhKHNoaXBPYmouc2hpcC5pc1N1bmspO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nU2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5zaGlwLmxlbmd0aCA8PSBtaW4pIG1pbiA9IHNoaXBPYmouc2hpcC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBzaGlwIGZpdHMgYXQgYmFzZSAvIGZhbHNlIGlmIG5vdFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrSWZGaXQocGxheWVyLCBiYXNlLCBvZmZzZXQsIHNoaXBMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAvLyBDb29yZHMgdG8gc3RvcmUgYWxsIHBvdGVudGlhbCBjb29yZHMgZnJvbSBiYXNlIG9mIHNoaXBMZW5ndGggaW4gb2Zmc2V0IGRpcmVjdGlvblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gKC0xICogc2hpcExlbmd0aCkgKyAxOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMucHVzaChiYXNlICsgKG9mZnNldCAqIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNoZWNrOiBcIiArIGNvb3Jkcyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdoaWxlIGxvb3BpbmcgdGhyb3VnaCBjb29yZHMsICdzaGlwTGVuZ3RoJyBjb29yZHMgaW4gYSByb3cgbXVzdCBiZSB2YWxpZCB0byByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAvLyBQb3Rlbml0YWwgY29vcmRzIGJhc2VkIG9uIGJhc2UsIG9mZnNldCwgc2hpcExlbmd0aCAtIGV4Y2x1ZGUgYmFzZSAoYWxyZWFkeSBhdHRhY2tlZCBhbmQgdmFsaWQpXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb25zZWN1dGl2ZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaWR4IG9mIGNvb3Jkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0aW5nIFwiICsgaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZHggIT0gYmFzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvb3JkIGlzIG5vdCBiYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhpZHgpIHx8IGlkeCA8IDAgfHwgaWR4ID4gOTkgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8ICgob2Zmc2V0ID09IC0xIHx8IG9mZnNldCA9PSAxKSAmJiAhKE1hdGguZmxvb3IoaWR4LzEwKSA9PSBNYXRoLmZsb29yKGJhc2UvMTApKSkpIHsgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBjb29yZCBpcyBub3QgYmFzZSBhbmQgaW52YWxpZCwgdGhlbiByZXNldCBjb25zZWN1dGl2ZSBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc2VjdXRpdmUgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb25zZWN1dGl2ZVJlc2V0ID0gXCIgKyBjb25zZWN1dGl2ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWYWxpZCAtIGFkZCB0byBjb25zZWN1dGl2ZSBhbmQgY2hlY2sgaWYgY2FuIGZpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zZWN1dGl2ZSArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZhbGlkIC0+IGNvbnNlY3V0aXZlKysgPSBcIiArIGNvbnNlY3V0aXZlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgY3VycmVudCBpZHggaXMgYmFzZSAtIHNraXAgb3ZlciBhbmQgYWRkIDEgdG8gY29uc2VjdXRpdmUgY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zZWN1dGl2ZSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmFzZUNhc2UgPSBcIiArIGNvbnNlY3V0aXZlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXQgZWFjaCBpdGVyYXRpb24gLSBjaGVjayBpZiBjb25zZWN1dGl2ZSAnc2hpcExlbmd0aCcgY29vcmRzIGluIGEgcm93IGFyZSB2YWxpZCB0byByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb21wYXJpbmc6XCIgKyBjb25zZWN1dGl2ZSArIFwid2l0aCBzaGlwIGxlbmd0aDpcIiArIHNoaXBMZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNlY3V0aXZlID09IHNoaXBMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRydWVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGVwIDI6IHNoaXAgb2YgbGVuZ3RoIFwiICsgc2hpcExlbmd0aCArIFwiIGNhbiBmaXQgaW50byBcIiArIGJhc2UsIGNvb3JkcyArIFwiP1wiICsgY29uc2VjdXRpdmUpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIE90aGVyd2lzZSwgbm8gbWF0Y2hcbiAgICAgICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gQm91bmRzIGNoZWNrIChlZGdlY2FzZTogaWYgaG9yaXpvbnRhbCBtdXN0IGJlIGluIHNhbWUgeS1heGlzKSArIG5vdCBhbHJlYWR5IGF0dGFja2VkID0gY3ljbGVcbiAgICAgICAgICAgICAgICB3aGlsZSAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKG5leHQpIHx8IG5leHQgPCAwIHx8IG5leHQgPiA5OSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICgob2Zmc2V0ID09IC0xIHx8IG9mZnNldCA9PSAxKSAmJiAhKE1hdGguZmxvb3IobmV4dC8xMCkgPT0gTWF0aC5mbG9vcihiYXNlLzEwKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAhY2hlY2tJZkZpdChwbGF5ZXIsIGJhc2UsIG9mZnNldCwgbWluKSkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBOV1NFW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGJhc2UgKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdnaW5nOiBuZXduZXh0ID0gXCIsIG5leHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGVwIDIgYXR0YWNrZWQgY2VsbDogXCIsIG5leHQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIDMuIElmIDIgaGl0cyBvciBtb3JlIGlzIG1heCwgdGhlbiBjYW4gZGVkdWNlIHRoZSBzaGlwIGF4aXMgYW5kIGd1ZXNzIGxlZnQtMSBvciByaWdodCsxIHVudGlsIGRvbmVcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgYXhpcyAtIGZyb20gMiBoaXRzIGNhbiBhc3N1bWUgXG4gICAgICAgICAgICAgICAgLy8gKFJlZmVyZW5jZTogU2xpZ2h0IGltcGVyZmVjdGlvbiBpbiBsb2dpYykgSWYgMiwzLDQsNSBoaXRzIGNhbiB0ZWNobmljYWxseSBiZSAyLDMsNCw1IHNoaXBzXG4gICAgICAgICAgICAgICAgY29uc3QgYXhpcyA9IHRhcmdldC5zaGlwLmF4aXM7XG4gICAgICAgICAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBob3Jpem9udGFsLCByYW5kb20gbGVmdCBvciByaWdodFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBXRSA9IFtNYXRoLm1pbiguLi50YXJnZXRIaXRzKSAtIDEsIE1hdGgubWF4KC4uLnRhcmdldEhpdHMpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gV0VbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMildO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBCb3VuZHMgY2hlY2sgKGVkZ2VjYXNlOiBpZiBob3Jpem9udGFsIG11c3QgYmUgaW4gc2FtZSB5LWF4aXMpICsgbm90IGFscmVhZHkgYXR0YWNrZWQgPSBjeWNsZVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKG5leHQpIHx8IG5leHQgPCAwIHx8IG5leHQgPiA5OSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICEoTWF0aC5mbG9vcihuZXh0LzEwKSA9PSBNYXRoLmZsb29yKE1hdGgubWluKC4uLnRhcmdldEhpdHMpLzEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBXRVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKG5leHQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMyBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHZlcnRpY2FsLCByYW5kb20gdG9wIG9yIGJvdHRvbVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBOUyA9IFtNYXRoLm1pbiguLi50YXJnZXRIaXRzKSAtIDEwLCBNYXRoLm1heCguLi50YXJnZXRIaXRzKSArIDEwXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSBOU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayArIG5vdCBhbHJlYWR5IGF0dGFja2VkID0gY3ljbGVcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhuZXh0KSB8fCBuZXh0IDwgMCB8fCBuZXh0ID4gOTkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBOU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKG5leHQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMyBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gMC4gTm8gaGl0cyB0byBhY3QgdXBvbiAtIENvbXBsZXRlIHJhbmRvbSBvdXQgb2YgcmVtYWluaW5nIGdyaWRzXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gcGxheWVyLmdhbWVib2FyZC5nZXRSZW1haW5pbmcoKTtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gb3B0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHRpb25zLmxlbmd0aCldO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGVwIDEgYXR0YWNrZWQgY2VsbDogXCIsIG5leHQpO1xuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKG5leHQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgQUlBdHRhY2tcbiAgICB9XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBCYXR0bGVzaGlwQUk7IiwiaW1wb3J0IFVJIGZyb20gJy4vdWknXG5cbmNvbnN0IERyYWdEcm9wID0gKCgpID0+IHtcblxuICAgIGZ1bmN0aW9uIGluaXQocGxheWVyKSB7XG4gICAgICAgIHJlc2V0RXZlbnRzKCk7XG4gICAgICAgIHNldERyYWdnYWJsZUFyZWEoKTtcbiAgICAgICAgZHJhZyhwbGF5ZXIpO1xuICAgICAgICBjbGljayhwbGF5ZXIpO1xuICAgIH1cblxuICAgIC8vIHJlc2V0IGFsbCBkcmFnL2NsaWNrIGV2ZW50IGxpc3RlbmVyc1xuICAgIGZ1bmN0aW9uIHJlc2V0RXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ3N0YXJ0ID0gKChlKSA9PiB7XG4gICAgICAgICAgICB9KSBcbiAgICAgICAgICAgIGdyaWQub25kcmFnZW50ZXIgPSAoKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KSBcbiAgICAgICAgICAgIGdyaWQub25kcmFnZW5kID0gKChlKSA9PiB7XG4gICAgICAgICAgICB9KSBcbiAgICAgICAgICAgIGdyaWQub25kcmFnb3ZlciA9ICgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBncmlkLm9uY2xpY2sgPSAoKGUpID0+IHtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICAvLyBSZXNldCBhbmQgc2V0IGFsbCBzaGlwcyB0byBiZSBkcmFnZ2FibGUgXG4gICAgZnVuY3Rpb24gc2V0RHJhZ2dhYmxlQXJlYSgpIHtcbiAgICAgICAgLy8gUmVzZXQgZHJhZ2dhYmxlIGNvbnRlbnRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgZmFsc2UpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAnYXV0byc7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIERyYWdnYWJsZSBjb250ZW50ID0gYW55IGdyaWQgd2l0aCBzaGlwIGNsYXNzXG4gICAgICAgIGxldCBwbGF5ZXJTaGlwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIik7XG4gICAgICAgIHBsYXllclNoaXBzLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIHRydWUpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAncG9pbnRlcic7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gSGVscGVyIGJvb2wgLSBWYWxpZCBkcm9wcGFibGUgcGxhY2UgZm9yIGhlYWQgLSBpZ25vcmUgY3VycmVudCBzaGlwJ3MgcG9zaXRpb24gd2hlbiBjaGVja2luZyB2YWxpZGl0eVxuICAgIGZ1bmN0aW9uIGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4geyBcbiAgICAgICAgICAgIGlmICgocGxheWVyLmdhbWVib2FyZC5ncmlkc1tpZHhdICE9IG51bGwgJiYgcGxheWVyLmdhbWVib2FyZC5ncmlkc1tpZHhdICE9IHNoaXApIHx8IGNvb3Jkcy5sZW5ndGggIT0gc2hpcC5sZW5ndGggfHwgaWR4IDwgMCB8fCBpZHggPiA5OSkge1xuICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayBwbGFjZW1lbnQgaWR4IGFuZCBpZiBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBhbmQgc2V0IGRyb3BwYWJsZSBhcmVhcyB3aXRoIGNsYXNzICdncmlkLWRyb3BwYWJsZScgXG4gICAgZnVuY3Rpb24gc2V0RHJvcHBhYmxlQXJlYShwbGF5ZXIsIHNoaXAsIGF4aXMsIHNoaXBPZmZzZXQpIHtcbiAgICAgICAgLy8gUmVzZXQgZHJvcHBhYmxlIGdyaWRzIHRvIGhhdmUgY2xhc3MgXCJncmlkLWRyb3BwYWJsZVwiXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZSgnZ3JpZC1kcm9wcGFibGUnKTtcbiAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZSgnc2hpcC1kcm9wcGFibGUnKTtcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBwbGF5ZXJHcmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpO1xuICAgICAgICAvLyBWYWxpZCBjaGVjayBpZiBoZWFkIGlzIGRyb3BwZWQgaW4gZ3JpZCAtIFxuICAgICAgICBwbGF5ZXJHcmlkcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoZWFkID0gcGFyc2VJbnQoZ3JpZC5pZC5zbGljZSgxKSk7XG4gICAgICAgICAgICBpZiAoYXhpcyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCBjYXNlIFxuICAgICAgICAgICAgICAgIC8vIFZhbGlkYXRpb24gLSBoZWFkIG11c3QgaGF2ZSBlbXB0eSBuIGxlbmd0aCB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRzID0gWy4uLm5ldyBBcnJheShzaGlwLmxlbmd0aCkua2V5cygpXS5tYXAoKHgpID0+IHggKyBoZWFkIC0gc2hpcE9mZnNldCk7IC8vIENvb3JkcyBhcnJheSBvZiBob3Jpem9udGFsIHNoaXAgZnJvbSBoZWFkICsgQWNjb3VudCBmb3Igb2Zmc2V0IGluIHBvdGVudGlhbCBjb29yZHNcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRzLmV2ZXJ5KCh4KSA9PiBNYXRoLmZsb29yKHgvMTApID09IE1hdGguZmxvb3IoY29vcmRzWzBdLzEwKSlcbiAgICAgICAgICAgICAgICAgICAgJiYgaXNEcm9wcGFibGUocGxheWVyLCBzaGlwLCBjb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICBUaGVuIHZhbGlkIC0gc2V0IGRyb3BwYWJsZVxuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5hZGQoJ2dyaWQtZHJvcHBhYmxlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGVudGlyZSBzaGlwIGRyb3BwYWJsZSBncmlkc1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gVmVydGljYWwgY2FzZVxuICAgICAgICAgICAgICAgIC8vIFZhbGlkYXRpb24gLSBoZWFkIG11c3QgaGF2ZSBlbXB0eSBuIGxlbmd0aCBncmlkcyBiZWxvdyB3aXRoaW4gYm91bmRzXG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiBoZWFkICsgKCh4IC0gc2hpcE9mZnNldCkgKiAxMCkpOyAvLyBDb29yZHMgYXJyYXkgb2YgdmVydGljYWwgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgaWYgKGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcCwgY29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5hZGQoJ2dyaWQtZHJvcHBhYmxlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGVudGlyZSBzaGlwIGRyb3BwYWJsZSBncmlkc1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYWcocGxheWVyKSB7XG4gICAgICAgIGxldCBwbGF5ZXJTaGlwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIik7XG5cbiAgICAgICAgcGxheWVyU2hpcHMuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmRyYWdzdGFydCA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuXG4gICAgICAgICAgICAgICAgLy8gRHJhZ2dpbmcgc2hpcCAtIG5lZWQgdG8gZXh0cmFjdCBTaGlwIG9iamVjdCBmcm9tIHRoZSBncmlkXG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IFsuLi5ncmlkLmNsYXNzTGlzdF07XG4gICAgICAgICAgICAgICAgbGV0IHNoaXBJZHggPSBjbGFzc2VzLmZpbmQodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuc3RhcnRzV2l0aChcInNoaXAtXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNoaXBJZHggPSBzaGlwSWR4LnNsaWNlKDUpLTE7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBjbGFzcyBhc3NvY2lhdGVkIHdpdGggc2hpcCArIHVzZSBhcyBoYXNobWFwIHRvIHJlZmVyZW5jZSBleGFjdCBzaGlwIG9iamVjdCB1c2VkIGluIGdhbWVib2FyZFxuICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBPYmogPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLnNoaXA7XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgZ3JpZCBwb3NpdGlvbiBvZiBjdXJyZW50IGRyYWdnZWQgc2hpcCAtIFNvcnQgc2hpcCBjb29yZHMgbG93ZXN0IHRvIGhpZ2hlc3RcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBPZmZzZXQgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3Jkcy5zb3J0KChhLGIpID0+IGEgPiBiKS5maW5kSW5kZXgoeCA9PiB4ID09IHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzaGlwT2Zmc2V0KTtcblxuICAgICAgICAgICAgICAgIHNldERyb3BwYWJsZUFyZWEocGxheWVyLCBzaGlwT2JqLCBzaGlwT2JqLmF4aXMsIHNoaXBPZmZzZXQpO1xuICAgICAgICAgICAgICAgIGRyYWdFbnRlcihwbGF5ZXIsIHNoaXBPYmosIHNoaXBPYmouYXhpcywgc2hpcElkeCwgc2hpcE9mZnNldCk7XG4gICAgICAgICAgICAgICAgZHJhZ0VuZChwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICAvLyBEcmFnIHNoaXAgZW50ZXJzIGRyb3BwYWJsZSBhcmVhIC0gb2ZmZXIgcHJldmlldyBvZiBob3cgc2hpcCB3b3VsZCBsb29rIHBsYWNlZFxuICAgIGZ1bmN0aW9uIGRyYWdFbnRlcihwbGF5ZXIsIHNoaXAsIGF4aXMsIHNoaXBJZHgsIHNoaXBPZmZzZXQpIHtcbiAgICAgICAgY29uc3QgZHJvcHBhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5ncmlkLWRyb3BwYWJsZVwiKTtcblxuICAgICAgICBkcm9wcGFibGUuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmRyYWdlbnRlciA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBwcmV2aWV3IGdyaWRzXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0xYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTJgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtM2ApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC00YCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTVgKTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgLy8gR2V0IGhlYWQgdmFsdWUgXG4gICAgICAgICAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBIb3Jpem9udGFsIGNhc2UgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSAtIHNoaXBPZmZzZXQ7IC8vIFVwZGF0ZSBoZWFkIHZhbHVlIHRvIGJlIG9mZnNldHRlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldmlldyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiB4ICsgaGVhZCk7IC8vIFBvdGVudGlhbCBjb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3LmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwcmV2aWV3LXNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGRyYWdEcm9wKHBsYXllciwgc2hpcCwgc2hpcElkeCwgcHJldmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBWZXJ0aWNhbCBjYXNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSAtICgxMCAqIHNoaXBPZmZzZXQpOyAvLyBVcGRhdGUgaGVhZCB2YWx1ZSB0byBiZSBvZmZzZXR0ZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXZpZXcgPSBbLi4ubmV3IEFycmF5KHNoaXAubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4gaGVhZCArICh4ICogMTApKTsgLy8gQ29vcmRzIGFycmF5IG9mIHZlcnRpY2FsIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3LmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwcmV2aWV3LXNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGRyYWdEcm9wKHBsYXllciwgc2hpcCwgc2hpcElkeCwgcHJldmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIERyYWcgZW5kIC0gcmVnYXJkbGVzcyBvZiBzdWNjZXNzZnVsIGRyb3Agb3Igbm90XG4gICAgZnVuY3Rpb24gZHJhZ0VuZChwbGF5ZXIpIHtcbiAgICAgICAgbGV0IHBsYXllclNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5wbGF5ZXItc2hpcFwiKTtcblxuICAgICAgICBwbGF5ZXJTaGlwcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ2VuZCA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIC8vIFJlc2V0IHByZXZpZXcgZ3JpZHNcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBkcm9wcGFibGUgZ3JpZHMgdG8gaGF2ZSBjbGFzcyBcImdyaWQtZHJvcHBhYmxlXCJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTFgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtMmApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0zYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTRgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtNWApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLWRyb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGluaXQocGxheWVyKTsgLy8gQXQgZWFjaCBkcmFnLWVuZCByZXNldCBkcmFnZ2FibGUrZHJvcHBhYmxlIGNvbnRlbnQgYW5kIHJlc2V0IGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gRHJhZyBwbGFjZSBpbiB2YWxpZCBncmlkIC0gdGFyZ2V0IGFzIHBvdGVudGlhbCBjb29yZHMgYXQgZWFjaCBkcmFnIGVudGVyXG4gICAgZnVuY3Rpb24gZHJhZ0Ryb3AocGxheWVyLCBzaGlwLCBzaGlwSWR4LCBwb3RlbnRpYWxDb29yZHMpIHsgICAgICAgXG4gICAgICAgIC8vIENvb3JkcyB0byBiZSBzaGlwLWRyb3BwYWJsZSBhcmVhIFxuICAgICAgICBwb3RlbnRpYWxDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgaGVhZCBvZiBwbGFjZW1lbnQgLSBhbHdheXMgbWluaW11bSB2YWx1ZSBvZiBjb29yZHNcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwJHtpZHh9YCkub25kcm9wID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDb29yZHMgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3JkcztcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZ2FtZWJvYXJkIHNoaXBzW10gYXJyYXkgYW5kIGdyaWRzW10gYXJyYXlcbiAgICAgICAgICAgICAgICByZXBsYWNlU2hpcChwbGF5ZXIsIHNoaXBJZHgsIG9sZENvb3JkcywgcG90ZW50aWFsQ29vcmRzLCBzaGlwLmF4aXMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlcGxhY2VTaGlwKHBsYXllciwgc2hpcElkeCwgb2xkQ29vcmRzLCBuZXdDb29yZHMsIG5ld0F4aXMpIHtcbiAgICAgICAgLy8gU3RvcmFnZSBjaGFuZ2VzXG4gICAgICAgIC8vIFVwZGF0ZSBnYW1lYm9hcmQgZ3JpZHNbXVxuICAgICAgICBvbGRDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gPSBudWxsO1xuICAgICAgICB9KVxuICAgICAgICBuZXdDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLnNoaXA7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIENoYW5nZSBjb29yZHMgaW4gZ2FtZWJvYXJkIHNoaXBzW10gb2JqZWN0XG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uY29vcmRzID0gbmV3Q29vcmRzO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBheGlzXG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcC5heGlzID0gbmV3QXhpcztcblxuICAgICAgICAvLyBGcm9udC1FbmQgY2hhbmdlc1xuICAgICAgICBVSS51cGRhdGVQbGFjZWRTaGlwcyhvbGRDb29yZHMsIG5ld0Nvb3Jkcywgc2hpcElkeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpY2socGxheWVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWRcIik7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGV4dHJhY3Qgc2hpcElkeCBmcm9tIGdyaWRcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gWy4uLmdyaWQuY2xhc3NMaXN0XTtcbiAgICAgICAgICAgICAgICBsZXQgc2hpcElkeCA9IGNsYXNzZXMuZmluZCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zdGFydHNXaXRoKFwic2hpcC1cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2hpcElkeCA9IHNoaXBJZHguc2xpY2UoNSktMTtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIGNsYXNzIGFzc29jaWF0ZWQgd2l0aCBzaGlwICsgdXNlIGFzIGhhc2htYXAgdG8gcmVmZXJlbmNlIGV4YWN0IHNoaXAgb2JqZWN0IHVzZWQgaW4gZ2FtZWJvYXJkXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hpcE9iaiA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcDtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDb29yZHMgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3JkcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkID0gTWF0aC5taW4oLi4ub2xkQ29vcmRzKTtcblxuICAgICAgICAgICAgICAgIC8vIEF0dGVtcHQgcm90YXRpb25cbiAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5heGlzID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCAtLT4gVmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0Nvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcE9iai5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiBoZWFkICsgKHggKiAxMCkpOyAvLyBDb29yZHMgYXJyYXkgb2YgdmVydGljYWwgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEcm9wcGFibGUocGxheWVyLCBzaGlwT2JqLCBuZXdDb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBkcm9wcGFibGUgLSB0aGVuIHJvdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFrZShvbGRDb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNoaXBPYmouYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcnRpY2FsIC0tPiBIb3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdDb29yZHMgPSBbLi4ubmV3IEFycmF5KHNoaXBPYmoubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4geCArIGhlYWQpOyAvLyBDb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q29vcmRzLmV2ZXJ5KCh4KSA9PiBNYXRoLmZsb29yKHgvMTApID09IE1hdGguZmxvb3IobmV3Q29vcmRzWzBdLzEwKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcE9iaiwgbmV3Q29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgMCk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdChwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hha2Uob2xkQ29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiAtIGFuaW1hdGUgY29vcmRzIHVzaW5nIGtleWZyYW1lcyBvYmplY3RcbiAgICBmdW5jdGlvbiBzaGFrZShjb29yZHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzaGFrZVwiKTsgIFxuICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGdyaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApO1xuICAgICAgICAgICAgZ3JpZC5hbmltYXRlKFtcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoMnB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoNHB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoNHB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoMnB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApXCJ9XG4gICAgICAgICAgICBdLCA1MDApO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlcm1pbmF0ZSgpIHtcbiAgICAgICAgcmVzZXRFdmVudHMoKTtcbiAgICAgICAgLy8gUmVzZXQgZHJhZ2dhYmxlIGNvbnRlbnRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgZmFsc2UpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAnYXV0byc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQsXG4gICAgICAgIHRlcm1pbmF0ZVxuICAgIH1cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IERyYWdEcm9wOyIsImNvbnN0IFNjb3JlQm9hcmQgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0aW5nXCIpXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NvcmVib2FyZCA+IGRpdlwiKS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgc2NvcmUuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgIHNjb3JlLmNsYXNzTGlzdC5yZW1vdmUoXCJzY29yZS1zdW5rXCIpO1xuICAgICAgICB9KVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNjb3JlYm9hcmRcIikuZm9yRWFjaCgoc2NvcmVib2FyZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNjb3JlYm9hcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwJykpIHtcbiAgICAgICAgICAgICAgICAvLyBQbGF5ZXIncyBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHNjb3JlLmlkLnNsaWNlKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHgtMV0uc2hpcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3guY2xhc3NMaXN0LmFkZChcImJveFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7c2hpcElkeH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlLmFwcGVuZENoaWxkKGJveCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHV0ZXIgc2NvcmVib2FyZFxuICAgICAgICAgICAgICAgIFsuLi5zY29yZWJvYXJkLmNoaWxkcmVuXS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2NvcmUgZGl2IElEIGFzIGhhc2hjb2RlIHRvIGdhdGhlciBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBJZHggPSBzY29yZS5pZC5zbGljZSgtMSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcHV0ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHgtMV0uc2hpcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3guY2xhc3NMaXN0LmFkZChcImJveFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7c2hpcElkeH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlLmFwcGVuZENoaWxkKGJveCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNjb3JlYm9hcmRcIikuZm9yRWFjaCgoc2NvcmVib2FyZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNjb3JlYm9hcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwJykpIHtcbiAgICAgICAgICAgICAgICAvLyBQbGF5ZXIgc2NvcmVib2FyZFxuICAgICAgICAgICAgICAgIFsuLi5zY29yZWJvYXJkLmNoaWxkcmVuXS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2NvcmUgZGl2IElEIGFzIGhhc2hjb2RlIHRvIGdhdGhlciBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBJZHggPSBwYXJzZUludChzY29yZS5pZC50b1N0cmluZygpLnNsaWNlKC0xKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHgtMV0uc2hpcC5pc1N1bmspIHNjb3JlLmNsYXNzTGlzdC5hZGQoXCJzY29yZS1zdW5rXCIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlICB7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHV0ZXIgc2NvcmVib2FyZFxuICAgICAgICAgICAgICAgIFsuLi5zY29yZWJvYXJkLmNoaWxkcmVuXS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2NvcmUgZGl2IElEIGFzIGhhc2hjb2RlIHRvIGdhdGhlciBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBJZHggPSBwYXJzZUludChzY29yZS5pZC50b1N0cmluZygpLnNsaWNlKC0xKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wdXRlci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmlzU3Vuaykgc2NvcmUuY2xhc3NMaXN0LmFkZChcInNjb3JlLXN1bmtcIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGVTY29yZWJvYXJkLFxuICAgICAgICB1cGRhdGVTY29yZWJvYXJkXG4gICAgfVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgU2NvcmVCb2FyZDsiLCJpbXBvcnQgU2hpcCBmcm9tIFwiLi4vZmFjdG9yaWVzL3NoaXBcIjtcbmltcG9ydCBQbGF5ZXIgZnJvbSBcIi4uL2ZhY3Rvcmllcy9wbGF5ZXJcIjtcbmltcG9ydCBEcmFnRHJvcCBmcm9tIFwiLi9kcmFnRHJvcFwiO1xuaW1wb3J0IEJhdHRsZXNoaXBBSSBmcm9tIFwiLi9iYXR0bGVzaGlwQUlcIjtcbmltcG9ydCBTY29yZUJvYXJkIGZyb20gXCIuL3Njb3JlYm9hcmRcIjtcblxuaW1wb3J0IEdpdCBmcm9tICcuLi9hc3NldHMvZ2l0aHViLnBuZyc7XG5pbXBvcnQgRmF2IGZyb20gJy4uL2Fzc2V0cy9mYXZpY29uLnBuZyc7XG5cbmNvbnN0IFVJID0gKCgpID0+IHtcbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnaXRodWJcIikuc3JjID0gR2l0O1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmF2aWNvbicpLnNldEF0dHJpYnV0ZSgnaHJlZicsIEZhdik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzcGxheUdyaWRzKCkge1xuICAgICAgICBsZXQgZ2FtZWJvYXJkUCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIik7XG4gICAgICAgIGdhbWVib2FyZFAuaW5uZXJIVE1MID0gXCJcIjsgLy8gQ2xlYXIgZXhpc3RpbmdcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZFVuaXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGdyaWRVbml0LmNsYXNzTGlzdC5hZGQoJ2dyaWQtdW5pdCcpO1xuICAgICAgICAgICAgZ3JpZFVuaXQuaWQgPSBgcCR7aX1gOyAvLyBhc3NpZ24gZWFjaCBhbiBpZCBmcm9tIDAgdG8gbipuLTFcbiAgICBcbiAgICAgICAgICAgIGdyaWRVbml0LnN0eWxlLndpZHRoID0gYGNhbGMoMTAlIC0gM3B4KWA7XG4gICAgICAgICAgICBncmlkVW5pdC5zdHlsZS5oZWlnaHQgPSBgY2FsYygxMCUgLSAzcHgpYDtcbiAgICBcbiAgICAgICAgICAgIGdhbWVib2FyZFAuYXBwZW5kQ2hpbGQoZ3JpZFVuaXQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBnYW1lYm9hcmRDID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKTtcbiAgICAgICAgZ2FtZWJvYXJkQy5pbm5lckhUTUwgPSBcIlwiOyAvLyBDbGVhciBleGlzdGluZ1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkVW5pdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZ3JpZFVuaXQuY2xhc3NMaXN0LmFkZCgnZ3JpZC11bml0Jyk7XG4gICAgICAgICAgICBncmlkVW5pdC5pZCA9IGBjJHtpfWA7IC8vIGFzc2lnbiBlYWNoIGFuIGlkIGZyb20gMCB0byBuKm4tMVxuICAgIFxuICAgICAgICAgICAgZ3JpZFVuaXQuc3R5bGUud2lkdGggPSBgY2FsYygxMCUgLSAzcHgpYDtcbiAgICAgICAgICAgIGdyaWRVbml0LnN0eWxlLmhlaWdodCA9IGBjYWxjKDEwJSAtIDNweClgO1xuICAgIFxuICAgICAgICAgICAgZ2FtZWJvYXJkQy5hcHBlbmRDaGlsZChncmlkVW5pdCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdEdhbWUoKSB7XG4gICAgICAgIC8vIERPTSBmb3IgcHJlcCBzdGFnZVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnZmxleCdcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXN0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnbm9uZSdcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oZWFkZXItaGVscGVyXCIpLnRleHRDb250ZW50ID0gXCJBc3NlbWJsZSB0aGUgZmxlZXRcIjtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oZWFkZXItZGVzY1wiKS50ZXh0Q29udGVudCA9IFwiRHJhZyB0byBNb3ZlIGFuZCBDbGljayB0byBSb3RhdGVcIjtcblxuICAgICAgICAvLyBTZXQgZGlzcGxheSBmb3IgcGxheWVyIHRvIG1vdmUvcm90YXRlIHNoaXBzIC0+IHNob3cgcGxheWVyIGdyaWQsIGxvY2sgY29tcHV0ZXIgZ3JpZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrZWRcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcblxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllcjtcbiAgICAgICAgbGV0IGNvbXB1dGVyID0gbmV3IFBsYXllcjtcblxuICAgICAgICAvLyBDcmVhdGUgRE9NIGdyaWRzIGFuZCBkaXNwbGF5IFxuICAgICAgICBkaXNwbGF5R3JpZHMoKTtcblxuICAgICAgICAvLyBQbGFjZSBwbGF5ZXIgKyBjb21wdXRlciBzaGlwcyByYW5kb21seVxuICAgICAgICBwbGFjZVJhbmRvbVNoaXBzKHBsYXllcik7XG4gICAgICAgIHBsYWNlUmFuZG9tU2hpcHMoY29tcHV0ZXIpO1xuICAgICAgICBpbml0RGlzcGxheVNoaXBzKHBsYXllcixjb21wdXRlcik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIERPTSBzY29yZWJvYXJkXG4gICAgICAgIFNjb3JlQm9hcmQuY3JlYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKTtcblxuICAgICAgICAvLyBBbGxvdyBwbGF5ZXIgdG8gbW92ZS9yb3RhdGUgc2hpcCBsb2NhdGlvbnNcbiAgICAgICAgcGxheWVyU2hpcFNlbGVjdChwbGF5ZXIpO1xuXG4gICAgICAgIC8vIFN0YXJ0IC0gU2hpcHMgc2VsZWN0ZWRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKS5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgIC8vIERPTSBmb3IgYmF0dGxlXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnbm9uZSc7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIikuc3R5bGVbJ2Rpc3BsYXknXSA9ICdmbGV4JztcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGVhZGVyLWhlbHBlclwiKS50ZXh0Q29udGVudCA9IFwiTGV0IHRoZSBiYXR0bGUgYmVnaW4hXCI7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmhlYWRlci1kZXNjXCIpLnRleHRDb250ZW50ID0gXCJLZWVwIGFuIGV5ZSBvbiB0aGUgc2NvcmVib2FyZFwiO1xuXG4gICAgICAgICAgICAvLyBTZXQgZGlzcGxheSB0byBQbGF5ZXIgQXR0YWNrIC0+IGxvY2sgcGxheWVyIGdyaWQsIHNob3cgY29tcHV0ZXIgZ3JpZCBmb3IgcGxheWVyIGF0dGFja1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQucFwiKS5jbGFzc0xpc3QuYWRkKFwibG9ja2VkXCIpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwibG9ja2VkXCIpO1xuXG4gICAgICAgICAgICBEcmFnRHJvcC50ZXJtaW5hdGUoKTsgLy8gVGVybWluYXRlIGdyaWQgZXZlbnRzXG4gICAgICAgICAgICBnYW1lTG9naWMocGxheWVyLCBjb21wdXRlcik7ICBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc3RhcnQgYnV0dG9uIG9uY2UgZ2FtZSBiZWdpbnNcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXN0YXJ0XCIpLm9uY2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaW5pdEdhbWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXllclNoaXBTZWxlY3QocGxheWVyKSB7XG4gICAgICAgIERyYWdEcm9wLmluaXQocGxheWVyKTtcbiAgICB9XG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gLSBSZXR1cm4gYXJyYXkgb2YgcmFuZG9tIGNvb3JkaW5hdGUgcGxhY2VtZW50IGJhc2VkIG9uIHNoaXAncyBsZW5ndGhcbiAgICBmdW5jdGlvbiByYW5kb21Db29yZGluYXRlcyhzaGlwKSB7XG4gICAgICAgIGxldCBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuICAgICAgICBsZXQgYXhpcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oICkqIDIpIC8vIDAgaXMgaG9yaXphbnRhbCwgMSBpcyB2ZXJ0aWNhbFxuICAgICAgICBsZXQgY29vcmRzID0gWy4uLm5ldyBBcnJheShzaGlwLmxlbmd0aCkua2V5cygpXTsgLy8gU3RhcnQgd2l0aCBjb29yZCBhcnJheSBvZiBbMC4uLm5dXG4gICAgICAgIGlmIChheGlzID09IDApIHtcbiAgICAgICAgICAgIC8vIEhvcml6b250YWxcbiAgICAgICAgICAgIGNvb3JkcyA9IGNvb3Jkcy5tYXAoKHgpID0+IHggKyBwb3MpO1xuICAgICAgICAgICAgLy8gRXJyb3IgY2hlY2sgKyBDeWNsZSB1bnRpbCB2YWxpZCAtIG11c3QgYWxsIGhhdmUgc2FtZSB4Ly8xMCB2YWx1ZSB0byBiZSBpbiBzYW1lIHktYXhpc1xuICAgICAgICAgICAgd2hpbGUgKCFjb29yZHMuZXZlcnkoKHgpID0+IE1hdGguZmxvb3IoeC8xMCkgPT0gTWF0aC5mbG9vcihjb29yZHNbMF0vMTApKSkge1xuICAgICAgICAgICAgICAgIGxldCBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuICAgICAgICAgICAgICAgIGNvb3JkcyA9IGNvb3Jkcy5tYXAoKHgpID0+IHggKyBwb3MpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9yaXpvbnRhbCB6aWd6YWcgLSBDeWNsaW5nXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAvLyBWZXJ0aWNhbCAtIG11c3QgYWxsIGhhdmUgc2FtZSB4JTEwIHZhbHVlIHRvIGJlIGluIHNhbWUgeC1heGlzXG4gICAgICAgICAgICBjb29yZHMgPSBjb29yZHMubWFwKCh4KSA9PiBwb3MgKyAoMTAgKiB4KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHthcnJheTogY29vcmRzLCBheGlzfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVJhbmRvbVNoaXBzKHBsYXllcikge1xuICAgICAgICBsZXQgZmxlZXQgPSBbbmV3IFNoaXAoMiksIG5ldyBTaGlwKDMpLCBuZXcgU2hpcCgzKSwgbmV3IFNoaXAoNCksIG5ldyBTaGlwKDUpXTtcblxuICAgICAgICBmbGVldC5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29vcmRzID0gcmFuZG9tQ29vcmRpbmF0ZXMoc2hpcCk7XG4gICAgICAgICAgICAvLyBFcnJvciBjaGVjayBjeWNsZSB1bnRpbCB2YWxpZCAtIHRoZW4gcGxhY2VcbiAgICAgICAgICAgIHdoaWxlICghcGxheWVyLmdhbWVib2FyZC5pc1ZhbGlkUGxhY2VtZW50KHNoaXAsIGNvb3Jkcy5hcnJheSkpIHtcbiAgICAgICAgICAgICAgICBjb29yZHMgPSByYW5kb21Db29yZGluYXRlcyhzaGlwKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkludmFsaWQgcmFuZG9taXphdGlvbiAtIEN5Y2xpbmdcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQucGxhY2VTaGlwKHNoaXAsIGNvb3Jkcy5hcnJheSk7XG4gICAgICAgICAgICBzaGlwLnNldEF4aXMoY29vcmRzLmF4aXMpO1xuICAgICAgICB9KVxuICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXREaXNwbGF5U2hpcHMocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICAvLyBNYXJrIGVhY2ggc2hpcCB3aXRoIGNsYXNzIHRvIGRpc3Rpbmd1aXNoXG4gICAgICAgIGxldCBpID0gMTtcbiAgICAgICAgbGV0IGogPSAxO1xuICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtpfWApO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwicGxheWVyLXNoaXBcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vIE1hcmsgZWFjaCBzaGlwIHdpdGggY2xhc3MgdG8gZGlzdGluZ3Vpc2hcbiAgICAgICAgY29tcHV0ZXIuZ2FtZWJvYXJkLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtqfWApO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1oaWRkZW5cIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVBsYWNlZFNoaXBzKG9sZENvb3JkcywgbmV3Q29vcmRzLCBzaGlwSWR4KSB7XG4gICAgICAgIC8vIFJlcGxhY2UgY2xhc3NlcyBgc2hpcC0ke3NoaXBJZHh9YCArICdwbGF5ZXItc2hpcCdcbiAgICAgICAgb2xkQ29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QucmVtb3ZlKGBzaGlwLSR7c2hpcElkeCsxfWApO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QucmVtb3ZlKGBwbGF5ZXItc2hpcGApO1xuICAgICAgICB9KVxuICAgICAgICBuZXdDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoYHBsYXllci1zaGlwYCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlR3JpZHMocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICAvLyBVcGRhdGUgcGxheWVyIGdyaWRzXG4gICAgICAgIGxldCBwbGF5ZXJBdHRhY2tzID0gcGxheWVyLmdhbWVib2FyZC5hdHRhY2tzO1xuICAgICAgICBwbGF5ZXJBdHRhY2tzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtZm91bmRcIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2lkeH1gKS5pbm5lckhUTUwgPSBcIiYjMTAwMDU7XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLW1pc3NlZFwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7aWR4fWApLmlubmVySFRNTCA9IFwiJiN4MjAyMjtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBVcGRhdGUgY29tcHV0ZXIgZ3JpZHNcbiAgICAgICAgbGV0IGNvbXBBdHRhY2tzID0gY29tcHV0ZXIuZ2FtZWJvYXJkLmF0dGFja3M7XG4gICAgICAgIGNvbXBBdHRhY2tzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbXB1dGVyLmdhbWVib2FyZC5ncmlkc1tpZHhdKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI2Mke2lkeH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1mb3VuZFwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjYyR7aWR4fWApLmNsYXNzTGlzdC5yZW1vdmUoXCJncmlkLWhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7aWR4fWApLmlubmVySFRNTCA9IFwiJiMxMDAwNTtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNjJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtbWlzc2VkXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtpZHh9YCkuaW5uZXJIVE1MID0gXCImI3gyMDIyO1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNoaXBzKHBsYXllciwgY29tcHV0ZXIpIHtcbiAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICBzaGlwT2JqLmNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzaGlwT2JqLnNoaXAuaXNTdW5rKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1zdW5rXCIpO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7Y29vcmR9YCkuY2xhc3NMaXN0LnJlbW92ZShcImdyaWQtZm91bmRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKGNvbXB1dGVyKSB7XG4gICAgICAgICAgICBjb21wdXRlci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGlwT2JqLnNoaXAuaXNTdW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtc3Vua1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtjb29yZH1gKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ3JpZC1mb3VuZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2FtZUxvZ2ljKHBsYXllciwgY29tcHV0ZXIpIHtcbiAgICAgICAgY29uc3QgZ3JpZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5jID4gLmdyaWQtdW5pdFwiKTtcbiAgICAgICAgZ3JpZHMuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmNsaWNrID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXB1dGVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpKSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5Um91bmQocGxheWVyLCBjb21wdXRlciwgcGFyc2VJbnQoZ3JpZC5pZC5zbGljZSgxKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgYXN5bmMgZnVuY3Rpb24gcGxheVJvdW5kKHBsYXllciwgY29tcHV0ZXIsIGlucHV0KSB7XG4gICAgICAgIC8vIEFUUCBnb3QgaW5wdXQgLT4gc2hvdyBwbGF5ZXIgZ3JpZCBmb3IgQUkgYXR0YWNrLCBsb2NrIGNvbXB1dGVyIGdyaWRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQucFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwibG9ja2VkXCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG5cbiAgICAgICAgLy8gSGFuZGxlIHBsYXllcidzIGlucHV0IC0+IFVwZGF0ZSBHcmlkIERpc3BsYXkgLT4gQ2hlY2sgaWYgd2lubmVyXG4gICAgICAgIHBsYXllckF0dGFjayhjb21wdXRlciwgaW5wdXQpO1xuICAgICAgICB1cGRhdGVHcmlkcyhwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgdXBkYXRlU2hpcHMocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIFNjb3JlQm9hcmQudXBkYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgaWYgKGNvbXB1dGVyLmdhbWVib2FyZC5pc0dhbWVPdmVyKCkpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gLSBjcmVhdGUgZ2FtZSBvdmVyIHN0eWxpbmcgdHJhbnNpdGlvbiBpbiB3aW5uaW5nIHBsYXllciBncmlkXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG4gICAgICAgICAgICBnYW1lT3ZlcihcIlBsYXllclwiLCBwbGF5ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29tcHV0ZXIgQXR0YWNrIC0+IFVwZGF0ZSBHcmlkIERpc3BsYXkgLT4gQ2hlY2sgaWYgd2lubmVyXG4gICAgICAgIGF3YWl0IGRlbGF5KDUwMCk7XG5cbiAgICAgICAgQmF0dGxlc2hpcEFJLkFJQXR0YWNrKHBsYXllcik7XG4gICAgICAgIHVwZGF0ZUdyaWRzKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICB1cGRhdGVTaGlwcyhwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgU2NvcmVCb2FyZC51cGRhdGVTY29yZWJvYXJkKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICBpZiAocGxheWVyLmdhbWVib2FyZC5pc0dhbWVPdmVyKCkpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gLSBjcmVhdGUgZ2FtZSBvdmVyIHN0eWxpbmcgdHJhbnNpdGlvbiBpbiB3aW5uaW5nIHBsYXllciBncmlkXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG4gICAgICAgICAgICBnYW1lT3ZlcihcIkNvbXB1dGVyXCIsIGNvbXB1dGVyKTtcbiAgICAgICAgfTsgLy9UT0RPIC0gSGFuZGxlIGdhbWUgb3ZlclxuXG4gICAgICAgIC8vIFJldmVydCBkaXNwbGF5IHRvIFBsYXllciBBdHRhY2sgLT4gbG9jayBwbGF5ZXIgZ3JpZCwgc2hvdyBjb21wdXRlciBncmlkIGZvciBwbGF5ZXIgYXR0YWNrXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwibG9ja2VkXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXllckF0dGFjayhjb21wdXRlciwgaW5wdXQpIHtcbiAgICAgICAgaWYgKCFjb21wdXRlci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbXB1dGVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKGlucHV0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBkZWxheVxuICAgIGZ1bmN0aW9uIGRlbGF5KG1zKSB7ICAgIFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlcywgbXMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIElmIGdhbWVvdmVyLCBwb3AgbW9kYWwgYW5kIHNob3cgd2lubmVyIHVudGlsIHJlc3RhcnRcbiAgICBhc3luYyBmdW5jdGlvbiBnYW1lT3Zlcih3aW5uZXJUZXh0KSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmVzdWx0XCIpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXN1bHQtdGV4dFwiKTtcbiAgICAgICAgY29uc3QgcmVzdGFydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheS1hZ2FpblwiKTtcblxuICAgICAgICBhd2FpdCBkZWxheSgxMDAwKTtcblxuICAgICAgICBkaWFsb2cuc2hvd01vZGFsKCk7XG4gICAgICAgIGRpYWxvZy5jbGFzc0xpc3QuYWRkKFwicmVzdWx0LWRpc3BsYXllZFwiKTtcbiAgICAgICAgdGV4dC50ZXh0Q29udGVudCA9IGAke3dpbm5lclRleHR9IHdpbnMhYFxuXG4gICAgICAgIHJlc3RhcnQub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIC8vIFJlc3RhcnQgZ2FtZVxuICAgICAgICAgICAgZGlhbG9nLmNsb3NlKCk7XG4gICAgICAgICAgICBkaWFsb2cuY2xhc3NMaXN0LnJlbW92ZShcInJlc3VsdC1kaXNwbGF5ZWRcIik7XG4gICAgICAgICAgICBpbml0R2FtZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2V0dXAsXG4gICAgICAgIGRpc3BsYXlHcmlkcyxcbiAgICAgICAgaW5pdEdhbWUsXG4gICAgICAgIHVwZGF0ZVBsYWNlZFNoaXBzXG4gICAgfVxuXG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBVSTsiLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAaW1wb3J0IHVybChodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PUFyc2VuYWwrU0M6aXRhbCx3Z2h0QDAsNDAwOzAsNzAwOzEsNDAwOzEsNzAwJmRpc3BsYXk9c3dhcCk7XCJdKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBgLyogRm9udCArIG1ldGEgKi9cblxuaW1nIHtcbiAgICBtYXgtd2lkdGg6IDEwMCU7XG59XG5cbmJvZHkge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBtYXJnaW46IDA7XG5cbiAgICBmb250LWZhbWlseTogXCJBcnNlbmFsIFNDXCIsIHNhbnMtc2VyaWY7XG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XG59XG5cbi8qIEhlYWRlciAqL1xuLmhlYWRlciB7XG4gICAgaGVpZ2h0OiAxMjBweDtcbiAgICBcbiAgICBmb250LXNpemU6IDQycHg7XG4gICAgbWFyZ2luLXRvcDogMTVweDtcblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uaGVhZGVyLWRlc2Mge1xuICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XG59XG4vKiBTdGFydC9yZXN0YXJ0IGJ1dHRvbiAqL1xuLyogQ1NTICovXG4uaGVhZC1idG4ge1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xuICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBjb2xvcjogIzAwMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmaWxsOiAjMDAwO1xuICBmb250LWZhbWlseTogXCJBcnNlbmFsIFNDXCIsIHNhbnMtc2VyaWY7XG4gIGZvbnQtc2l6ZTogMThweDtcbiAgZm9udC13ZWlnaHQ6IDQwMDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGxldHRlci1zcGFjaW5nOiAtLjhweDtcbiAgbGluZS1oZWlnaHQ6IDI0cHg7XG4gIG1pbi13aWR0aDogMTgwcHg7XG4gIG91dGxpbmU6IDA7XG4gIHBhZGRpbmc6IDhweCAxMHB4O1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgdHJhbnNpdGlvbjogYWxsIC4zcztcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG4gIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uO1xuXG4gIG1hcmdpbi10b3A6IDI1cHg7XG59XG5cbi5oZWFkLWJ0bjpmb2N1cyB7XG4gIGNvbG9yOiAjMTcxZTI5O1xufVxuXG4uaGVhZC1idG46aG92ZXIge1xuICBib3JkZXItY29sb3I6ICMwNmY7XG4gIGNvbG9yOiAjMDZmO1xuICBmaWxsOiAjMDZmO1xufVxuXG4uaGVhZC1idG46YWN0aXZlIHtcbiAgYm9yZGVyLWNvbG9yOiAjMDZmO1xuICBjb2xvcjogIzA2ZjtcbiAgZmlsbDogIzA2Zjtcbn1cblxuLm1haW4ge1xuICAgIGZsZXg6IDE7XG5cbiAgICBtYXJnaW46IGF1dG87XG4gICAgd2lkdGg6IDgwJTtcblxuICAgIGRpc3BsYXk6IGZsZXg7XG5cbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuXG4ucGxheWVyLCAuY29tcHV0ZXIge1xuICAgIGhlaWdodDogMTAwJTtcbiAgICBtaW4td2lkdGg6IDQ0JTtcblxuICAgIHBhZGRpbmctdG9wOiA1cHg7XG4gICAgcGFkZGluZy1ib3R0b206IDc1cHg7XG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uZ2FtZWJvYXJkLWxhYmVsIHtcbiAgICBtYXJnaW46IDEwcHg7XG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7XG59XG5cbi8qIEdhbWVib2FyZCBzdHlsaW5nICovXG4uZ2FtZWJvYXJkIHtcbiAgICBoZWlnaHQ6IDQyMHB4O1xuICAgIHdpZHRoOiA0MjBweDtcblxuICAgIC8qIG91dGxpbmU6IDFweCBzb2xpZCBibGFjazsgKi9cblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xuXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuM3M7XG59XG5cbi5sb2NrZWQsXG4uZ2FtZWJvYXJkLWxhYmVsOmhhcygrIC5sb2NrZWQpIHtcbiAgICBvcGFjaXR5OiAwLjQ7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG5cbi8qIEdyaWQtdW5pdHMgc3R5bGluZyAtIGFsbCBzdGF0ZXMgKi9cbi8qIEVtcHR5IEdyaWQgLSBkZWZhdWx0ICovXG4uZ3JpZC11bml0IHtcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIG1hcmdpbjogMS41cHg7IC8qIGNvdXBsZWQgd2l0aCBVSS5kaXNwbGF5R3JpZHMoKSovXG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5nYW1lYm9hcmQuYyB7XG4gICAgY3Vyc29yOiBjcm9zc2hhaXI7XG59XG5cbi5ncmlkLW1pc3NlZCB7XG4gICAgZm9udC1zaXplOiAyNHB4O1xuICAgIG91dGxpbmU6IHJnYigyMjAsMzYsMzEpIHNvbGlkIDAuNXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjIwLDM2LDMxLCAwLjMpO1xufVxuXG4vKiBQcmlvcml0eSBTdGF0ZSBTdHlsaW5nIC0+IEFueSAzIG9mIHRoZXNlIHdpbGwgbm90IGJlIG11dHVhbGx5IGFwcGxpZWQgYXQgYW55IHBvaW50Ki9cbi5ncmlkLWhpZGRlbiB7XG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZSAhaW1wb3J0YW50OyAgICBcbn1cblxuLmdyaWQtZm91bmQge1xuICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICBvdXRsaW5lOiByZ2IoMjMsMTU5LDEwMikgc29saWQgMC41cHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzLDE1OSwxMDIsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLmdyaWQtc3VuayB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDkyLCAxNTgsIDE3MywgMC4xKSAhaW1wb3J0YW50O1xufVxuXG4vKiBHcmlkLXNoaXAgaW5kaXZpZHVhbCBzdHlsaW5nKi9cbi5zaGlwLTEge1xuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwyMCwyNTUsIDAuMyk7XG59XG5cbi5zaGlwLTIge1xuICAgIG91dGxpbmU6IHJnYigyMCw1MCwyNTUpIHNvbGlkIDFweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLDUwLDI1NSwgMC4zKTtcbn1cblxuLnNoaXAtMyB7XG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLDEwMiwyNTUsIDAuMyk7XG59XG5cbi5zaGlwLTQge1xuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4NSwxMzYsMjU1LCAwLjMpO1xufVxuXG4uc2hpcC01IHtcbiAgICBvdXRsaW5lOiByZ2IoMTE5LDE3MCwyNTUpIHNvbGlkIDFweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDExOSwxNzAsMjU1LCAwLjMpO1xufVxuXG4vKiBEcmFnIGRyb3AgcHJldmlldyBzdHlsaW5nIGZvciBlYWNoIHNoaXAqL1xuLnByZXZpZXctc2hpcC0xIHtcbiAgICBvdXRsaW5lOiByZ2IoMCwyMCwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwyMCwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnByZXZpZXctc2hpcC0yIHtcbiAgICBvdXRsaW5lOiByZ2IoMjAsNTAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLDUwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4ucHJldmlldy1zaGlwLTMge1xuICAgIG91dGxpbmU6IHJnYig1MSwxMDIsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLDEwMiwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnByZXZpZXctc2hpcC00IHtcbiAgICBvdXRsaW5lOiByZ2IoODUsMTM2LDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4NSwxMzYsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5wcmV2aWV3LXNoaXAtNSB7XG4gICAgb3V0bGluZTogcmdiKDExOSwxNzAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDExOSwxNzAsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5zaGlwLWRyb3BwYWJsZSB7XG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzEsMjQ1LDI0NCwwLjYpO1xufVxuXG4vKiBTY29yZWJvYXJkIFN0eWxpbmcgKi9cblxuLnNjb3JlYm9hcmQtbGFiZWwge1xuICAgIG1hcmdpbi10b3A6IDIwcHg7XG4gICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbn1cblxuLnNjb3JlYm9hcmQge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG5cbiAgICBnYXA6IDEwcHg7XG59XG5cbi5zY29yZWJvYXJkID4gZGl2IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGdhcDogMXB4O1xufVxuXG4uc2NvcmVib2FyZCA+IGRpdi5zY29yZS1zdW5rIHtcbiAgICBkaXNwbGF5OiBub25lO1xufVxuXG4uYm94IHtcbiAgICBvdXRsaW5lOiAwcHggIWltcG9ydGFudDtcbiAgICB3aWR0aDogMTVweDtcbiAgICBoZWlnaHQ6IDE1cHg7XG59XG5cblxuLyogcmVzdWx0cyBtb2RhbCBzdHlsaW5nICovXG5kaWFsb2c6OmJhY2tkcm9wIHtcbiAgICBvcGFjaXR5OiAwLjk7XG59XG5cbi5yZXN1bHQge1xuICAgIHdpZHRoOiA0MCU7XG4gICAgaGVpZ2h0OiA0MHZoO1xuXG4gICAgYm9yZGVyOiAxcHggc29saWQgYmxhY2s7XG59XG5cbi8qIHJlc3VsdCBtb2RhbCBmbGV4IHRvIGJlIHJ1biBvbmx5IHdoZW4gZGlzcGxheWVkICovXG4ucmVzdWx0LWRpc3BsYXllZCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbn1cblxuLnJlc3VsdC10ZXh0IHtcbiAgICBtYXJnaW4tYm90dG9tOiAzMHB4O1xuICAgIGZvbnQtc2l6ZTogNDJweDtcbn1cblxuI3BsYXktYWdhaW4ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZGRkZGO1xuICBib3JkZXI6IDFweCBzb2xpZCAjMjIyMjIyO1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBjb2xvcjogIzIyMjIyMjtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gIGZvbnQtZmFtaWx5OiAnQXJzZW5hbCBTQycsLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsUm9ib3RvLFwiSGVsdmV0aWNhIE5ldWVcIixzYW5zLXNlcmlmO1xuICBmb250LXNpemU6IDE2cHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICBtYXJnaW46IDA7XG4gIG91dGxpbmU6IG5vbmU7XG4gIHBhZGRpbmc6IDEzcHggMjNweDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XG4gIHRyYW5zaXRpb246IGJveC1zaGFkb3cgLjJzLC1tcy10cmFuc2Zvcm0gLjFzLC13ZWJraXQtdHJhbnNmb3JtIC4xcyx0cmFuc2Zvcm0gLjFzO1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgd2lkdGg6IGF1dG87XG59XG5cbiNwbGF5LWFnYWluOmFjdGl2ZSB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNGN0Y3Rjc7XG4gIGJvcmRlci1jb2xvcjogIzAwMDAwMDtcbiAgdHJhbnNmb3JtOiBzY2FsZSguOTYpO1xufVxuXG4jcGxheS1hZ2FpbjpkaXNhYmxlZCB7XG4gIGJvcmRlci1jb2xvcjogI0RERERERDtcbiAgY29sb3I6ICNEREREREQ7XG4gIGN1cnNvcjogbm90LWFsbG93ZWQ7XG4gIG9wYWNpdHk6IDE7XG59XG5cbi5mb290ZXIge1xuICAgIGZvbnQtZmFtaWx5OiBcIkFyc2VuYWwgU0NcIiwgc2Fucy1zZXJpZjtcblxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICAgIGNvbG9yOiBibGFjaztcbiAgICBoZWlnaHQ6IDEwMHB4O1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuXG4gICAgZm9udC1zaXplOiAxNnB4O1xufVxuXG4uZ2l0aHViLWxvZ28ge1xuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xuICAgIHdpZHRoOiAyNHB4O1xuICAgIGhlaWdodDogMjRweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5naXRodWItYSBpbWd7XG4gICAgb3BhY2l0eTogMC41O1xuICAgIHRyYW5zaXRpb246IGFsbCAzMDBtcztcbn1cblxuLmdpdGh1Yi1hIGltZzpob3ZlciB7XG4gICAgb3BhY2l0eTogMTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpIHNjYWxlKDEuMSk7XG59XG5cbi8qIE1lZGlhIHF1ZXJ5ICovXG5cbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMTMwMHB4KSB7XG4gICAgLm1haW4ge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICB9XG59XG5cbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogMTAwMHB4KSB7XG4gICAgLmdhbWVib2FyZCB7XG4gICAgICAgIHdpZHRoOiAzNTBweDtcbiAgICAgICAgaGVpZ2h0OiAzNTBweDtcbiAgICB9XG4gICAgLm1haW4ge1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICB9XG59XG5cbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODAwcHgpIHtcbiAgICAubWFpbiB7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgfVxuICAgIC5oZWFkZXIge1xuICAgICAgICBoZWlnaHQ6IDIwMHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgIH1cbiAgICAuZ2FtZWJvYXJkIHtcbiAgICAgICAgd2lkdGg6IDQ3MHB4O1xuICAgICAgICBoZWlnaHQ6IDQ3MHB4O1xuICAgIH1cbn1cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0ODBweCkge1xuICAgIC5nYW1lYm9hcmQge1xuICAgICAgICB3aWR0aDogMzUwcHg7XG4gICAgICAgIGhlaWdodDogMzUwcHg7XG4gICAgfVxufWAsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxnQkFBZ0I7O0FBR2hCO0lBQ0ksZUFBZTtBQUNuQjs7QUFFQTtJQUNJLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsU0FBUzs7SUFFVCxxQ0FBcUM7SUFDckMsZ0JBQWdCO0lBQ2hCLGtCQUFrQjtBQUN0Qjs7QUFFQSxXQUFXO0FBQ1g7SUFDSSxhQUFhOztJQUViLGVBQWU7SUFDZixnQkFBZ0I7O0lBRWhCLGFBQWE7SUFDYixzQkFBc0I7SUFDdEIsdUJBQXVCO0lBQ3ZCLG1CQUFtQjtBQUN2Qjs7QUFFQTtJQUNJLGVBQWU7SUFDZixrQkFBa0I7QUFDdEI7QUFDQSx5QkFBeUI7QUFDekIsUUFBUTtBQUNSO0VBQ0UsbUJBQW1CO0VBQ25CLHNCQUFzQjtFQUN0QixzQkFB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SUFDakI7QUFDSjs7QUFFQTtJQUNJO1FBQ0ksWUFBWTtRQUNaLGFBQWE7SUFDakI7QUFDSlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIvKiBGb250ICsgbWV0YSAqL1xcbkBpbXBvcnQgdXJsKCdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PUFyc2VuYWwrU0M6aXRhbCx3Z2h0QDAsNDAwOzAsNzAwOzEsNDAwOzEsNzAwJmRpc3BsYXk9c3dhcCcpO1xcblxcbmltZyB7XFxuICAgIG1heC13aWR0aDogMTAwJTtcXG59XFxuXFxuYm9keSB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIG1hcmdpbjogMDtcXG5cXG4gICAgZm9udC1mYW1pbHk6IFxcXCJBcnNlbmFsIFNDXFxcIiwgc2Fucy1zZXJpZjtcXG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xcbn1cXG5cXG4vKiBIZWFkZXIgKi9cXG4uaGVhZGVyIHtcXG4gICAgaGVpZ2h0OiAxMjBweDtcXG4gICAgXFxuICAgIGZvbnQtc2l6ZTogNDJweDtcXG4gICAgbWFyZ2luLXRvcDogMTVweDtcXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5oZWFkZXItZGVzYyB7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gICAgZm9udC1zdHlsZTogaXRhbGljO1xcbn1cXG4vKiBTdGFydC9yZXN0YXJ0IGJ1dHRvbiAqL1xcbi8qIENTUyAqL1xcbi5oZWFkLWJ0biB7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgY29sb3I6ICMwMDA7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmlsbDogIzAwMDtcXG4gIGZvbnQtZmFtaWx5OiBcXFwiQXJzZW5hbCBTQ1xcXCIsIHNhbnMtc2VyaWY7XFxuICBmb250LXNpemU6IDE4cHg7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBsZXR0ZXItc3BhY2luZzogLS44cHg7XFxuICBsaW5lLWhlaWdodDogMjRweDtcXG4gIG1pbi13aWR0aDogMTgwcHg7XFxuICBvdXRsaW5lOiAwO1xcbiAgcGFkZGluZzogOHB4IDEwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XFxuXFxuICBtYXJnaW4tdG9wOiAyNXB4O1xcbn1cXG5cXG4uaGVhZC1idG46Zm9jdXMge1xcbiAgY29sb3I6ICMxNzFlMjk7XFxufVxcblxcbi5oZWFkLWJ0bjpob3ZlciB7XFxuICBib3JkZXItY29sb3I6ICMwNmY7XFxuICBjb2xvcjogIzA2ZjtcXG4gIGZpbGw6ICMwNmY7XFxufVxcblxcbi5oZWFkLWJ0bjphY3RpdmUge1xcbiAgYm9yZGVyLWNvbG9yOiAjMDZmO1xcbiAgY29sb3I6ICMwNmY7XFxuICBmaWxsOiAjMDZmO1xcbn1cXG5cXG4ubWFpbiB7XFxuICAgIGZsZXg6IDE7XFxuXFxuICAgIG1hcmdpbjogYXV0bztcXG4gICAgd2lkdGg6IDgwJTtcXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG5cXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcblxcbi5wbGF5ZXIsIC5jb21wdXRlciB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgbWluLXdpZHRoOiA0NCU7XFxuXFxuICAgIHBhZGRpbmctdG9wOiA1cHg7XFxuICAgIHBhZGRpbmctYm90dG9tOiA3NXB4O1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcblxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG4uZ2FtZWJvYXJkLWxhYmVsIHtcXG4gICAgbWFyZ2luOiAxMHB4O1xcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcXG59XFxuXFxuLyogR2FtZWJvYXJkIHN0eWxpbmcgKi9cXG4uZ2FtZWJvYXJkIHtcXG4gICAgaGVpZ2h0OiA0MjBweDtcXG4gICAgd2lkdGg6IDQyMHB4O1xcblxcbiAgICAvKiBvdXRsaW5lOiAxcHggc29saWQgYmxhY2s7ICovXFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogd3JhcDtcXG5cXG4gICAgdHJhbnNpdGlvbjogYWxsIDAuM3M7XFxufVxcblxcbi5sb2NrZWQsXFxuLmdhbWVib2FyZC1sYWJlbDpoYXMoKyAubG9ja2VkKSB7XFxuICAgIG9wYWNpdHk6IDAuNDtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbi8qIEdyaWQtdW5pdHMgc3R5bGluZyAtIGFsbCBzdGF0ZXMgKi9cXG4vKiBFbXB0eSBHcmlkIC0gZGVmYXVsdCAqL1xcbi5ncmlkLXVuaXQge1xcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgbWFyZ2luOiAxLjVweDsgLyogY291cGxlZCB3aXRoIFVJLmRpc3BsYXlHcmlkcygpKi9cXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5nYW1lYm9hcmQuYyB7XFxuICAgIGN1cnNvcjogY3Jvc3NoYWlyO1xcbn1cXG5cXG4uZ3JpZC1taXNzZWQge1xcbiAgICBmb250LXNpemU6IDI0cHg7XFxuICAgIG91dGxpbmU6IHJnYigyMjAsMzYsMzEpIHNvbGlkIDAuNXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIyMCwzNiwzMSwgMC4zKTtcXG59XFxuXFxuLyogUHJpb3JpdHkgU3RhdGUgU3R5bGluZyAtPiBBbnkgMyBvZiB0aGVzZSB3aWxsIG5vdCBiZSBtdXR1YWxseSBhcHBsaWVkIGF0IGFueSBwb2ludCovXFxuLmdyaWQtaGlkZGVuIHtcXG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGUgIWltcG9ydGFudDsgICAgXFxufVxcblxcbi5ncmlkLWZvdW5kIHtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICBvdXRsaW5lOiByZ2IoMjMsMTU5LDEwMikgc29saWQgMC41cHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMywxNTksMTAyLCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5ncmlkLXN1bmsge1xcbiAgICBmb250LXNpemU6IDEycHg7XFxuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig5MiwgMTU4LCAxNzMsIDAuMSkgIWltcG9ydGFudDtcXG59XFxuXFxuLyogR3JpZC1zaGlwIGluZGl2aWR1YWwgc3R5bGluZyovXFxuLnNoaXAtMSB7XFxuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMjAsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC0yIHtcXG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLDUwLDI1NSwgMC4zKTtcXG59XFxuXFxuLnNoaXAtMyB7XFxuICAgIG91dGxpbmU6IHJnYig1MSwxMDIsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsMTAyLDI1NSwgMC4zKTtcXG59XFxuXFxuLnNoaXAtNCB7XFxuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoODUsMTM2LDI1NSwgMC4zKTtcXG59XFxuXFxuLnNoaXAtNSB7XFxuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDExOSwxNzAsMjU1LCAwLjMpO1xcbn1cXG5cXG4vKiBEcmFnIGRyb3AgcHJldmlldyBzdHlsaW5nIGZvciBlYWNoIHNoaXAqL1xcbi5wcmV2aWV3LXNoaXAtMSB7XFxuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwyMCwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC0yIHtcXG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5wcmV2aWV3LXNoaXAtMyB7XFxuICAgIG91dGxpbmU6IHJnYig1MSwxMDIsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwxMDIsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5wcmV2aWV3LXNoaXAtNCB7XFxuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4NSwxMzYsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5wcmV2aWV3LXNoaXAtNSB7XFxuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnNoaXAtZHJvcHBhYmxlIHtcXG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMxLDI0NSwyNDQsMC42KTtcXG59XFxuXFxuLyogU2NvcmVib2FyZCBTdHlsaW5nICovXFxuXFxuLnNjb3JlYm9hcmQtbGFiZWwge1xcbiAgICBtYXJnaW4tdG9wOiAyMHB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xcbn1cXG5cXG4uc2NvcmVib2FyZCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcblxcbiAgICBnYXA6IDEwcHg7XFxufVxcblxcbi5zY29yZWJvYXJkID4gZGl2IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZ2FwOiAxcHg7XFxufVxcblxcbi5zY29yZWJvYXJkID4gZGl2LnNjb3JlLXN1bmsge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4uYm94IHtcXG4gICAgb3V0bGluZTogMHB4ICFpbXBvcnRhbnQ7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxufVxcblxcblxcbi8qIHJlc3VsdHMgbW9kYWwgc3R5bGluZyAqL1xcbmRpYWxvZzo6YmFja2Ryb3Age1xcbiAgICBvcGFjaXR5OiAwLjk7XFxufVxcblxcbi5yZXN1bHQge1xcbiAgICB3aWR0aDogNDAlO1xcbiAgICBoZWlnaHQ6IDQwdmg7XFxuXFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xcbn1cXG5cXG4vKiByZXN1bHQgbW9kYWwgZmxleCB0byBiZSBydW4gb25seSB3aGVuIGRpc3BsYXllZCAqL1xcbi5yZXN1bHQtZGlzcGxheWVkIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG5cXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcblxcbi5yZXN1bHQtdGV4dCB7XFxuICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XFxuICAgIGZvbnQtc2l6ZTogNDJweDtcXG59XFxuXFxuI3BsYXktYWdhaW4ge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICMyMjIyMjI7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgY29sb3I6ICMyMjIyMjI7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBmb250LWZhbWlseTogJ0Fyc2VuYWwgU0MnLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFJvYm90byxcXFwiSGVsdmV0aWNhIE5ldWVcXFwiLHNhbnMtc2VyaWY7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICBtYXJnaW46IDA7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgcGFkZGluZzogMTNweCAyM3B4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XFxuICB0cmFuc2l0aW9uOiBib3gtc2hhZG93IC4ycywtbXMtdHJhbnNmb3JtIC4xcywtd2Via2l0LXRyYW5zZm9ybSAuMXMsdHJhbnNmb3JtIC4xcztcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcXG4gIHdpZHRoOiBhdXRvO1xcbn1cXG5cXG4jcGxheS1hZ2FpbjphY3RpdmUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0Y3RjdGNztcXG4gIGJvcmRlci1jb2xvcjogIzAwMDAwMDtcXG4gIHRyYW5zZm9ybTogc2NhbGUoLjk2KTtcXG59XFxuXFxuI3BsYXktYWdhaW46ZGlzYWJsZWQge1xcbiAgYm9yZGVyLWNvbG9yOiAjREREREREO1xcbiAgY29sb3I6ICNEREREREQ7XFxuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgb3BhY2l0eTogMTtcXG59XFxuXFxuLmZvb3RlciB7XFxuICAgIGZvbnQtZmFtaWx5OiBcXFwiQXJzZW5hbCBTQ1xcXCIsIHNhbnMtc2VyaWY7XFxuXFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBjb2xvcjogYmxhY2s7XFxuICAgIGhlaWdodDogMTAwcHg7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcblxcbiAgICBmb250LXNpemU6IDE2cHg7XFxufVxcblxcbi5naXRodWItbG9nbyB7XFxuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xcbiAgICB3aWR0aDogMjRweDtcXG4gICAgaGVpZ2h0OiAyNHB4O1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuLmdpdGh1Yi1hIGltZ3tcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMzAwbXM7XFxufVxcblxcbi5naXRodWItYSBpbWc6aG92ZXIge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpIHNjYWxlKDEuMSk7XFxufVxcblxcbi8qIE1lZGlhIHF1ZXJ5ICovXFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMzAwcHgpIHtcXG4gICAgLm1haW4ge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMDAwcHgpIHtcXG4gICAgLmdhbWVib2FyZCB7XFxuICAgICAgICB3aWR0aDogMzUwcHg7XFxuICAgICAgICBoZWlnaHQ6IDM1MHB4O1xcbiAgICB9XFxuICAgIC5tYWluIHtcXG4gICAgICAgIHdpZHRoOiAxMDAlO1xcbiAgICB9XFxufVxcblxcbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogODAwcHgpIHtcXG4gICAgLm1haW4ge1xcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIH1cXG4gICAgLmhlYWRlciB7XFxuICAgICAgICBoZWlnaHQ6IDIwMHB4O1xcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMjBweDtcXG4gICAgfVxcbiAgICAuZ2FtZWJvYXJkIHtcXG4gICAgICAgIHdpZHRoOiA0NzBweDtcXG4gICAgICAgIGhlaWdodDogNDcwcHg7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0ODBweCkge1xcbiAgICAuZ2FtZWJvYXJkIHtcXG4gICAgICAgIHdpZHRoOiAzNTBweDtcXG4gICAgICAgIGhlaWdodDogMzUwcHg7XFxuICAgIH1cXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5vcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgc2NyaXB0VXJsO1xuaWYgKF9fd2VicGFja19yZXF1aXJlX18uZy5pbXBvcnRTY3JpcHRzKSBzY3JpcHRVcmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcubG9jYXRpb24gKyBcIlwiO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmRvY3VtZW50O1xuaWYgKCFzY3JpcHRVcmwgJiYgZG9jdW1lbnQpIHtcblx0aWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpXG5cdFx0c2NyaXB0VXJsID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmM7XG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkge1xuXHRcdFx0dmFyIGkgPSBzY3JpcHRzLmxlbmd0aCAtIDE7XG5cdFx0XHR3aGlsZSAoaSA+IC0xICYmICghc2NyaXB0VXJsIHx8ICEvXmh0dHAocz8pOi8udGVzdChzY3JpcHRVcmwpKSkgc2NyaXB0VXJsID0gc2NyaXB0c1tpLS1dLnNyYztcblx0XHR9XG5cdH1cbn1cbi8vIFdoZW4gc3VwcG9ydGluZyBicm93c2VycyB3aGVyZSBhbiBhdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIHlvdSBtdXN0IHNwZWNpZnkgYW4gb3V0cHV0LnB1YmxpY1BhdGggbWFudWFsbHkgdmlhIGNvbmZpZ3VyYXRpb25cbi8vIG9yIHBhc3MgYW4gZW1wdHkgc3RyaW5nIChcIlwiKSBhbmQgc2V0IHRoZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB2YXJpYWJsZSBmcm9tIHlvdXIgY29kZSB0byB1c2UgeW91ciBvd24gbG9naWMuXG5pZiAoIXNjcmlwdFVybCkgdGhyb3cgbmV3IEVycm9yKFwiQXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIik7XG5zY3JpcHRVcmwgPSBzY3JpcHRVcmwucmVwbGFjZSgvIy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcPy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgXCIvXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gc2NyaXB0VXJsOyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0ICcuL3N0eWxlL3N0eWxlLmNzcyc7XG5pbXBvcnQgVUkgZnJvbSAnLi9tb2R1bGVzL3VpJ1xuXG5VSS5zZXR1cCgpO1xuVUkuaW5pdEdhbWUoKTtcbiJdLCJuYW1lcyI6WyJTaGlwIiwiR2FtZWJvYXJkIiwiY29uc3RydWN0b3IiLCJncmlkcyIsIkFycmF5IiwiZmlsbCIsImF0dGFja3MiLCJzaGlwcyIsImlzVmFsaWRQbGFjZW1lbnQiLCJzaGlwIiwiY29vcmRzIiwiaXNWYWxpZCIsImZvckVhY2giLCJpZHgiLCJsZW5ndGgiLCJwbGFjZVNoaXAiLCJwdXNoIiwicmVjZWl2ZUF0dGFjayIsImNvb3JkIiwiaW5jbHVkZXMiLCJoaXQiLCJnZXRNaXNzZXMiLCJtaXNzZXMiLCJhdHRhY2siLCJnZXRSZW1haW5pbmciLCJyZW1haW5pbmciLCJpIiwiaXNHYW1lT3ZlciIsImdhbWVvdmVyIiwic2hpcE9iaiIsImlzU3VuayIsIlBsYXllciIsImdhbWVib2FyZCIsImF4aXMiLCJhcmd1bWVudHMiLCJ1bmRlZmluZWQiLCJoaXRzIiwic2V0QXhpcyIsImdldEF4aXMiLCJEcmFnRHJvcCIsIlNjb3JlQm9hcmQiLCJCYXR0bGVzaGlwQUkiLCJBSUF0dGFjayIsInBsYXllciIsImhpdHNOb3RTdW5rIiwiZmlsdGVyIiwidGFyZ2V0IiwiY29uc29sZSIsImxvZyIsInRhcmdldEhpdHMiLCJOV1NFIiwiYmFzZSIsIm9mZnNldCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsIm5leHQiLCJtaW4iLCJyZW1haW5pbmdTaGlwcyIsImNoZWNrSWZGaXQiLCJzaGlwTGVuZ3RoIiwiY29uc2VjdXRpdmUiLCJXRSIsIm1heCIsIk5TIiwib3B0aW9ucyIsIlVJIiwiaW5pdCIsInJlc2V0RXZlbnRzIiwic2V0RHJhZ2dhYmxlQXJlYSIsImRyYWciLCJjbGljayIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImdyaWQiLCJvbmRyYWdzdGFydCIsImUiLCJvbmRyYWdlbnRlciIsInByZXZlbnREZWZhdWx0Iiwib25kcmFnZW5kIiwib25kcmFnb3ZlciIsIm9uY2xpY2siLCJzZXRBdHRyaWJ1dGUiLCJzdHlsZSIsInBsYXllclNoaXBzIiwiaXNEcm9wcGFibGUiLCJzZXREcm9wcGFibGVBcmVhIiwic2hpcE9mZnNldCIsImNsYXNzTGlzdCIsInJlbW92ZSIsInBsYXllckdyaWRzIiwiaGVhZCIsInBhcnNlSW50IiwiaWQiLCJzbGljZSIsImtleXMiLCJtYXAiLCJ4IiwiZXZlcnkiLCJhZGQiLCJnZXRFbGVtZW50QnlJZCIsImRhdGFUcmFuc2ZlciIsImVmZmVjdEFsbG93ZWQiLCJjbGFzc2VzIiwic2hpcElkeCIsImZpbmQiLCJ2YWx1ZSIsInN0YXJ0c1dpdGgiLCJzb3J0IiwiYSIsImIiLCJmaW5kSW5kZXgiLCJkcmFnRW50ZXIiLCJkcmFnRW5kIiwiZHJvcHBhYmxlIiwiZHJvcEVmZmVjdCIsInByZXZpZXciLCJxdWVyeVNlbGVjdG9yIiwiZHJhZ0Ryb3AiLCJwb3RlbnRpYWxDb29yZHMiLCJvbmRyb3AiLCJvbGRDb29yZHMiLCJyZXBsYWNlU2hpcCIsIm5ld0Nvb3JkcyIsIm5ld0F4aXMiLCJ1cGRhdGVQbGFjZWRTaGlwcyIsInNoYWtlIiwiYW5pbWF0ZSIsInRyYW5zZm9ybSIsInRlcm1pbmF0ZSIsImNyZWF0ZVNjb3JlYm9hcmQiLCJjb21wdXRlciIsInNjb3JlIiwiaW5uZXJIVE1MIiwic2NvcmVib2FyZCIsImNvbnRhaW5zIiwiY2hpbGRyZW4iLCJib3giLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJ1cGRhdGVTY29yZWJvYXJkIiwidG9TdHJpbmciLCJHaXQiLCJGYXYiLCJzZXR1cCIsInNyYyIsImRpc3BsYXlHcmlkcyIsImdhbWVib2FyZFAiLCJncmlkVW5pdCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2FtZWJvYXJkQyIsImluaXRHYW1lIiwidGV4dENvbnRlbnQiLCJwbGFjZVJhbmRvbVNoaXBzIiwiaW5pdERpc3BsYXlTaGlwcyIsInBsYXllclNoaXBTZWxlY3QiLCJnYW1lTG9naWMiLCJyYW5kb21Db29yZGluYXRlcyIsInBvcyIsImFycmF5IiwiZmxlZXQiLCJqIiwidXBkYXRlR3JpZHMiLCJwbGF5ZXJBdHRhY2tzIiwiY29tcEF0dGFja3MiLCJ1cGRhdGVTaGlwcyIsInBsYXlSb3VuZCIsImlucHV0IiwicGxheWVyQXR0YWNrIiwiZ2FtZU92ZXIiLCJkZWxheSIsIm1zIiwiUHJvbWlzZSIsInJlcyIsInJlaiIsInNldFRpbWVvdXQiLCJ3aW5uZXJUZXh0IiwiZGlhbG9nIiwidGV4dCIsInJlc3RhcnQiLCJzaG93TW9kYWwiLCJjbG9zZSJdLCJzb3VyY2VSb290IjoiIn0=