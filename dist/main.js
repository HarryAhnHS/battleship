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
      if (this.grids[i] == null) remaining.push(i);
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

        let min = 5;
        const remainingShips = player.gameboard.ships;
        remainingShips = player.gameboard.ships.filter(shipObj => {
          !shipObj.ship.isSunk;
        });
        console.log(remainingShips);
        remainingShips.forEach(shipObj => {
          console.log("min = ", min);
          if (shipObj.ship.length <= min) min = shipObj.ship.length;
        });
        console.log("final min", min);
        // Return true if ship fits from base / false if not
        function checkIfFit(player, base, offset, shipLength) {
          let coords = [];
          for (let i = 0; i < shipLength; i++) {
            coords.push(base + offset * i);
          }
          console.log("Check if fit coords - ", coords);
          // Potenital coords of base, offset, shipLength
          let isValid = true;
          coords.forEach(idx => {
            if (!player.gameboard.attacks.includes(idx) || next < 0 || next > 99 || (offset == -1 || offset == 1) && !(Math.floor(next / 10) == Math.floor(base / 10))) {
              isValid = false;
            }
          });
          console.log(isValid);
          return isValid;
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
      let next = Math.floor(Math.random() * options.length);
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
    document.querySelector(".header-helper").textContent = "Move/Rotate Ships";

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
      document.querySelector(".header-helper").textContent = "Begin the battle";
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
    if (computer.gameboard.isGameOver()) gameOver("Player", player);

    // Computer Attack -> Update Grid Display -> Check if winner
    await delay(500);
    _battleshipAI__WEBPACK_IMPORTED_MODULE_3__["default"].AIAttack(player);
    updateGrids(player, computer);
    updateShips(player, computer);
    _scoreboard__WEBPACK_IMPORTED_MODULE_4__["default"].updateScoreboard(player, computer);
    if (player.gameboard.isGameOver()) gameOver("Computer", computer);
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
    const restart = document.querySelector("#play-agin");

    // TODO - create game over styling transition in winning player grid
    document.querySelector(".gameboard.c").classList.add("locked");
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
    height: 130px;
    
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
  min-width: 140px;
  outline: 0;
  padding: 8px 10px;
  text-align: center;
  text-decoration: none;
  transition: all .3s;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  margin-top: 15px;
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

    display: flex;

    align-items: center;
    justify-content: center;
}

.player, .computer {
    height: 100%;
    width: 46%;

    padding-bottom: 100px;

    display: flex;
    flex-direction: column;

    align-items: center;
}

.gameboard-label {
    margin: 15px;
}

/* Gameboard styling */
.gameboard {
    height: 420px;
    width: 420px;

    /* outline: 1px solid black; */

    display: flex;
    flex-wrap: wrap;
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
`, "",{"version":3,"sources":["webpack://./src/style/style.css"],"names":[],"mappings":"AAAA,gBAAgB;;AAGhB;IACI,eAAe;AACnB;;AAEA;IACI,aAAa;IACb,sBAAsB;IACtB,SAAS;;IAET,qCAAqC;IACrC,gBAAgB;IAChB,kBAAkB;AACtB;;AAEA,WAAW;AACX;IACI,aAAa;;IAEb,eAAe;IACf,gBAAgB;;IAEhB,aAAa;IACb,sBAAsB;IACtB,uBAAuB;IACvB,mBAAmB;AACvB;;AAEA;IACI,eAAe;IACf,kBAAkB;AACtB;AACA,yBAAyB;AACzB,QAAQ;AACR;EACE,mBAAmB;EACnB,sBAAsB;EACtB,sBAAsB;EACtB,sBAAsB;EACtB,WAAW;EACX,eAAe;EACf,aAAa;EACb,UAAU;EACV,qCAAqC;EACrC,eAAe;EACf,gBAAgB;EAChB,uBAAuB;EACvB,qBAAqB;EACrB,iBAAiB;EACjB,gBAAgB;EAChB,UAAU;EACV,iBAAiB;EACjB,kBAAkB;EAClB,qBAAqB;EACrB,mBAAmB;EACnB,iBAAiB;EACjB,yBAAyB;EACzB,0BAA0B;;EAE1B,gBAAgB;AAClB;;AAEA;EACE,cAAc;AAChB;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,WAAW;EACX,UAAU;AACZ;;AAEA;IACI,OAAO;;IAEP,aAAa;;IAEb,mBAAmB;IACnB,uBAAuB;AAC3B;;AAEA;IACI,YAAY;IACZ,UAAU;;IAEV,qBAAqB;;IAErB,aAAa;IACb,sBAAsB;;IAEtB,mBAAmB;AACvB;;AAEA;IACI,YAAY;AAChB;;AAEA,sBAAsB;AACtB;IACI,aAAa;IACb,YAAY;;IAEZ,8BAA8B;;IAE9B,aAAa;IACb,eAAe;AACnB;;AAEA;;IAEI,YAAY;IACZ,oBAAoB;AACxB;;AAEA,oCAAoC;AACpC,yBAAyB;AACzB;IACI,sCAAsC;IACtC,sBAAsB;IACtB,aAAa,EAAE,kCAAkC;;IAEjD,aAAa;IACb,uBAAuB;IACvB,mBAAmB;AACvB;;AAEA;IACI,iBAAiB;AACrB;;AAEA;IACI,eAAe;IACf,mCAAmC;IACnC,sCAAsC;AAC1C;;AAEA,sFAAsF;AACtF;IACI,iDAAiD;IACjD,kCAAkC;AACtC;;AAEA;IACI,eAAe;IACf,+CAA+C;IAC/C,kDAAkD;AACtD;;AAEA;IACI,eAAe;IACf,iDAAiD;IACjD,mDAAmD;AACvD;;AAEA,gCAAgC;AAChC;IACI,gCAAgC;IAChC,qCAAqC;AACzC;;AAEA;IACI,iCAAiC;IACjC,sCAAsC;AAC1C;;AAEA;IACI,kCAAkC;IAClC,uCAAuC;AAC3C;;AAEA;IACI,kCAAkC;IAClC,uCAAuC;AAC3C;;AAEA;IACI,mCAAmC;IACnC,wCAAwC;AAC5C;;AAEA,2CAA2C;AAC3C;IACI,2CAA2C;IAC3C,gDAAgD;AACpD;;AAEA;IACI,4CAA4C;IAC5C,iDAAiD;AACrD;;AAEA;IACI,6CAA6C;IAC7C,kDAAkD;AACtD;;AAEA;IACI,6CAA6C;IAC7C,kDAAkD;AACtD;;AAEA;IACI,8CAA8C;IAC9C,mDAAmD;AACvD;;AAEA;IACI,sCAAsC;IACtC,uCAAuC;AAC3C;;AAEA,uBAAuB;;AAEvB;IACI,gBAAgB;IAChB,mBAAmB;AACvB;;AAEA;IACI,aAAa;IACb,uBAAuB;;IAEvB,SAAS;AACb;;AAEA;IACI,aAAa;IACb,QAAQ;AACZ;;AAEA;IACI,aAAa;AACjB;;AAEA;IACI,uBAAuB;IACvB,WAAW;IACX,YAAY;AAChB;;;AAGA,0BAA0B;AAC1B;IACI,YAAY;AAChB;;AAEA;IACI,UAAU;IACV,YAAY;;IAEZ,uBAAuB;AAC3B;;AAEA,oDAAoD;AACpD;IACI,aAAa;IACb,sBAAsB;;IAEtB,mBAAmB;IACnB,uBAAuB;AAC3B;;AAEA;IACI,mBAAmB;IACnB,eAAe;AACnB;;AAEA;EACE,yBAAyB;EACzB,yBAAyB;EACzB,sBAAsB;EACtB,cAAc;EACd,eAAe;EACf,qBAAqB;EACrB,6FAA6F;EAC7F,eAAe;EACf,gBAAgB;EAChB,iBAAiB;EACjB,SAAS;EACT,aAAa;EACb,kBAAkB;EAClB,kBAAkB;EAClB,kBAAkB;EAClB,qBAAqB;EACrB,0BAA0B;EAC1B,gFAAgF;EAChF,iBAAiB;EACjB,yBAAyB;EACzB,WAAW;AACb;;AAEA;EACE,yBAAyB;EACzB,qBAAqB;EACrB,qBAAqB;AACvB;;AAEA;EACE,qBAAqB;EACrB,cAAc;EACd,mBAAmB;EACnB,UAAU;AACZ;;AAEA;IACI,qCAAqC;;IAErC,uBAAuB;IACvB,YAAY;IACZ,aAAa;;IAEb,aAAa;IACb,uBAAuB;IACvB,mBAAmB;;IAEnB,eAAe;AACnB;;AAEA;IACI,iBAAiB;IACjB,WAAW;IACX,YAAY;IACZ,aAAa;IACb,uBAAuB;IACvB,mBAAmB;AACvB;;AAEA;IACI,YAAY;IACZ,qBAAqB;AACzB;;AAEA;IACI,UAAU;IACV,oCAAoC;AACxC","sourcesContent":["/* Font + meta */\n@import url('https://fonts.googleapis.com/css2?family=Arsenal+SC:ital,wght@0,400;0,700;1,400;1,700&display=swap');\n\nimg {\n    max-width: 100%;\n}\n\nbody {\n    display: flex;\n    flex-direction: column;\n    margin: 0;\n\n    font-family: \"Arsenal SC\", sans-serif;\n    font-weight: 400;\n    font-style: normal;\n}\n\n/* Header */\n.header {\n    height: 130px;\n    \n    font-size: 42px;\n    margin-top: 15px;\n\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    align-items: center;\n}\n\n.header-desc {\n    font-size: 16px;\n    font-style: italic;\n}\n/* Start/restart button */\n/* CSS */\n.head-btn {\n  align-items: center;\n  background-color: #fff;\n  border: 1px solid #000;\n  box-sizing: border-box;\n  color: #000;\n  cursor: pointer;\n  display: flex;\n  fill: #000;\n  font-family: \"Arsenal SC\", sans-serif;\n  font-size: 18px;\n  font-weight: 400;\n  justify-content: center;\n  letter-spacing: -.8px;\n  line-height: 24px;\n  min-width: 140px;\n  outline: 0;\n  padding: 8px 10px;\n  text-align: center;\n  text-decoration: none;\n  transition: all .3s;\n  user-select: none;\n  -webkit-user-select: none;\n  touch-action: manipulation;\n\n  margin-top: 15px;\n}\n\n.head-btn:focus {\n  color: #171e29;\n}\n\n.head-btn:hover {\n  border-color: #06f;\n  color: #06f;\n  fill: #06f;\n}\n\n.head-btn:active {\n  border-color: #06f;\n  color: #06f;\n  fill: #06f;\n}\n\n.main {\n    flex: 1;\n\n    display: flex;\n\n    align-items: center;\n    justify-content: center;\n}\n\n.player, .computer {\n    height: 100%;\n    width: 46%;\n\n    padding-bottom: 100px;\n\n    display: flex;\n    flex-direction: column;\n\n    align-items: center;\n}\n\n.gameboard-label {\n    margin: 15px;\n}\n\n/* Gameboard styling */\n.gameboard {\n    height: 420px;\n    width: 420px;\n\n    /* outline: 1px solid black; */\n\n    display: flex;\n    flex-wrap: wrap;\n}\n\n.locked,\n.gameboard-label:has(+ .locked) {\n    opacity: 0.4;\n    pointer-events: none;\n}\n\n/* Grid-units styling - all states */\n/* Empty Grid - default */\n.grid-unit {\n    outline: rgb(92, 158, 173) solid 0.5px;\n    box-sizing: border-box;\n    margin: 1.5px; /* coupled with UI.displayGrids()*/\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.gameboard.c {\n    cursor: crosshair;\n}\n\n.grid-missed {\n    font-size: 24px;\n    outline: rgb(220,36,31) solid 0.5px;\n    background-color: rgba(220,36,31, 0.3);\n}\n\n/* Priority State Styling -> Any 3 of these will not be mutually applied at any point*/\n.grid-hidden {\n    outline: rgb(92, 158, 173) solid 0.5px !important;\n    background-color: white !important;    \n}\n\n.grid-found {\n    font-size: 12px;\n    outline: rgb(23,159,102) solid 0.5px !important;\n    background-color: rgba(23,159,102, 0.3) !important;\n}\n\n.grid-sunk {\n    font-size: 12px;\n    outline: rgb(92, 158, 173) solid 0.5px !important;\n    background-color: rgb(92, 158, 173, 0.1) !important;\n}\n\n/* Grid-ship individual styling*/\n.ship-1 {\n    outline: rgb(0,20,255) solid 1px;\n    background-color: rgba(0,20,255, 0.3);\n}\n\n.ship-2 {\n    outline: rgb(20,50,255) solid 1px;\n    background-color: rgba(20,50,255, 0.3);\n}\n\n.ship-3 {\n    outline: rgb(51,102,255) solid 1px;\n    background-color: rgba(51,102,255, 0.3);\n}\n\n.ship-4 {\n    outline: rgb(85,136,255) solid 1px;\n    background-color: rgba(85,136,255, 0.3);\n}\n\n.ship-5 {\n    outline: rgb(119,170,255) solid 1px;\n    background-color: rgba(119,170,255, 0.3);\n}\n\n/* Drag drop preview styling for each ship*/\n.preview-ship-1 {\n    outline: rgb(0,20,255) solid 1px !important;\n    background-color: rgba(0,20,255, 0.3) !important;\n}\n\n.preview-ship-2 {\n    outline: rgb(20,50,255) solid 1px !important;\n    background-color: rgba(20,50,255, 0.3) !important;\n}\n\n.preview-ship-3 {\n    outline: rgb(51,102,255) solid 1px !important;\n    background-color: rgba(51,102,255, 0.3) !important;\n}\n\n.preview-ship-4 {\n    outline: rgb(85,136,255) solid 1px !important;\n    background-color: rgba(85,136,255, 0.3) !important;\n}\n\n.preview-ship-5 {\n    outline: rgb(119,170,255) solid 1px !important;\n    background-color: rgba(119,170,255, 0.3) !important;\n}\n\n.ship-droppable {\n    outline: rgb(92, 158, 173) solid 0.5px;\n    background-color: rgba(231,245,244,0.6);\n}\n\n/* Scoreboard Styling */\n\n.scoreboard-label {\n    margin-top: 20px;\n    margin-bottom: 10px;\n}\n\n.scoreboard {\n    display: flex;\n    justify-content: center;\n\n    gap: 10px;\n}\n\n.scoreboard > div {\n    display: flex;\n    gap: 1px;\n}\n\n.scoreboard > div.score-sunk {\n    display: none;\n}\n\n.box {\n    outline: 0px !important;\n    width: 15px;\n    height: 15px;\n}\n\n\n/* results modal styling */\ndialog::backdrop {\n    opacity: 0.9;\n}\n\n.result {\n    width: 40%;\n    height: 40vh;\n\n    border: 1px solid black;\n}\n\n/* result modal flex to be run only when displayed */\n.result-displayed {\n    display: flex;\n    flex-direction: column;\n\n    align-items: center;\n    justify-content: center;\n}\n\n.result-text {\n    margin-bottom: 30px;\n    font-size: 42px;\n}\n\n#play-again {\n  background-color: #FFFFFF;\n  border: 1px solid #222222;\n  box-sizing: border-box;\n  color: #222222;\n  cursor: pointer;\n  display: inline-block;\n  font-family: 'Arsenal SC',-apple-system,BlinkMacSystemFont,Roboto,\"Helvetica Neue\",sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  line-height: 20px;\n  margin: 0;\n  outline: none;\n  padding: 13px 23px;\n  position: relative;\n  text-align: center;\n  text-decoration: none;\n  touch-action: manipulation;\n  transition: box-shadow .2s,-ms-transform .1s,-webkit-transform .1s,transform .1s;\n  user-select: none;\n  -webkit-user-select: none;\n  width: auto;\n}\n\n#play-again:active {\n  background-color: #F7F7F7;\n  border-color: #000000;\n  transform: scale(.96);\n}\n\n#play-again:disabled {\n  border-color: #DDDDDD;\n  color: #DDDDDD;\n  cursor: not-allowed;\n  opacity: 1;\n}\n\n.footer {\n    font-family: \"Arsenal SC\", sans-serif;\n\n    background-color: white;\n    color: black;\n    height: 100px;\n\n    display: flex;\n    justify-content: center;\n    align-items: center;\n\n    font-size: 16px;\n}\n\n.github-logo {\n    margin-left: 10px;\n    width: 24px;\n    height: 24px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.github-a img{\n    opacity: 0.5;\n    transition: all 300ms;\n}\n\n.github-a img:hover {\n    opacity: 1;\n    transform: rotate(360deg) scale(1.1);\n}\n"],"sourceRoot":""}]);
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
/* harmony import */ var _assets_github_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assets/github.png */ "./src/assets/github.png");
/* harmony import */ var _modules_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/ui */ "./src/modules/ui.js");



document.getElementById("github").src = _assets_github_png__WEBPACK_IMPORTED_MODULE_1__; // Fill github logo

_modules_ui__WEBPACK_IMPORTED_MODULE_2__["default"].initGame();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyw4RkFBOEYsTUFBTSxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksWUFBWSxZQUFZLGFBQWEsYUFBYSxPQUFPLFVBQVUsS0FBSyxXQUFXLFVBQVUsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksTUFBTSxZQUFZLFdBQVcsS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGNBQWMsYUFBYSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxXQUFXLFVBQVUsTUFBTSxLQUFLLFlBQVksV0FBVyxVQUFVLE1BQU0sS0FBSyxXQUFXLFdBQVcsWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFdBQVcsYUFBYSxXQUFXLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxPQUFPLFlBQVksTUFBTSxVQUFVLFdBQVcsYUFBYSxXQUFXLFVBQVUsT0FBTyxNQUFNLFVBQVUsWUFBWSxPQUFPLFlBQVksYUFBYSxNQUFNLFlBQVksYUFBYSx3QkFBd0IsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sWUFBWSxNQUFNLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sWUFBWSxNQUFNLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sWUFBWSxNQUFNLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxhQUFhLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLGFBQWEsV0FBVyxNQUFNLEtBQUssVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLE9BQU8sS0FBSyxZQUFZLFdBQVcsVUFBVSxRQUFRLFlBQVksTUFBTSxVQUFVLE9BQU8sS0FBSyxVQUFVLFdBQVcsWUFBWSxPQUFPLFlBQVksTUFBTSxVQUFVLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsT0FBTyxLQUFLLFlBQVksYUFB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QUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDbEJBOzs7Ozs7Ozs7Ozs7QUNBMkI7QUFDVztBQUVUO0FBRTdCTSxRQUFRLENBQUM0QixjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM2RSxHQUFHLEdBQUdELCtDQUFHLENBQUMsQ0FBQzs7QUFFN0M5RyxtREFBRSxDQUFDK0UsUUFBUSxDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JsYW5rLy4vc3JjL2ZhY3Rvcmllcy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvZmFjdG9yaWVzL3BsYXllci5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9mYWN0b3JpZXMvc2hpcC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL2JhdHRsZXNoaXBBSS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL2RyYWdEcm9wLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL21vZHVsZXMvc2NvcmVib2FyZC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL3VpLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL3N0eWxlL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9zdHlsZS9zdHlsZS5jc3M/YzlmMCIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNoaXAgZnJvbSAnLi9zaGlwJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lYm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmdyaWRzID0gbmV3IEFycmF5KDEwMCkuZmlsbChudWxsKTsgLy8gMkQgYXJyYXkgaWxsdXN0cmF0ZWQgYnkgMUQgKDEweDEwKVxuICAgICAgICB0aGlzLmF0dGFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5zaGlwcyA9IFtdO1xuICAgIH1cblxuICAgIGlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHNbaWR4XSAhPSBudWxsIHx8IGNvb3Jkcy5sZW5ndGggIT0gc2hpcC5sZW5ndGggfHwgaWR4IDwgMCB8fCBpZHggPiA5OSkge1xuICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayBwbGFjZW1lbnQgaWR4IGFuZCBpZiBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBwbGFjZVNoaXAoc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzKSkge1xuICAgICAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHNbaWR4XSA9IHNoaXA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdGhpcy5zaGlwcy5wdXNoKHtzaGlwLCBjb29yZHN9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlY2VpdmVBdHRhY2soY29vcmQpIHtcbiAgICAgICAgLy8gUmVnaXN0ZXIgYXR0YWNrIG9ubHkgaWYgdmFsaWRcbiAgICAgICAgaWYgKCF0aGlzLmF0dGFja3MuaW5jbHVkZXMoY29vcmQpICYmIGNvb3JkID49IDAgJiYgY29vcmQgPD0gOTkpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNrcy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRzW2Nvb3JkXSkge1xuICAgICAgICAgICAgICAgIC8vIFNoaXAgaGl0IC0gcmVnaXN0ZXIgaGl0IHRvIGNvcnJlc3BvbmRpbmcgc2hpcCBvYmplY3RcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzW2Nvb3JkXS5oaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE1pc3NlcygpIHtcbiAgICAgICAgbGV0IG1pc3NlcyA9IFtdO1xuICAgICAgICB0aGlzLmF0dGFja3MuZm9yRWFjaCgoYXR0YWNrKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1thdHRhY2tdID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtaXNzZXMucHVzaChhdHRhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gbWlzc2VzO1xuICAgIH1cblxuICAgIGdldFJlbWFpbmluZygpIHtcbiAgICAgICAgbGV0IHJlbWFpbmluZyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1tpXSA9PSBudWxsKSByZW1haW5pbmcucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVtYWluaW5nO1xuICAgIH1cblxuICAgIGlzR2FtZU92ZXIoKSB7XG4gICAgICAgIGxldCBnYW1lb3ZlciA9IHRydWU7XG4gICAgICAgIHRoaXMuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgaWYgKCFzaGlwT2JqLnNoaXAuaXNTdW5rKSBnYW1lb3ZlciA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZ2FtZW92ZXI7XG4gICAgfVxufSIsImltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ2FtZWJvYXJkID0gbmV3IEdhbWVib2FyZDtcbiAgICB9XG59XG5cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoaXAge1xuICAgIGNvbnN0cnVjdG9yKGxlbmd0aCwgYXhpcz0wKSB7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoLFxuICAgICAgICB0aGlzLmhpdHMgPSAwO1xuICAgICAgICB0aGlzLmlzU3VuayA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF4aXMgPSBheGlzOyAvLyAwIGhvcml6b250YWwsIDEgdmVydGljYWxcbiAgICB9XG5cbiAgICBzZXRBeGlzKGF4aXMpIHtcbiAgICAgICAgdGhpcy5heGlzID0gYXhpcztcbiAgICB9XG5cbiAgICBnZXRBeGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlzO1xuICAgIH1cblxuICAgIGhpdCgpIHtcbiAgICAgICAgdGhpcy5oaXRzKys7IFxuICAgICAgICBpZiAodGhpcy5oaXRzID49IHRoaXMubGVuZ3RoKSB0aGlzLmlzU3VuayA9IHRydWU7XG4gICAgfVxufSIsImltcG9ydCBTaGlwIGZyb20gXCIuLi9mYWN0b3JpZXMvc2hpcFwiO1xuaW1wb3J0IFBsYXllciBmcm9tIFwiLi4vZmFjdG9yaWVzL3BsYXllclwiO1xuaW1wb3J0IERyYWdEcm9wIGZyb20gXCIuL2RyYWdEcm9wXCI7XG5pbXBvcnQgU2NvcmVCb2FyZCBmcm9tIFwiLi9zY29yZWJvYXJkXCI7XG5cbmNvbnN0IEJhdHRsZXNoaXBBSSA9ICgoKSA9PiB7XG4gICAgZnVuY3Rpb24gQUlBdHRhY2socGxheWVyKSB7XG4gICAgICAgIC8vIFF1ZXVlOiBBcnJheSB0byBob2xkIGFsbCBjdXJyZW50bHkgYWN0aW9uYWJsZSBncmlkc1xuICAgICAgICBjb25zdCBoaXRzTm90U3VuayA9IHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcy5maWx0ZXIoKGhpdCkgPT4gXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2hpdF0gJiYgIXBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaGl0XS5pc1N1bmspO1xuICAgIFxuICAgICAgICBpZiAoaGl0c05vdFN1bmsubGVuZ3RoID4gMCkgeyBcbiAgICAgICAgICAgIC8vIDAuIEFjdGlvbiAtIGF0IGxlYXN0IDEgaGl0IHRvIGFjdCB1cG9uXG4gICAgICAgICAgICAvLyBTZXQgdW5zdW5rIHNoaXAgb2JqIHdpdGggbWF4IGhpdHMgdG8gd29yayBvbiBhcyB0YXJnZXRcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSB7c2hpcDogbmV3IFNoaXAoMCksIGNvb3JkczogW119OyAvLyBEdW1teSB2YXJpYWJsZSB0byB1cGRhdGUgYXMgbG9vcFxuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaGlwT2JqLnNoaXAuaXNTdW5rICYmIHNoaXBPYmouc2hpcC5oaXRzID4gdGFyZ2V0LnNoaXAuaGl0cykge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIG1heCBoaXQsIHVuc3VuayBzaGlwXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHNoaXBPYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGFyZ2V0ID0gXCIsIHRhcmdldCk7XG4gICAgXG4gICAgICAgICAgICAvLyBHZXQgdGFyZ2V0J3MgYWxyZWFkeSBoaXQgY29vcmRzIGFuZCBzdG9yZSBpbiBhcnJheVxuICAgICAgICAgICAgbGV0IHRhcmdldEhpdHMgPSBoaXRzTm90U3Vuay5maWx0ZXIoKGhpdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2hpdF0gPT0gdGFyZ2V0LnNoaXAgJiYgdGFyZ2V0LmNvb3Jkcy5pbmNsdWRlcyhoaXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRhcmdldCdzIGFscmVhZHkgaGl0IGNvb3JkcyA9IFwiLCB0YXJnZXRIaXRzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRhcmdldC5zaGlwLmhpdHMgPT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIDIuIElmIG9ubHkgMSBoaXQgaXMgbWF4LCB0aGVuIG11c3QgcmFuZG9taXplIGxlZnQgcmlnaHQgdG9wIG9yIHJpZ2h0XG4gICAgICAgICAgICAgICAgY29uc3QgTldTRSA9IFstMTAsIC0xLCArMTAsIDFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0YXJnZXRIaXRzWzBdO1xuICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBOV1NFW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IGJhc2UgKyBvZmZzZXQ7XG4gICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYmFzZSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXh0KVxuXG4gICAgICAgICAgICAgICAgLy8gRWRnZSBjYXNlIGhhbmRsaW5nIC0gKGFzc3VtZSB3b3JzdCBjYXNlIHNjZW5hcmlvKVxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGN1cnJlbnQgc21hbGxlc3QgcmVtYWluaW5nIHNoaXBcbiAgICAgICAgICAgICAgICAvLyAgLT4gY2hlY2sgaWYgdGhpcyBzaGlwIGNhbiBmaXRcblxuICAgICAgICAgICAgICAgIGxldCBtaW4gPSA1O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ1NoaXBzID0gcGxheWVyLmdhbWVib2FyZC5zaGlwcztcbiAgICAgICAgICAgICAgICByZW1haW5pbmdTaGlwcyA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZmlsdGVyKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICFzaGlwT2JqLnNoaXAuaXNTdW5rO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVtYWluaW5nU2hpcHMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1NoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJtaW4gPSBcIiwgbWluKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoaXBPYmouc2hpcC5sZW5ndGggPD0gbWluKSBtaW4gPSBzaGlwT2JqLnNoaXAubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmaW5hbCBtaW5cIiwgbWluKTtcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBzaGlwIGZpdHMgZnJvbSBiYXNlIC8gZmFsc2UgaWYgbm90XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tJZkZpdChwbGF5ZXIsIGJhc2UsIG9mZnNldCwgc2hpcExlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29vcmRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMucHVzaChiYXNlICsgKG9mZnNldCAqIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2hlY2sgaWYgZml0IGNvb3JkcyAtIFwiLCBjb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICAvLyBQb3Rlbml0YWwgY29vcmRzIG9mIGJhc2UsIG9mZnNldCwgc2hpcExlbmd0aFxuICAgICAgICAgICAgICAgICAgICBsZXQgaXNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKGlkeCkgfHwgbmV4dCA8IDAgfHwgbmV4dCA+IDk5IFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgKChvZmZzZXQgPT0gLTEgfHwgb2Zmc2V0ID09IDEpICYmICEoTWF0aC5mbG9vcihuZXh0LzEwKSA9PSBNYXRoLmZsb29yKGJhc2UvMTApKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXNWYWxpZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAvLyBCb3VuZHMgY2hlY2sgKGVkZ2VjYXNlOiBpZiBob3Jpem9udGFsIG11c3QgYmUgaW4gc2FtZSB5LWF4aXMpICsgbm90IGFscmVhZHkgYXR0YWNrZWQgPSBjeWNsZVxuICAgICAgICAgICAgICAgIHdoaWxlIChwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3MuaW5jbHVkZXMobmV4dCkgfHwgbmV4dCA8IDAgfHwgbmV4dCA+IDk5IFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgKChvZmZzZXQgPT0gLTEgfHwgb2Zmc2V0ID09IDEpICYmICEoTWF0aC5mbG9vcihuZXh0LzEwKSA9PSBNYXRoLmZsb29yKGJhc2UvMTApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICFjaGVja0lmRml0KHBsYXllciwgYmFzZSwgb2Zmc2V0LCBtaW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IE5XU0VbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCldO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gYmFzZSArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1Z2dpbmc6IG5ld25leHQgPSBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQucmVjZWl2ZUF0dGFjayhuZXh0KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMiBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gMy4gSWYgMiBoaXRzIG9yIG1vcmUgaXMgbWF4LCB0aGVuIGNhbiBkZWR1Y2UgdGhlIHNoaXAgYXhpcyBhbmQgZ3Vlc3MgbGVmdC0xIG9yIHJpZ2h0KzEgdW50aWwgZG9uZVxuICAgIFxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBheGlzIC0gZnJvbSAyIGhpdHMgY2FuIGFzc3VtZSBcbiAgICAgICAgICAgICAgICAvLyAoUmVmZXJlbmNlOiBTbGlnaHQgaW1wZXJmZWN0aW9uIGluIGxvZ2ljKSBJZiAyLDMsNCw1IGhpdHMgY2FuIHRlY2huaWNhbGx5IGJlIDIsMyw0LDUgc2hpcHNcbiAgICAgICAgICAgICAgICBjb25zdCBheGlzID0gdGFyZ2V0LnNoaXAuYXhpcztcbiAgICAgICAgICAgICAgICBpZiAoYXhpcyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGhvcml6b250YWwsIHJhbmRvbSBsZWZ0IG9yIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFdFID0gW01hdGgubWluKC4uLnRhcmdldEhpdHMpIC0gMSwgTWF0aC5tYXgoLi4udGFyZ2V0SGl0cykgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSBXRVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayAoZWRnZWNhc2U6IGlmIGhvcml6b250YWwgbXVzdCBiZSBpbiBzYW1lIHktYXhpcykgKyBub3QgYWxyZWFkeSBhdHRhY2tlZCA9IGN5Y2xlXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3MuaW5jbHVkZXMobmV4dCkgfHwgbmV4dCA8IDAgfHwgbmV4dCA+IDk5IFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIShNYXRoLmZsb29yKG5leHQvMTApID09IE1hdGguZmxvb3IoTWF0aC5taW4oLi4udGFyZ2V0SGl0cykvMTApKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IFdFW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU3RlcCAzIGF0dGFja2VkIGNlbGw6IFwiLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdmVydGljYWwsIHJhbmRvbSB0b3Agb3IgYm90dG9tXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IE5TID0gW01hdGgubWluKC4uLnRhcmdldEhpdHMpIC0gMTAsIE1hdGgubWF4KC4uLnRhcmdldEhpdHMpICsgMTBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IE5TW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gQm91bmRzIGNoZWNrICsgbm90IGFscmVhZHkgYXR0YWNrZWQgPSBjeWNsZVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKG5leHQpIHx8IG5leHQgPCAwIHx8IG5leHQgPiA5OSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IE5TW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU3RlcCAzIGF0dGFja2VkIGNlbGw6IFwiLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyAwLiBObyBoaXRzIHRvIGFjdCB1cG9uIC0gQ29tcGxldGUgcmFuZG9tIG91dCBvZiByZW1haW5pbmcgZ3JpZHNcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBwbGF5ZXIuZ2FtZWJvYXJkLmdldFJlbWFpbmluZygpO1xuICAgICAgICAgICAgbGV0IG5leHQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHRpb25zLmxlbmd0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU3RlcCAxIGF0dGFja2VkIGNlbGw6IFwiLCBuZXh0KTtcbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQucmVjZWl2ZUF0dGFjayhuZXh0KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIEFJQXR0YWNrXG4gICAgfVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgQmF0dGxlc2hpcEFJOyIsImltcG9ydCBVSSBmcm9tICcuL3VpJ1xuXG5jb25zdCBEcmFnRHJvcCA9ICgoKSA9PiB7XG5cbiAgICBmdW5jdGlvbiBpbml0KHBsYXllcikge1xuICAgICAgICByZXNldEV2ZW50cygpO1xuICAgICAgICBzZXREcmFnZ2FibGVBcmVhKCk7XG4gICAgICAgIGRyYWcocGxheWVyKTtcbiAgICAgICAgY2xpY2socGxheWVyKTtcbiAgICB9XG5cbiAgICAvLyByZXNldCBhbGwgZHJhZy9jbGljayBldmVudCBsaXN0ZW5lcnNcbiAgICBmdW5jdGlvbiByZXNldEV2ZW50cygpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmRyYWdzdGFydCA9ICgoZSkgPT4ge1xuICAgICAgICAgICAgfSkgXG4gICAgICAgICAgICBncmlkLm9uZHJhZ2VudGVyID0gKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSkgXG4gICAgICAgICAgICBncmlkLm9uZHJhZ2VuZCA9ICgoZSkgPT4ge1xuICAgICAgICAgICAgfSkgXG4gICAgICAgICAgICBncmlkLm9uZHJhZ292ZXIgPSAoKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgZ3JpZC5vbmNsaWNrID0gKChlKSA9PiB7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgLy8gUmVzZXQgYW5kIHNldCBhbGwgc2hpcHMgdG8gYmUgZHJhZ2dhYmxlIFxuICAgIGZ1bmN0aW9uIHNldERyYWdnYWJsZUFyZWEoKSB7XG4gICAgICAgIC8vIFJlc2V0IGRyYWdnYWJsZSBjb250ZW50XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIGZhbHNlKTtcbiAgICAgICAgICAgIGdyaWQuc3R5bGVbJ2N1cnNvciddID0gJ2F1dG8nO1xuICAgICAgICB9KVxuICAgICAgICAvLyBEcmFnZ2FibGUgY29udGVudCA9IGFueSBncmlkIHdpdGggc2hpcCBjbGFzc1xuICAgICAgICBsZXQgcGxheWVyU2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLnBsYXllci1zaGlwXCIpO1xuICAgICAgICBwbGF5ZXJTaGlwcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLnNldEF0dHJpYnV0ZShcImRyYWdnYWJsZVwiLCB0cnVlKTtcbiAgICAgICAgICAgIGdyaWQuc3R5bGVbJ2N1cnNvciddID0gJ3BvaW50ZXInO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIEhlbHBlciBib29sIC0gVmFsaWQgZHJvcHBhYmxlIHBsYWNlIGZvciBoZWFkIC0gaWdub3JlIGN1cnJlbnQgc2hpcCdzIHBvc2l0aW9uIHdoZW4gY2hlY2tpbmcgdmFsaWRpdHlcbiAgICBmdW5jdGlvbiBpc0Ryb3BwYWJsZShwbGF5ZXIsIHNoaXAsIGNvb3Jkcykge1xuICAgICAgICBsZXQgaXNWYWxpZCA9IHRydWU7XG4gICAgICAgIGNvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHsgXG4gICAgICAgICAgICBpZiAoKHBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSAhPSBudWxsICYmIHBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSAhPSBzaGlwKSB8fCBjb29yZHMubGVuZ3RoICE9IHNoaXAubGVuZ3RoIHx8IGlkeCA8IDAgfHwgaWR4ID4gOTkpIHtcbiAgICAgICAgICAgICAgICAvLyBCb3VuZHMgY2hlY2sgcGxhY2VtZW50IGlkeCBhbmQgaWYgbm90IGVtcHR5XG4gICAgICAgICAgICAgICAgaXNWYWxpZCA9IGZhbHNlOyBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgYW5kIHNldCBkcm9wcGFibGUgYXJlYXMgd2l0aCBjbGFzcyAnZ3JpZC1kcm9wcGFibGUnIFxuICAgIGZ1bmN0aW9uIHNldERyb3BwYWJsZUFyZWEocGxheWVyLCBzaGlwLCBheGlzLCBzaGlwT2Zmc2V0KSB7XG4gICAgICAgIC8vIFJlc2V0IGRyb3BwYWJsZSBncmlkcyB0byBoYXZlIGNsYXNzIFwiZ3JpZC1kcm9wcGFibGVcIlxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoJ2dyaWQtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3QgcGxheWVyR3JpZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKTtcbiAgICAgICAgLy8gVmFsaWQgY2hlY2sgaWYgaGVhZCBpcyBkcm9wcGVkIGluIGdyaWQgLSBcbiAgICAgICAgcGxheWVyR3JpZHMuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGVhZCA9IHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpO1xuICAgICAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgY2FzZSBcbiAgICAgICAgICAgICAgICAvLyBWYWxpZGF0aW9uIC0gaGVhZCBtdXN0IGhhdmUgZW1wdHkgbiBsZW5ndGggdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiB4ICsgaGVhZCAtIHNoaXBPZmZzZXQpOyAvLyBDb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZCArIEFjY291bnQgZm9yIG9mZnNldCBpbiBwb3RlbnRpYWwgY29vcmRzXG4gICAgICAgICAgICAgICAgaWYgKGNvb3Jkcy5ldmVyeSgoeCkgPT4gTWF0aC5mbG9vcih4LzEwKSA9PSBNYXRoLmZsb29yKGNvb3Jkc1swXS8xMCkpXG4gICAgICAgICAgICAgICAgICAgICYmIGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcCwgY29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAgVGhlbiB2YWxpZCAtIHNldCBkcm9wcGFibGVcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QuYWRkKCdncmlkLWRyb3BwYWJsZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBlbnRpcmUgc2hpcCBkcm9wcGFibGUgZ3JpZHNcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHAke2lkeH1gKS5jbGFzc0xpc3QuYWRkKCdzaGlwLWRyb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIFZlcnRpY2FsIGNhc2VcbiAgICAgICAgICAgICAgICAvLyBWYWxpZGF0aW9uIC0gaGVhZCBtdXN0IGhhdmUgZW1wdHkgbiBsZW5ndGggZ3JpZHMgYmVsb3cgd2l0aGluIGJvdW5kc1xuICAgICAgICAgICAgICAgIGxldCBjb29yZHMgPSBbLi4ubmV3IEFycmF5KHNoaXAubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4gaGVhZCArICgoeCAtIHNoaXBPZmZzZXQpICogMTApKTsgLy8gQ29vcmRzIGFycmF5IG9mIHZlcnRpY2FsIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgIGlmIChpc0Ryb3BwYWJsZShwbGF5ZXIsIHNoaXAsIGNvb3JkcykpIHtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QuYWRkKCdncmlkLWRyb3BwYWJsZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBlbnRpcmUgc2hpcCBkcm9wcGFibGUgZ3JpZHNcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHAke2lkeH1gKS5jbGFzc0xpc3QuYWRkKCdzaGlwLWRyb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmFnKHBsYXllcikge1xuICAgICAgICBsZXQgcGxheWVyU2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLnBsYXllci1zaGlwXCIpO1xuXG4gICAgICAgIHBsYXllclNoaXBzLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQub25kcmFnc3RhcnQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIERyYWdnaW5nIHNoaXAgLSBuZWVkIHRvIGV4dHJhY3QgU2hpcCBvYmplY3QgZnJvbSB0aGUgZ3JpZFxuICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBbLi4uZ3JpZC5jbGFzc0xpc3RdO1xuICAgICAgICAgICAgICAgIGxldCBzaGlwSWR4ID0gY2xhc3Nlcy5maW5kKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnN0YXJ0c1dpdGgoXCJzaGlwLVwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzaGlwSWR4ID0gc2hpcElkeC5zbGljZSg1KS0xO1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgY2xhc3MgYXNzb2NpYXRlZCB3aXRoIHNoaXAgKyB1c2UgYXMgaGFzaG1hcCB0byByZWZlcmVuY2UgZXhhY3Qgc2hpcCBvYmplY3QgdXNlZCBpbiBnYW1lYm9hcmRcbiAgICAgICAgICAgICAgICBjb25zdCBzaGlwT2JqID0gcGxheWVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4XS5zaGlwO1xuXG4gICAgICAgICAgICAgICAgLy8gR2V0IGdyaWQgcG9zaXRpb24gb2YgY3VycmVudCBkcmFnZ2VkIHNoaXAgLSBTb3J0IHNoaXAgY29vcmRzIGxvd2VzdCB0byBoaWdoZXN0XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzaGlwT2Zmc2V0ID0gcGxheWVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4XS5jb29yZHMuc29ydCgoYSxiKSA9PiBhID4gYikuZmluZEluZGV4KHggPT4geCA9PSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2hpcE9mZnNldCk7XG5cbiAgICAgICAgICAgICAgICBzZXREcm9wcGFibGVBcmVhKHBsYXllciwgc2hpcE9iaiwgc2hpcE9iai5heGlzLCBzaGlwT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBkcmFnRW50ZXIocGxheWVyLCBzaGlwT2JqLCBzaGlwT2JqLmF4aXMsIHNoaXBJZHgsIHNoaXBPZmZzZXQpO1xuICAgICAgICAgICAgICAgIGRyYWdFbmQocGxheWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG4gICAgLy8gRHJhZyBzaGlwIGVudGVycyBkcm9wcGFibGUgYXJlYSAtIG9mZmVyIHByZXZpZXcgb2YgaG93IHNoaXAgd291bGQgbG9vayBwbGFjZWRcbiAgICBmdW5jdGlvbiBkcmFnRW50ZXIocGxheWVyLCBzaGlwLCBheGlzLCBzaGlwSWR4LCBzaGlwT2Zmc2V0KSB7XG4gICAgICAgIGNvbnN0IGRyb3BwYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ3JpZC1kcm9wcGFibGVcIik7XG5cbiAgICAgICAgZHJvcHBhYmxlLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQub25kcmFnZW50ZXIgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBwcmV2aWV3IGdyaWRzXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0xYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTJgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtM2ApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC00YCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTVgKTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgLy8gR2V0IGhlYWQgdmFsdWUgXG4gICAgICAgICAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBIb3Jpem9udGFsIGNhc2UgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSAtIHNoaXBPZmZzZXQ7IC8vIFVwZGF0ZSBoZWFkIHZhbHVlIHRvIGJlIG9mZnNldHRlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldmlldyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiB4ICsgaGVhZCk7IC8vIFBvdGVudGlhbCBjb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3LmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwcmV2aWV3LXNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGRyYWdEcm9wKHBsYXllciwgc2hpcCwgc2hpcElkeCwgcHJldmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBWZXJ0aWNhbCBjYXNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSAtICgxMCAqIHNoaXBPZmZzZXQpOyAvLyBVcGRhdGUgaGVhZCB2YWx1ZSB0byBiZSBvZmZzZXR0ZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXZpZXcgPSBbLi4ubmV3IEFycmF5KHNoaXAubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4gaGVhZCArICh4ICogMTApKTsgLy8gQ29vcmRzIGFycmF5IG9mIHZlcnRpY2FsIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3LmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwcmV2aWV3LXNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGRyYWdEcm9wKHBsYXllciwgc2hpcCwgc2hpcElkeCwgcHJldmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIERyYWcgZW5kIC0gcmVnYXJkbGVzcyBvZiBzdWNjZXNzZnVsIGRyb3Agb3Igbm90XG4gICAgZnVuY3Rpb24gZHJhZ0VuZChwbGF5ZXIpIHtcbiAgICAgICAgbGV0IHBsYXllclNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5wbGF5ZXItc2hpcFwiKTtcblxuICAgICAgICBwbGF5ZXJTaGlwcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ2VuZCA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIC8vIFJlc2V0IHByZXZpZXcgZ3JpZHNcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBkcm9wcGFibGUgZ3JpZHMgdG8gaGF2ZSBjbGFzcyBcImdyaWQtZHJvcHBhYmxlXCJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTFgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtMmApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0zYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTRgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtNWApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLWRyb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGluaXQocGxheWVyKTsgLy8gQXQgZWFjaCBkcmFnLWVuZCByZXNldCBkcmFnZ2FibGUrZHJvcHBhYmxlIGNvbnRlbnQgYW5kIHJlc2V0IGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gRHJhZyBwbGFjZSBpbiB2YWxpZCBncmlkIC0gdGFyZ2V0IGFzIHBvdGVudGlhbCBjb29yZHMgYXQgZWFjaCBkcmFnIGVudGVyXG4gICAgZnVuY3Rpb24gZHJhZ0Ryb3AocGxheWVyLCBzaGlwLCBzaGlwSWR4LCBwb3RlbnRpYWxDb29yZHMpIHsgICAgICAgXG4gICAgICAgIC8vIENvb3JkcyB0byBiZSBzaGlwLWRyb3BwYWJsZSBhcmVhIFxuICAgICAgICBwb3RlbnRpYWxDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgaGVhZCBvZiBwbGFjZW1lbnQgLSBhbHdheXMgbWluaW11bSB2YWx1ZSBvZiBjb29yZHNcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwJHtpZHh9YCkub25kcm9wID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDb29yZHMgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3JkcztcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZ2FtZWJvYXJkIHNoaXBzW10gYXJyYXkgYW5kIGdyaWRzW10gYXJyYXlcbiAgICAgICAgICAgICAgICByZXBsYWNlU2hpcChwbGF5ZXIsIHNoaXBJZHgsIG9sZENvb3JkcywgcG90ZW50aWFsQ29vcmRzLCBzaGlwLmF4aXMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlcGxhY2VTaGlwKHBsYXllciwgc2hpcElkeCwgb2xkQ29vcmRzLCBuZXdDb29yZHMsIG5ld0F4aXMpIHtcbiAgICAgICAgLy8gU3RvcmFnZSBjaGFuZ2VzXG4gICAgICAgIC8vIFVwZGF0ZSBnYW1lYm9hcmQgZ3JpZHNbXVxuICAgICAgICBvbGRDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gPSBudWxsO1xuICAgICAgICB9KVxuICAgICAgICBuZXdDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLnNoaXA7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIENoYW5nZSBjb29yZHMgaW4gZ2FtZWJvYXJkIHNoaXBzW10gb2JqZWN0XG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uY29vcmRzID0gbmV3Q29vcmRzO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBheGlzXG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcC5heGlzID0gbmV3QXhpcztcblxuICAgICAgICAvLyBGcm9udC1FbmQgY2hhbmdlc1xuICAgICAgICBVSS51cGRhdGVQbGFjZWRTaGlwcyhvbGRDb29yZHMsIG5ld0Nvb3Jkcywgc2hpcElkeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpY2socGxheWVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWRcIik7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGV4dHJhY3Qgc2hpcElkeCBmcm9tIGdyaWRcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gWy4uLmdyaWQuY2xhc3NMaXN0XTtcbiAgICAgICAgICAgICAgICBsZXQgc2hpcElkeCA9IGNsYXNzZXMuZmluZCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zdGFydHNXaXRoKFwic2hpcC1cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2hpcElkeCA9IHNoaXBJZHguc2xpY2UoNSktMTtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIGNsYXNzIGFzc29jaWF0ZWQgd2l0aCBzaGlwICsgdXNlIGFzIGhhc2htYXAgdG8gcmVmZXJlbmNlIGV4YWN0IHNoaXAgb2JqZWN0IHVzZWQgaW4gZ2FtZWJvYXJkXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hpcE9iaiA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcDtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDb29yZHMgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3JkcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkID0gTWF0aC5taW4oLi4ub2xkQ29vcmRzKTtcblxuICAgICAgICAgICAgICAgIC8vIEF0dGVtcHQgcm90YXRpb25cbiAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5heGlzID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCAtLT4gVmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0Nvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcE9iai5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiBoZWFkICsgKHggKiAxMCkpOyAvLyBDb29yZHMgYXJyYXkgb2YgdmVydGljYWwgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEcm9wcGFibGUocGxheWVyLCBzaGlwT2JqLCBuZXdDb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBkcm9wcGFibGUgLSB0aGVuIHJvdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFrZShvbGRDb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNoaXBPYmouYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcnRpY2FsIC0tPiBIb3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdDb29yZHMgPSBbLi4ubmV3IEFycmF5KHNoaXBPYmoubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4geCArIGhlYWQpOyAvLyBDb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q29vcmRzLmV2ZXJ5KCh4KSA9PiBNYXRoLmZsb29yKHgvMTApID09IE1hdGguZmxvb3IobmV3Q29vcmRzWzBdLzEwKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcE9iaiwgbmV3Q29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgMCk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdChwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hha2Uob2xkQ29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiAtIGFuaW1hdGUgY29vcmRzIHVzaW5nIGtleWZyYW1lcyBvYmplY3RcbiAgICBmdW5jdGlvbiBzaGFrZShjb29yZHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzaGFrZVwiKTsgIFxuICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGdyaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApO1xuICAgICAgICAgICAgZ3JpZC5hbmltYXRlKFtcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoMnB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoNHB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoNHB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoMnB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApXCJ9XG4gICAgICAgICAgICBdLCA1MDApO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlcm1pbmF0ZSgpIHtcbiAgICAgICAgcmVzZXRFdmVudHMoKTtcbiAgICAgICAgLy8gUmVzZXQgZHJhZ2dhYmxlIGNvbnRlbnRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgZmFsc2UpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAnYXV0byc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQsXG4gICAgICAgIHRlcm1pbmF0ZVxuICAgIH1cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IERyYWdEcm9wOyIsImNvbnN0IFNjb3JlQm9hcmQgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0aW5nXCIpXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NvcmVib2FyZFwiKS5mb3JFYWNoKChzY29yZWJvYXJkKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2NvcmVib2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ3AnKSkge1xuICAgICAgICAgICAgICAgIC8vIFBsYXllcidzIHNjb3JlYm9hcmRcbiAgICAgICAgICAgICAgICBbLi4uc2NvcmVib2FyZC5jaGlsZHJlbl0uZm9yRWFjaCgoc2NvcmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlIHNjb3JlIGRpdiBJRCBhcyBoYXNoY29kZSB0byBnYXRoZXIgZGF0YVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaGlwSWR4ID0gc2NvcmUuaWQuc2xpY2UoLTEpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKFwiYm94XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm94LmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtzaGlwSWR4fWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUuYXBwZW5kQ2hpbGQoYm94KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDb21wdXRlciBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHNjb3JlLmlkLnNsaWNlKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wdXRlci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKFwiYm94XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm94LmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtzaGlwSWR4fWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUuYXBwZW5kQ2hpbGQoYm94KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NvcmVib2FyZFwiKS5mb3JFYWNoKChzY29yZWJvYXJkKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2NvcmVib2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ3AnKSkge1xuICAgICAgICAgICAgICAgIC8vIFBsYXllciBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHBhcnNlSW50KHNjb3JlLmlkLnRvU3RyaW5nKCkuc2xpY2UoLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmlzU3Vuaykgc2NvcmUuY2xhc3NMaXN0LmFkZChcInNjb3JlLXN1bmtcIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgIHtcbiAgICAgICAgICAgICAgICAvLyBDb21wdXRlciBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHBhcnNlSW50KHNjb3JlLmlkLnRvU3RyaW5nKCkuc2xpY2UoLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXB1dGVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4LTFdLnNoaXAuaXNTdW5rKSBzY29yZS5jbGFzc0xpc3QuYWRkKFwic2NvcmUtc3Vua1wiKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0ZVNjb3JlYm9hcmQsXG4gICAgICAgIHVwZGF0ZVNjb3JlYm9hcmRcbiAgICB9XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBTY29yZUJvYXJkO1xuXG4iLCJpbXBvcnQgU2hpcCBmcm9tIFwiLi4vZmFjdG9yaWVzL3NoaXBcIjtcbmltcG9ydCBQbGF5ZXIgZnJvbSBcIi4uL2ZhY3Rvcmllcy9wbGF5ZXJcIjtcbmltcG9ydCBEcmFnRHJvcCBmcm9tIFwiLi9kcmFnRHJvcFwiO1xuaW1wb3J0IEJhdHRsZXNoaXBBSSBmcm9tIFwiLi9iYXR0bGVzaGlwQUlcIjtcbmltcG9ydCBTY29yZUJvYXJkIGZyb20gXCIuL3Njb3JlYm9hcmRcIjtcblxuY29uc3QgVUkgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGRpc3BsYXlHcmlkcygpIHtcbiAgICAgICAgbGV0IGdhbWVib2FyZFAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpO1xuICAgICAgICBnYW1lYm9hcmRQLmlubmVySFRNTCA9IFwiXCI7IC8vIENsZWFyIGV4aXN0aW5nXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWRVbml0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBncmlkVW5pdC5jbGFzc0xpc3QuYWRkKCdncmlkLXVuaXQnKTtcbiAgICAgICAgICAgIGdyaWRVbml0LmlkID0gYHAke2l9YDsgLy8gYXNzaWduIGVhY2ggYW4gaWQgZnJvbSAwIHRvIG4qbi0xXG4gICAgXG4gICAgICAgICAgICBncmlkVW5pdC5zdHlsZS53aWR0aCA9IGBjYWxjKDEwJSAtIDNweClgO1xuICAgICAgICAgICAgZ3JpZFVuaXQuc3R5bGUuaGVpZ2h0ID0gYGNhbGMoMTAlIC0gM3B4KWA7XG4gICAgXG4gICAgICAgICAgICBnYW1lYm9hcmRQLmFwcGVuZENoaWxkKGdyaWRVbml0KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgZ2FtZWJvYXJkQyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIik7XG4gICAgICAgIGdhbWVib2FyZEMuaW5uZXJIVE1MID0gXCJcIjsgLy8gQ2xlYXIgZXhpc3RpbmdcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZFVuaXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGdyaWRVbml0LmNsYXNzTGlzdC5hZGQoJ2dyaWQtdW5pdCcpO1xuICAgICAgICAgICAgZ3JpZFVuaXQuaWQgPSBgYyR7aX1gOyAvLyBhc3NpZ24gZWFjaCBhbiBpZCBmcm9tIDAgdG8gbipuLTFcbiAgICBcbiAgICAgICAgICAgIGdyaWRVbml0LnN0eWxlLndpZHRoID0gYGNhbGMoMTAlIC0gM3B4KWA7XG4gICAgICAgICAgICBncmlkVW5pdC5zdHlsZS5oZWlnaHQgPSBgY2FsYygxMCUgLSAzcHgpYDtcbiAgICBcbiAgICAgICAgICAgIGdhbWVib2FyZEMuYXBwZW5kQ2hpbGQoZ3JpZFVuaXQpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRHYW1lKCkge1xuICAgICAgICAvLyBET00gZm9yIHByZXAgc3RhZ2VcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKS5zdHlsZVsnZGlzcGxheSddID0gJ2ZsZXgnXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdGFydFwiKS5zdHlsZVsnZGlzcGxheSddID0gJ25vbmUnXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGVhZGVyLWhlbHBlclwiKS50ZXh0Q29udGVudCA9IFwiTW92ZS9Sb3RhdGUgU2hpcHNcIjtcblxuICAgICAgICAvLyBTZXQgZGlzcGxheSBmb3IgcGxheWVyIHRvIG1vdmUvcm90YXRlIHNoaXBzIC0+IHNob3cgcGxheWVyIGdyaWQsIGxvY2sgY29tcHV0ZXIgZ3JpZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrZWRcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcblxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllcjtcbiAgICAgICAgbGV0IGNvbXB1dGVyID0gbmV3IFBsYXllcjtcblxuICAgICAgICAvLyBDcmVhdGUgRE9NIGdyaWRzIGFuZCBkaXNwbGF5IFxuICAgICAgICBkaXNwbGF5R3JpZHMoKTtcblxuICAgICAgICAvLyBQbGFjZSBwbGF5ZXIgKyBjb21wdXRlciBzaGlwcyByYW5kb21seVxuICAgICAgICBwbGFjZVJhbmRvbVNoaXBzKHBsYXllcik7XG4gICAgICAgIHBsYWNlUmFuZG9tU2hpcHMoY29tcHV0ZXIpO1xuICAgICAgICBpbml0RGlzcGxheVNoaXBzKHBsYXllcixjb21wdXRlcik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIERPTSBzY29yZWJvYXJkXG4gICAgICAgIFNjb3JlQm9hcmQuY3JlYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKTtcblxuICAgICAgICAvLyBBbGxvdyBwbGF5ZXIgdG8gbW92ZS9yb3RhdGUgc2hpcCBsb2NhdGlvbnNcbiAgICAgICAgcGxheWVyU2hpcFNlbGVjdChwbGF5ZXIpO1xuXG4gICAgICAgIC8vIFN0YXJ0IC0gU2hpcHMgc2VsZWN0ZWRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKS5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgIC8vIERPTSBmb3IgYmF0dGxlXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnbm9uZSc7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIikuc3R5bGVbJ2Rpc3BsYXknXSA9ICdmbGV4JztcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGVhZGVyLWhlbHBlclwiKS50ZXh0Q29udGVudCA9IFwiQmVnaW4gdGhlIGJhdHRsZVwiO1xuICAgICAgICAgICAgLy8gU2V0IGRpc3BsYXkgdG8gUGxheWVyIEF0dGFjayAtPiBsb2NrIHBsYXllciBncmlkLCBzaG93IGNvbXB1dGVyIGdyaWQgZm9yIHBsYXllciBhdHRhY2tcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LnJlbW92ZShcImxvY2tlZFwiKTtcblxuICAgICAgICAgICAgRHJhZ0Ryb3AudGVybWluYXRlKCk7IC8vIFRlcm1pbmF0ZSBncmlkIGV2ZW50c1xuICAgICAgICAgICAgZ2FtZUxvZ2ljKHBsYXllciwgY29tcHV0ZXIpOyAgXG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXN0YXJ0IGJ1dHRvbiBvbmNlIGdhbWUgYmVnaW5zXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdGFydFwiKS5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgIGluaXRHYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ZXJTaGlwU2VsZWN0KHBsYXllcikge1xuICAgICAgICBEcmFnRHJvcC5pbml0KHBsYXllcik7XG4gICAgfVxuXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIC0gUmV0dXJuIGFycmF5IG9mIHJhbmRvbSBjb29yZGluYXRlIHBsYWNlbWVudCBiYXNlZCBvbiBzaGlwJ3MgbGVuZ3RoXG4gICAgZnVuY3Rpb24gcmFuZG9tQ29vcmRpbmF0ZXMoc2hpcCkge1xuICAgICAgICBsZXQgcG9zID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKTtcbiAgICAgICAgbGV0IGF4aXMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCApKiAyKSAvLyAwIGlzIGhvcml6YW50YWwsIDEgaXMgdmVydGljYWxcbiAgICAgICAgbGV0IGNvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV07IC8vIFN0YXJ0IHdpdGggY29vcmQgYXJyYXkgb2YgWzAuLi5uXVxuICAgICAgICBpZiAoYXhpcyA9PSAwKSB7XG4gICAgICAgICAgICAvLyBIb3Jpem9udGFsXG4gICAgICAgICAgICBjb29yZHMgPSBjb29yZHMubWFwKCh4KSA9PiB4ICsgcG9zKTtcbiAgICAgICAgICAgIC8vIEVycm9yIGNoZWNrICsgQ3ljbGUgdW50aWwgdmFsaWQgLSBtdXN0IGFsbCBoYXZlIHNhbWUgeC8vMTAgdmFsdWUgdG8gYmUgaW4gc2FtZSB5LWF4aXNcbiAgICAgICAgICAgIHdoaWxlICghY29vcmRzLmV2ZXJ5KCh4KSA9PiBNYXRoLmZsb29yKHgvMTApID09IE1hdGguZmxvb3IoY29vcmRzWzBdLzEwKSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKTtcbiAgICAgICAgICAgICAgICBjb29yZHMgPSBjb29yZHMubWFwKCh4KSA9PiB4ICsgcG9zKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvcml6b250YWwgemlnemFnIC0gQ3ljbGluZ1wiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGF4aXMgPT0gMSkge1xuICAgICAgICAgICAgLy8gVmVydGljYWwgLSBtdXN0IGFsbCBoYXZlIHNhbWUgeCUxMCB2YWx1ZSB0byBiZSBpbiBzYW1lIHgtYXhpc1xuICAgICAgICAgICAgY29vcmRzID0gY29vcmRzLm1hcCgoeCkgPT4gcG9zICsgKDEwICogeCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7YXJyYXk6IGNvb3JkcywgYXhpc307XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxhY2VSYW5kb21TaGlwcyhwbGF5ZXIpIHtcbiAgICAgICAgbGV0IGZsZWV0ID0gW25ldyBTaGlwKDIpLCBuZXcgU2hpcCgzKSwgbmV3IFNoaXAoMyksIG5ldyBTaGlwKDQpLCBuZXcgU2hpcCg1KV07XG5cbiAgICAgICAgZmxlZXQuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICAgICAgbGV0IGNvb3JkcyA9IHJhbmRvbUNvb3JkaW5hdGVzKHNoaXApO1xuICAgICAgICAgICAgLy8gRXJyb3IgY2hlY2sgY3ljbGUgdW50aWwgdmFsaWQgLSB0aGVuIHBsYWNlXG4gICAgICAgICAgICB3aGlsZSAoIXBsYXllci5nYW1lYm9hcmQuaXNWYWxpZFBsYWNlbWVudChzaGlwLCBjb29yZHMuYXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgY29vcmRzID0gcmFuZG9tQ29vcmRpbmF0ZXMoc2hpcCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbnZhbGlkIHJhbmRvbWl6YXRpb24gLSBDeWNsaW5nXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnBsYWNlU2hpcChzaGlwLCBjb29yZHMuYXJyYXkpO1xuICAgICAgICAgICAgc2hpcC5zZXRBeGlzKGNvb3Jkcy5heGlzKTtcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2cocGxheWVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0RGlzcGxheVNoaXBzKHBsYXllciwgY29tcHV0ZXIpIHtcbiAgICAgICAgLy8gTWFyayBlYWNoIHNoaXAgd2l0aCBjbGFzcyB0byBkaXN0aW5ndWlzaFxuICAgICAgICBsZXQgaSA9IDE7XG4gICAgICAgIGxldCBqID0gMTtcbiAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICBzaGlwT2JqLmNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7aX1gKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChcInBsYXllci1zaGlwXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBNYXJrIGVhY2ggc2hpcCB3aXRoIGNsYXNzIHRvIGRpc3Rpbmd1aXNoXG4gICAgICAgIGNvbXB1dGVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICBzaGlwT2JqLmNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7an1gKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtaGlkZGVuXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVQbGFjZWRTaGlwcyhvbGRDb29yZHMsIG5ld0Nvb3Jkcywgc2hpcElkeCkge1xuICAgICAgICAvLyBSZXBsYWNlIGNsYXNzZXMgYHNoaXAtJHtzaGlwSWR4fWAgKyAncGxheWVyLXNoaXAnXG4gICAgICAgIG9sZENvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LnJlbW92ZShgc2hpcC0ke3NoaXBJZHgrMX1gKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LnJlbW92ZShgcGxheWVyLXNoaXBgKTtcbiAgICAgICAgfSlcbiAgICAgICAgbmV3Q29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7c2hpcElkeCsxfWApO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwbGF5ZXItc2hpcGApO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUdyaWRzKHBsYXllciwgY29tcHV0ZXIpIHtcbiAgICAgICAgLy8gVXBkYXRlIHBsYXllciBncmlkc1xuICAgICAgICBsZXQgcGxheWVyQXR0YWNrcyA9IHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcztcbiAgICAgICAgcGxheWVyQXR0YWNrcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0pIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLWZvdW5kXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtpZHh9YCkuaW5uZXJIVE1MID0gXCImIzEwMDA1O1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1taXNzZWRcIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2lkeH1gKS5pbm5lckhUTUwgPSBcIiYjeDIwMjI7XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gVXBkYXRlIGNvbXB1dGVyIGdyaWRzXG4gICAgICAgIGxldCBjb21wQXR0YWNrcyA9IGNvbXB1dGVyLmdhbWVib2FyZC5hdHRhY2tzO1xuICAgICAgICBjb21wQXR0YWNrcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIGlmIChjb21wdXRlci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNjJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtZm91bmRcIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI2Mke2lkeH1gKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ3JpZC1oaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2lkeH1gKS5pbm5lckhUTUwgPSBcIiYjMTAwMDU7XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjYyR7aWR4fWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLW1pc3NlZFwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7aWR4fWApLmlubmVySFRNTCA9IFwiJiN4MjAyMjtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTaGlwcyhwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgc2hpcE9iai5jb29yZHMuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5zaGlwLmlzU3Vuaykge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtc3Vua1wiKTtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2Nvb3JkfWApLmNsYXNzTGlzdC5yZW1vdmUoXCJncmlkLWZvdW5kXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChjb21wdXRlcikge1xuICAgICAgICAgICAgY29tcHV0ZXIuZ2FtZWJvYXJkLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgICAgICBzaGlwT2JqLmNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5zaGlwLmlzU3Vuaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLXN1bmtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7Y29vcmR9YCkuY2xhc3NMaXN0LnJlbW92ZShcImdyaWQtZm91bmRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdhbWVMb2dpYyhwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIGNvbnN0IGdyaWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQuYyA+IC5ncmlkLXVuaXRcIik7XG4gICAgICAgIGdyaWRzLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQub25jbGljayA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wdXRlci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheVJvdW5kKHBsYXllciwgY29tcHV0ZXIsIHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGFzeW5jIGZ1bmN0aW9uIHBsYXlSb3VuZChwbGF5ZXIsIGNvbXB1dGVyLCBpbnB1dCkge1xuICAgICAgICAvLyBBVFAgZ290IGlucHV0IC0+IHNob3cgcGxheWVyIGdyaWQgZm9yIEFJIGF0dGFjaywgbG9jayBjb21wdXRlciBncmlkXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIikuY2xhc3NMaXN0LnJlbW92ZShcImxvY2tlZFwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKS5jbGFzc0xpc3QuYWRkKFwibG9ja2VkXCIpO1xuXG4gICAgICAgIC8vIEhhbmRsZSBwbGF5ZXIncyBpbnB1dCAtPiBVcGRhdGUgR3JpZCBEaXNwbGF5IC0+IENoZWNrIGlmIHdpbm5lclxuICAgICAgICBwbGF5ZXJBdHRhY2soY29tcHV0ZXIsIGlucHV0KTtcbiAgICAgICAgdXBkYXRlR3JpZHMocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIHVwZGF0ZVNoaXBzKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICBTY29yZUJvYXJkLnVwZGF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIGlmIChjb21wdXRlci5nYW1lYm9hcmQuaXNHYW1lT3ZlcigpKSBnYW1lT3ZlcihcIlBsYXllclwiLCBwbGF5ZXIpO1xuXG4gICAgICAgIC8vIENvbXB1dGVyIEF0dGFjayAtPiBVcGRhdGUgR3JpZCBEaXNwbGF5IC0+IENoZWNrIGlmIHdpbm5lclxuICAgICAgICBhd2FpdCBkZWxheSg1MDApO1xuXG4gICAgICAgIEJhdHRsZXNoaXBBSS5BSUF0dGFjayhwbGF5ZXIpO1xuICAgICAgICB1cGRhdGVHcmlkcyhwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgdXBkYXRlU2hpcHMocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIFNjb3JlQm9hcmQudXBkYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuaXNHYW1lT3ZlcigpKSBnYW1lT3ZlcihcIkNvbXB1dGVyXCIsIGNvbXB1dGVyKTs7IC8vVE9ETyAtIEhhbmRsZSBnYW1lIG92ZXJcblxuICAgICAgICAvLyBSZXZlcnQgZGlzcGxheSB0byBQbGF5ZXIgQXR0YWNrIC0+IGxvY2sgcGxheWVyIGdyaWQsIHNob3cgY29tcHV0ZXIgZ3JpZCBmb3IgcGxheWVyIGF0dGFja1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LnJlbW92ZShcImxvY2tlZFwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGF5ZXJBdHRhY2soY29tcHV0ZXIsIGlucHV0KSB7XG4gICAgICAgIGlmICghY29tcHV0ZXIuZ2FtZWJvYXJkLmF0dGFja3MuaW5jbHVkZXMoaW5wdXQpKSB7XG4gICAgICAgICAgICBjb21wdXRlci5nYW1lYm9hcmQucmVjZWl2ZUF0dGFjayhpbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGVsYXlcbiAgICBmdW5jdGlvbiBkZWxheShtcykgeyAgICBcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dChyZXMsIG1zKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBJZiBnYW1lb3ZlciwgcG9wIG1vZGFsIGFuZCBzaG93IHdpbm5lciB1bnRpbCByZXN0YXJ0XG4gICAgYXN5bmMgZnVuY3Rpb24gZ2FtZU92ZXIod2lubmVyVGV4dCkge1xuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJlc3VsdFwiKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmVzdWx0LXRleHRcIik7XG4gICAgICAgIGNvbnN0IHJlc3RhcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXktYWdpblwiKTtcblxuICAgICAgICAvLyBUT0RPIC0gY3JlYXRlIGdhbWUgb3ZlciBzdHlsaW5nIHRyYW5zaXRpb24gaW4gd2lubmluZyBwbGF5ZXIgZ3JpZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG4gICAgICAgIGF3YWl0IGRlbGF5KDEwMDApO1xuXG4gICAgICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoXCJyZXN1bHQtZGlzcGxheWVkXCIpO1xuICAgICAgICB0ZXh0LnRleHRDb250ZW50ID0gYCR7d2lubmVyVGV4dH0gd2lucyFgXG5cbiAgICAgICAgcmVzdGFydC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzdGFydCBnYW1lXG4gICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKFwicmVzdWx0LWRpc3BsYXllZFwiKTtcbiAgICAgICAgICAgIGluaXRHYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBkaXNwbGF5R3JpZHMsXG4gICAgICAgIGluaXRHYW1lLFxuICAgICAgICB1cGRhdGVQbGFjZWRTaGlwc1xuICAgIH1cblxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgVUk7IiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiQGltcG9ydCB1cmwoaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1BcnNlbmFsK1NDOml0YWwsd2dodEAwLDQwMDswLDcwMDsxLDQwMDsxLDcwMCZkaXNwbGF5PXN3YXApO1wiXSk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYC8qIEZvbnQgKyBtZXRhICovXG5cbmltZyB7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xufVxuXG5ib2R5IHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgbWFyZ2luOiAwO1xuXG4gICAgZm9udC1mYW1pbHk6IFwiQXJzZW5hbCBTQ1wiLCBzYW5zLXNlcmlmO1xuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xufVxuXG4vKiBIZWFkZXIgKi9cbi5oZWFkZXIge1xuICAgIGhlaWdodDogMTMwcHg7XG4gICAgXG4gICAgZm9udC1zaXplOiA0MnB4O1xuICAgIG1hcmdpbi10b3A6IDE1cHg7XG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmhlYWRlci1kZXNjIHtcbiAgICBmb250LXNpemU6IDE2cHg7XG4gICAgZm9udC1zdHlsZTogaXRhbGljO1xufVxuLyogU3RhcnQvcmVzdGFydCBidXR0b24gKi9cbi8qIENTUyAqL1xuLmhlYWQtYnRuIHtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcbiAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgY29sb3I6ICMwMDA7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgZGlzcGxheTogZmxleDtcbiAgZmlsbDogIzAwMDtcbiAgZm9udC1mYW1pbHk6IFwiQXJzZW5hbCBTQ1wiLCBzYW5zLXNlcmlmO1xuICBmb250LXNpemU6IDE4cHg7XG4gIGZvbnQtd2VpZ2h0OiA0MDA7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBsZXR0ZXItc3BhY2luZzogLS44cHg7XG4gIGxpbmUtaGVpZ2h0OiAyNHB4O1xuICBtaW4td2lkdGg6IDE0MHB4O1xuICBvdXRsaW5lOiAwO1xuICBwYWRkaW5nOiA4cHggMTBweDtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIHRyYW5zaXRpb246IGFsbCAuM3M7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcblxuICBtYXJnaW4tdG9wOiAxNXB4O1xufVxuXG4uaGVhZC1idG46Zm9jdXMge1xuICBjb2xvcjogIzE3MWUyOTtcbn1cblxuLmhlYWQtYnRuOmhvdmVyIHtcbiAgYm9yZGVyLWNvbG9yOiAjMDZmO1xuICBjb2xvcjogIzA2ZjtcbiAgZmlsbDogIzA2Zjtcbn1cblxuLmhlYWQtYnRuOmFjdGl2ZSB7XG4gIGJvcmRlci1jb2xvcjogIzA2ZjtcbiAgY29sb3I6ICMwNmY7XG4gIGZpbGw6ICMwNmY7XG59XG5cbi5tYWluIHtcbiAgICBmbGV4OiAxO1xuXG4gICAgZGlzcGxheTogZmxleDtcblxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5wbGF5ZXIsIC5jb21wdXRlciB7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHdpZHRoOiA0NiU7XG5cbiAgICBwYWRkaW5nLWJvdHRvbTogMTAwcHg7XG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uZ2FtZWJvYXJkLWxhYmVsIHtcbiAgICBtYXJnaW46IDE1cHg7XG59XG5cbi8qIEdhbWVib2FyZCBzdHlsaW5nICovXG4uZ2FtZWJvYXJkIHtcbiAgICBoZWlnaHQ6IDQyMHB4O1xuICAgIHdpZHRoOiA0MjBweDtcblxuICAgIC8qIG91dGxpbmU6IDFweCBzb2xpZCBibGFjazsgKi9cblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC13cmFwOiB3cmFwO1xufVxuXG4ubG9ja2VkLFxuLmdhbWVib2FyZC1sYWJlbDpoYXMoKyAubG9ja2VkKSB7XG4gICAgb3BhY2l0eTogMC40O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuXG4vKiBHcmlkLXVuaXRzIHN0eWxpbmcgLSBhbGwgc3RhdGVzICovXG4vKiBFbXB0eSBHcmlkIC0gZGVmYXVsdCAqL1xuLmdyaWQtdW5pdCB7XG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHg7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBtYXJnaW46IDEuNXB4OyAvKiBjb3VwbGVkIHdpdGggVUkuZGlzcGxheUdyaWRzKCkqL1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uZ2FtZWJvYXJkLmMge1xuICAgIGN1cnNvcjogY3Jvc3NoYWlyO1xufVxuXG4uZ3JpZC1taXNzZWQge1xuICAgIGZvbnQtc2l6ZTogMjRweDtcbiAgICBvdXRsaW5lOiByZ2IoMjIwLDM2LDMxKSBzb2xpZCAwLjVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIyMCwzNiwzMSwgMC4zKTtcbn1cblxuLyogUHJpb3JpdHkgU3RhdGUgU3R5bGluZyAtPiBBbnkgMyBvZiB0aGVzZSB3aWxsIG5vdCBiZSBtdXR1YWxseSBhcHBsaWVkIGF0IGFueSBwb2ludCovXG4uZ3JpZC1oaWRkZW4ge1xuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGUgIWltcG9ydGFudDsgICAgXG59XG5cbi5ncmlkLWZvdW5kIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgb3V0bGluZTogcmdiKDIzLDE1OSwxMDIpIHNvbGlkIDAuNXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMywxNTksMTAyLCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5ncmlkLXN1bmsge1xuICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig5MiwgMTU4LCAxNzMsIDAuMSkgIWltcG9ydGFudDtcbn1cblxuLyogR3JpZC1zaGlwIGluZGl2aWR1YWwgc3R5bGluZyovXG4uc2hpcC0xIHtcbiAgICBvdXRsaW5lOiByZ2IoMCwyMCwyNTUpIHNvbGlkIDFweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMjAsMjU1LCAwLjMpO1xufVxuXG4uc2hpcC0yIHtcbiAgICBvdXRsaW5lOiByZ2IoMjAsNTAsMjU1KSBzb2xpZCAxcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMCw1MCwyNTUsIDAuMyk7XG59XG5cbi5zaGlwLTMge1xuICAgIG91dGxpbmU6IHJnYig1MSwxMDIsMjU1KSBzb2xpZCAxcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwxMDIsMjU1LCAwLjMpO1xufVxuXG4uc2hpcC00IHtcbiAgICBvdXRsaW5lOiByZ2IoODUsMTM2LDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoODUsMTM2LDI1NSwgMC4zKTtcbn1cblxuLnNoaXAtNSB7XG4gICAgb3V0bGluZTogcmdiKDExOSwxNzAsMjU1KSBzb2xpZCAxcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMTksMTcwLDI1NSwgMC4zKTtcbn1cblxuLyogRHJhZyBkcm9wIHByZXZpZXcgc3R5bGluZyBmb3IgZWFjaCBzaGlwKi9cbi5wcmV2aWV3LXNoaXAtMSB7XG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMjAsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5wcmV2aWV3LXNoaXAtMiB7XG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMCw1MCwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnByZXZpZXctc2hpcC0zIHtcbiAgICBvdXRsaW5lOiByZ2IoNTEsMTAyLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwxMDIsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5wcmV2aWV3LXNoaXAtNCB7XG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoODUsMTM2LDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4ucHJldmlldy1zaGlwLTUge1xuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMTksMTcwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4uc2hpcC1kcm9wcGFibGUge1xuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMxLDI0NSwyNDQsMC42KTtcbn1cblxuLyogU2NvcmVib2FyZCBTdHlsaW5nICovXG5cbi5zY29yZWJvYXJkLWxhYmVsIHtcbiAgICBtYXJnaW4tdG9wOiAyMHB4O1xuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XG59XG5cbi5zY29yZWJvYXJkIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuXG4gICAgZ2FwOiAxMHB4O1xufVxuXG4uc2NvcmVib2FyZCA+IGRpdiB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBnYXA6IDFweDtcbn1cblxuLnNjb3JlYm9hcmQgPiBkaXYuc2NvcmUtc3VuayB7XG4gICAgZGlzcGxheTogbm9uZTtcbn1cblxuLmJveCB7XG4gICAgb3V0bGluZTogMHB4ICFpbXBvcnRhbnQ7XG4gICAgd2lkdGg6IDE1cHg7XG4gICAgaGVpZ2h0OiAxNXB4O1xufVxuXG5cbi8qIHJlc3VsdHMgbW9kYWwgc3R5bGluZyAqL1xuZGlhbG9nOjpiYWNrZHJvcCB7XG4gICAgb3BhY2l0eTogMC45O1xufVxuXG4ucmVzdWx0IHtcbiAgICB3aWR0aDogNDAlO1xuICAgIGhlaWdodDogNDB2aDtcblxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xufVxuXG4vKiByZXN1bHQgbW9kYWwgZmxleCB0byBiZSBydW4gb25seSB3aGVuIGRpc3BsYXllZCAqL1xuLnJlc3VsdC1kaXNwbGF5ZWQge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcblxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5yZXN1bHQtdGV4dCB7XG4gICAgbWFyZ2luLWJvdHRvbTogMzBweDtcbiAgICBmb250LXNpemU6IDQycHg7XG59XG5cbiNwbGF5LWFnYWluIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjtcbiAgYm9yZGVyOiAxcHggc29saWQgIzIyMjIyMjtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgY29sb3I6ICMyMjIyMjI7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICBmb250LWZhbWlseTogJ0Fyc2VuYWwgU0MnLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFJvYm90byxcIkhlbHZldGljYSBOZXVlXCIsc2Fucy1zZXJpZjtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBmb250LXdlaWdodDogNjAwO1xuICBsaW5lLWhlaWdodDogMjBweDtcbiAgbWFyZ2luOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBwYWRkaW5nOiAxM3B4IDIzcHg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uO1xuICB0cmFuc2l0aW9uOiBib3gtc2hhZG93IC4ycywtbXMtdHJhbnNmb3JtIC4xcywtd2Via2l0LXRyYW5zZm9ybSAuMXMsdHJhbnNmb3JtIC4xcztcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG4gIHdpZHRoOiBhdXRvO1xufVxuXG4jcGxheS1hZ2FpbjphY3RpdmUge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRjdGN0Y3O1xuICBib3JkZXItY29sb3I6ICMwMDAwMDA7XG4gIHRyYW5zZm9ybTogc2NhbGUoLjk2KTtcbn1cblxuI3BsYXktYWdhaW46ZGlzYWJsZWQge1xuICBib3JkZXItY29sb3I6ICNEREREREQ7XG4gIGNvbG9yOiAjREREREREO1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICBvcGFjaXR5OiAxO1xufVxuXG4uZm9vdGVyIHtcbiAgICBmb250LWZhbWlseTogXCJBcnNlbmFsIFNDXCIsIHNhbnMtc2VyaWY7XG5cbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcbiAgICBjb2xvcjogYmxhY2s7XG4gICAgaGVpZ2h0OiAxMDBweDtcblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcblxuICAgIGZvbnQtc2l6ZTogMTZweDtcbn1cblxuLmdpdGh1Yi1sb2dvIHtcbiAgICBtYXJnaW4tbGVmdDogMTBweDtcbiAgICB3aWR0aDogMjRweDtcbiAgICBoZWlnaHQ6IDI0cHg7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uZ2l0aHViLWEgaW1ne1xuICAgIG9wYWNpdHk6IDAuNTtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMzAwbXM7XG59XG5cbi5naXRodWItYSBpbWc6aG92ZXIge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKSBzY2FsZSgxLjEpO1xufVxuYCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLGdCQUFnQjs7QUFHaEI7SUFDSSxlQUFlO0FBQ25COztBQUVBO0lBQ0ksYUFBYTtJQUNi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eENcIixcInNvdXJjZXNDb250ZW50XCI6W1wiLyogRm9udCArIG1ldGEgKi9cXG5AaW1wb3J0IHVybCgnaHR0cHM6Ly9mb250cy5nb29nbGVhcGlzLmNvbS9jc3MyP2ZhbWlseT1BcnNlbmFsK1NDOml0YWwsd2dodEAwLDQwMDswLDcwMDsxLDQwMDsxLDcwMCZkaXNwbGF5PXN3YXAnKTtcXG5cXG5pbWcge1xcbiAgICBtYXgtd2lkdGg6IDEwMCU7XFxufVxcblxcbmJvZHkge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBtYXJnaW46IDA7XFxuXFxuICAgIGZvbnQtZmFtaWx5OiBcXFwiQXJzZW5hbCBTQ1xcXCIsIHNhbnMtc2VyaWY7XFxuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG59XFxuXFxuLyogSGVhZGVyICovXFxuLmhlYWRlciB7XFxuICAgIGhlaWdodDogMTMwcHg7XFxuICAgIFxcbiAgICBmb250LXNpemU6IDQycHg7XFxuICAgIG1hcmdpbi10b3A6IDE1cHg7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG4uaGVhZGVyLWRlc2Mge1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcXG59XFxuLyogU3RhcnQvcmVzdGFydCBidXR0b24gKi9cXG4vKiBDU1MgKi9cXG4uaGVhZC1idG4ge1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gIGNvbG9yOiAjMDAwO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZpbGw6ICMwMDA7XFxuICBmb250LWZhbWlseTogXFxcIkFyc2VuYWwgU0NcXFwiLCBzYW5zLXNlcmlmO1xcbiAgZm9udC1zaXplOiAxOHB4O1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgbGV0dGVyLXNwYWNpbmc6IC0uOHB4O1xcbiAgbGluZS1oZWlnaHQ6IDI0cHg7XFxuICBtaW4td2lkdGg6IDE0MHB4O1xcbiAgb3V0bGluZTogMDtcXG4gIHBhZGRpbmc6IDhweCAxMHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgdHJhbnNpdGlvbjogYWxsIC4zcztcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcXG4gIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uO1xcblxcbiAgbWFyZ2luLXRvcDogMTVweDtcXG59XFxuXFxuLmhlYWQtYnRuOmZvY3VzIHtcXG4gIGNvbG9yOiAjMTcxZTI5O1xcbn1cXG5cXG4uaGVhZC1idG46aG92ZXIge1xcbiAgYm9yZGVyLWNvbG9yOiAjMDZmO1xcbiAgY29sb3I6ICMwNmY7XFxuICBmaWxsOiAjMDZmO1xcbn1cXG5cXG4uaGVhZC1idG46YWN0aXZlIHtcXG4gIGJvcmRlci1jb2xvcjogIzA2ZjtcXG4gIGNvbG9yOiAjMDZmO1xcbiAgZmlsbDogIzA2ZjtcXG59XFxuXFxuLm1haW4ge1xcbiAgICBmbGV4OiAxO1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcblxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuLnBsYXllciwgLmNvbXB1dGVyIHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICB3aWR0aDogNDYlO1xcblxcbiAgICBwYWRkaW5nLWJvdHRvbTogMTAwcHg7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuXFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5nYW1lYm9hcmQtbGFiZWwge1xcbiAgICBtYXJnaW46IDE1cHg7XFxufVxcblxcbi8qIEdhbWVib2FyZCBzdHlsaW5nICovXFxuLmdhbWVib2FyZCB7XFxuICAgIGhlaWdodDogNDIwcHg7XFxuICAgIHdpZHRoOiA0MjBweDtcXG5cXG4gICAgLyogb3V0bGluZTogMXB4IHNvbGlkIGJsYWNrOyAqL1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IHdyYXA7XFxufVxcblxcbi5sb2NrZWQsXFxuLmdhbWVib2FyZC1sYWJlbDpoYXMoKyAubG9ja2VkKSB7XFxuICAgIG9wYWNpdHk6IDAuNDtcXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XFxufVxcblxcbi8qIEdyaWQtdW5pdHMgc3R5bGluZyAtIGFsbCBzdGF0ZXMgKi9cXG4vKiBFbXB0eSBHcmlkIC0gZGVmYXVsdCAqL1xcbi5ncmlkLXVuaXQge1xcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICAgbWFyZ2luOiAxLjVweDsgLyogY291cGxlZCB3aXRoIFVJLmRpc3BsYXlHcmlkcygpKi9cXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5nYW1lYm9hcmQuYyB7XFxuICAgIGN1cnNvcjogY3Jvc3NoYWlyO1xcbn1cXG5cXG4uZ3JpZC1taXNzZWQge1xcbiAgICBmb250LXNpemU6IDI0cHg7XFxuICAgIG91dGxpbmU6IHJnYigyMjAsMzYsMzEpIHNvbGlkIDAuNXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIyMCwzNiwzMSwgMC4zKTtcXG59XFxuXFxuLyogUHJpb3JpdHkgU3RhdGUgU3R5bGluZyAtPiBBbnkgMyBvZiB0aGVzZSB3aWxsIG5vdCBiZSBtdXR1YWxseSBhcHBsaWVkIGF0IGFueSBwb2ludCovXFxuLmdyaWQtaGlkZGVuIHtcXG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGUgIWltcG9ydGFudDsgICAgXFxufVxcblxcbi5ncmlkLWZvdW5kIHtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICBvdXRsaW5lOiByZ2IoMjMsMTU5LDEwMikgc29saWQgMC41cHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMywxNTksMTAyLCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5ncmlkLXN1bmsge1xcbiAgICBmb250LXNpemU6IDEycHg7XFxuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYig5MiwgMTU4LCAxNzMsIDAuMSkgIWltcG9ydGFudDtcXG59XFxuXFxuLyogR3JpZC1zaGlwIGluZGl2aWR1YWwgc3R5bGluZyovXFxuLnNoaXAtMSB7XFxuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsMjAsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC0yIHtcXG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIwLDUwLDI1NSwgMC4zKTtcXG59XFxuXFxuLnNoaXAtMyB7XFxuICAgIG91dGxpbmU6IHJnYig1MSwxMDIsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsMTAyLDI1NSwgMC4zKTtcXG59XFxuXFxuLnNoaXAtNCB7XFxuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoODUsMTM2LDI1NSwgMC4zKTtcXG59XFxuXFxuLnNoaXAtNSB7XFxuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDExOSwxNzAsMjU1LCAwLjMpO1xcbn1cXG5cXG4vKiBEcmFnIGRyb3AgcHJldmlldyBzdHlsaW5nIGZvciBlYWNoIHNoaXAqL1xcbi5wcmV2aWV3LXNoaXAtMSB7XFxuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwyMCwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC0yIHtcXG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5wcmV2aWV3LXNoaXAtMyB7XFxuICAgIG91dGxpbmU6IHJnYig1MSwxMDIsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwxMDIsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5wcmV2aWV3LXNoaXAtNCB7XFxuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4NSwxMzYsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XFxufVxcblxcbi5wcmV2aWV3LXNoaXAtNSB7XFxuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnNoaXAtZHJvcHBhYmxlIHtcXG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMxLDI0NSwyNDQsMC42KTtcXG59XFxuXFxuLyogU2NvcmVib2FyZCBTdHlsaW5nICovXFxuXFxuLnNjb3JlYm9hcmQtbGFiZWwge1xcbiAgICBtYXJnaW4tdG9wOiAyMHB4O1xcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xcbn1cXG5cXG4uc2NvcmVib2FyZCB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcblxcbiAgICBnYXA6IDEwcHg7XFxufVxcblxcbi5zY29yZWJvYXJkID4gZGl2IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZ2FwOiAxcHg7XFxufVxcblxcbi5zY29yZWJvYXJkID4gZGl2LnNjb3JlLXN1bmsge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbn1cXG5cXG4uYm94IHtcXG4gICAgb3V0bGluZTogMHB4ICFpbXBvcnRhbnQ7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxufVxcblxcblxcbi8qIHJlc3VsdHMgbW9kYWwgc3R5bGluZyAqL1xcbmRpYWxvZzo6YmFja2Ryb3Age1xcbiAgICBvcGFjaXR5OiAwLjk7XFxufVxcblxcbi5yZXN1bHQge1xcbiAgICB3aWR0aDogNDAlO1xcbiAgICBoZWlnaHQ6IDQwdmg7XFxuXFxuICAgIGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xcbn1cXG5cXG4vKiByZXN1bHQgbW9kYWwgZmxleCB0byBiZSBydW4gb25seSB3aGVuIGRpc3BsYXllZCAqL1xcbi5yZXN1bHQtZGlzcGxheWVkIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG5cXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxufVxcblxcbi5yZXN1bHQtdGV4dCB7XFxuICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XFxuICAgIGZvbnQtc2l6ZTogNDJweDtcXG59XFxuXFxuI3BsYXktYWdhaW4ge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0ZGRkZGRjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICMyMjIyMjI7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgY29sb3I6ICMyMjIyMjI7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICBmb250LWZhbWlseTogJ0Fyc2VuYWwgU0MnLC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LFJvYm90byxcXFwiSGVsdmV0aWNhIE5ldWVcXFwiLHNhbnMtc2VyaWY7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBmb250LXdlaWdodDogNjAwO1xcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICBtYXJnaW46IDA7XFxuICBvdXRsaW5lOiBub25lO1xcbiAgcGFkZGluZzogMTNweCAyM3B4O1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XFxuICB0cmFuc2l0aW9uOiBib3gtc2hhZG93IC4ycywtbXMtdHJhbnNmb3JtIC4xcywtd2Via2l0LXRyYW5zZm9ybSAuMXMsdHJhbnNmb3JtIC4xcztcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcXG4gIHdpZHRoOiBhdXRvO1xcbn1cXG5cXG4jcGxheS1hZ2FpbjphY3RpdmUge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogI0Y3RjdGNztcXG4gIGJvcmRlci1jb2xvcjogIzAwMDAwMDtcXG4gIHRyYW5zZm9ybTogc2NhbGUoLjk2KTtcXG59XFxuXFxuI3BsYXktYWdhaW46ZGlzYWJsZWQge1xcbiAgYm9yZGVyLWNvbG9yOiAjREREREREO1xcbiAgY29sb3I6ICNEREREREQ7XFxuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xcbiAgb3BhY2l0eTogMTtcXG59XFxuXFxuLmZvb3RlciB7XFxuICAgIGZvbnQtZmFtaWx5OiBcXFwiQXJzZW5hbCBTQ1xcXCIsIHNhbnMtc2VyaWY7XFxuXFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBjb2xvcjogYmxhY2s7XFxuICAgIGhlaWdodDogMTAwcHg7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcblxcbiAgICBmb250LXNpemU6IDE2cHg7XFxufVxcblxcbi5naXRodWItbG9nbyB7XFxuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xcbiAgICB3aWR0aDogMjRweDtcXG4gICAgaGVpZ2h0OiAyNHB4O1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuLmdpdGh1Yi1hIGltZ3tcXG4gICAgb3BhY2l0eTogMC41O1xcbiAgICB0cmFuc2l0aW9uOiBhbGwgMzAwbXM7XFxufVxcblxcbi5naXRodWItYSBpbWc6aG92ZXIge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpIHNjYWxlKDEuMSk7XFxufVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xub3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjO1xuXHRpZiAoIXNjcmlwdFVybCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0aWYoc2NyaXB0cy5sZW5ndGgpIHtcblx0XHRcdHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxO1xuXHRcdFx0d2hpbGUgKGkgPiAtMSAmJiAoIXNjcmlwdFVybCB8fCAhL15odHRwKHM/KTovLnRlc3Qoc2NyaXB0VXJsKSkpIHNjcmlwdFVybCA9IHNjcmlwdHNbaS0tXS5zcmM7XG5cdFx0fVxuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsImltcG9ydCAnLi9zdHlsZS9zdHlsZS5jc3MnO1xuaW1wb3J0IEdpdCBmcm9tICcuL2Fzc2V0cy9naXRodWIucG5nJztcblxuaW1wb3J0IFVJIGZyb20gJy4vbW9kdWxlcy91aSdcblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnaXRodWJcIikuc3JjID0gR2l0OyAvLyBGaWxsIGdpdGh1YiBsb2dvXG5cblVJLmluaXRHYW1lKCk7XG4iXSwibmFtZXMiOlsiU2hpcCIsIkdhbWVib2FyZCIsImNvbnN0cnVjdG9yIiwiZ3JpZHMiLCJBcnJheSIsImZpbGwiLCJhdHRhY2tzIiwic2hpcHMiLCJpc1ZhbGlkUGxhY2VtZW50Iiwic2hpcCIsImNvb3JkcyIsImlzVmFsaWQiLCJmb3JFYWNoIiwiaWR4IiwibGVuZ3RoIiwicGxhY2VTaGlwIiwicHVzaCIsInJlY2VpdmVBdHRhY2siLCJjb29yZCIsImluY2x1ZGVzIiwiaGl0IiwiZ2V0TWlzc2VzIiwibWlzc2VzIiwiYXR0YWNrIiwiZ2V0UmVtYWluaW5nIiwicmVtYWluaW5nIiwiaSIsImlzR2FtZU92ZXIiLCJnYW1lb3ZlciIsInNoaXBPYmoiLCJpc1N1bmsiLCJQbGF5ZXIiLCJnYW1lYm9hcmQiLCJheGlzIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwiaGl0cyIsInNldEF4aXMiLCJnZXRBeGlzIiwiRHJhZ0Ryb3AiLCJTY29yZUJvYXJkIiwiQmF0dGxlc2hpcEFJIiwiQUlBdHRhY2siLCJwbGF5ZXIiLCJoaXRzTm90U3VuayIsImZpbHRlciIsInRhcmdldCIsImNvbnNvbGUiLCJsb2ciLCJ0YXJnZXRIaXRzIiwiTldTRSIsImJhc2UiLCJvZmZzZXQiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJuZXh0IiwibWluIiwicmVtYWluaW5nU2hpcHMiLCJjaGVja0lmRml0Iiwic2hpcExlbmd0aCIsIldFIiwibWF4IiwiTlMiLCJvcHRpb25zIiwiVUkiLCJpbml0IiwicmVzZXRFdmVudHMiLCJzZXREcmFnZ2FibGVBcmVhIiwiZHJhZyIsImNsaWNrIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZ3JpZCIsIm9uZHJhZ3N0YXJ0IiwiZSIsIm9uZHJhZ2VudGVyIiwicHJldmVudERlZmF1bHQiLCJvbmRyYWdlbmQiLCJvbmRyYWdvdmVyIiwib25jbGljayIsInNldEF0dHJpYnV0ZSIsInN0eWxlIiwicGxheWVyU2hpcHMiLCJpc0Ryb3BwYWJsZSIsInNldERyb3BwYWJsZUFyZWEiLCJzaGlwT2Zmc2V0IiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwicGxheWVyR3JpZHMiLCJoZWFkIiwicGFyc2VJbnQiLCJpZCIsInNsaWNlIiwia2V5cyIsIm1hcCIsIngiLCJldmVyeSIsImFkZCIsImdldEVsZW1lbnRCeUlkIiwiY2xhc3NlcyIsInNoaXBJZHgiLCJmaW5kIiwidmFsdWUiLCJzdGFydHNXaXRoIiwic29ydCIsImEiLCJiIiwiZmluZEluZGV4IiwiZHJhZ0VudGVyIiwiZHJhZ0VuZCIsImRyb3BwYWJsZSIsInByZXZpZXciLCJxdWVyeVNlbGVjdG9yIiwiZHJhZ0Ryb3AiLCJwb3RlbnRpYWxDb29yZHMiLCJvbmRyb3AiLCJvbGRDb29yZHMiLCJyZXBsYWNlU2hpcCIsIm5ld0Nvb3JkcyIsIm5ld0F4aXMiLCJ1cGRhdGVQbGFjZWRTaGlwcyIsInNoYWtlIiwiYW5pbWF0ZSIsInRyYW5zZm9ybSIsInRlcm1pbmF0ZSIsImNyZWF0ZVNjb3JlYm9hcmQiLCJjb21wdXRlciIsInNjb3JlYm9hcmQiLCJjb250YWlucyIsImNoaWxkcmVuIiwic2NvcmUiLCJib3giLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJ1cGRhdGVTY29yZWJvYXJkIiwidG9TdHJpbmciLCJkaXNwbGF5R3JpZHMiLCJnYW1lYm9hcmRQIiwiaW5uZXJIVE1MIiwiZ3JpZFVuaXQiLCJ3aWR0aCIsImhlaWdodCIsImdhbWVib2FyZEMiLCJpbml0R2FtZSIsInRleHRDb250ZW50IiwicGxhY2VSYW5kb21TaGlwcyIsImluaXREaXNwbGF5U2hpcHMiLCJwbGF5ZXJTaGlwU2VsZWN0IiwiZ2FtZUxvZ2ljIiwicmFuZG9tQ29vcmRpbmF0ZXMiLCJwb3MiLCJhcnJheSIsImZsZWV0IiwiaiIsInVwZGF0ZUdyaWRzIiwicGxheWVyQXR0YWNrcyIsImNvbXBBdHRhY2tzIiwidXBkYXRlU2hpcHMiLCJwbGF5Um91bmQiLCJpbnB1dCIsInBsYXllckF0dGFjayIsImdhbWVPdmVyIiwiZGVsYXkiLCJtcyIsIlByb21pc2UiLCJyZXMiLCJyZWoiLCJzZXRUaW1lb3V0Iiwid2lubmVyVGV4dCIsImRpYWxvZyIsInRleHQiLCJyZXN0YXJ0Iiwic2hvd01vZGFsIiwiY2xvc2UiLCJHaXQiLCJzcmMiXSwic291cmNlUm9vdCI6IiJ9