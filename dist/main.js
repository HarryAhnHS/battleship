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
        // Return true if ship fits from base / false if not
        function checkIfFit(player, base, offset, shipLength) {
          let coords = [];
          for (let i = 1; i < shipLength; i++) {
            coords.push(base + offset * i);
          }
          // Potenital coords based on base, offset, shipLength - exclude base (already attacked and valid)
          let isValid = true;
          coords.forEach(idx => {
            if (player.gameboard.attacks.includes(idx) || idx < 0 || idx > 99 || (offset == -1 || offset == 1) && !(Math.floor(idx / 10) == Math.floor(base / 10))) {
              isValid = false;
            }
          });
          console.log("Step 2: (min)shipLength: " + shipLength + " can fit into " + base, coords + " = " + isValid);
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
    const restart = document.querySelector("#play-again");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQ0FBaUM7O0FBRWpDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7O0FBRW5CO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLE9BQU8sOEZBQThGLE1BQU0sVUFBVSxPQUFPLEtBQUssVUFBVSxZQUFZLFlBQVksWUFBWSxhQUFhLGFBQWEsT0FBTyxVQUFVLEtBQUssV0FBVyxVQUFVLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLE1BQU0sWUFBWSxXQUFXLEtBQUssWUFBWSxhQUFhLGFBQWEsYUFBYSxXQUFXLFVBQVUsVUFBVSxVQUFVLFlBQVksV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxjQUFjLGFBQWEsT0FBTyxLQUFLLFVBQVUsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLE1BQU0sS0FBSyxZQUFZLFdBQVcsVUFBVSxNQUFNLEtBQUssV0FBVyxVQUFVLFdBQVcsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsV0FBVyxZQUFZLGNBQWMsV0FBVyxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLFlBQVksTUFBTSxVQUFVLFdBQVcsYUFBYSxXQUFXLFdBQVcsWUFBWSxPQUFPLE1BQU0sVUFBVSxZQUFZLE9BQU8sWUFBWSxhQUFhLE1BQU0sWUFBWSxhQUFhLHdCQUF3QixXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxZQUFZLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLGFBQWEsT0FBTyxZQUFZLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxZQUFZLE1BQU0sWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLGFBQWEsTUFBTSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsYUFBYSxXQUFXLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFFBQVEsWUFBWSxNQUFNLFVBQVUsT0FBTyxLQUFLLFVBQVUsV0FBVyxZQUFZLE9BQU8sWUFBWSxNQUFNLFVBQVUsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxPQUFPLEtBQUssWUFBWSxhQUFhLGFBQWEsV0FBVyxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLFdBQVcsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsWUFBWSxXQUFXLE1BQU0sS0FBSyxhQUFhLGFBQWEsV0FBVyxXQUFXLFVBQVUsWUFBWSxjQUFjLFdBQVcsT0FBTyxLQUFLLFlB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Q0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztVQ2JBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQ2xCQTs7Ozs7Ozs7Ozs7QUNBMkI7QUFDRTtBQUU3QkEsbURBQUUsQ0FBQzhFLEtBQUssQ0FBQyxDQUFDO0FBQ1Y5RSxtREFBRSxDQUFDc0YsUUFBUSxDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JsYW5rLy4vc3JjL2ZhY3Rvcmllcy9nYW1lYm9hcmQuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvZmFjdG9yaWVzL3BsYXllci5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9mYWN0b3JpZXMvc2hpcC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL2JhdHRsZXNoaXBBSS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL2RyYWdEcm9wLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL21vZHVsZXMvc2NvcmVib2FyZC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9tb2R1bGVzL3VpLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL3N0eWxlL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9zdHlsZS9zdHlsZS5jc3M/YzlmMCIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNoaXAgZnJvbSAnLi9zaGlwJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lYm9hcmQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmdyaWRzID0gbmV3IEFycmF5KDEwMCkuZmlsbChudWxsKTsgLy8gMkQgYXJyYXkgaWxsdXN0cmF0ZWQgYnkgMUQgKDEweDEwKVxuICAgICAgICB0aGlzLmF0dGFja3MgPSBbXTtcbiAgICAgICAgdGhpcy5zaGlwcyA9IFtdO1xuICAgIH1cblxuICAgIGlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHNbaWR4XSAhPSBudWxsIHx8IGNvb3Jkcy5sZW5ndGggIT0gc2hpcC5sZW5ndGggfHwgaWR4IDwgMCB8fCBpZHggPiA5OSkge1xuICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayBwbGFjZW1lbnQgaWR4IGFuZCBpZiBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBwbGFjZVNoaXAoc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzKSkge1xuICAgICAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHNbaWR4XSA9IHNoaXA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdGhpcy5zaGlwcy5wdXNoKHtzaGlwLCBjb29yZHN9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlY2VpdmVBdHRhY2soY29vcmQpIHtcbiAgICAgICAgLy8gUmVnaXN0ZXIgYXR0YWNrIG9ubHkgaWYgdmFsaWRcbiAgICAgICAgaWYgKCF0aGlzLmF0dGFja3MuaW5jbHVkZXMoY29vcmQpICYmIGNvb3JkID49IDAgJiYgY29vcmQgPD0gOTkpIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNrcy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRzW2Nvb3JkXSkge1xuICAgICAgICAgICAgICAgIC8vIFNoaXAgaGl0IC0gcmVnaXN0ZXIgaGl0IHRvIGNvcnJlc3BvbmRpbmcgc2hpcCBvYmplY3RcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRzW2Nvb3JkXS5oaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE1pc3NlcygpIHtcbiAgICAgICAgbGV0IG1pc3NlcyA9IFtdO1xuICAgICAgICB0aGlzLmF0dGFja3MuZm9yRWFjaCgoYXR0YWNrKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1thdHRhY2tdID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtaXNzZXMucHVzaChhdHRhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gbWlzc2VzO1xuICAgIH1cblxuICAgIGdldFJlbWFpbmluZygpIHtcbiAgICAgICAgbGV0IHJlbWFpbmluZyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXR0YWNrcy5pbmNsdWRlcyhpKSkgcmVtYWluaW5nLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlbWFpbmluZztcbiAgICB9XG5cbiAgICBpc0dhbWVPdmVyKCkge1xuICAgICAgICBsZXQgZ2FtZW92ZXIgPSB0cnVlO1xuICAgICAgICB0aGlzLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIGlmICghc2hpcE9iai5zaGlwLmlzU3VuaykgZ2FtZW92ZXIgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGdhbWVvdmVyO1xuICAgIH1cbn0iLCJpbXBvcnQgR2FtZWJvYXJkIGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IFNoaXAgZnJvbSBcIi4vc2hpcFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmdhbWVib2FyZCA9IG5ldyBHYW1lYm9hcmQ7XG4gICAgfVxufVxuXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTaGlwIHtcbiAgICBjb25zdHJ1Y3RvcihsZW5ndGgsIGF4aXM9MCkge1xuICAgICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aCxcbiAgICAgICAgdGhpcy5oaXRzID0gMDtcbiAgICAgICAgdGhpcy5pc1N1bmsgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5heGlzID0gYXhpczsgLy8gMCBob3Jpem9udGFsLCAxIHZlcnRpY2FsXG4gICAgfVxuXG4gICAgc2V0QXhpcyhheGlzKSB7XG4gICAgICAgIHRoaXMuYXhpcyA9IGF4aXM7XG4gICAgfVxuXG4gICAgZ2V0QXhpcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXhpcztcbiAgICB9XG5cbiAgICBoaXQoKSB7XG4gICAgICAgIHRoaXMuaGl0cysrOyBcbiAgICAgICAgaWYgKHRoaXMuaGl0cyA+PSB0aGlzLmxlbmd0aCkgdGhpcy5pc1N1bmsgPSB0cnVlO1xuICAgIH1cbn0iLCJpbXBvcnQgU2hpcCBmcm9tIFwiLi4vZmFjdG9yaWVzL3NoaXBcIjtcbmltcG9ydCBQbGF5ZXIgZnJvbSBcIi4uL2ZhY3Rvcmllcy9wbGF5ZXJcIjtcbmltcG9ydCBEcmFnRHJvcCBmcm9tIFwiLi9kcmFnRHJvcFwiO1xuaW1wb3J0IFNjb3JlQm9hcmQgZnJvbSBcIi4vc2NvcmVib2FyZFwiO1xuXG5jb25zdCBCYXR0bGVzaGlwQUkgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIEFJQXR0YWNrKHBsYXllcikge1xuICAgICAgICAvLyBRdWV1ZTogQXJyYXkgdG8gaG9sZCBhbGwgY3VycmVudGx5IGFjdGlvbmFibGUgZ3JpZHNcbiAgICAgICAgY29uc3QgaGl0c05vdFN1bmsgPSBwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3MuZmlsdGVyKChoaXQpID0+IFxuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5ncmlkc1toaXRdICYmICFwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2hpdF0uaXNTdW5rKTtcbiAgICBcbiAgICAgICAgaWYgKGhpdHNOb3RTdW5rLmxlbmd0aCA+IDApIHsgXG4gICAgICAgICAgICAvLyAwLiBBY3Rpb24gLSBhdCBsZWFzdCAxIGhpdCB0byBhY3QgdXBvblxuICAgICAgICAgICAgLy8gU2V0IHVuc3VuayBzaGlwIG9iaiB3aXRoIG1heCBoaXRzIHRvIHdvcmsgb24gYXMgdGFyZ2V0XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0ge3NoaXA6IG5ldyBTaGlwKDApLCBjb29yZHM6IFtdfTsgLy8gRHVtbXkgdmFyaWFibGUgdG8gdXBkYXRlIGFzIGxvb3BcbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc2hpcE9iai5zaGlwLmlzU3VuayAmJiBzaGlwT2JqLnNoaXAuaGl0cyA+IHRhcmdldC5zaGlwLmhpdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZmluZCBtYXggaGl0LCB1bnN1bmsgc2hpcFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBzaGlwT2JqO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRhcmdldCA9IFwiLCB0YXJnZXQpO1xuICAgIFxuICAgICAgICAgICAgLy8gR2V0IHRhcmdldCdzIGFscmVhZHkgaGl0IGNvb3JkcyBhbmQgc3RvcmUgaW4gYXJyYXlcbiAgICAgICAgICAgIGxldCB0YXJnZXRIaXRzID0gaGl0c05vdFN1bmsuZmlsdGVyKChoaXQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGxheWVyLmdhbWVib2FyZC5ncmlkc1toaXRdID09IHRhcmdldC5zaGlwICYmIHRhcmdldC5jb29yZHMuaW5jbHVkZXMoaGl0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUYXJnZXQncyBhbHJlYWR5IGhpdCBjb29yZHMgPSBcIiwgdGFyZ2V0SGl0cyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0YXJnZXQuc2hpcC5oaXRzID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyAyLiBJZiBvbmx5IDEgaGl0IGlzIG1heCwgdGhlbiBtdXN0IHJhbmRvbWl6ZSBsZWZ0IHJpZ2h0IHRvcCBvciByaWdodFxuICAgICAgICAgICAgICAgIGNvbnN0IE5XU0UgPSBbLTEwLCAtMSwgKzEwLCAxXTtcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlID0gdGFyZ2V0SGl0c1swXTtcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0ID0gTldTRVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV07XG4gICAgICAgICAgICAgICAgbGV0IG5leHQgPSBiYXNlICsgb2Zmc2V0O1xuICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGJhc2UpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV4dClcblxuICAgICAgICAgICAgICAgIC8vIEVkZ2UgY2FzZSBoYW5kbGluZyAtIChhc3N1bWUgd29yc3QgY2FzZSBzY2VuYXJpbylcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBjdXJyZW50IHNtYWxsZXN0IHJlbWFpbmluZyBzaGlwXG4gICAgICAgICAgICAgICAgLy8gIC0+IGNoZWNrIGlmIHRoaXMgc2hpcCBjYW4gZml0XG4gICAgICAgICAgICAgICAgbGV0IG1pbiA9IDU7IC8vIGR1bW15IHRvIHJlcGxhY2VcbiAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdTaGlwcyA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZmlsdGVyKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhKHNoaXBPYmouc2hpcC5pc1N1bmspO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nU2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5zaGlwLmxlbmd0aCA8PSBtaW4pIG1pbiA9IHNoaXBPYmouc2hpcC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdHJ1ZSBpZiBzaGlwIGZpdHMgZnJvbSBiYXNlIC8gZmFsc2UgaWYgbm90XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tJZkZpdChwbGF5ZXIsIGJhc2UsIG9mZnNldCwgc2hpcExlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29vcmRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgc2hpcExlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZHMucHVzaChiYXNlICsgKG9mZnNldCAqIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBQb3Rlbml0YWwgY29vcmRzIGJhc2VkIG9uIGJhc2UsIG9mZnNldCwgc2hpcExlbmd0aCAtIGV4Y2x1ZGUgYmFzZSAoYWxyZWFkeSBhdHRhY2tlZCBhbmQgdmFsaWQpXG4gICAgICAgICAgICAgICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhpZHgpIHx8IGlkeCA8IDAgfHwgaWR4ID4gOTkgXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAoKG9mZnNldCA9PSAtMSB8fCBvZmZzZXQgPT0gMSkgJiYgIShNYXRoLmZsb29yKGlkeC8xMCkgPT0gTWF0aC5mbG9vcihiYXNlLzEwKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGVwIDI6IChtaW4pc2hpcExlbmd0aDogXCIgKyBzaGlwTGVuZ3RoICsgXCIgY2FuIGZpdCBpbnRvIFwiICsgYmFzZSwgY29vcmRzICsgXCIgPSBcIiArIGlzVmFsaWQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICAgICAgLy8gQm91bmRzIGNoZWNrIChlZGdlY2FzZTogaWYgaG9yaXpvbnRhbCBtdXN0IGJlIGluIHNhbWUgeS1heGlzKSArIG5vdCBhbHJlYWR5IGF0dGFja2VkID0gY3ljbGVcbiAgICAgICAgICAgICAgICB3aGlsZSAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKG5leHQpIHx8IG5leHQgPCAwIHx8IG5leHQgPiA5OSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICgob2Zmc2V0ID09IC0xIHx8IG9mZnNldCA9PSAxKSAmJiAhKE1hdGguZmxvb3IobmV4dC8xMCkgPT0gTWF0aC5mbG9vcihiYXNlLzEwKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCAhY2hlY2tJZkZpdChwbGF5ZXIsIGJhc2UsIG9mZnNldCwgbWluKSkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBOV1NFW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGJhc2UgKyBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdnaW5nOiBuZXduZXh0ID0gXCIsIG5leHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGVwIDIgYXR0YWNrZWQgY2VsbDogXCIsIG5leHQpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIDMuIElmIDIgaGl0cyBvciBtb3JlIGlzIG1heCwgdGhlbiBjYW4gZGVkdWNlIHRoZSBzaGlwIGF4aXMgYW5kIGd1ZXNzIGxlZnQtMSBvciByaWdodCsxIHVudGlsIGRvbmVcbiAgICBcbiAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgYXhpcyAtIGZyb20gMiBoaXRzIGNhbiBhc3N1bWUgXG4gICAgICAgICAgICAgICAgLy8gKFJlZmVyZW5jZTogU2xpZ2h0IGltcGVyZmVjdGlvbiBpbiBsb2dpYykgSWYgMiwzLDQsNSBoaXRzIGNhbiB0ZWNobmljYWxseSBiZSAyLDMsNCw1IHNoaXBzXG4gICAgICAgICAgICAgICAgY29uc3QgYXhpcyA9IHRhcmdldC5zaGlwLmF4aXM7XG4gICAgICAgICAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBob3Jpem9udGFsLCByYW5kb20gbGVmdCBvciByaWdodFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBXRSA9IFtNYXRoLm1pbiguLi50YXJnZXRIaXRzKSAtIDEsIE1hdGgubWF4KC4uLnRhcmdldEhpdHMpICsgMV07XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gV0VbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMildO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBCb3VuZHMgY2hlY2sgKGVkZ2VjYXNlOiBpZiBob3Jpem9udGFsIG11c3QgYmUgaW4gc2FtZSB5LWF4aXMpICsgbm90IGFscmVhZHkgYXR0YWNrZWQgPSBjeWNsZVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKG5leHQpIHx8IG5leHQgPCAwIHx8IG5leHQgPiA5OSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICEoTWF0aC5mbG9vcihuZXh0LzEwKSA9PSBNYXRoLmZsb29yKE1hdGgubWluKC4uLnRhcmdldEhpdHMpLzEwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBXRVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKG5leHQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMyBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHZlcnRpY2FsLCByYW5kb20gdG9wIG9yIGJvdHRvbVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBOUyA9IFtNYXRoLm1pbiguLi50YXJnZXRIaXRzKSAtIDEwLCBNYXRoLm1heCguLi50YXJnZXRIaXRzKSArIDEwXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSBOU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayArIG5vdCBhbHJlYWR5IGF0dGFja2VkID0gY3ljbGVcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhuZXh0KSB8fCBuZXh0IDwgMCB8fCBuZXh0ID4gOTkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBOU1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKG5leHQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMyBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gMC4gTm8gaGl0cyB0byBhY3QgdXBvbiAtIENvbXBsZXRlIHJhbmRvbSBvdXQgb2YgcmVtYWluaW5nIGdyaWRzXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gcGxheWVyLmdhbWVib2FyZC5nZXRSZW1haW5pbmcoKTtcbiAgICAgICAgICAgIGxldCBuZXh0ID0gb3B0aW9uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBvcHRpb25zLmxlbmd0aCldO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTdGVwIDEgYXR0YWNrZWQgY2VsbDogXCIsIG5leHQpO1xuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKG5leHQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgQUlBdHRhY2tcbiAgICB9XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBCYXR0bGVzaGlwQUk7IiwiaW1wb3J0IFVJIGZyb20gJy4vdWknXG5cbmNvbnN0IERyYWdEcm9wID0gKCgpID0+IHtcblxuICAgIGZ1bmN0aW9uIGluaXQocGxheWVyKSB7XG4gICAgICAgIHJlc2V0RXZlbnRzKCk7XG4gICAgICAgIHNldERyYWdnYWJsZUFyZWEoKTtcbiAgICAgICAgZHJhZyhwbGF5ZXIpO1xuICAgICAgICBjbGljayhwbGF5ZXIpO1xuICAgIH1cblxuICAgIC8vIHJlc2V0IGFsbCBkcmFnL2NsaWNrIGV2ZW50IGxpc3RlbmVyc1xuICAgIGZ1bmN0aW9uIHJlc2V0RXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ3N0YXJ0ID0gKChlKSA9PiB7XG4gICAgICAgICAgICB9KSBcbiAgICAgICAgICAgIGdyaWQub25kcmFnZW50ZXIgPSAoKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KSBcbiAgICAgICAgICAgIGdyaWQub25kcmFnZW5kID0gKChlKSA9PiB7XG4gICAgICAgICAgICB9KSBcbiAgICAgICAgICAgIGdyaWQub25kcmFnb3ZlciA9ICgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBncmlkLm9uY2xpY2sgPSAoKGUpID0+IHtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICAvLyBSZXNldCBhbmQgc2V0IGFsbCBzaGlwcyB0byBiZSBkcmFnZ2FibGUgXG4gICAgZnVuY3Rpb24gc2V0RHJhZ2dhYmxlQXJlYSgpIHtcbiAgICAgICAgLy8gUmVzZXQgZHJhZ2dhYmxlIGNvbnRlbnRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgZmFsc2UpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAnYXV0byc7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIERyYWdnYWJsZSBjb250ZW50ID0gYW55IGdyaWQgd2l0aCBzaGlwIGNsYXNzXG4gICAgICAgIGxldCBwbGF5ZXJTaGlwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIik7XG4gICAgICAgIHBsYXllclNoaXBzLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIHRydWUpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAncG9pbnRlcic7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gSGVscGVyIGJvb2wgLSBWYWxpZCBkcm9wcGFibGUgcGxhY2UgZm9yIGhlYWQgLSBpZ25vcmUgY3VycmVudCBzaGlwJ3MgcG9zaXRpb24gd2hlbiBjaGVja2luZyB2YWxpZGl0eVxuICAgIGZ1bmN0aW9uIGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcCwgY29vcmRzKSB7XG4gICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgY29vcmRzLmZvckVhY2goKGlkeCkgPT4geyBcbiAgICAgICAgICAgIGlmICgocGxheWVyLmdhbWVib2FyZC5ncmlkc1tpZHhdICE9IG51bGwgJiYgcGxheWVyLmdhbWVib2FyZC5ncmlkc1tpZHhdICE9IHNoaXApIHx8IGNvb3Jkcy5sZW5ndGggIT0gc2hpcC5sZW5ndGggfHwgaWR4IDwgMCB8fCBpZHggPiA5OSkge1xuICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayBwbGFjZW1lbnQgaWR4IGFuZCBpZiBub3QgZW1wdHlcbiAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7IFxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBhbmQgc2V0IGRyb3BwYWJsZSBhcmVhcyB3aXRoIGNsYXNzICdncmlkLWRyb3BwYWJsZScgXG4gICAgZnVuY3Rpb24gc2V0RHJvcHBhYmxlQXJlYShwbGF5ZXIsIHNoaXAsIGF4aXMsIHNoaXBPZmZzZXQpIHtcbiAgICAgICAgLy8gUmVzZXQgZHJvcHBhYmxlIGdyaWRzIHRvIGhhdmUgY2xhc3MgXCJncmlkLWRyb3BwYWJsZVwiXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZSgnZ3JpZC1kcm9wcGFibGUnKTtcbiAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZSgnc2hpcC1kcm9wcGFibGUnKTtcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBwbGF5ZXJHcmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpO1xuICAgICAgICAvLyBWYWxpZCBjaGVjayBpZiBoZWFkIGlzIGRyb3BwZWQgaW4gZ3JpZCAtIFxuICAgICAgICBwbGF5ZXJHcmlkcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoZWFkID0gcGFyc2VJbnQoZ3JpZC5pZC5zbGljZSgxKSk7XG4gICAgICAgICAgICBpZiAoYXhpcyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCBjYXNlIFxuICAgICAgICAgICAgICAgIC8vIFZhbGlkYXRpb24gLSBoZWFkIG11c3QgaGF2ZSBlbXB0eSBuIGxlbmd0aCB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRzID0gWy4uLm5ldyBBcnJheShzaGlwLmxlbmd0aCkua2V5cygpXS5tYXAoKHgpID0+IHggKyBoZWFkIC0gc2hpcE9mZnNldCk7IC8vIENvb3JkcyBhcnJheSBvZiBob3Jpem9udGFsIHNoaXAgZnJvbSBoZWFkICsgQWNjb3VudCBmb3Igb2Zmc2V0IGluIHBvdGVudGlhbCBjb29yZHNcbiAgICAgICAgICAgICAgICBpZiAoY29vcmRzLmV2ZXJ5KCh4KSA9PiBNYXRoLmZsb29yKHgvMTApID09IE1hdGguZmxvb3IoY29vcmRzWzBdLzEwKSlcbiAgICAgICAgICAgICAgICAgICAgJiYgaXNEcm9wcGFibGUocGxheWVyLCBzaGlwLCBjb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICBUaGVuIHZhbGlkIC0gc2V0IGRyb3BwYWJsZVxuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5hZGQoJ2dyaWQtZHJvcHBhYmxlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGVudGlyZSBzaGlwIGRyb3BwYWJsZSBncmlkc1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gVmVydGljYWwgY2FzZVxuICAgICAgICAgICAgICAgIC8vIFZhbGlkYXRpb24gLSBoZWFkIG11c3QgaGF2ZSBlbXB0eSBuIGxlbmd0aCBncmlkcyBiZWxvdyB3aXRoaW4gYm91bmRzXG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiBoZWFkICsgKCh4IC0gc2hpcE9mZnNldCkgKiAxMCkpOyAvLyBDb29yZHMgYXJyYXkgb2YgdmVydGljYWwgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgaWYgKGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcCwgY29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5hZGQoJ2dyaWQtZHJvcHBhYmxlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IGVudGlyZSBzaGlwIGRyb3BwYWJsZSBncmlkc1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYWcocGxheWVyKSB7XG4gICAgICAgIGxldCBwbGF5ZXJTaGlwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIik7XG5cbiAgICAgICAgcGxheWVyU2hpcHMuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmRyYWdzdGFydCA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibW92ZVwiO1xuXG4gICAgICAgICAgICAgICAgLy8gRHJhZ2dpbmcgc2hpcCAtIG5lZWQgdG8gZXh0cmFjdCBTaGlwIG9iamVjdCBmcm9tIHRoZSBncmlkXG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IFsuLi5ncmlkLmNsYXNzTGlzdF07XG4gICAgICAgICAgICAgICAgbGV0IHNoaXBJZHggPSBjbGFzc2VzLmZpbmQodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuc3RhcnRzV2l0aChcInNoaXAtXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNoaXBJZHggPSBzaGlwSWR4LnNsaWNlKDUpLTE7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBjbGFzcyBhc3NvY2lhdGVkIHdpdGggc2hpcCArIHVzZSBhcyBoYXNobWFwIHRvIHJlZmVyZW5jZSBleGFjdCBzaGlwIG9iamVjdCB1c2VkIGluIGdhbWVib2FyZFxuICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBPYmogPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLnNoaXA7XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgZ3JpZCBwb3NpdGlvbiBvZiBjdXJyZW50IGRyYWdnZWQgc2hpcCAtIFNvcnQgc2hpcCBjb29yZHMgbG93ZXN0IHRvIGhpZ2hlc3RcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBPZmZzZXQgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3Jkcy5zb3J0KChhLGIpID0+IGEgPiBiKS5maW5kSW5kZXgoeCA9PiB4ID09IHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzaGlwT2Zmc2V0KTtcblxuICAgICAgICAgICAgICAgIHNldERyb3BwYWJsZUFyZWEocGxheWVyLCBzaGlwT2JqLCBzaGlwT2JqLmF4aXMsIHNoaXBPZmZzZXQpO1xuICAgICAgICAgICAgICAgIGRyYWdFbnRlcihwbGF5ZXIsIHNoaXBPYmosIHNoaXBPYmouYXhpcywgc2hpcElkeCwgc2hpcE9mZnNldCk7XG4gICAgICAgICAgICAgICAgZHJhZ0VuZChwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbiAgICBcbiAgICAvLyBEcmFnIHNoaXAgZW50ZXJzIGRyb3BwYWJsZSBhcmVhIC0gb2ZmZXIgcHJldmlldyBvZiBob3cgc2hpcCB3b3VsZCBsb29rIHBsYWNlZFxuICAgIGZ1bmN0aW9uIGRyYWdFbnRlcihwbGF5ZXIsIHNoaXAsIGF4aXMsIHNoaXBJZHgsIHNoaXBPZmZzZXQpIHtcbiAgICAgICAgY29uc3QgZHJvcHBhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5ncmlkLWRyb3BwYWJsZVwiKTtcblxuICAgICAgICBkcm9wcGFibGUuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmRyYWdlbnRlciA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBwcmV2aWV3IGdyaWRzXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0xYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTJgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtM2ApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC00YCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTVgKTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgLy8gR2V0IGhlYWQgdmFsdWUgXG4gICAgICAgICAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBIb3Jpem9udGFsIGNhc2UgXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSAtIHNoaXBPZmZzZXQ7IC8vIFVwZGF0ZSBoZWFkIHZhbHVlIHRvIGJlIG9mZnNldHRlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldmlldyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiB4ICsgaGVhZCk7IC8vIFBvdGVudGlhbCBjb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3LmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwcmV2aWV3LXNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGRyYWdEcm9wKHBsYXllciwgc2hpcCwgc2hpcElkeCwgcHJldmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBWZXJ0aWNhbCBjYXNlXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSAtICgxMCAqIHNoaXBPZmZzZXQpOyAvLyBVcGRhdGUgaGVhZCB2YWx1ZSB0byBiZSBvZmZzZXR0ZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXZpZXcgPSBbLi4ubmV3IEFycmF5KHNoaXAubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4gaGVhZCArICh4ICogMTApKTsgLy8gQ29vcmRzIGFycmF5IG9mIHZlcnRpY2FsIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBwcmV2aWV3LmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKGBwcmV2aWV3LXNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGRyYWdEcm9wKHBsYXllciwgc2hpcCwgc2hpcElkeCwgcHJldmlldyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIERyYWcgZW5kIC0gcmVnYXJkbGVzcyBvZiBzdWNjZXNzZnVsIGRyb3Agb3Igbm90XG4gICAgZnVuY3Rpb24gZHJhZ0VuZChwbGF5ZXIpIHtcbiAgICAgICAgbGV0IHBsYXllclNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5wbGF5ZXItc2hpcFwiKTtcblxuICAgICAgICBwbGF5ZXJTaGlwcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ2VuZCA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIC8vIFJlc2V0IHByZXZpZXcgZ3JpZHNcbiAgICAgICAgICAgICAgICAvLyBSZXNldCBkcm9wcGFibGUgZ3JpZHMgdG8gaGF2ZSBjbGFzcyBcImdyaWQtZHJvcHBhYmxlXCJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTFgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtMmApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0zYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTRgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtNWApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLWRyb3BwYWJsZScpO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoJ3NoaXAtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIGluaXQocGxheWVyKTsgLy8gQXQgZWFjaCBkcmFnLWVuZCByZXNldCBkcmFnZ2FibGUrZHJvcHBhYmxlIGNvbnRlbnQgYW5kIHJlc2V0IGFsbCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gRHJhZyBwbGFjZSBpbiB2YWxpZCBncmlkIC0gdGFyZ2V0IGFzIHBvdGVudGlhbCBjb29yZHMgYXQgZWFjaCBkcmFnIGVudGVyXG4gICAgZnVuY3Rpb24gZHJhZ0Ryb3AocGxheWVyLCBzaGlwLCBzaGlwSWR4LCBwb3RlbnRpYWxDb29yZHMpIHsgICAgICAgXG4gICAgICAgIC8vIENvb3JkcyB0byBiZSBzaGlwLWRyb3BwYWJsZSBhcmVhIFxuICAgICAgICBwb3RlbnRpYWxDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgaGVhZCBvZiBwbGFjZW1lbnQgLSBhbHdheXMgbWluaW11bSB2YWx1ZSBvZiBjb29yZHNcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwJHtpZHh9YCkub25kcm9wID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDb29yZHMgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3JkcztcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZ2FtZWJvYXJkIHNoaXBzW10gYXJyYXkgYW5kIGdyaWRzW10gYXJyYXlcbiAgICAgICAgICAgICAgICByZXBsYWNlU2hpcChwbGF5ZXIsIHNoaXBJZHgsIG9sZENvb3JkcywgcG90ZW50aWFsQ29vcmRzLCBzaGlwLmF4aXMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlcGxhY2VTaGlwKHBsYXllciwgc2hpcElkeCwgb2xkQ29vcmRzLCBuZXdDb29yZHMsIG5ld0F4aXMpIHtcbiAgICAgICAgLy8gU3RvcmFnZSBjaGFuZ2VzXG4gICAgICAgIC8vIFVwZGF0ZSBnYW1lYm9hcmQgZ3JpZHNbXVxuICAgICAgICBvbGRDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gPSBudWxsO1xuICAgICAgICB9KVxuICAgICAgICBuZXdDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLnNoaXA7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIENoYW5nZSBjb29yZHMgaW4gZ2FtZWJvYXJkIHNoaXBzW10gb2JqZWN0XG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uY29vcmRzID0gbmV3Q29vcmRzO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBheGlzXG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcC5heGlzID0gbmV3QXhpcztcblxuICAgICAgICAvLyBGcm9udC1FbmQgY2hhbmdlc1xuICAgICAgICBVSS51cGRhdGVQbGFjZWRTaGlwcyhvbGRDb29yZHMsIG5ld0Nvb3Jkcywgc2hpcElkeCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpY2socGxheWVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAucGxheWVyLXNoaXBcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNsaWNrZWRcIik7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGV4dHJhY3Qgc2hpcElkeCBmcm9tIGdyaWRcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gWy4uLmdyaWQuY2xhc3NMaXN0XTtcbiAgICAgICAgICAgICAgICBsZXQgc2hpcElkeCA9IGNsYXNzZXMuZmluZCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zdGFydHNXaXRoKFwic2hpcC1cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2hpcElkeCA9IHNoaXBJZHguc2xpY2UoNSktMTtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIGNsYXNzIGFzc29jaWF0ZWQgd2l0aCBzaGlwICsgdXNlIGFzIGhhc2htYXAgdG8gcmVmZXJlbmNlIGV4YWN0IHNoaXAgb2JqZWN0IHVzZWQgaW4gZ2FtZWJvYXJkXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hpcE9iaiA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcDtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDb29yZHMgPSBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHhdLmNvb3JkcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBoZWFkID0gTWF0aC5taW4oLi4ub2xkQ29vcmRzKTtcblxuICAgICAgICAgICAgICAgIC8vIEF0dGVtcHQgcm90YXRpb25cbiAgICAgICAgICAgICAgICBpZiAoc2hpcE9iai5heGlzID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCAtLT4gVmVydGljYWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0Nvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcE9iai5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiBoZWFkICsgKHggKiAxMCkpOyAvLyBDb29yZHMgYXJyYXkgb2YgdmVydGljYWwgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEcm9wcGFibGUocGxheWVyLCBzaGlwT2JqLCBuZXdDb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBkcm9wcGFibGUgLSB0aGVuIHJvdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFrZShvbGRDb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHNoaXBPYmouYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcnRpY2FsIC0tPiBIb3Jpem9udGFsXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdDb29yZHMgPSBbLi4ubmV3IEFycmF5KHNoaXBPYmoubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4geCArIGhlYWQpOyAvLyBDb29yZHMgYXJyYXkgb2YgaG9yaXpvbnRhbCBzaGlwIGZyb20gaGVhZFxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3Q29vcmRzLmV2ZXJ5KCh4KSA9PiBNYXRoLmZsb29yKHgvMTApID09IE1hdGguZmxvb3IobmV3Q29vcmRzWzBdLzEwKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIGlzRHJvcHBhYmxlKHBsYXllciwgc2hpcE9iaiwgbmV3Q29vcmRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgMCk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdChwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hha2Uob2xkQ29vcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiAtIGFuaW1hdGUgY29vcmRzIHVzaW5nIGtleWZyYW1lcyBvYmplY3RcbiAgICBmdW5jdGlvbiBzaGFrZShjb29yZHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzaGFrZVwiKTsgIFxuICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGdyaWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcCR7aWR4fWApO1xuICAgICAgICAgICAgZ3JpZC5hbmltYXRlKFtcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoMnB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoNHB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoNHB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC00cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoMnB4LCAwLCAwKVwifSxcbiAgICAgICAgICAgICAgICB7dHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC0xcHgsIDAsIDApXCJ9XG4gICAgICAgICAgICBdLCA1MDApO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRlcm1pbmF0ZSgpIHtcbiAgICAgICAgcmVzZXRFdmVudHMoKTtcbiAgICAgICAgLy8gUmVzZXQgZHJhZ2dhYmxlIGNvbnRlbnRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgZmFsc2UpO1xuICAgICAgICAgICAgZ3JpZC5zdHlsZVsnY3Vyc29yJ10gPSAnYXV0byc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQsXG4gICAgICAgIHRlcm1pbmF0ZVxuICAgIH1cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IERyYWdEcm9wOyIsImNvbnN0IFNjb3JlQm9hcmQgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0aW5nXCIpXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NvcmVib2FyZCA+IGRpdlwiKS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgc2NvcmUuaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgIHNjb3JlLmNsYXNzTGlzdC5yZW1vdmUoXCJzY29yZS1zdW5rXCIpO1xuICAgICAgICB9KVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNjb3JlYm9hcmRcIikuZm9yRWFjaCgoc2NvcmVib2FyZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNjb3JlYm9hcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwJykpIHtcbiAgICAgICAgICAgICAgICAvLyBQbGF5ZXIncyBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHNjb3JlLmlkLnNsaWNlKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHgtMV0uc2hpcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3guY2xhc3NMaXN0LmFkZChcImJveFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7c2hpcElkeH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlLmFwcGVuZENoaWxkKGJveCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHV0ZXIgc2NvcmVib2FyZFxuICAgICAgICAgICAgICAgIFsuLi5zY29yZWJvYXJkLmNoaWxkcmVuXS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2NvcmUgZGl2IElEIGFzIGhhc2hjb2RlIHRvIGdhdGhlciBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBJZHggPSBzY29yZS5pZC5zbGljZSgtMSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcHV0ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHgtMV0uc2hpcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3guY2xhc3NMaXN0LmFkZChcImJveFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKGBzaGlwLSR7c2hpcElkeH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlLmFwcGVuZENoaWxkKGJveCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNjb3JlYm9hcmRcIikuZm9yRWFjaCgoc2NvcmVib2FyZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNjb3JlYm9hcmQuY2xhc3NMaXN0LmNvbnRhaW5zKCdwJykpIHtcbiAgICAgICAgICAgICAgICAvLyBQbGF5ZXIgc2NvcmVib2FyZFxuICAgICAgICAgICAgICAgIFsuLi5zY29yZWJvYXJkLmNoaWxkcmVuXS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2NvcmUgZGl2IElEIGFzIGhhc2hjb2RlIHRvIGdhdGhlciBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBJZHggPSBwYXJzZUludChzY29yZS5pZC50b1N0cmluZygpLnNsaWNlKC0xKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzW3NoaXBJZHgtMV0uc2hpcC5pc1N1bmspIHNjb3JlLmNsYXNzTGlzdC5hZGQoXCJzY29yZS1zdW5rXCIpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlICB7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHV0ZXIgc2NvcmVib2FyZFxuICAgICAgICAgICAgICAgIFsuLi5zY29yZWJvYXJkLmNoaWxkcmVuXS5mb3JFYWNoKChzY29yZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc2Ugc2NvcmUgZGl2IElEIGFzIGhhc2hjb2RlIHRvIGdhdGhlciBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNoaXBJZHggPSBwYXJzZUludChzY29yZS5pZC50b1N0cmluZygpLnNsaWNlKC0xKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wdXRlci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmlzU3Vuaykgc2NvcmUuY2xhc3NMaXN0LmFkZChcInNjb3JlLXN1bmtcIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjcmVhdGVTY29yZWJvYXJkLFxuICAgICAgICB1cGRhdGVTY29yZWJvYXJkXG4gICAgfVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgU2NvcmVCb2FyZDsiLCJpbXBvcnQgU2hpcCBmcm9tIFwiLi4vZmFjdG9yaWVzL3NoaXBcIjtcbmltcG9ydCBQbGF5ZXIgZnJvbSBcIi4uL2ZhY3Rvcmllcy9wbGF5ZXJcIjtcbmltcG9ydCBEcmFnRHJvcCBmcm9tIFwiLi9kcmFnRHJvcFwiO1xuaW1wb3J0IEJhdHRsZXNoaXBBSSBmcm9tIFwiLi9iYXR0bGVzaGlwQUlcIjtcbmltcG9ydCBTY29yZUJvYXJkIGZyb20gXCIuL3Njb3JlYm9hcmRcIjtcblxuaW1wb3J0IEdpdCBmcm9tICcuLi9hc3NldHMvZ2l0aHViLnBuZyc7XG5pbXBvcnQgRmF2IGZyb20gJy4uL2Fzc2V0cy9mYXZpY29uLnBuZyc7XG5cbmNvbnN0IFVJID0gKCgpID0+IHtcbiAgICBmdW5jdGlvbiBzZXR1cCgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnaXRodWJcIikuc3JjID0gR2l0O1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmF2aWNvbicpLnNldEF0dHJpYnV0ZSgnaHJlZicsIEZhdik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzcGxheUdyaWRzKCkge1xuICAgICAgICBsZXQgZ2FtZWJvYXJkUCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIik7XG4gICAgICAgIGdhbWVib2FyZFAuaW5uZXJIVE1MID0gXCJcIjsgLy8gQ2xlYXIgZXhpc3RpbmdcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZ3JpZFVuaXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGdyaWRVbml0LmNsYXNzTGlzdC5hZGQoJ2dyaWQtdW5pdCcpO1xuICAgICAgICAgICAgZ3JpZFVuaXQuaWQgPSBgcCR7aX1gOyAvLyBhc3NpZ24gZWFjaCBhbiBpZCBmcm9tIDAgdG8gbipuLTFcbiAgICBcbiAgICAgICAgICAgIGdyaWRVbml0LnN0eWxlLndpZHRoID0gYGNhbGMoMTAlIC0gM3B4KWA7XG4gICAgICAgICAgICBncmlkVW5pdC5zdHlsZS5oZWlnaHQgPSBgY2FsYygxMCUgLSAzcHgpYDtcbiAgICBcbiAgICAgICAgICAgIGdhbWVib2FyZFAuYXBwZW5kQ2hpbGQoZ3JpZFVuaXQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBnYW1lYm9hcmRDID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKTtcbiAgICAgICAgZ2FtZWJvYXJkQy5pbm5lckhUTUwgPSBcIlwiOyAvLyBDbGVhciBleGlzdGluZ1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkVW5pdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZ3JpZFVuaXQuY2xhc3NMaXN0LmFkZCgnZ3JpZC11bml0Jyk7XG4gICAgICAgICAgICBncmlkVW5pdC5pZCA9IGBjJHtpfWA7IC8vIGFzc2lnbiBlYWNoIGFuIGlkIGZyb20gMCB0byBuKm4tMVxuICAgIFxuICAgICAgICAgICAgZ3JpZFVuaXQuc3R5bGUud2lkdGggPSBgY2FsYygxMCUgLSAzcHgpYDtcbiAgICAgICAgICAgIGdyaWRVbml0LnN0eWxlLmhlaWdodCA9IGBjYWxjKDEwJSAtIDNweClgO1xuICAgIFxuICAgICAgICAgICAgZ2FtZWJvYXJkQy5hcHBlbmRDaGlsZChncmlkVW5pdCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdEdhbWUoKSB7XG4gICAgICAgIC8vIERPTSBmb3IgcHJlcCBzdGFnZVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnZmxleCdcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXN0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnbm9uZSdcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oZWFkZXItaGVscGVyXCIpLnRleHRDb250ZW50ID0gXCJBc3NlbWJsZSB0aGUgZmxlZXRcIjtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oZWFkZXItZGVzY1wiKS50ZXh0Q29udGVudCA9IFwiRHJhZyB0byBNb3ZlIGFuZCBDbGljayB0byBSb3RhdGVcIjtcblxuICAgICAgICAvLyBTZXQgZGlzcGxheSBmb3IgcGxheWVyIHRvIG1vdmUvcm90YXRlIHNoaXBzIC0+IHNob3cgcGxheWVyIGdyaWQsIGxvY2sgY29tcHV0ZXIgZ3JpZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrZWRcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcblxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllcjtcbiAgICAgICAgbGV0IGNvbXB1dGVyID0gbmV3IFBsYXllcjtcblxuICAgICAgICAvLyBDcmVhdGUgRE9NIGdyaWRzIGFuZCBkaXNwbGF5IFxuICAgICAgICBkaXNwbGF5R3JpZHMoKTtcblxuICAgICAgICAvLyBQbGFjZSBwbGF5ZXIgKyBjb21wdXRlciBzaGlwcyByYW5kb21seVxuICAgICAgICBwbGFjZVJhbmRvbVNoaXBzKHBsYXllcik7XG4gICAgICAgIHBsYWNlUmFuZG9tU2hpcHMoY29tcHV0ZXIpO1xuICAgICAgICBpbml0RGlzcGxheVNoaXBzKHBsYXllcixjb21wdXRlcik7XG5cbiAgICAgICAgLy8gQ3JlYXRlIERPTSBzY29yZWJvYXJkXG4gICAgICAgIFNjb3JlQm9hcmQuY3JlYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKTtcblxuICAgICAgICAvLyBBbGxvdyBwbGF5ZXIgdG8gbW92ZS9yb3RhdGUgc2hpcCBsb2NhdGlvbnNcbiAgICAgICAgcGxheWVyU2hpcFNlbGVjdChwbGF5ZXIpO1xuXG4gICAgICAgIC8vIFN0YXJ0IC0gU2hpcHMgc2VsZWN0ZWRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGFydFwiKS5vbmNsaWNrID0gKGUpID0+IHtcbiAgICAgICAgICAgIC8vIERPTSBmb3IgYmF0dGxlXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpLnN0eWxlWydkaXNwbGF5J10gPSAnbm9uZSc7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIikuc3R5bGVbJ2Rpc3BsYXknXSA9ICdmbGV4JztcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGVhZGVyLWhlbHBlclwiKS50ZXh0Q29udGVudCA9IFwiTGV0IHRoZSBiYXR0bGUgYmVnaW4hXCI7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmhlYWRlci1kZXNjXCIpLnRleHRDb250ZW50ID0gXCJLZWVwIGFuIGV5ZSBvbiB0aGUgc2NvcmVib2FyZFwiO1xuXG4gICAgICAgICAgICAvLyBTZXQgZGlzcGxheSB0byBQbGF5ZXIgQXR0YWNrIC0+IGxvY2sgcGxheWVyIGdyaWQsIHNob3cgY29tcHV0ZXIgZ3JpZCBmb3IgcGxheWVyIGF0dGFja1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQucFwiKS5jbGFzc0xpc3QuYWRkKFwibG9ja2VkXCIpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwibG9ja2VkXCIpO1xuXG4gICAgICAgICAgICBEcmFnRHJvcC50ZXJtaW5hdGUoKTsgLy8gVGVybWluYXRlIGdyaWQgZXZlbnRzXG4gICAgICAgICAgICBnYW1lTG9naWMocGxheWVyLCBjb21wdXRlcik7ICBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc3RhcnQgYnV0dG9uIG9uY2UgZ2FtZSBiZWdpbnNcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXN0YXJ0XCIpLm9uY2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaW5pdEdhbWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXllclNoaXBTZWxlY3QocGxheWVyKSB7XG4gICAgICAgIERyYWdEcm9wLmluaXQocGxheWVyKTtcbiAgICB9XG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gLSBSZXR1cm4gYXJyYXkgb2YgcmFuZG9tIGNvb3JkaW5hdGUgcGxhY2VtZW50IGJhc2VkIG9uIHNoaXAncyBsZW5ndGhcbiAgICBmdW5jdGlvbiByYW5kb21Db29yZGluYXRlcyhzaGlwKSB7XG4gICAgICAgIGxldCBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuICAgICAgICBsZXQgYXhpcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oICkqIDIpIC8vIDAgaXMgaG9yaXphbnRhbCwgMSBpcyB2ZXJ0aWNhbFxuICAgICAgICBsZXQgY29vcmRzID0gWy4uLm5ldyBBcnJheShzaGlwLmxlbmd0aCkua2V5cygpXTsgLy8gU3RhcnQgd2l0aCBjb29yZCBhcnJheSBvZiBbMC4uLm5dXG4gICAgICAgIGlmIChheGlzID09IDApIHtcbiAgICAgICAgICAgIC8vIEhvcml6b250YWxcbiAgICAgICAgICAgIGNvb3JkcyA9IGNvb3Jkcy5tYXAoKHgpID0+IHggKyBwb3MpO1xuICAgICAgICAgICAgLy8gRXJyb3IgY2hlY2sgKyBDeWNsZSB1bnRpbCB2YWxpZCAtIG11c3QgYWxsIGhhdmUgc2FtZSB4Ly8xMCB2YWx1ZSB0byBiZSBpbiBzYW1lIHktYXhpc1xuICAgICAgICAgICAgd2hpbGUgKCFjb29yZHMuZXZlcnkoKHgpID0+IE1hdGguZmxvb3IoeC8xMCkgPT0gTWF0aC5mbG9vcihjb29yZHNbMF0vMTApKSkge1xuICAgICAgICAgICAgICAgIGxldCBwb3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuICAgICAgICAgICAgICAgIGNvb3JkcyA9IGNvb3Jkcy5tYXAoKHgpID0+IHggKyBwb3MpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9yaXpvbnRhbCB6aWd6YWcgLSBDeWNsaW5nXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAvLyBWZXJ0aWNhbCAtIG11c3QgYWxsIGhhdmUgc2FtZSB4JTEwIHZhbHVlIHRvIGJlIGluIHNhbWUgeC1heGlzXG4gICAgICAgICAgICBjb29yZHMgPSBjb29yZHMubWFwKCh4KSA9PiBwb3MgKyAoMTAgKiB4KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHthcnJheTogY29vcmRzLCBheGlzfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVJhbmRvbVNoaXBzKHBsYXllcikge1xuICAgICAgICBsZXQgZmxlZXQgPSBbbmV3IFNoaXAoMiksIG5ldyBTaGlwKDMpLCBuZXcgU2hpcCgzKSwgbmV3IFNoaXAoNCksIG5ldyBTaGlwKDUpXTtcblxuICAgICAgICBmbGVldC5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29vcmRzID0gcmFuZG9tQ29vcmRpbmF0ZXMoc2hpcCk7XG4gICAgICAgICAgICAvLyBFcnJvciBjaGVjayBjeWNsZSB1bnRpbCB2YWxpZCAtIHRoZW4gcGxhY2VcbiAgICAgICAgICAgIHdoaWxlICghcGxheWVyLmdhbWVib2FyZC5pc1ZhbGlkUGxhY2VtZW50KHNoaXAsIGNvb3Jkcy5hcnJheSkpIHtcbiAgICAgICAgICAgICAgICBjb29yZHMgPSByYW5kb21Db29yZGluYXRlcyhzaGlwKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkludmFsaWQgcmFuZG9taXphdGlvbiAtIEN5Y2xpbmdcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQucGxhY2VTaGlwKHNoaXAsIGNvb3Jkcy5hcnJheSk7XG4gICAgICAgICAgICBzaGlwLnNldEF4aXMoY29vcmRzLmF4aXMpO1xuICAgICAgICB9KVxuICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXREaXNwbGF5U2hpcHMocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICAvLyBNYXJrIGVhY2ggc2hpcCB3aXRoIGNsYXNzIHRvIGRpc3Rpbmd1aXNoXG4gICAgICAgIGxldCBpID0gMTtcbiAgICAgICAgbGV0IGogPSAxO1xuICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtpfWApO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwicGxheWVyLXNoaXBcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9KVxuXG4gICAgICAgIC8vIE1hcmsgZWFjaCBzaGlwIHdpdGggY2xhc3MgdG8gZGlzdGluZ3Vpc2hcbiAgICAgICAgY29tcHV0ZXIuZ2FtZWJvYXJkLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtqfWApO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1oaWRkZW5cIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgaisrO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVBsYWNlZFNoaXBzKG9sZENvb3JkcywgbmV3Q29vcmRzLCBzaGlwSWR4KSB7XG4gICAgICAgIC8vIFJlcGxhY2UgY2xhc3NlcyBgc2hpcC0ke3NoaXBJZHh9YCArICdwbGF5ZXItc2hpcCdcbiAgICAgICAgb2xkQ29vcmRzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QucmVtb3ZlKGBzaGlwLSR7c2hpcElkeCsxfWApO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QucmVtb3ZlKGBwbGF5ZXItc2hpcGApO1xuICAgICAgICB9KVxuICAgICAgICBuZXdDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoYHBsYXllci1zaGlwYCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlR3JpZHMocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICAvLyBVcGRhdGUgcGxheWVyIGdyaWRzXG4gICAgICAgIGxldCBwbGF5ZXJBdHRhY2tzID0gcGxheWVyLmdhbWVib2FyZC5hdHRhY2tzO1xuICAgICAgICBwbGF5ZXJBdHRhY2tzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtZm91bmRcIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2lkeH1gKS5pbm5lckhUTUwgPSBcIiYjMTAwMDU7XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLW1pc3NlZFwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7aWR4fWApLmlubmVySFRNTCA9IFwiJiN4MjAyMjtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBVcGRhdGUgY29tcHV0ZXIgZ3JpZHNcbiAgICAgICAgbGV0IGNvbXBBdHRhY2tzID0gY29tcHV0ZXIuZ2FtZWJvYXJkLmF0dGFja3M7XG4gICAgICAgIGNvbXBBdHRhY2tzLmZvckVhY2goKGlkeCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbXB1dGVyLmdhbWVib2FyZC5ncmlkc1tpZHhdKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI2Mke2lkeH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1mb3VuZFwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjYyR7aWR4fWApLmNsYXNzTGlzdC5yZW1vdmUoXCJncmlkLWhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7aWR4fWApLmlubmVySFRNTCA9IFwiJiMxMDAwNTtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNjJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtbWlzc2VkXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtpZHh9YCkuaW5uZXJIVE1MID0gXCImI3gyMDIyO1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNoaXBzKHBsYXllciwgY29tcHV0ZXIpIHtcbiAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICBzaGlwT2JqLmNvb3Jkcy5mb3JFYWNoKChjb29yZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzaGlwT2JqLnNoaXAuaXNTdW5rKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1zdW5rXCIpO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7Y29vcmR9YCkuY2xhc3NMaXN0LnJlbW92ZShcImdyaWQtZm91bmRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKGNvbXB1dGVyKSB7XG4gICAgICAgICAgICBjb21wdXRlci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGlwT2JqLnNoaXAuaXNTdW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtc3Vua1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtjb29yZH1gKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ3JpZC1mb3VuZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2FtZUxvZ2ljKHBsYXllciwgY29tcHV0ZXIpIHtcbiAgICAgICAgY29uc3QgZ3JpZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5jID4gLmdyaWQtdW5pdFwiKTtcbiAgICAgICAgZ3JpZHMuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5vbmNsaWNrID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXB1dGVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpKSkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5Um91bmQocGxheWVyLCBjb21wdXRlciwgcGFyc2VJbnQoZ3JpZC5pZC5zbGljZSgxKSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgYXN5bmMgZnVuY3Rpb24gcGxheVJvdW5kKHBsYXllciwgY29tcHV0ZXIsIGlucHV0KSB7XG4gICAgICAgIC8vIEFUUCBnb3QgaW5wdXQgLT4gc2hvdyBwbGF5ZXIgZ3JpZCBmb3IgQUkgYXR0YWNrLCBsb2NrIGNvbXB1dGVyIGdyaWRcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQucFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwibG9ja2VkXCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG5cbiAgICAgICAgLy8gSGFuZGxlIHBsYXllcidzIGlucHV0IC0+IFVwZGF0ZSBHcmlkIERpc3BsYXkgLT4gQ2hlY2sgaWYgd2lubmVyXG4gICAgICAgIHBsYXllckF0dGFjayhjb21wdXRlciwgaW5wdXQpO1xuICAgICAgICB1cGRhdGVHcmlkcyhwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgdXBkYXRlU2hpcHMocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIFNjb3JlQm9hcmQudXBkYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgaWYgKGNvbXB1dGVyLmdhbWVib2FyZC5pc0dhbWVPdmVyKCkpIGdhbWVPdmVyKFwiUGxheWVyXCIsIHBsYXllcik7XG5cbiAgICAgICAgLy8gQ29tcHV0ZXIgQXR0YWNrIC0+IFVwZGF0ZSBHcmlkIERpc3BsYXkgLT4gQ2hlY2sgaWYgd2lubmVyXG4gICAgICAgIGF3YWl0IGRlbGF5KDUwMCk7XG5cbiAgICAgICAgQmF0dGxlc2hpcEFJLkFJQXR0YWNrKHBsYXllcik7XG4gICAgICAgIHVwZGF0ZUdyaWRzKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICB1cGRhdGVTaGlwcyhwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgU2NvcmVCb2FyZC51cGRhdGVTY29yZWJvYXJkKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICBpZiAocGxheWVyLmdhbWVib2FyZC5pc0dhbWVPdmVyKCkpIGdhbWVPdmVyKFwiQ29tcHV0ZXJcIiwgY29tcHV0ZXIpOzsgLy9UT0RPIC0gSGFuZGxlIGdhbWUgb3ZlclxuXG4gICAgICAgIC8vIFJldmVydCBkaXNwbGF5IHRvIFBsYXllciBBdHRhY2sgLT4gbG9jayBwbGF5ZXIgZ3JpZCwgc2hvdyBjb21wdXRlciBncmlkIGZvciBwbGF5ZXIgYXR0YWNrXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKS5jbGFzc0xpc3QucmVtb3ZlKFwibG9ja2VkXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYXllckF0dGFjayhjb21wdXRlciwgaW5wdXQpIHtcbiAgICAgICAgaWYgKCFjb21wdXRlci5nYW1lYm9hcmQuYXR0YWNrcy5pbmNsdWRlcyhpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbXB1dGVyLmdhbWVib2FyZC5yZWNlaXZlQXR0YWNrKGlucHV0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBkZWxheVxuICAgIGZ1bmN0aW9uIGRlbGF5KG1zKSB7ICAgIFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlcywgbXMpXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIElmIGdhbWVvdmVyLCBwb3AgbW9kYWwgYW5kIHNob3cgd2lubmVyIHVudGlsIHJlc3RhcnRcbiAgICBhc3luYyBmdW5jdGlvbiBnYW1lT3Zlcih3aW5uZXJUZXh0KSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmVzdWx0XCIpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXN1bHQtdGV4dFwiKTtcbiAgICAgICAgY29uc3QgcmVzdGFydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheS1hZ2FpblwiKTtcblxuICAgICAgICAvLyBUT0RPIC0gY3JlYXRlIGdhbWUgb3ZlciBzdHlsaW5nIHRyYW5zaXRpb24gaW4gd2lubmluZyBwbGF5ZXIgZ3JpZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG4gICAgICAgIGF3YWl0IGRlbGF5KDEwMDApO1xuXG4gICAgICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoXCJyZXN1bHQtZGlzcGxheWVkXCIpO1xuICAgICAgICB0ZXh0LnRleHRDb250ZW50ID0gYCR7d2lubmVyVGV4dH0gd2lucyFgXG5cbiAgICAgICAgcmVzdGFydC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzdGFydCBnYW1lXG4gICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKFwicmVzdWx0LWRpc3BsYXllZFwiKTtcbiAgICAgICAgICAgIGluaXRHYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXR1cCxcbiAgICAgICAgZGlzcGxheUdyaWRzLFxuICAgICAgICBpbml0R2FtZSxcbiAgICAgICAgdXBkYXRlUGxhY2VkU2hpcHNcbiAgICB9XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFVJOyIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9QXJzZW5hbCtTQzppdGFsLHdnaHRAMCw0MDA7MCw3MDA7MSw0MDA7MSw3MDAmZGlzcGxheT1zd2FwKTtcIl0pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKiBGb250ICsgbWV0YSAqL1xuXG5pbWcge1xuICAgIG1heC13aWR0aDogMTAwJTtcbn1cblxuYm9keSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIG1hcmdpbjogMDtcblxuICAgIGZvbnQtZmFtaWx5OiBcIkFyc2VuYWwgU0NcIiwgc2Fucy1zZXJpZjtcbiAgICBmb250LXdlaWdodDogNDAwO1xuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcbn1cblxuLyogSGVhZGVyICovXG4uaGVhZGVyIHtcbiAgICBoZWlnaHQ6IDEyMHB4O1xuICAgIFxuICAgIGZvbnQtc2l6ZTogNDJweDtcbiAgICBtYXJnaW4tdG9wOiAxNXB4O1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5oZWFkZXItZGVzYyB7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbn1cbi8qIFN0YXJ0L3Jlc3RhcnQgYnV0dG9uICovXG4vKiBDU1MgKi9cbi5oZWFkLWJ0biB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGNvbG9yOiAjMDAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZpbGw6ICMwMDA7XG4gIGZvbnQtZmFtaWx5OiBcIkFyc2VuYWwgU0NcIiwgc2Fucy1zZXJpZjtcbiAgZm9udC1zaXplOiAxOHB4O1xuICBmb250LXdlaWdodDogNDAwO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgbGV0dGVyLXNwYWNpbmc6IC0uOHB4O1xuICBsaW5lLWhlaWdodDogMjRweDtcbiAgbWluLXdpZHRoOiAxODBweDtcbiAgb3V0bGluZTogMDtcbiAgcGFkZGluZzogOHB4IDEwcHg7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XG5cbiAgbWFyZ2luLXRvcDogMjVweDtcbn1cblxuLmhlYWQtYnRuOmZvY3VzIHtcbiAgY29sb3I6ICMxNzFlMjk7XG59XG5cbi5oZWFkLWJ0bjpob3ZlciB7XG4gIGJvcmRlci1jb2xvcjogIzA2ZjtcbiAgY29sb3I6ICMwNmY7XG4gIGZpbGw6ICMwNmY7XG59XG5cbi5oZWFkLWJ0bjphY3RpdmUge1xuICBib3JkZXItY29sb3I6ICMwNmY7XG4gIGNvbG9yOiAjMDZmO1xuICBmaWxsOiAjMDZmO1xufVxuXG4ubWFpbiB7XG4gICAgZmxleDogMTtcblxuICAgIG1hcmdpbjogYXV0bztcbiAgICB3aWR0aDogODAlO1xuXG4gICAgZGlzcGxheTogZmxleDtcblxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5wbGF5ZXIsIC5jb21wdXRlciB7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIG1pbi13aWR0aDogNDQlO1xuXG4gICAgcGFkZGluZy10b3A6IDVweDtcbiAgICBwYWRkaW5nLWJvdHRvbTogNzVweDtcblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcblxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5nYW1lYm9hcmQtbGFiZWwge1xuICAgIG1hcmdpbjogMTBweDtcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbn1cblxuLyogR2FtZWJvYXJkIHN0eWxpbmcgKi9cbi5nYW1lYm9hcmQge1xuICAgIGhlaWdodDogNDIwcHg7XG4gICAgd2lkdGg6IDQyMHB4O1xuXG4gICAgLyogb3V0bGluZTogMXB4IHNvbGlkIGJsYWNrOyAqL1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG5cbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcbn1cblxuLmxvY2tlZCxcbi5nYW1lYm9hcmQtbGFiZWw6aGFzKCsgLmxvY2tlZCkge1xuICAgIG9wYWNpdHk6IDAuNDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cblxuLyogR3JpZC11bml0cyBzdHlsaW5nIC0gYWxsIHN0YXRlcyAqL1xuLyogRW1wdHkgR3JpZCAtIGRlZmF1bHQgKi9cbi5ncmlkLXVuaXQge1xuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWFyZ2luOiAxLjVweDsgLyogY291cGxlZCB3aXRoIFVJLmRpc3BsYXlHcmlkcygpKi9cblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmdhbWVib2FyZC5jIHtcbiAgICBjdXJzb3I6IGNyb3NzaGFpcjtcbn1cblxuLmdyaWQtbWlzc2VkIHtcbiAgICBmb250LXNpemU6IDI0cHg7XG4gICAgb3V0bGluZTogcmdiKDIyMCwzNiwzMSkgc29saWQgMC41cHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMjAsMzYsMzEsIDAuMyk7XG59XG5cbi8qIFByaW9yaXR5IFN0YXRlIFN0eWxpbmcgLT4gQW55IDMgb2YgdGhlc2Ugd2lsbCBub3QgYmUgbXV0dWFsbHkgYXBwbGllZCBhdCBhbnkgcG9pbnQqL1xuLmdyaWQtaGlkZGVuIHtcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlICFpbXBvcnRhbnQ7ICAgIFxufVxuXG4uZ3JpZC1mb3VuZCB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIG91dGxpbmU6IHJnYigyMywxNTksMTAyKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMsMTU5LDEwMiwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4uZ3JpZC1zdW5rIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoOTIsIDE1OCwgMTczLCAwLjEpICFpbXBvcnRhbnQ7XG59XG5cbi8qIEdyaWQtc2hpcCBpbmRpdmlkdWFsIHN0eWxpbmcqL1xuLnNoaXAtMSB7XG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDIwLDI1NSwgMC4zKTtcbn1cblxuLnNoaXAtMiB7XG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpO1xufVxuXG4uc2hpcC0zIHtcbiAgICBvdXRsaW5lOiByZ2IoNTEsMTAyLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsMTAyLDI1NSwgMC4zKTtcbn1cblxuLnNoaXAtNCB7XG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LDEzNiwyNTUsIDAuMyk7XG59XG5cbi5zaGlwLTUge1xuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMyk7XG59XG5cbi8qIERyYWcgZHJvcCBwcmV2aWV3IHN0eWxpbmcgZm9yIGVhY2ggc2hpcCovXG4ucHJldmlldy1zaGlwLTEge1xuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDIwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4ucHJldmlldy1zaGlwLTIge1xuICAgIG91dGxpbmU6IHJnYigyMCw1MCwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5wcmV2aWV3LXNoaXAtMyB7XG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsMTAyLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4ucHJldmlldy1zaGlwLTQge1xuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LDEzNiwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnByZXZpZXctc2hpcC01IHtcbiAgICBvdXRsaW5lOiByZ2IoMTE5LDE3MCwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnNoaXAtZHJvcHBhYmxlIHtcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzMSwyNDUsMjQ0LDAuNik7XG59XG5cbi8qIFNjb3JlYm9hcmQgU3R5bGluZyAqL1xuXG4uc2NvcmVib2FyZC1sYWJlbCB7XG4gICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xufVxuXG4uc2NvcmVib2FyZCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblxuICAgIGdhcDogMTBweDtcbn1cblxuLnNjb3JlYm9hcmQgPiBkaXYge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZ2FwOiAxcHg7XG59XG5cbi5zY29yZWJvYXJkID4gZGl2LnNjb3JlLXN1bmsge1xuICAgIGRpc3BsYXk6IG5vbmU7XG59XG5cbi5ib3gge1xuICAgIG91dGxpbmU6IDBweCAhaW1wb3J0YW50O1xuICAgIHdpZHRoOiAxNXB4O1xuICAgIGhlaWdodDogMTVweDtcbn1cblxuXG4vKiByZXN1bHRzIG1vZGFsIHN0eWxpbmcgKi9cbmRpYWxvZzo6YmFja2Ryb3Age1xuICAgIG9wYWNpdHk6IDAuOTtcbn1cblxuLnJlc3VsdCB7XG4gICAgd2lkdGg6IDQwJTtcbiAgICBoZWlnaHQ6IDQwdmg7XG5cbiAgICBib3JkZXI6IDFweCBzb2xpZCBibGFjaztcbn1cblxuLyogcmVzdWx0IG1vZGFsIGZsZXggdG8gYmUgcnVuIG9ubHkgd2hlbiBkaXNwbGF5ZWQgKi9cbi5yZXN1bHQtZGlzcGxheWVkIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuXG4ucmVzdWx0LXRleHQge1xuICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgZm9udC1zaXplOiA0MnB4O1xufVxuXG4jcGxheS1hZ2FpbiB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMyMjIyMjI7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGNvbG9yOiAjMjIyMjIyO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgZm9udC1mYW1pbHk6ICdBcnNlbmFsIFNDJywtYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxSb2JvdG8sXCJIZWx2ZXRpY2EgTmV1ZVwiLHNhbnMtc2VyaWY7XG4gIGZvbnQtc2l6ZTogMTZweDtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gIG1hcmdpbjogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgcGFkZGluZzogMTNweCAyM3B4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcbiAgdHJhbnNpdGlvbjogYm94LXNoYWRvdyAuMnMsLW1zLXRyYW5zZm9ybSAuMXMsLXdlYmtpdC10cmFuc2Zvcm0gLjFzLHRyYW5zZm9ybSAuMXM7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICB3aWR0aDogYXV0bztcbn1cblxuI3BsYXktYWdhaW46YWN0aXZlIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogI0Y3RjdGNztcbiAgYm9yZGVyLWNvbG9yOiAjMDAwMDAwO1xuICB0cmFuc2Zvcm06IHNjYWxlKC45Nik7XG59XG5cbiNwbGF5LWFnYWluOmRpc2FibGVkIHtcbiAgYm9yZGVyLWNvbG9yOiAjREREREREO1xuICBjb2xvcjogI0RERERERDtcbiAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbiAgb3BhY2l0eTogMTtcbn1cblxuLmZvb3RlciB7XG4gICAgZm9udC1mYW1pbHk6IFwiQXJzZW5hbCBTQ1wiLCBzYW5zLXNlcmlmO1xuXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgY29sb3I6IGJsYWNrO1xuICAgIGhlaWdodDogMTAwcHg7XG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cbiAgICBmb250LXNpemU6IDE2cHg7XG59XG5cbi5naXRodWItbG9nbyB7XG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG4gICAgd2lkdGg6IDI0cHg7XG4gICAgaGVpZ2h0OiAyNHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmdpdGh1Yi1hIGltZ3tcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgdHJhbnNpdGlvbjogYWxsIDMwMG1zO1xufVxuXG4uZ2l0aHViLWEgaW1nOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZykgc2NhbGUoMS4xKTtcbn1cblxuLyogTWVkaWEgcXVlcnkgKi9cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMzAwcHgpIHtcbiAgICAubWFpbiB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgIH1cbn1cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMDAwcHgpIHtcbiAgICAuZ2FtZWJvYXJkIHtcbiAgICAgICAgd2lkdGg6IDM1MHB4O1xuICAgICAgICBoZWlnaHQ6IDM1MHB4O1xuICAgIH1cbiAgICAubWFpbiB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgIH1cbn1cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MDBweCkge1xuICAgIC5tYWluIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gICAgLmhlYWRlciB7XG4gICAgICAgIGhlaWdodDogMjAwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gICAgfVxuICAgIC5nYW1lYm9hcmQge1xuICAgICAgICB3aWR0aDogNDcwcHg7XG4gICAgICAgIGhlaWdodDogNDcwcHg7XG4gICAgfVxufVxuXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ4MHB4KSB7XG4gICAgLmdhbWVib2FyZCB7XG4gICAgICAgIHdpZHRoOiAzNTBweDtcbiAgICAgICAgaGVpZ2h0OiAzNTBweDtcbiAgICB9XG59YCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLGdCQUFnQjs7QUFHaEI7SUFDSSxlQUFlO0FBQ25COztBQUVBO0lBQ0ksYUFBYTtJQUNiLHNCQUFzQjtJQUN0QixTQUFTOztJQUVULHFDQUFxQztJQUNyQyxnQkFBZ0I7SUFDaEIsa0JBQWtCO0FBQ3RCOztBQUVBLFdBQVc7QUFDWDtJQUNJLGFBQWE7O0lBRWIsZUFBZTtJQUNmLGdCQUFnQjs7SUFFaEIsYUFBYTtJQUNiLHNCQUFzQjtJQUN0Qix1QkFBdUI7SUFDdkIsbUJBQW1CO0FBQ3ZCOztBQUVBO0lBQ0ksZUFBZTtJQUNmLGtCQUFrQjtB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QXNCO0lBQzFCO0lBQ0E7UUFDSSxhQUFhO1FBQ2IsbUJBQW1CO0lBQ3ZCO0lBQ0E7UUFDSSxZQUFZO1FBQ1osYUFBYTtJQUNqQjtBQUNKOztBQUVBO0lBQ0k7UUFDSSxZQUFZO1FBQ1osYUFBYTtJQUNqQjtBQUNKXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi8qIEZvbnQgKyBtZXRhICovXFxuQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9QXJzZW5hbCtTQzppdGFsLHdnaHRAMCw0MDA7MCw3MDA7MSw0MDA7MSw3MDAmZGlzcGxheT1zd2FwJyk7XFxuXFxuaW1nIHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG5ib2R5IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgbWFyZ2luOiAwO1xcblxcbiAgICBmb250LWZhbWlseTogXFxcIkFyc2VuYWwgU0NcXFwiLCBzYW5zLXNlcmlmO1xcbiAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcblxcbi8qIEhlYWRlciAqL1xcbi5oZWFkZXIge1xcbiAgICBoZWlnaHQ6IDEyMHB4O1xcbiAgICBcXG4gICAgZm9udC1zaXplOiA0MnB4O1xcbiAgICBtYXJnaW4tdG9wOiAxNXB4O1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuLmhlYWRlci1kZXNjIHtcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XFxufVxcbi8qIFN0YXJ0L3Jlc3RhcnQgYnV0dG9uICovXFxuLyogQ1NTICovXFxuLmhlYWQtYnRuIHtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBjb2xvcjogIzAwMDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmaWxsOiAjMDAwO1xcbiAgZm9udC1mYW1pbHk6IFxcXCJBcnNlbmFsIFNDXFxcIiwgc2Fucy1zZXJpZjtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGxldHRlci1zcGFjaW5nOiAtLjhweDtcXG4gIGxpbmUtaGVpZ2h0OiAyNHB4O1xcbiAgbWluLXdpZHRoOiAxODBweDtcXG4gIG91dGxpbmU6IDA7XFxuICBwYWRkaW5nOiA4cHggMTBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIHRyYW5zaXRpb246IGFsbCAuM3M7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XFxuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcXG5cXG4gIG1hcmdpbi10b3A6IDI1cHg7XFxufVxcblxcbi5oZWFkLWJ0bjpmb2N1cyB7XFxuICBjb2xvcjogIzE3MWUyOTtcXG59XFxuXFxuLmhlYWQtYnRuOmhvdmVyIHtcXG4gIGJvcmRlci1jb2xvcjogIzA2ZjtcXG4gIGNvbG9yOiAjMDZmO1xcbiAgZmlsbDogIzA2ZjtcXG59XFxuXFxuLmhlYWQtYnRuOmFjdGl2ZSB7XFxuICBib3JkZXItY29sb3I6ICMwNmY7XFxuICBjb2xvcjogIzA2ZjtcXG4gIGZpbGw6ICMwNmY7XFxufVxcblxcbi5tYWluIHtcXG4gICAgZmxleDogMTtcXG5cXG4gICAgbWFyZ2luOiBhdXRvO1xcbiAgICB3aWR0aDogODAlO1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcblxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuLnBsYXllciwgLmNvbXB1dGVyIHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBtaW4td2lkdGg6IDQ0JTtcXG5cXG4gICAgcGFkZGluZy10b3A6IDVweDtcXG4gICAgcGFkZGluZy1ib3R0b206IDc1cHg7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuXFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5nYW1lYm9hcmQtbGFiZWwge1xcbiAgICBtYXJnaW46IDEwcHg7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcbn1cXG5cXG4vKiBHYW1lYm9hcmQgc3R5bGluZyAqL1xcbi5nYW1lYm9hcmQge1xcbiAgICBoZWlnaHQ6IDQyMHB4O1xcbiAgICB3aWR0aDogNDIwcHg7XFxuXFxuICAgIC8qIG91dGxpbmU6IDFweCBzb2xpZCBibGFjazsgKi9cXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiB3cmFwO1xcblxcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG59XFxuXFxuLmxvY2tlZCxcXG4uZ2FtZWJvYXJkLWxhYmVsOmhhcygrIC5sb2NrZWQpIHtcXG4gICAgb3BhY2l0eTogMC40O1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuXFxuLyogR3JpZC11bml0cyBzdHlsaW5nIC0gYWxsIHN0YXRlcyAqL1xcbi8qIEVtcHR5IEdyaWQgLSBkZWZhdWx0ICovXFxuLmdyaWQtdW5pdCB7XFxuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4O1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBtYXJnaW46IDEuNXB4OyAvKiBjb3VwbGVkIHdpdGggVUkuZGlzcGxheUdyaWRzKCkqL1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuLmdhbWVib2FyZC5jIHtcXG4gICAgY3Vyc29yOiBjcm9zc2hhaXI7XFxufVxcblxcbi5ncmlkLW1pc3NlZCB7XFxuICAgIGZvbnQtc2l6ZTogMjRweDtcXG4gICAgb3V0bGluZTogcmdiKDIyMCwzNiwzMSkgc29saWQgMC41cHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjIwLDM2LDMxLCAwLjMpO1xcbn1cXG5cXG4vKiBQcmlvcml0eSBTdGF0ZSBTdHlsaW5nIC0+IEFueSAzIG9mIHRoZXNlIHdpbGwgbm90IGJlIG11dHVhbGx5IGFwcGxpZWQgYXQgYW55IHBvaW50Ki9cXG4uZ3JpZC1oaWRkZW4ge1xcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZSAhaW1wb3J0YW50OyAgICBcXG59XFxuXFxuLmdyaWQtZm91bmQge1xcbiAgICBmb250LXNpemU6IDEycHg7XFxuICAgIG91dGxpbmU6IHJnYigyMywxNTksMTAyKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzLDE1OSwxMDIsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLmdyaWQtc3VuayB7XFxuICAgIGZvbnQtc2l6ZTogMTJweDtcXG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDkyLCAxNTgsIDE3MywgMC4xKSAhaW1wb3J0YW50O1xcbn1cXG5cXG4vKiBHcmlkLXNoaXAgaW5kaXZpZHVhbCBzdHlsaW5nKi9cXG4uc2hpcC0xIHtcXG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwyMCwyNTUsIDAuMyk7XFxufVxcblxcbi5zaGlwLTIge1xcbiAgICBvdXRsaW5lOiByZ2IoMjAsNTAsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC0zIHtcXG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwxMDIsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC00IHtcXG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4NSwxMzYsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC01IHtcXG4gICAgb3V0bGluZTogcmdiKDExOSwxNzAsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMyk7XFxufVxcblxcbi8qIERyYWcgZHJvcCBwcmV2aWV3IHN0eWxpbmcgZm9yIGVhY2ggc2hpcCovXFxuLnByZXZpZXctc2hpcC0xIHtcXG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDIwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xcbn1cXG5cXG4ucHJldmlldy1zaGlwLTIge1xcbiAgICBvdXRsaW5lOiByZ2IoMjAsNTAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMCw1MCwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC0zIHtcXG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLDEwMiwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC00IHtcXG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LDEzNiwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC01IHtcXG4gICAgb3V0bGluZTogcmdiKDExOSwxNzAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMTksMTcwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xcbn1cXG5cXG4uc2hpcC1kcm9wcGFibGUge1xcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzEsMjQ1LDI0NCwwLjYpO1xcbn1cXG5cXG4vKiBTY29yZWJvYXJkIFN0eWxpbmcgKi9cXG5cXG4uc2NvcmVib2FyZC1sYWJlbCB7XFxuICAgIG1hcmdpbi10b3A6IDIwcHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XFxufVxcblxcbi5zY29yZWJvYXJkIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuXFxuICAgIGdhcDogMTBweDtcXG59XFxuXFxuLnNjb3JlYm9hcmQgPiBkaXYge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBnYXA6IDFweDtcXG59XFxuXFxuLnNjb3JlYm9hcmQgPiBkaXYuc2NvcmUtc3VuayB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5ib3gge1xcbiAgICBvdXRsaW5lOiAwcHggIWltcG9ydGFudDtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG59XFxuXFxuXFxuLyogcmVzdWx0cyBtb2RhbCBzdHlsaW5nICovXFxuZGlhbG9nOjpiYWNrZHJvcCB7XFxuICAgIG9wYWNpdHk6IDAuOTtcXG59XFxuXFxuLnJlc3VsdCB7XFxuICAgIHdpZHRoOiA0MCU7XFxuICAgIGhlaWdodDogNDB2aDtcXG5cXG4gICAgYm9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxufVxcblxcbi8qIHJlc3VsdCBtb2RhbCBmbGV4IHRvIGJlIHJ1biBvbmx5IHdoZW4gZGlzcGxheWVkICovXFxuLnJlc3VsdC1kaXNwbGF5ZWQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcblxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuLnJlc3VsdC10ZXh0IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMzBweDtcXG4gICAgZm9udC1zaXplOiA0MnB4O1xcbn1cXG5cXG4jcGxheS1hZ2FpbiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZGRkZGO1xcbiAgYm9yZGVyOiAxcHggc29saWQgIzIyMjIyMjtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBjb2xvcjogIzIyMjIyMjtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGZvbnQtZmFtaWx5OiAnQXJzZW5hbCBTQycsLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsUm9ib3RvLFxcXCJIZWx2ZXRpY2EgTmV1ZVxcXCIsc2Fucy1zZXJpZjtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICBsaW5lLWhlaWdodDogMjBweDtcXG4gIG1hcmdpbjogMDtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICBwYWRkaW5nOiAxM3B4IDIzcHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcXG4gIHRyYW5zaXRpb246IGJveC1zaGFkb3cgLjJzLC1tcy10cmFuc2Zvcm0gLjFzLC13ZWJraXQtdHJhbnNmb3JtIC4xcyx0cmFuc2Zvcm0gLjFzO1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xcbiAgd2lkdGg6IGF1dG87XFxufVxcblxcbiNwbGF5LWFnYWluOmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRjdGN0Y3O1xcbiAgYm9yZGVyLWNvbG9yOiAjMDAwMDAwO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSguOTYpO1xcbn1cXG5cXG4jcGxheS1hZ2FpbjpkaXNhYmxlZCB7XFxuICBib3JkZXItY29sb3I6ICNEREREREQ7XFxuICBjb2xvcjogI0RERERERDtcXG4gIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG5cXG4uZm9vdGVyIHtcXG4gICAgZm9udC1mYW1pbHk6IFxcXCJBcnNlbmFsIFNDXFxcIiwgc2Fucy1zZXJpZjtcXG5cXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIGNvbG9yOiBibGFjaztcXG4gICAgaGVpZ2h0OiAxMDBweDtcXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG59XFxuXFxuLmdpdGh1Yi1sb2dvIHtcXG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XFxuICAgIHdpZHRoOiAyNHB4O1xcbiAgICBoZWlnaHQ6IDI0cHg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG4uZ2l0aHViLWEgaW1ne1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICAgIHRyYW5zaXRpb246IGFsbCAzMDBtcztcXG59XFxuXFxuLmdpdGh1Yi1hIGltZzpob3ZlciB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZykgc2NhbGUoMS4xKTtcXG59XFxuXFxuLyogTWVkaWEgcXVlcnkgKi9cXG5cXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDEzMDBweCkge1xcbiAgICAubWFpbiB7XFxuICAgICAgICB3aWR0aDogMTAwJTtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAuZ2FtZWJvYXJkIHtcXG4gICAgICAgIHdpZHRoOiAzNTBweDtcXG4gICAgICAgIGhlaWdodDogMzUwcHg7XFxuICAgIH1cXG4gICAgLm1haW4ge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MDBweCkge1xcbiAgICAubWFpbiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgfVxcbiAgICAuaGVhZGVyIHtcXG4gICAgICAgIGhlaWdodDogMjAwcHg7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xcbiAgICB9XFxuICAgIC5nYW1lYm9hcmQge1xcbiAgICAgICAgd2lkdGg6IDQ3MHB4O1xcbiAgICAgICAgaGVpZ2h0OiA0NzBweDtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ4MHB4KSB7XFxuICAgIC5nYW1lYm9hcmQge1xcbiAgICAgICAgd2lkdGg6IDM1MHB4O1xcbiAgICAgICAgaGVpZ2h0OiAzNTBweDtcXG4gICAgfVxcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcbm9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYztcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaSA9IHNjcmlwdHMubGVuZ3RoIC0gMTtcblx0XHRcdHdoaWxlIChpID4gLTEgJiYgKCFzY3JpcHRVcmwgfHwgIS9eaHR0cChzPyk6Ly50ZXN0KHNjcmlwdFVybCkpKSBzY3JpcHRVcmwgPSBzY3JpcHRzW2ktLV0uc3JjO1xuXHRcdH1cblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCJpbXBvcnQgJy4vc3R5bGUvc3R5bGUuY3NzJztcbmltcG9ydCBVSSBmcm9tICcuL21vZHVsZXMvdWknXG5cblVJLnNldHVwKCk7XG5VSS5pbml0R2FtZSgpO1xuIl0sIm5hbWVzIjpbIlNoaXAiLCJHYW1lYm9hcmQiLCJjb25zdHJ1Y3RvciIsImdyaWRzIiwiQXJyYXkiLCJmaWxsIiwiYXR0YWNrcyIsInNoaXBzIiwiaXNWYWxpZFBsYWNlbWVudCIsInNoaXAiLCJjb29yZHMiLCJpc1ZhbGlkIiwiZm9yRWFjaCIsImlkeCIsImxlbmd0aCIsInBsYWNlU2hpcCIsInB1c2giLCJyZWNlaXZlQXR0YWNrIiwiY29vcmQiLCJpbmNsdWRlcyIsImhpdCIsImdldE1pc3NlcyIsIm1pc3NlcyIsImF0dGFjayIsImdldFJlbWFpbmluZyIsInJlbWFpbmluZyIsImkiLCJpc0dhbWVPdmVyIiwiZ2FtZW92ZXIiLCJzaGlwT2JqIiwiaXNTdW5rIiwiUGxheWVyIiwiZ2FtZWJvYXJkIiwiYXhpcyIsImFyZ3VtZW50cyIsInVuZGVmaW5lZCIsImhpdHMiLCJzZXRBeGlzIiwiZ2V0QXhpcyIsIkRyYWdEcm9wIiwiU2NvcmVCb2FyZCIsIkJhdHRsZXNoaXBBSSIsIkFJQXR0YWNrIiwicGxheWVyIiwiaGl0c05vdFN1bmsiLCJmaWx0ZXIiLCJ0YXJnZXQiLCJjb25zb2xlIiwibG9nIiwidGFyZ2V0SGl0cyIsIk5XU0UiLCJiYXNlIiwib2Zmc2V0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibmV4dCIsIm1pbiIsInJlbWFpbmluZ1NoaXBzIiwiY2hlY2tJZkZpdCIsInNoaXBMZW5ndGgiLCJXRSIsIm1heCIsIk5TIiwib3B0aW9ucyIsIlVJIiwiaW5pdCIsInJlc2V0RXZlbnRzIiwic2V0RHJhZ2dhYmxlQXJlYSIsImRyYWciLCJjbGljayIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImdyaWQiLCJvbmRyYWdzdGFydCIsImUiLCJvbmRyYWdlbnRlciIsInByZXZlbnREZWZhdWx0Iiwib25kcmFnZW5kIiwib25kcmFnb3ZlciIsIm9uY2xpY2siLCJzZXRBdHRyaWJ1dGUiLCJzdHlsZSIsInBsYXllclNoaXBzIiwiaXNEcm9wcGFibGUiLCJzZXREcm9wcGFibGVBcmVhIiwic2hpcE9mZnNldCIsImNsYXNzTGlzdCIsInJlbW92ZSIsInBsYXllckdyaWRzIiwiaGVhZCIsInBhcnNlSW50IiwiaWQiLCJzbGljZSIsImtleXMiLCJtYXAiLCJ4IiwiZXZlcnkiLCJhZGQiLCJnZXRFbGVtZW50QnlJZCIsImRhdGFUcmFuc2ZlciIsImVmZmVjdEFsbG93ZWQiLCJjbGFzc2VzIiwic2hpcElkeCIsImZpbmQiLCJ2YWx1ZSIsInN0YXJ0c1dpdGgiLCJzb3J0IiwiYSIsImIiLCJmaW5kSW5kZXgiLCJkcmFnRW50ZXIiLCJkcmFnRW5kIiwiZHJvcHBhYmxlIiwiZHJvcEVmZmVjdCIsInByZXZpZXciLCJxdWVyeVNlbGVjdG9yIiwiZHJhZ0Ryb3AiLCJwb3RlbnRpYWxDb29yZHMiLCJvbmRyb3AiLCJvbGRDb29yZHMiLCJyZXBsYWNlU2hpcCIsIm5ld0Nvb3JkcyIsIm5ld0F4aXMiLCJ1cGRhdGVQbGFjZWRTaGlwcyIsInNoYWtlIiwiYW5pbWF0ZSIsInRyYW5zZm9ybSIsInRlcm1pbmF0ZSIsImNyZWF0ZVNjb3JlYm9hcmQiLCJjb21wdXRlciIsInNjb3JlIiwiaW5uZXJIVE1MIiwic2NvcmVib2FyZCIsImNvbnRhaW5zIiwiY2hpbGRyZW4iLCJib3giLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJ1cGRhdGVTY29yZWJvYXJkIiwidG9TdHJpbmciLCJHaXQiLCJGYXYiLCJzZXR1cCIsInNyYyIsImRpc3BsYXlHcmlkcyIsImdhbWVib2FyZFAiLCJncmlkVW5pdCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2FtZWJvYXJkQyIsImluaXRHYW1lIiwidGV4dENvbnRlbnQiLCJwbGFjZVJhbmRvbVNoaXBzIiwiaW5pdERpc3BsYXlTaGlwcyIsInBsYXllclNoaXBTZWxlY3QiLCJnYW1lTG9naWMiLCJyYW5kb21Db29yZGluYXRlcyIsInBvcyIsImFycmF5IiwiZmxlZXQiLCJqIiwidXBkYXRlR3JpZHMiLCJwbGF5ZXJBdHRhY2tzIiwiY29tcEF0dGFja3MiLCJ1cGRhdGVTaGlwcyIsInBsYXlSb3VuZCIsImlucHV0IiwicGxheWVyQXR0YWNrIiwiZ2FtZU92ZXIiLCJkZWxheSIsIm1zIiwiUHJvbWlzZSIsInJlcyIsInJlaiIsInNldFRpbWVvdXQiLCJ3aW5uZXJUZXh0IiwiZGlhbG9nIiwidGV4dCIsInJlc3RhcnQiLCJzaG93TW9kYWwiLCJjbG9zZSJdLCJzb3VyY2VSb290IjoiIn0=