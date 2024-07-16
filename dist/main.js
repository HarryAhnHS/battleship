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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGlDQUFpQzs7QUFFakM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7QUFFbkI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsT0FBTyw4RkFBOEYsTUFBTSxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksWUFBWSxZQUFZLGFBQWEsYUFBYSxPQUFPLFVBQVUsS0FBSyxXQUFXLFVBQVUsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksTUFBTSxZQUFZLFdBQVcsS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFVBQVUsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGNBQWMsYUFBYSxPQUFPLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxXQUFXLFVBQVUsTUFBTSxLQUFLLFlBQVksV0FBVyxVQUFVLE1BQU0sS0FBSyxXQUFXLFVBQVUsV0FBVyxXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxXQUFXLFlBQVksY0FBYyxXQUFXLGFBQWEsYUFBYSxPQUFPLEtBQUssVUFBVSxZQUFZLE9BQU8sWUFBWSxNQUFNLFVBQVUsV0FBVyxhQUFhLFdBQVcsV0FBVyxZQUFZLE9BQU8sTUFBTSxVQUFVLFlBQVksT0FBTyxZQUFZLGFBQWEsTUFBTSxZQUFZLGFBQWEsd0JBQXdCLFdBQVcsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLFlBQVksTUFBTSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLFlBQVksTUFBTSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLFlBQVksTUFBTSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLE9BQU8sYUFBYSxNQUFNLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxhQUFhLFdBQVcsTUFBTSxLQUFLLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxPQUFPLEtBQUssWUFBWSxXQUFXLFVBQVUsUUFBUSxZQUFZLE1BQU0sVUFBVSxPQUFPLEtBQUssVUFBVSxXQUFXLFlBQVksT0FBTyxZQUFZLE1BQU0sVUFBVSxhQUFhLGFBQWEsYUFBYSxPQUFPLEtBQUssWUFBWSxXQUFXLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxXQUFXLFVBQVUsWUFBWSxhQUFhLFdBQVcsWUFBWSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsV0FBVyxNQUFNLEtBQUssWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxZQUFZLFdBQVcsTUFBTSxLQUFLLGFBQWEsYUFBYSxXQUFXLFdBQVcsVUFBVSxZQUFZLGNBQWMsV0FBVyxPQUFPLEtBQUssWUFBWSxXQUFXLFVBQVUsVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLE9BQU8sYUFBYSxNQUFNLEtBQUssVUFBVSxLQUFLLE1BQU0sS0FBSyxLQUFLLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxLQUFLLE1BQU0sS0FBSyxLQUFLLFVBQVUsWUFBWSxNQUFNLEtBQUssVUFBVSxZQUFZLE1BQU0sS0FBSyxVQUFVLFVBQVUsTUFBTSxNQUFNLEtBQUssS0FBSyxVQUFVLFVBQVUsTUFBTSw2SEFBNkgsTUFBTSxNQUFNLHFCQUFxQixTQUFTLHNCQUFzQixHQUFHLFVBQVUsb0JBQW9CLDZCQUE2QixnQkFBZ0IsZ0RBQWdELHVCQUF1Qix5QkFBeUIsR0FBRywyQkFBMkIsb0JBQW9CLDRCQUE0Qix1QkFBdUIsc0JBQXNCLDZCQUE2Qiw4QkFBOEIsMEJBQTBCLEdBQUcsa0JBQWtCLHNCQUFzQix5QkFBeUIsR0FBRyxvREFBb0Qsd0JBQXdCLDJCQUEyQiwyQkFBMkIsMkJBQTJCLGdCQUFnQixvQkFBb0Isa0JBQWtCLGVBQWUsNENBQTRDLG9CQUFvQixxQkFBcUIsNEJBQTRCLDBCQUEwQixzQkFBc0IscUJBQXFCLGVBQWUsc0JBQXNCLHVCQUF1QiwwQkFBMEIsd0JBQXdCLHNCQUFzQiw4QkFBOEIsK0JBQStCLHVCQUF1QixHQUFHLHFCQUFxQixtQkFBbUIsR0FBRyxxQkFBcUIsdUJBQXVCLGdCQUFnQixlQUFlLEdBQUcsc0JBQXNCLHVCQUF1QixnQkFBZ0IsZUFBZSxHQUFHLFdBQVcsY0FBYyxxQkFBcUIsaUJBQWlCLHNCQUFzQiw0QkFBNEIsOEJBQThCLEdBQUcsd0JBQXdCLG1CQUFtQixxQkFBcUIseUJBQXlCLDJCQUEyQixzQkFBc0IsNkJBQTZCLDRCQUE0QixHQUFHLHNCQUFzQixtQkFBbUIsaUNBQWlDLEdBQUcseUNBQXlDLG9CQUFvQixtQkFBbUIscUNBQXFDLHdCQUF3QixzQkFBc0IsNkJBQTZCLEdBQUcsK0NBQStDLG1CQUFtQiwyQkFBMkIsR0FBRyxtRkFBbUYsNkNBQTZDLDZCQUE2QixxQkFBcUIseURBQXlELDhCQUE4QiwwQkFBMEIsR0FBRyxrQkFBa0Isd0JBQXdCLEdBQUcsa0JBQWtCLHNCQUFzQiwwQ0FBMEMsNkNBQTZDLEdBQUcsMkdBQTJHLHdEQUF3RCw2Q0FBNkMsR0FBRyxpQkFBaUIsc0JBQXNCLHNEQUFzRCx5REFBeUQsR0FBRyxnQkFBZ0Isc0JBQXNCLHdEQUF3RCwwREFBMEQsR0FBRyxnREFBZ0QsdUNBQXVDLDRDQUE0QyxHQUFHLGFBQWEsd0NBQXdDLDZDQUE2QyxHQUFHLGFBQWEseUNBQXlDLDhDQUE4QyxHQUFHLGFBQWEseUNBQXlDLDhDQUE4QyxHQUFHLGFBQWEsMENBQTBDLCtDQUErQyxHQUFHLG1FQUFtRSxrREFBa0QsdURBQXVELEdBQUcscUJBQXFCLG1EQUFtRCx3REFBd0QsR0FBRyxxQkFBcUIsb0RBQW9ELHlEQUF5RCxHQUFHLHFCQUFxQixvREFBb0QseURBQXlELEdBQUcscUJBQXFCLHFEQUFxRCwwREFBMEQsR0FBRyxxQkFBcUIsNkNBQTZDLDhDQUE4QyxHQUFHLG1EQUFtRCx1QkFBdUIsMEJBQTBCLEdBQUcsaUJBQWlCLG9CQUFvQiw4QkFBOEIsa0JBQWtCLEdBQUcsdUJBQXVCLG9CQUFvQixlQUFlLEdBQUcsa0NBQWtDLG9CQUFvQixHQUFHLFVBQVUsOEJBQThCLGtCQUFrQixtQkFBbUIsR0FBRyxxREFBcUQsbUJBQW1CLEdBQUcsYUFBYSxpQkFBaUIsbUJBQW1CLGdDQUFnQyxHQUFHLDhFQUE4RSxvQkFBb0IsNkJBQTZCLDRCQUE0Qiw4QkFBOEIsR0FBRyxrQkFBa0IsMEJBQTBCLHNCQUFzQixHQUFHLGlCQUFpQiw4QkFBOEIsOEJBQThCLDJCQUEyQixtQkFBbUIsb0JBQW9CLDBCQUEwQixvR0FBb0csb0JBQW9CLHFCQUFxQixzQkFBc0IsY0FBYyxrQkFBa0IsdUJBQXVCLHVCQUF1Qix1QkFBdUIsMEJBQTBCLCtCQUErQixxRkFBcUYsc0JBQXNCLDhCQUE4QixnQkFBZ0IsR0FBRyx3QkFBd0IsOEJBQThCLDBCQUEwQiwwQkFBMEIsR0FBRywwQkFBMEIsMEJBQTBCLG1CQUFtQix3QkFBd0IsZUFBZSxHQUFHLGFBQWEsOENBQThDLGdDQUFnQyxtQkFBbUIsb0JBQW9CLHNCQUFzQiw4QkFBOEIsMEJBQTBCLHdCQUF3QixHQUFHLGtCQUFrQix3QkFBd0Isa0JBQWtCLG1CQUFtQixvQkFBb0IsOEJBQThCLDBCQUEwQixHQUFHLGtCQUFrQixtQkFBbUIsNEJBQTRCLEdBQUcseUJBQXlCLGlCQUFpQiwyQ0FBMkMsR0FBRyxxRUFBcUUsYUFBYSxzQkFBc0IsT0FBTyxHQUFHLGdEQUFnRCxrQkFBa0IsdUJBQXVCLHdCQUF3QixPQUFPLGFBQWEsc0JBQXNCLE9BQU8sR0FBRywrQ0FBK0MsYUFBYSx3QkFBd0IsaUNBQWlDLE9BQU8sZUFBZSx3QkFBd0IsOEJBQThCLE9BQU8sa0JBQWtCLHVCQUF1Qix3QkFBd0IsT0FBTyxHQUFHLCtDQUErQyxrQkFBa0IsdUJBQXVCLHdCQUF3QixPQUFPLEdBQUcsbUJBQW1CO0FBQ3AzVTtBQUNBLGlFQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7OztBQzdZMUI7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQSxxRkFBcUY7QUFDckY7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlCQUFpQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIscUJBQXFCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLHNGQUFzRixxQkFBcUI7QUFDM0c7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLGlEQUFpRCxxQkFBcUI7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLHNEQUFzRCxxQkFBcUI7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ3BGYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdURBQXVELGNBQWM7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2RBLE1BQWtHO0FBQ2xHLE1BQXdGO0FBQ3hGLE1BQStGO0FBQy9GLE1BQWtIO0FBQ2xILE1BQTJHO0FBQzNHLE1BQTJHO0FBQzNHLE1BQXNHO0FBQ3RHO0FBQ0E7O0FBRUE7O0FBRUEsNEJBQTRCLHFHQUFtQjtBQUMvQyx3QkFBd0Isa0hBQWE7QUFDckMsaUJBQWlCLHVHQUFhO0FBQzlCLGlCQUFpQiwrRkFBTTtBQUN2Qiw2QkFBNkIsc0dBQWtCOztBQUUvQyxhQUFhLDBHQUFHLENBQUMsc0ZBQU87Ozs7QUFJZ0Q7QUFDeEUsT0FBTyxpRUFBZSxzRkFBTyxJQUFJLHNGQUFPLFVBQVUsc0ZBQU8sbUJBQW1CLEVBQUM7Ozs7Ozs7Ozs7O0FDeEJoRTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isd0JBQXdCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGlCQUFpQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLDRCQUE0QjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLDZCQUE2QjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ25GYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNqQ2E7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQ1RhOztBQUViO0FBQ0E7QUFDQSxjQUFjLEtBQXdDLEdBQUcsc0JBQWlCLEdBQUcsQ0FBSTtBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDVGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBLDBDQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUM1RGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDYkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDbEJBOzs7Ozs7Ozs7OztBQ0EyQjtBQUNFO0FBRTdCQSxtREFBRSxDQUFDOEUsS0FBSyxDQUFDLENBQUM7QUFDVjlFLG1EQUFFLENBQUNzRixRQUFRLENBQUMsQ0FBQyxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvZmFjdG9yaWVzL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9mYWN0b3JpZXMvcGxheWVyLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL2ZhY3Rvcmllcy9zaGlwLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL21vZHVsZXMvYmF0dGxlc2hpcEFJLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL21vZHVsZXMvZHJhZ0Ryb3AuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvbW9kdWxlcy9zY29yZWJvYXJkLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL21vZHVsZXMvdWkuanMiLCJ3ZWJwYWNrOi8vYmxhbmsvLi9zcmMvc3R5bGUvc3R5bGUuY3NzIiwid2VicGFjazovL2JsYW5rLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2JsYW5rLy4vc3JjL3N0eWxlL3N0eWxlLmNzcz9jOWYwIiwid2VicGFjazovL2JsYW5rLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2JsYW5rLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9ibGFuay8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2JsYW5rLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vYmxhbmsvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9ibGFuay93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2JsYW5rL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9ibGFuay8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2hpcCBmcm9tICcuL3NoaXAnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVib2FyZCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ3JpZHMgPSBuZXcgQXJyYXkoMTAwKS5maWxsKG51bGwpOyAvLyAyRCBhcnJheSBpbGx1c3RyYXRlZCBieSAxRCAoMTB4MTApXG4gICAgICAgIHRoaXMuYXR0YWNrcyA9IFtdO1xuICAgICAgICB0aGlzLnNoaXBzID0gW107XG4gICAgfVxuXG4gICAgaXNWYWxpZFBsYWNlbWVudChzaGlwLCBjb29yZHMpIHtcbiAgICAgICAgbGV0IGlzVmFsaWQgPSB0cnVlO1xuICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ncmlkc1tpZHhdICE9IG51bGwgfHwgY29vcmRzLmxlbmd0aCAhPSBzaGlwLmxlbmd0aCB8fCBpZHggPCAwIHx8IGlkeCA+IDk5KSB7XG4gICAgICAgICAgICAgICAgLy8gQm91bmRzIGNoZWNrIHBsYWNlbWVudCBpZHggYW5kIGlmIG5vdCBlbXB0eVxuICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIHBsYWNlU2hpcChzaGlwLCBjb29yZHMpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZFBsYWNlbWVudChzaGlwLCBjb29yZHMpKSB7XG4gICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkc1tpZHhdID0gc2hpcDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLnNoaXBzLnB1c2goe3NoaXAsIGNvb3Jkc30pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVjZWl2ZUF0dGFjayhjb29yZCkge1xuICAgICAgICAvLyBSZWdpc3RlciBhdHRhY2sgb25seSBpZiB2YWxpZFxuICAgICAgICBpZiAoIXRoaXMuYXR0YWNrcy5pbmNsdWRlcyhjb29yZCkgJiYgY29vcmQgPj0gMCAmJiBjb29yZCA8PSA5OSkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2tzLnB1c2goY29vcmQpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZHNbY29vcmRdKSB7XG4gICAgICAgICAgICAgICAgLy8gU2hpcCBoaXQgLSByZWdpc3RlciBoaXQgdG8gY29ycmVzcG9uZGluZyBzaGlwIG9iamVjdFxuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZHNbY29vcmRdLmhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0TWlzc2VzKCkge1xuICAgICAgICBsZXQgbWlzc2VzID0gW107XG4gICAgICAgIHRoaXMuYXR0YWNrcy5mb3JFYWNoKChhdHRhY2spID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyaWRzW2F0dGFja10gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1pc3Nlcy5wdXNoKGF0dGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBtaXNzZXM7XG4gICAgfVxuXG4gICAgZ2V0UmVtYWluaW5nKCkge1xuICAgICAgICBsZXQgcmVtYWluaW5nID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdHRhY2tzLmluY2x1ZGVzKGkpKSByZW1haW5pbmcucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVtYWluaW5nO1xuICAgIH1cblxuICAgIGlzR2FtZU92ZXIoKSB7XG4gICAgICAgIGxldCBnYW1lb3ZlciA9IHRydWU7XG4gICAgICAgIHRoaXMuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgaWYgKCFzaGlwT2JqLnNoaXAuaXNTdW5rKSBnYW1lb3ZlciA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gZ2FtZW92ZXI7XG4gICAgfVxufSIsImltcG9ydCBHYW1lYm9hcmQgZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgU2hpcCBmcm9tIFwiLi9zaGlwXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ2FtZWJvYXJkID0gbmV3IEdhbWVib2FyZDtcbiAgICB9XG59XG5cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoaXAge1xuICAgIGNvbnN0cnVjdG9yKGxlbmd0aCwgYXhpcz0wKSB7XG4gICAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoLFxuICAgICAgICB0aGlzLmhpdHMgPSAwO1xuICAgICAgICB0aGlzLmlzU3VuayA9IGZhbHNlO1xuICAgICAgICB0aGlzLmF4aXMgPSBheGlzOyAvLyAwIGhvcml6b250YWwsIDEgdmVydGljYWxcbiAgICB9XG5cbiAgICBzZXRBeGlzKGF4aXMpIHtcbiAgICAgICAgdGhpcy5heGlzID0gYXhpcztcbiAgICB9XG5cbiAgICBnZXRBeGlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5heGlzO1xuICAgIH1cblxuICAgIGhpdCgpIHtcbiAgICAgICAgdGhpcy5oaXRzKys7IFxuICAgICAgICBpZiAodGhpcy5oaXRzID49IHRoaXMubGVuZ3RoKSB0aGlzLmlzU3VuayA9IHRydWU7XG4gICAgfVxufSIsImltcG9ydCBTaGlwIGZyb20gXCIuLi9mYWN0b3JpZXMvc2hpcFwiO1xuaW1wb3J0IFBsYXllciBmcm9tIFwiLi4vZmFjdG9yaWVzL3BsYXllclwiO1xuaW1wb3J0IERyYWdEcm9wIGZyb20gXCIuL2RyYWdEcm9wXCI7XG5pbXBvcnQgU2NvcmVCb2FyZCBmcm9tIFwiLi9zY29yZWJvYXJkXCI7XG5cbmNvbnN0IEJhdHRsZXNoaXBBSSA9ICgoKSA9PiB7XG4gICAgZnVuY3Rpb24gQUlBdHRhY2socGxheWVyKSB7XG4gICAgICAgIC8vIFF1ZXVlOiBBcnJheSB0byBob2xkIGFsbCBjdXJyZW50bHkgYWN0aW9uYWJsZSBncmlkc1xuICAgICAgICBjb25zdCBoaXRzTm90U3VuayA9IHBsYXllci5nYW1lYm9hcmQuYXR0YWNrcy5maWx0ZXIoKGhpdCkgPT4gXG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2hpdF0gJiYgIXBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaGl0XS5pc1N1bmspO1xuICAgIFxuICAgICAgICBpZiAoaGl0c05vdFN1bmsubGVuZ3RoID4gMCkgeyBcbiAgICAgICAgICAgIC8vIDAuIEFjdGlvbiAtIGF0IGxlYXN0IDEgaGl0IHRvIGFjdCB1cG9uXG4gICAgICAgICAgICAvLyBTZXQgdW5zdW5rIHNoaXAgb2JqIHdpdGggbWF4IGhpdHMgdG8gd29yayBvbiBhcyB0YXJnZXRcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSB7c2hpcDogbmV3IFNoaXAoMCksIGNvb3JkczogW119OyAvLyBEdW1teSB2YXJpYWJsZSB0byB1cGRhdGUgYXMgbG9vcFxuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFzaGlwT2JqLnNoaXAuaXNTdW5rICYmIHNoaXBPYmouc2hpcC5oaXRzID4gdGFyZ2V0LnNoaXAuaGl0cykge1xuICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIG1heCBoaXQsIHVuc3VuayBzaGlwXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHNoaXBPYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGFyZ2V0ID0gXCIsIHRhcmdldCk7XG4gICAgXG4gICAgICAgICAgICAvLyBHZXQgdGFyZ2V0J3MgYWxyZWFkeSBoaXQgY29vcmRzIGFuZCBzdG9yZSBpbiBhcnJheVxuICAgICAgICAgICAgbGV0IHRhcmdldEhpdHMgPSBoaXRzTm90U3Vuay5maWx0ZXIoKGhpdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2hpdF0gPT0gdGFyZ2V0LnNoaXAgJiYgdGFyZ2V0LmNvb3Jkcy5pbmNsdWRlcyhoaXQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRhcmdldCdzIGFscmVhZHkgaGl0IGNvb3JkcyA9IFwiLCB0YXJnZXRIaXRzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRhcmdldC5zaGlwLmhpdHMgPT0gMSkge1xuICAgICAgICAgICAgICAgIC8vIDIuIElmIG9ubHkgMSBoaXQgaXMgbWF4LCB0aGVuIG11c3QgcmFuZG9taXplIGxlZnQgcmlnaHQgdG9wIG9yIHJpZ2h0XG4gICAgICAgICAgICAgICAgY29uc3QgTldTRSA9IFstMTAsIC0xLCArMTAsIDFdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhc2UgPSB0YXJnZXRIaXRzWzBdO1xuICAgICAgICAgICAgICAgIGxldCBvZmZzZXQgPSBOV1NFW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IGJhc2UgKyBvZmZzZXQ7XG4gICAgXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYmFzZSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXh0KVxuXG4gICAgICAgICAgICAgICAgLy8gRWRnZSBjYXNlIGhhbmRsaW5nIC0gKGFzc3VtZSB3b3JzdCBjYXNlIHNjZW5hcmlvKVxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGN1cnJlbnQgc21hbGxlc3QgcmVtYWluaW5nIHNoaXBcbiAgICAgICAgICAgICAgICAvLyAgLT4gY2hlY2sgaWYgdGhpcyBzaGlwIGNhbiBmaXRcbiAgICAgICAgICAgICAgICBsZXQgbWluID0gNTsgLy8gZHVtbXkgdG8gcmVwbGFjZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ1NoaXBzID0gcGxheWVyLmdhbWVib2FyZC5zaGlwcy5maWx0ZXIoKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEoc2hpcE9iai5zaGlwLmlzU3Vuayk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICByZW1haW5pbmdTaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzaGlwT2JqLnNoaXAubGVuZ3RoIDw9IG1pbikgbWluID0gc2hpcE9iai5zaGlwLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIGlmIHNoaXAgZml0cyBmcm9tIGJhc2UgLyBmYWxzZSBpZiBub3RcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBjaGVja0lmRml0KHBsYXllciwgYmFzZSwgb2Zmc2V0LCBzaGlwTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb29yZHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBzaGlwTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5wdXNoKGJhc2UgKyAob2Zmc2V0ICogaSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFBvdGVuaXRhbCBjb29yZHMgYmFzZWQgb24gYmFzZSwgb2Zmc2V0LCBzaGlwTGVuZ3RoIC0gZXhjbHVkZSBiYXNlIChhbHJlYWR5IGF0dGFja2VkIGFuZCB2YWxpZClcbiAgICAgICAgICAgICAgICAgICAgbGV0IGlzVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKGlkeCkgfHwgaWR4IDwgMCB8fCBpZHggPiA5OSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICgob2Zmc2V0ID09IC0xIHx8IG9mZnNldCA9PSAxKSAmJiAhKE1hdGguZmxvb3IoaWR4LzEwKSA9PSBNYXRoLmZsb29yKGJhc2UvMTApKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMjogKG1pbilzaGlwTGVuZ3RoOiBcIiArIHNoaXBMZW5ndGggKyBcIiBjYW4gZml0IGludG8gXCIgKyBiYXNlLCBjb29yZHMgKyBcIiA9IFwiICsgaXNWYWxpZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgICAgICAvLyBCb3VuZHMgY2hlY2sgKGVkZ2VjYXNlOiBpZiBob3Jpem9udGFsIG11c3QgYmUgaW4gc2FtZSB5LWF4aXMpICsgbm90IGFscmVhZHkgYXR0YWNrZWQgPSBjeWNsZVxuICAgICAgICAgICAgICAgIHdoaWxlIChwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3MuaW5jbHVkZXMobmV4dCkgfHwgbmV4dCA8IDAgfHwgbmV4dCA+IDk5IFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgKChvZmZzZXQgPT0gLTEgfHwgb2Zmc2V0ID09IDEpICYmICEoTWF0aC5mbG9vcihuZXh0LzEwKSA9PSBNYXRoLmZsb29yKGJhc2UvMTApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHx8ICFjaGVja0lmRml0KHBsYXllciwgYmFzZSwgb2Zmc2V0LCBtaW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IE5XU0VbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCldO1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gYmFzZSArIG9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1Z2dpbmc6IG5ld25leHQgPSBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQucmVjZWl2ZUF0dGFjayhuZXh0KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMiBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gMy4gSWYgMiBoaXRzIG9yIG1vcmUgaXMgbWF4LCB0aGVuIGNhbiBkZWR1Y2UgdGhlIHNoaXAgYXhpcyBhbmQgZ3Vlc3MgbGVmdC0xIG9yIHJpZ2h0KzEgdW50aWwgZG9uZVxuICAgIFxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBheGlzIC0gZnJvbSAyIGhpdHMgY2FuIGFzc3VtZSBcbiAgICAgICAgICAgICAgICAvLyAoUmVmZXJlbmNlOiBTbGlnaHQgaW1wZXJmZWN0aW9uIGluIGxvZ2ljKSBJZiAyLDMsNCw1IGhpdHMgY2FuIHRlY2huaWNhbGx5IGJlIDIsMyw0LDUgc2hpcHNcbiAgICAgICAgICAgICAgICBjb25zdCBheGlzID0gdGFyZ2V0LnNoaXAuYXhpcztcbiAgICAgICAgICAgICAgICBpZiAoYXhpcyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGhvcml6b250YWwsIHJhbmRvbSBsZWZ0IG9yIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFdFID0gW01hdGgubWluKC4uLnRhcmdldEhpdHMpIC0gMSwgTWF0aC5tYXgoLi4udGFyZ2V0SGl0cykgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSBXRVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyKV07XG4gICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIEJvdW5kcyBjaGVjayAoZWRnZWNhc2U6IGlmIGhvcml6b250YWwgbXVzdCBiZSBpbiBzYW1lIHktYXhpcykgKyBub3QgYWxyZWFkeSBhdHRhY2tlZCA9IGN5Y2xlXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3MuaW5jbHVkZXMobmV4dCkgfHwgbmV4dCA8IDAgfHwgbmV4dCA+IDk5IFxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgIShNYXRoLmZsb29yKG5leHQvMTApID09IE1hdGguZmxvb3IoTWF0aC5taW4oLi4udGFyZ2V0SGl0cykvMTApKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IFdFW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU3RlcCAzIGF0dGFja2VkIGNlbGw6IFwiLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdmVydGljYWwsIHJhbmRvbSB0b3Agb3IgYm90dG9tXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IE5TID0gW01hdGgubWluKC4uLnRhcmdldEhpdHMpIC0gMTAsIE1hdGgubWF4KC4uLnRhcmdldEhpdHMpICsgMTBdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IE5TW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gQm91bmRzIGNoZWNrICsgbm90IGFscmVhZHkgYXR0YWNrZWQgPSBjeWNsZVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAocGxheWVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKG5leHQpIHx8IG5leHQgPCAwIHx8IG5leHQgPiA5OSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IE5TW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgIFxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU3RlcCAzIGF0dGFja2VkIGNlbGw6IFwiLCBuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyAwLiBObyBoaXRzIHRvIGFjdCB1cG9uIC0gQ29tcGxldGUgcmFuZG9tIG91dCBvZiByZW1haW5pbmcgZ3JpZHNcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBwbGF5ZXIuZ2FtZWJvYXJkLmdldFJlbWFpbmluZygpO1xuICAgICAgICAgICAgbGV0IG5leHQgPSBvcHRpb25zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG9wdGlvbnMubGVuZ3RoKV07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlN0ZXAgMSBhdHRhY2tlZCBjZWxsOiBcIiwgbmV4dCk7XG4gICAgICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2sobmV4dCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBBSUF0dGFja1xuICAgIH1cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IEJhdHRsZXNoaXBBSTsiLCJpbXBvcnQgVUkgZnJvbSAnLi91aSdcblxuY29uc3QgRHJhZ0Ryb3AgPSAoKCkgPT4ge1xuXG4gICAgZnVuY3Rpb24gaW5pdChwbGF5ZXIpIHtcbiAgICAgICAgcmVzZXRFdmVudHMoKTtcbiAgICAgICAgc2V0RHJhZ2dhYmxlQXJlYSgpO1xuICAgICAgICBkcmFnKHBsYXllcik7XG4gICAgICAgIGNsaWNrKHBsYXllcik7XG4gICAgfVxuXG4gICAgLy8gcmVzZXQgYWxsIGRyYWcvY2xpY2sgZXZlbnQgbGlzdGVuZXJzXG4gICAgZnVuY3Rpb24gcmVzZXRFdmVudHMoKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQub25kcmFnc3RhcnQgPSAoKGUpID0+IHtcbiAgICAgICAgICAgIH0pIFxuICAgICAgICAgICAgZ3JpZC5vbmRyYWdlbnRlciA9ICgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH0pIFxuICAgICAgICAgICAgZ3JpZC5vbmRyYWdlbmQgPSAoKGUpID0+IHtcbiAgICAgICAgICAgIH0pIFxuICAgICAgICAgICAgZ3JpZC5vbmRyYWdvdmVyID0gKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGdyaWQub25jbGljayA9ICgoZSkgPT4ge1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgIC8vIFJlc2V0IGFuZCBzZXQgYWxsIHNoaXBzIHRvIGJlIGRyYWdnYWJsZSBcbiAgICBmdW5jdGlvbiBzZXREcmFnZ2FibGVBcmVhKCkge1xuICAgICAgICAvLyBSZXNldCBkcmFnZ2FibGUgY29udGVudFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLnNldEF0dHJpYnV0ZShcImRyYWdnYWJsZVwiLCBmYWxzZSk7XG4gICAgICAgICAgICBncmlkLnN0eWxlWydjdXJzb3InXSA9ICdhdXRvJztcbiAgICAgICAgfSlcbiAgICAgICAgLy8gRHJhZ2dhYmxlIGNvbnRlbnQgPSBhbnkgZ3JpZCB3aXRoIHNoaXAgY2xhc3NcbiAgICAgICAgbGV0IHBsYXllclNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5wbGF5ZXItc2hpcFwiKTtcbiAgICAgICAgcGxheWVyU2hpcHMuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgdHJ1ZSk7XG4gICAgICAgICAgICBncmlkLnN0eWxlWydjdXJzb3InXSA9ICdwb2ludGVyJztcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBIZWxwZXIgYm9vbCAtIFZhbGlkIGRyb3BwYWJsZSBwbGFjZSBmb3IgaGVhZCAtIGlnbm9yZSBjdXJyZW50IHNoaXAncyBwb3NpdGlvbiB3aGVuIGNoZWNraW5nIHZhbGlkaXR5XG4gICAgZnVuY3Rpb24gaXNEcm9wcGFibGUocGxheWVyLCBzaGlwLCBjb29yZHMpIHtcbiAgICAgICAgbGV0IGlzVmFsaWQgPSB0cnVlO1xuICAgICAgICBjb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7IFxuICAgICAgICAgICAgaWYgKChwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gIT0gbnVsbCAmJiBwbGF5ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0gIT0gc2hpcCkgfHwgY29vcmRzLmxlbmd0aCAhPSBzaGlwLmxlbmd0aCB8fCBpZHggPCAwIHx8IGlkeCA+IDk5KSB7XG4gICAgICAgICAgICAgICAgLy8gQm91bmRzIGNoZWNrIHBsYWNlbWVudCBpZHggYW5kIGlmIG5vdCBlbXB0eVxuICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IGFuZCBzZXQgZHJvcHBhYmxlIGFyZWFzIHdpdGggY2xhc3MgJ2dyaWQtZHJvcHBhYmxlJyBcbiAgICBmdW5jdGlvbiBzZXREcm9wcGFibGVBcmVhKHBsYXllciwgc2hpcCwgYXhpcywgc2hpcE9mZnNldCkge1xuICAgICAgICAvLyBSZXNldCBkcm9wcGFibGUgZ3JpZHMgdG8gaGF2ZSBjbGFzcyBcImdyaWQtZHJvcHBhYmxlXCJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIikuZm9yRWFjaCgoZ3JpZCkgPT4ge1xuICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKCdncmlkLWRyb3BwYWJsZScpO1xuICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKCdzaGlwLWRyb3BwYWJsZScpO1xuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHBsYXllckdyaWRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5ncmlkLXVuaXRcIik7XG4gICAgICAgIC8vIFZhbGlkIGNoZWNrIGlmIGhlYWQgaXMgZHJvcHBlZCBpbiBncmlkIC0gXG4gICAgICAgIHBsYXllckdyaWRzLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKTtcbiAgICAgICAgICAgIGlmIChheGlzID09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBIb3Jpem9udGFsIGNhc2UgXG4gICAgICAgICAgICAgICAgLy8gVmFsaWRhdGlvbiAtIGhlYWQgbXVzdCBoYXZlIGVtcHR5IG4gbGVuZ3RoIHRvIHRoZSByaWdodFxuICAgICAgICAgICAgICAgIGxldCBjb29yZHMgPSBbLi4ubmV3IEFycmF5KHNoaXAubGVuZ3RoKS5rZXlzKCldLm1hcCgoeCkgPT4geCArIGhlYWQgLSBzaGlwT2Zmc2V0KTsgLy8gQ29vcmRzIGFycmF5IG9mIGhvcml6b250YWwgc2hpcCBmcm9tIGhlYWQgKyBBY2NvdW50IGZvciBvZmZzZXQgaW4gcG90ZW50aWFsIGNvb3Jkc1xuICAgICAgICAgICAgICAgIGlmIChjb29yZHMuZXZlcnkoKHgpID0+IE1hdGguZmxvb3IoeC8xMCkgPT0gTWF0aC5mbG9vcihjb29yZHNbMF0vMTApKVxuICAgICAgICAgICAgICAgICAgICAmJiBpc0Ryb3BwYWJsZShwbGF5ZXIsIHNoaXAsIGNvb3JkcykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gIFRoZW4gdmFsaWQgLSBzZXQgZHJvcHBhYmxlXG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LmFkZCgnZ3JpZC1kcm9wcGFibGUnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZW50aXJlIHNoaXAgZHJvcHBhYmxlIGdyaWRzXG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZCgnc2hpcC1kcm9wcGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChheGlzID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBWZXJ0aWNhbCBjYXNlXG4gICAgICAgICAgICAgICAgLy8gVmFsaWRhdGlvbiAtIGhlYWQgbXVzdCBoYXZlIGVtcHR5IG4gbGVuZ3RoIGdyaWRzIGJlbG93IHdpdGhpbiBib3VuZHNcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRzID0gWy4uLm5ldyBBcnJheShzaGlwLmxlbmd0aCkua2V5cygpXS5tYXAoKHgpID0+IGhlYWQgKyAoKHggLSBzaGlwT2Zmc2V0KSAqIDEwKSk7IC8vIENvb3JkcyBhcnJheSBvZiB2ZXJ0aWNhbCBmcm9tIGhlYWRcbiAgICAgICAgICAgICAgICBpZiAoaXNEcm9wcGFibGUocGxheWVyLCBzaGlwLCBjb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LmFkZCgnZ3JpZC1kcm9wcGFibGUnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTZXQgZW50aXJlIHNoaXAgZHJvcHBhYmxlIGdyaWRzXG4gICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZCgnc2hpcC1kcm9wcGFibGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhZyhwbGF5ZXIpIHtcbiAgICAgICAgbGV0IHBsYXllclNoaXBzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5wbGF5ZXItc2hpcFwiKTtcblxuICAgICAgICBwbGF5ZXJTaGlwcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ3N0YXJ0ID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJtb3ZlXCI7XG5cbiAgICAgICAgICAgICAgICAvLyBEcmFnZ2luZyBzaGlwIC0gbmVlZCB0byBleHRyYWN0IFNoaXAgb2JqZWN0IGZyb20gdGhlIGdyaWRcbiAgICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gWy4uLmdyaWQuY2xhc3NMaXN0XTtcbiAgICAgICAgICAgICAgICBsZXQgc2hpcElkeCA9IGNsYXNzZXMuZmluZCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5zdGFydHNXaXRoKFwic2hpcC1cIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2hpcElkeCA9IHNoaXBJZHguc2xpY2UoNSktMTtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIGNsYXNzIGFzc29jaWF0ZWQgd2l0aCBzaGlwICsgdXNlIGFzIGhhc2htYXAgdG8gcmVmZXJlbmNlIGV4YWN0IHNoaXAgb2JqZWN0IHVzZWQgaW4gZ2FtZWJvYXJkXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hpcE9iaiA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcDtcblxuICAgICAgICAgICAgICAgIC8vIEdldCBncmlkIHBvc2l0aW9uIG9mIGN1cnJlbnQgZHJhZ2dlZCBzaGlwIC0gU29ydCBzaGlwIGNvb3JkcyBsb3dlc3QgdG8gaGlnaGVzdFxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hpcE9mZnNldCA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uY29vcmRzLnNvcnQoKGEsYikgPT4gYSA+IGIpLmZpbmRJbmRleCh4ID0+IHggPT0gcGFyc2VJbnQoZ3JpZC5pZC5zbGljZSgxKSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNoaXBPZmZzZXQpO1xuXG4gICAgICAgICAgICAgICAgc2V0RHJvcHBhYmxlQXJlYShwbGF5ZXIsIHNoaXBPYmosIHNoaXBPYmouYXhpcywgc2hpcE9mZnNldCk7XG4gICAgICAgICAgICAgICAgZHJhZ0VudGVyKHBsYXllciwgc2hpcE9iaiwgc2hpcE9iai5heGlzLCBzaGlwSWR4LCBzaGlwT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBkcmFnRW5kKHBsYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxuICAgIC8vIERyYWcgc2hpcCBlbnRlcnMgZHJvcHBhYmxlIGFyZWEgLSBvZmZlciBwcmV2aWV3IG9mIGhvdyBzaGlwIHdvdWxkIGxvb2sgcGxhY2VkXG4gICAgZnVuY3Rpb24gZHJhZ0VudGVyKHBsYXllciwgc2hpcCwgYXhpcywgc2hpcElkeCwgc2hpcE9mZnNldCkge1xuICAgICAgICBjb25zdCBkcm9wcGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdyaWQtZHJvcHBhYmxlXCIpO1xuXG4gICAgICAgIGRyb3BwYWJsZS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uZHJhZ2VudGVyID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IFwibm9uZVwiO1xuICAgICAgICAgICAgICAgIC8vIFJlc2V0IHByZXZpZXcgZ3JpZHNcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTFgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtMmApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0zYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTRgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtNWApO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgaGVhZCB2YWx1ZSBcbiAgICAgICAgICAgICAgICBpZiAoYXhpcyA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgY2FzZSBcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZCA9IHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpIC0gc2hpcE9mZnNldDsgLy8gVXBkYXRlIGhlYWQgdmFsdWUgdG8gYmUgb2Zmc2V0dGVkXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcmV2aWV3ID0gWy4uLm5ldyBBcnJheShzaGlwLmxlbmd0aCkua2V5cygpXS5tYXAoKHgpID0+IHggKyBoZWFkKTsgLy8gUG90ZW50aWFsIGNvb3JkcyBhcnJheSBvZiBob3Jpem9udGFsIHNoaXAgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXcuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoYHByZXZpZXctc2hpcC0ke3NoaXBJZHgrMX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0Ryb3AocGxheWVyLCBzaGlwLCBzaGlwSWR4LCBwcmV2aWV3KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcnRpY2FsIGNhc2VcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZCA9IHBhcnNlSW50KGdyaWQuaWQuc2xpY2UoMSkpIC0gKDEwICogc2hpcE9mZnNldCk7IC8vIFVwZGF0ZSBoZWFkIHZhbHVlIHRvIGJlIG9mZnNldHRlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldmlldyA9IFsuLi5uZXcgQXJyYXkoc2hpcC5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiBoZWFkICsgKHggKiAxMCkpOyAvLyBDb29yZHMgYXJyYXkgb2YgdmVydGljYWwgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgICAgIHByZXZpZXcuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5hZGQoYHByZXZpZXctc2hpcC0ke3NoaXBJZHgrMX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgZHJhZ0Ryb3AocGxheWVyLCBzaGlwLCBzaGlwSWR4LCBwcmV2aWV3KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gRHJhZyBlbmQgLSByZWdhcmRsZXNzIG9mIHN1Y2Nlc3NmdWwgZHJvcCBvciBub3RcbiAgICBmdW5jdGlvbiBkcmFnRW5kKHBsYXllcikge1xuICAgICAgICBsZXQgcGxheWVyU2hpcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLnBsYXllci1zaGlwXCIpO1xuXG4gICAgICAgIHBsYXllclNoaXBzLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgIGdyaWQub25kcmFnZW5kID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgcHJldmlldyBncmlkc1xuICAgICAgICAgICAgICAgIC8vIFJlc2V0IGRyb3BwYWJsZSBncmlkcyB0byBoYXZlIGNsYXNzIFwiZ3JpZC1kcm9wcGFibGVcIlxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLnAgPiAuZ3JpZC11bml0XCIpLmZvckVhY2goKGdyaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtMWApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC0yYCk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZShgcHJldmlldy1zaGlwLTNgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZC5jbGFzc0xpc3QucmVtb3ZlKGBwcmV2aWV3LXNoaXAtNGApO1xuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoYHByZXZpZXctc2hpcC01YCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBncmlkLmNsYXNzTGlzdC5yZW1vdmUoJ2dyaWQtZHJvcHBhYmxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGdyaWQuY2xhc3NMaXN0LnJlbW92ZSgnc2hpcC1kcm9wcGFibGUnKTtcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgaW5pdChwbGF5ZXIpOyAvLyBBdCBlYWNoIGRyYWctZW5kIHJlc2V0IGRyYWdnYWJsZStkcm9wcGFibGUgY29udGVudCBhbmQgcmVzZXQgYWxsIGxpc3RlbmVyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBEcmFnIHBsYWNlIGluIHZhbGlkIGdyaWQgLSB0YXJnZXQgYXMgcG90ZW50aWFsIGNvb3JkcyBhdCBlYWNoIGRyYWcgZW50ZXJcbiAgICBmdW5jdGlvbiBkcmFnRHJvcChwbGF5ZXIsIHNoaXAsIHNoaXBJZHgsIHBvdGVudGlhbENvb3JkcykgeyAgICAgICBcbiAgICAgICAgLy8gQ29vcmRzIHRvIGJlIHNoaXAtZHJvcHBhYmxlIGFyZWEgXG4gICAgICAgIHBvdGVudGlhbENvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIC8vIEdldCBoZWFkIG9mIHBsYWNlbWVudCAtIGFsd2F5cyBtaW5pbXVtIHZhbHVlIG9mIGNvb3Jkc1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHAke2lkeH1gKS5vbmRyb3AgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZENvb3JkcyA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uY29vcmRzO1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBnYW1lYm9hcmQgc2hpcHNbXSBhcnJheSBhbmQgZ3JpZHNbXSBhcnJheVxuICAgICAgICAgICAgICAgIHJlcGxhY2VTaGlwKHBsYXllciwgc2hpcElkeCwgb2xkQ29vcmRzLCBwb3RlbnRpYWxDb29yZHMsIHNoaXAuYXhpcyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGxheWVyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVwbGFjZVNoaXAocGxheWVyLCBzaGlwSWR4LCBvbGRDb29yZHMsIG5ld0Nvb3JkcywgbmV3QXhpcykge1xuICAgICAgICAvLyBTdG9yYWdlIGNoYW5nZXNcbiAgICAgICAgLy8gVXBkYXRlIGdhbWVib2FyZCBncmlkc1tdXG4gICAgICAgIG9sZENvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSA9IG51bGw7XG4gICAgICAgIH0pXG4gICAgICAgIG5ld0Nvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIHBsYXllci5nYW1lYm9hcmQuZ3JpZHNbaWR4XSA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uc2hpcDtcbiAgICAgICAgfSlcbiAgICAgICAgLy8gQ2hhbmdlIGNvb3JkcyBpbiBnYW1lYm9hcmQgc2hpcHNbXSBvYmplY3RcbiAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4XS5jb29yZHMgPSBuZXdDb29yZHM7XG5cbiAgICAgICAgLy8gVXBkYXRlIGF4aXNcbiAgICAgICAgcGxheWVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4XS5zaGlwLmF4aXMgPSBuZXdBeGlzO1xuXG4gICAgICAgIC8vIEZyb250LUVuZCBjaGFuZ2VzXG4gICAgICAgIFVJLnVwZGF0ZVBsYWNlZFNoaXBzKG9sZENvb3JkcywgbmV3Q29vcmRzLCBzaGlwSWR4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGljayhwbGF5ZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5nYW1lYm9hcmQucCA+IC5wbGF5ZXItc2hpcFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uY2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2xpY2tlZFwiKTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gZXh0cmFjdCBzaGlwSWR4IGZyb20gZ3JpZFxuICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBbLi4uZ3JpZC5jbGFzc0xpc3RdO1xuICAgICAgICAgICAgICAgIGxldCBzaGlwSWR4ID0gY2xhc3Nlcy5maW5kKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnN0YXJ0c1dpdGgoXCJzaGlwLVwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzaGlwSWR4ID0gc2hpcElkeC5zbGljZSg1KS0xO1xuICAgICAgICAgICAgICAgIC8vIEZpbmQgY2xhc3MgYXNzb2NpYXRlZCB3aXRoIHNoaXAgKyB1c2UgYXMgaGFzaG1hcCB0byByZWZlcmVuY2UgZXhhY3Qgc2hpcCBvYmplY3QgdXNlZCBpbiBnYW1lYm9hcmRcbiAgICAgICAgICAgICAgICBjb25zdCBzaGlwT2JqID0gcGxheWVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4XS5zaGlwO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9sZENvb3JkcyA9IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeF0uY29vcmRzO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWQgPSBNYXRoLm1pbiguLi5vbGRDb29yZHMpO1xuXG4gICAgICAgICAgICAgICAgLy8gQXR0ZW1wdCByb3RhdGlvblxuICAgICAgICAgICAgICAgIGlmIChzaGlwT2JqLmF4aXMgPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBIb3Jpem9udGFsIC0tPiBWZXJ0aWNhbFxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Q29vcmRzID0gWy4uLm5ldyBBcnJheShzaGlwT2JqLmxlbmd0aCkua2V5cygpXS5tYXAoKHgpID0+IGhlYWQgKyAoeCAqIDEwKSk7IC8vIENvb3JkcyBhcnJheSBvZiB2ZXJ0aWNhbCBmcm9tIGhlYWRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0Ryb3BwYWJsZShwbGF5ZXIsIHNoaXBPYmosIG5ld0Nvb3JkcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGRyb3BwYWJsZSAtIHRoZW4gcm90YXRlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlU2hpcChwbGF5ZXIsIHNoaXBJZHgsIG9sZENvb3JkcywgbmV3Q29vcmRzLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXQocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYWtlKG9sZENvb3Jkcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc2hpcE9iai5heGlzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVmVydGljYWwgLS0+IEhvcml6b250YWxcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0Nvb3JkcyA9IFsuLi5uZXcgQXJyYXkoc2hpcE9iai5sZW5ndGgpLmtleXMoKV0ubWFwKCh4KSA9PiB4ICsgaGVhZCk7IC8vIENvb3JkcyBhcnJheSBvZiBob3Jpem9udGFsIHNoaXAgZnJvbSBoZWFkXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdDb29yZHMuZXZlcnkoKHgpID0+IE1hdGguZmxvb3IoeC8xMCkgPT0gTWF0aC5mbG9vcihuZXdDb29yZHNbMF0vMTApKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgaXNEcm9wcGFibGUocGxheWVyLCBzaGlwT2JqLCBuZXdDb29yZHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlU2hpcChwbGF5ZXIsIHNoaXBJZHgsIG9sZENvb3JkcywgbmV3Q29vcmRzLCAwKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0KHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFrZShvbGRDb29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIC0gYW5pbWF0ZSBjb29yZHMgdXNpbmcga2V5ZnJhbWVzIG9iamVjdFxuICAgIGZ1bmN0aW9uIHNoYWtlKGNvb3Jkcykge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNoYWtlXCIpOyAgXG4gICAgICAgIGNvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgZ3JpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBwJHtpZHh9YCk7XG4gICAgICAgICAgICBncmlkLmFuaW1hdGUoW1xuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTFweCwgMCwgMClcIn0sXG4gICAgICAgICAgICAgICAge3RyYW5zZm9ybTogXCJ0cmFuc2xhdGUzZCgycHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTRweCwgMCwgMClcIn0sXG4gICAgICAgICAgICAgICAge3RyYW5zZm9ybTogXCJ0cmFuc2xhdGUzZCg0cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTRweCwgMCwgMClcIn0sXG4gICAgICAgICAgICAgICAge3RyYW5zZm9ybTogXCJ0cmFuc2xhdGUzZCg0cHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTRweCwgMCwgMClcIn0sXG4gICAgICAgICAgICAgICAge3RyYW5zZm9ybTogXCJ0cmFuc2xhdGUzZCgycHgsIDAsIDApXCJ9LFxuICAgICAgICAgICAgICAgIHt0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTFweCwgMCwgMClcIn1cbiAgICAgICAgICAgIF0sIDUwMCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVybWluYXRlKCkge1xuICAgICAgICByZXNldEV2ZW50cygpO1xuICAgICAgICAvLyBSZXNldCBkcmFnZ2FibGUgY29udGVudFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmdhbWVib2FyZC5wID4gLmdyaWQtdW5pdFwiKS5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLnNldEF0dHJpYnV0ZShcImRyYWdnYWJsZVwiLCBmYWxzZSk7XG4gICAgICAgICAgICBncmlkLnN0eWxlWydjdXJzb3InXSA9ICdhdXRvJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdCxcbiAgICAgICAgdGVybWluYXRlXG4gICAgfVxufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgRHJhZ0Ryb3A7IiwiY29uc3QgU2NvcmVCb2FyZCA9ICgoKSA9PiB7XG4gICAgZnVuY3Rpb24gY3JlYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY3JlYXRpbmdcIilcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zY29yZWJvYXJkID4gZGl2XCIpLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICBzY29yZS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgc2NvcmUuY2xhc3NMaXN0LnJlbW92ZShcInNjb3JlLXN1bmtcIik7XG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NvcmVib2FyZFwiKS5mb3JFYWNoKChzY29yZWJvYXJkKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2NvcmVib2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ3AnKSkge1xuICAgICAgICAgICAgICAgIC8vIFBsYXllcidzIHNjb3JlYm9hcmRcbiAgICAgICAgICAgICAgICBbLi4uc2NvcmVib2FyZC5jaGlsZHJlbl0uZm9yRWFjaCgoc2NvcmUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlIHNjb3JlIGRpdiBJRCBhcyBoYXNoY29kZSB0byBnYXRoZXIgZGF0YVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaGlwSWR4ID0gc2NvcmUuaWQuc2xpY2UoLTEpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKFwiYm94XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm94LmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtzaGlwSWR4fWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUuYXBwZW5kQ2hpbGQoYm94KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDb21wdXRlciBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHNjb3JlLmlkLnNsaWNlKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wdXRlci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveC5jbGFzc0xpc3QuYWRkKFwiYm94XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm94LmNsYXNzTGlzdC5hZGQoYHNoaXAtJHtzaGlwSWR4fWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmUuYXBwZW5kQ2hpbGQoYm94KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2NvcmVib2FyZChwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2NvcmVib2FyZFwiKS5mb3JFYWNoKChzY29yZWJvYXJkKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2NvcmVib2FyZC5jbGFzc0xpc3QuY29udGFpbnMoJ3AnKSkge1xuICAgICAgICAgICAgICAgIC8vIFBsYXllciBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHBhcnNlSW50KHNjb3JlLmlkLnRvU3RyaW5nKCkuc2xpY2UoLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5nYW1lYm9hcmQuc2hpcHNbc2hpcElkeC0xXS5zaGlwLmlzU3Vuaykgc2NvcmUuY2xhc3NMaXN0LmFkZChcInNjb3JlLXN1bmtcIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgIHtcbiAgICAgICAgICAgICAgICAvLyBDb21wdXRlciBzY29yZWJvYXJkXG4gICAgICAgICAgICAgICAgWy4uLnNjb3JlYm9hcmQuY2hpbGRyZW5dLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBzY29yZSBkaXYgSUQgYXMgaGFzaGNvZGUgdG8gZ2F0aGVyIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpcElkeCA9IHBhcnNlSW50KHNjb3JlLmlkLnRvU3RyaW5nKCkuc2xpY2UoLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXB1dGVyLmdhbWVib2FyZC5zaGlwc1tzaGlwSWR4LTFdLnNoaXAuaXNTdW5rKSBzY29yZS5jbGFzc0xpc3QuYWRkKFwic2NvcmUtc3Vua1wiKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNyZWF0ZVNjb3JlYm9hcmQsXG4gICAgICAgIHVwZGF0ZVNjb3JlYm9hcmRcbiAgICB9XG59KSgpO1xuXG5leHBvcnQgZGVmYXVsdCBTY29yZUJvYXJkOyIsImltcG9ydCBTaGlwIGZyb20gXCIuLi9mYWN0b3JpZXMvc2hpcFwiO1xuaW1wb3J0IFBsYXllciBmcm9tIFwiLi4vZmFjdG9yaWVzL3BsYXllclwiO1xuaW1wb3J0IERyYWdEcm9wIGZyb20gXCIuL2RyYWdEcm9wXCI7XG5pbXBvcnQgQmF0dGxlc2hpcEFJIGZyb20gXCIuL2JhdHRsZXNoaXBBSVwiO1xuaW1wb3J0IFNjb3JlQm9hcmQgZnJvbSBcIi4vc2NvcmVib2FyZFwiO1xuXG5pbXBvcnQgR2l0IGZyb20gJy4uL2Fzc2V0cy9naXRodWIucG5nJztcbmltcG9ydCBGYXYgZnJvbSAnLi4vYXNzZXRzL2Zhdmljb24ucG5nJztcblxuY29uc3QgVUkgPSAoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIHNldHVwKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dpdGh1YlwiKS5zcmMgPSBHaXQ7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmYXZpY29uJykuc2V0QXR0cmlidXRlKCdocmVmJywgRmF2KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaXNwbGF5R3JpZHMoKSB7XG4gICAgICAgIGxldCBnYW1lYm9hcmRQID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQucFwiKTtcbiAgICAgICAgZ2FtZWJvYXJkUC5pbm5lckhUTUwgPSBcIlwiOyAvLyBDbGVhciBleGlzdGluZ1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBncmlkVW5pdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgZ3JpZFVuaXQuY2xhc3NMaXN0LmFkZCgnZ3JpZC11bml0Jyk7XG4gICAgICAgICAgICBncmlkVW5pdC5pZCA9IGBwJHtpfWA7IC8vIGFzc2lnbiBlYWNoIGFuIGlkIGZyb20gMCB0byBuKm4tMVxuICAgIFxuICAgICAgICAgICAgZ3JpZFVuaXQuc3R5bGUud2lkdGggPSBgY2FsYygxMCUgLSAzcHgpYDtcbiAgICAgICAgICAgIGdyaWRVbml0LnN0eWxlLmhlaWdodCA9IGBjYWxjKDEwJSAtIDNweClgO1xuICAgIFxuICAgICAgICAgICAgZ2FtZWJvYXJkUC5hcHBlbmRDaGlsZChncmlkVW5pdCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGdhbWVib2FyZEMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpO1xuICAgICAgICBnYW1lYm9hcmRDLmlubmVySFRNTCA9IFwiXCI7IC8vIENsZWFyIGV4aXN0aW5nXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGdyaWRVbml0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBncmlkVW5pdC5jbGFzc0xpc3QuYWRkKCdncmlkLXVuaXQnKTtcbiAgICAgICAgICAgIGdyaWRVbml0LmlkID0gYGMke2l9YDsgLy8gYXNzaWduIGVhY2ggYW4gaWQgZnJvbSAwIHRvIG4qbi0xXG4gICAgXG4gICAgICAgICAgICBncmlkVW5pdC5zdHlsZS53aWR0aCA9IGBjYWxjKDEwJSAtIDNweClgO1xuICAgICAgICAgICAgZ3JpZFVuaXQuc3R5bGUuaGVpZ2h0ID0gYGNhbGMoMTAlIC0gM3B4KWA7XG4gICAgXG4gICAgICAgICAgICBnYW1lYm9hcmRDLmFwcGVuZENoaWxkKGdyaWRVbml0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0R2FtZSgpIHtcbiAgICAgICAgLy8gRE9NIGZvciBwcmVwIHN0YWdlXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRcIikuc3R5bGVbJ2Rpc3BsYXknXSA9ICdmbGV4J1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIikuc3R5bGVbJ2Rpc3BsYXknXSA9ICdub25lJ1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmhlYWRlci1oZWxwZXJcIikudGV4dENvbnRlbnQgPSBcIkFzc2VtYmxlIHRoZSBmbGVldFwiO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmhlYWRlci1kZXNjXCIpLnRleHRDb250ZW50ID0gXCJEcmFnIHRvIE1vdmUgYW5kIENsaWNrIHRvIFJvdGF0ZVwiO1xuXG4gICAgICAgIC8vIFNldCBkaXNwbGF5IGZvciBwbGF5ZXIgdG8gbW92ZS9yb3RhdGUgc2hpcHMgLT4gc2hvdyBwbGF5ZXIgZ3JpZCwgbG9jayBjb21wdXRlciBncmlkXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLnBcIikuY2xhc3NMaXN0LnJlbW92ZShcImxvY2tlZFwiKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQuY1wiKS5jbGFzc0xpc3QuYWRkKFwibG9ja2VkXCIpO1xuXG4gICAgICAgIGxldCBwbGF5ZXIgPSBuZXcgUGxheWVyO1xuICAgICAgICBsZXQgY29tcHV0ZXIgPSBuZXcgUGxheWVyO1xuXG4gICAgICAgIC8vIENyZWF0ZSBET00gZ3JpZHMgYW5kIGRpc3BsYXkgXG4gICAgICAgIGRpc3BsYXlHcmlkcygpO1xuXG4gICAgICAgIC8vIFBsYWNlIHBsYXllciArIGNvbXB1dGVyIHNoaXBzIHJhbmRvbWx5XG4gICAgICAgIHBsYWNlUmFuZG9tU2hpcHMocGxheWVyKTtcbiAgICAgICAgcGxhY2VSYW5kb21TaGlwcyhjb21wdXRlcik7XG4gICAgICAgIGluaXREaXNwbGF5U2hpcHMocGxheWVyLGNvbXB1dGVyKTtcblxuICAgICAgICAvLyBDcmVhdGUgRE9NIHNjb3JlYm9hcmRcbiAgICAgICAgU2NvcmVCb2FyZC5jcmVhdGVTY29yZWJvYXJkKHBsYXllciwgY29tcHV0ZXIpO1xuXG4gICAgICAgIC8vIEFsbG93IHBsYXllciB0byBtb3ZlL3JvdGF0ZSBzaGlwIGxvY2F0aW9uc1xuICAgICAgICBwbGF5ZXJTaGlwU2VsZWN0KHBsYXllcik7XG5cbiAgICAgICAgLy8gU3RhcnQgLSBTaGlwcyBzZWxlY3RlZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXJ0XCIpLm9uY2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICAgICAgLy8gRE9NIGZvciBiYXR0bGVcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRcIikuc3R5bGVbJ2Rpc3BsYXknXSA9ICdub25lJztcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmVzdGFydFwiKS5zdHlsZVsnZGlzcGxheSddID0gJ2ZsZXgnO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5oZWFkZXItaGVscGVyXCIpLnRleHRDb250ZW50ID0gXCJMZXQgdGhlIGJhdHRsZSBiZWdpbiFcIjtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuaGVhZGVyLWRlc2NcIikudGV4dENvbnRlbnQgPSBcIktlZXAgYW4gZXllIG9uIHRoZSBzY29yZWJvYXJkXCI7XG5cbiAgICAgICAgICAgIC8vIFNldCBkaXNwbGF5IHRvIFBsYXllciBBdHRhY2sgLT4gbG9jayBwbGF5ZXIgZ3JpZCwgc2hvdyBjb21wdXRlciBncmlkIGZvciBwbGF5ZXIgYXR0YWNrXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpLmNsYXNzTGlzdC5hZGQoXCJsb2NrZWRcIik7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrZWRcIik7XG5cbiAgICAgICAgICAgIERyYWdEcm9wLnRlcm1pbmF0ZSgpOyAvLyBUZXJtaW5hdGUgZ3JpZCBldmVudHNcbiAgICAgICAgICAgIGdhbWVMb2dpYyhwbGF5ZXIsIGNvbXB1dGVyKTsgIFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzdGFydCBidXR0b24gb25jZSBnYW1lIGJlZ2luc1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Jlc3RhcnRcIikub25jbGljayA9IChlKSA9PiB7XG4gICAgICAgICAgICBpbml0R2FtZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheWVyU2hpcFNlbGVjdChwbGF5ZXIpIHtcbiAgICAgICAgRHJhZ0Ryb3AuaW5pdChwbGF5ZXIpO1xuICAgIH1cblxuICAgIC8vIEhlbHBlciBmdW5jdGlvbiAtIFJldHVybiBhcnJheSBvZiByYW5kb20gY29vcmRpbmF0ZSBwbGFjZW1lbnQgYmFzZWQgb24gc2hpcCdzIGxlbmd0aFxuICAgIGZ1bmN0aW9uIHJhbmRvbUNvb3JkaW5hdGVzKHNoaXApIHtcbiAgICAgICAgbGV0IHBvcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCk7XG4gICAgICAgIGxldCBheGlzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSggKSogMikgLy8gMCBpcyBob3JpemFudGFsLCAxIGlzIHZlcnRpY2FsXG4gICAgICAgIGxldCBjb29yZHMgPSBbLi4ubmV3IEFycmF5KHNoaXAubGVuZ3RoKS5rZXlzKCldOyAvLyBTdGFydCB3aXRoIGNvb3JkIGFycmF5IG9mIFswLi4ubl1cbiAgICAgICAgaWYgKGF4aXMgPT0gMCkge1xuICAgICAgICAgICAgLy8gSG9yaXpvbnRhbFxuICAgICAgICAgICAgY29vcmRzID0gY29vcmRzLm1hcCgoeCkgPT4geCArIHBvcyk7XG4gICAgICAgICAgICAvLyBFcnJvciBjaGVjayArIEN5Y2xlIHVudGlsIHZhbGlkIC0gbXVzdCBhbGwgaGF2ZSBzYW1lIHgvLzEwIHZhbHVlIHRvIGJlIGluIHNhbWUgeS1heGlzXG4gICAgICAgICAgICB3aGlsZSAoIWNvb3Jkcy5ldmVyeSgoeCkgPT4gTWF0aC5mbG9vcih4LzEwKSA9PSBNYXRoLmZsb29yKGNvb3Jkc1swXS8xMCkpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBvcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCk7XG4gICAgICAgICAgICAgICAgY29vcmRzID0gY29vcmRzLm1hcCgoeCkgPT4geCArIHBvcyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIb3Jpem9udGFsIHppZ3phZyAtIEN5Y2xpbmdcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChheGlzID09IDEpIHtcbiAgICAgICAgICAgIC8vIFZlcnRpY2FsIC0gbXVzdCBhbGwgaGF2ZSBzYW1lIHglMTAgdmFsdWUgdG8gYmUgaW4gc2FtZSB4LWF4aXNcbiAgICAgICAgICAgIGNvb3JkcyA9IGNvb3Jkcy5tYXAoKHgpID0+IHBvcyArICgxMCAqIHgpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2FycmF5OiBjb29yZHMsIGF4aXN9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYWNlUmFuZG9tU2hpcHMocGxheWVyKSB7XG4gICAgICAgIGxldCBmbGVldCA9IFtuZXcgU2hpcCgyKSwgbmV3IFNoaXAoMyksIG5ldyBTaGlwKDMpLCBuZXcgU2hpcCg0KSwgbmV3IFNoaXAoNSldO1xuXG4gICAgICAgIGZsZWV0LmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgICAgIGxldCBjb29yZHMgPSByYW5kb21Db29yZGluYXRlcyhzaGlwKTtcbiAgICAgICAgICAgIC8vIEVycm9yIGNoZWNrIGN5Y2xlIHVudGlsIHZhbGlkIC0gdGhlbiBwbGFjZVxuICAgICAgICAgICAgd2hpbGUgKCFwbGF5ZXIuZ2FtZWJvYXJkLmlzVmFsaWRQbGFjZW1lbnQoc2hpcCwgY29vcmRzLmFycmF5KSkge1xuICAgICAgICAgICAgICAgIGNvb3JkcyA9IHJhbmRvbUNvb3JkaW5hdGVzKHNoaXApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSW52YWxpZCByYW5kb21pemF0aW9uIC0gQ3ljbGluZ1wiKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxheWVyLmdhbWVib2FyZC5wbGFjZVNoaXAoc2hpcCwgY29vcmRzLmFycmF5KTtcbiAgICAgICAgICAgIHNoaXAuc2V0QXhpcyhjb29yZHMuYXhpcyk7XG4gICAgICAgIH0pXG4gICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdERpc3BsYXlTaGlwcyhwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIC8vIE1hcmsgZWFjaCBzaGlwIHdpdGggY2xhc3MgdG8gZGlzdGluZ3Vpc2hcbiAgICAgICAgbGV0IGkgPSAxO1xuICAgICAgICBsZXQgaiA9IDE7XG4gICAgICAgIHBsYXllci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgc2hpcE9iai5jb29yZHMuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChgc2hpcC0ke2l9YCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoXCJwbGF5ZXItc2hpcFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gTWFyayBlYWNoIHNoaXAgd2l0aCBjbGFzcyB0byBkaXN0aW5ndWlzaFxuICAgICAgICBjb21wdXRlci5nYW1lYm9hcmQuc2hpcHMuZm9yRWFjaCgoc2hpcE9iaikgPT4ge1xuICAgICAgICAgICAgc2hpcE9iai5jb29yZHMuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLmMgPiAjYyR7Y29vcmR9YCkuY2xhc3NMaXN0LmFkZChgc2hpcC0ke2p9YCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLWhpZGRlblwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlUGxhY2VkU2hpcHMob2xkQ29vcmRzLCBuZXdDb29yZHMsIHNoaXBJZHgpIHtcbiAgICAgICAgLy8gUmVwbGFjZSBjbGFzc2VzIGBzaGlwLSR7c2hpcElkeH1gICsgJ3BsYXllci1zaGlwJ1xuICAgICAgICBvbGRDb29yZHMuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5yZW1vdmUoYHNoaXAtJHtzaGlwSWR4KzF9YCk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjcCR7aWR4fWApLmNsYXNzTGlzdC5yZW1vdmUoYHBsYXllci1zaGlwYCk7XG4gICAgICAgIH0pXG4gICAgICAgIG5ld0Nvb3Jkcy5mb3JFYWNoKChpZHgpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChgc2hpcC0ke3NoaXBJZHgrMX1gKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChgcGxheWVyLXNoaXBgKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVHcmlkcyhwbGF5ZXIsIGNvbXB1dGVyKSB7XG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5ZXIgZ3JpZHNcbiAgICAgICAgbGV0IHBsYXllckF0dGFja3MgPSBwbGF5ZXIuZ2FtZWJvYXJkLmF0dGFja3M7XG4gICAgICAgIHBsYXllckF0dGFja3MuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBpZiAocGxheWVyLmdhbWVib2FyZC5ncmlkc1tpZHhdKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI3Ake2lkeH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1mb3VuZFwiKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZ2FtZWJvYXJkLnAgPiAjcCR7aWR4fWApLmlubmVySFRNTCA9IFwiJiMxMDAwNTtcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNwJHtpZHh9YCkuY2xhc3NMaXN0LmFkZChcImdyaWQtbWlzc2VkXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtpZHh9YCkuaW5uZXJIVE1MID0gXCImI3gyMDIyO1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vIFVwZGF0ZSBjb21wdXRlciBncmlkc1xuICAgICAgICBsZXQgY29tcEF0dGFja3MgPSBjb21wdXRlci5nYW1lYm9hcmQuYXR0YWNrcztcbiAgICAgICAgY29tcEF0dGFja3MuZm9yRWFjaCgoaWR4KSA9PiB7XG4gICAgICAgICAgICBpZiAoY29tcHV0ZXIuZ2FtZWJvYXJkLmdyaWRzW2lkeF0pIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjYyR7aWR4fWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLWZvdW5kXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNjJHtpZHh9YCkuY2xhc3NMaXN0LnJlbW92ZShcImdyaWQtaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtpZHh9YCkuaW5uZXJIVE1MID0gXCImIzEwMDA1O1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI2Mke2lkeH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1taXNzZWRcIik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2lkeH1gKS5pbm5lckhUTUwgPSBcIiYjeDIwMjI7XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcHMocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBwbGF5ZXIuZ2FtZWJvYXJkLnNoaXBzLmZvckVhY2goKHNoaXBPYmopID0+IHtcbiAgICAgICAgICAgIHNoaXBPYmouY29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNoaXBPYmouc2hpcC5pc1N1bmspIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5wID4gI3Ake2Nvb3JkfWApLmNsYXNzTGlzdC5hZGQoXCJncmlkLXN1bmtcIik7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQucCA+ICNwJHtjb29yZH1gKS5jbGFzc0xpc3QucmVtb3ZlKFwiZ3JpZC1mb3VuZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBpZiAoY29tcHV0ZXIpIHtcbiAgICAgICAgICAgIGNvbXB1dGVyLmdhbWVib2FyZC5zaGlwcy5mb3JFYWNoKChzaGlwT2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgc2hpcE9iai5jb29yZHMuZm9yRWFjaCgoY29vcmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoaXBPYmouc2hpcC5pc1N1bmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5nYW1lYm9hcmQuYyA+ICNjJHtjb29yZH1gKS5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1zdW5rXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmdhbWVib2FyZC5jID4gI2Mke2Nvb3JkfWApLmNsYXNzTGlzdC5yZW1vdmUoXCJncmlkLWZvdW5kXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnYW1lTG9naWMocGxheWVyLCBjb21wdXRlcikge1xuICAgICAgICBjb25zdCBncmlkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ2FtZWJvYXJkLmMgPiAuZ3JpZC11bml0XCIpO1xuICAgICAgICBncmlkcy5mb3JFYWNoKChncmlkKSA9PiB7XG4gICAgICAgICAgICBncmlkLm9uY2xpY2sgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY29tcHV0ZXIuZ2FtZWJvYXJkLmF0dGFja3MuaW5jbHVkZXMocGFyc2VJbnQoZ3JpZC5pZC5zbGljZSgxKSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXlSb3VuZChwbGF5ZXIsIGNvbXB1dGVyLCBwYXJzZUludChncmlkLmlkLnNsaWNlKDEpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBhc3luYyBmdW5jdGlvbiBwbGF5Um91bmQocGxheWVyLCBjb21wdXRlciwgaW5wdXQpIHtcbiAgICAgICAgLy8gQVRQIGdvdCBpbnB1dCAtPiBzaG93IHBsYXllciBncmlkIGZvciBBSSBhdHRhY2ssIGxvY2sgY29tcHV0ZXIgZ3JpZFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5wXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrZWRcIik7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcblxuICAgICAgICAvLyBIYW5kbGUgcGxheWVyJ3MgaW5wdXQgLT4gVXBkYXRlIEdyaWQgRGlzcGxheSAtPiBDaGVjayBpZiB3aW5uZXJcbiAgICAgICAgcGxheWVyQXR0YWNrKGNvbXB1dGVyLCBpbnB1dCk7XG4gICAgICAgIHVwZGF0ZUdyaWRzKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICB1cGRhdGVTaGlwcyhwbGF5ZXIsIGNvbXB1dGVyKTtcbiAgICAgICAgU2NvcmVCb2FyZC51cGRhdGVTY29yZWJvYXJkKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICBpZiAoY29tcHV0ZXIuZ2FtZWJvYXJkLmlzR2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgLy8gVE9ETyAtIGNyZWF0ZSBnYW1lIG92ZXIgc3R5bGluZyB0cmFuc2l0aW9uIGluIHdpbm5pbmcgcGxheWVyIGdyaWRcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcbiAgICAgICAgICAgIGdhbWVPdmVyKFwiUGxheWVyXCIsIHBsYXllcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb21wdXRlciBBdHRhY2sgLT4gVXBkYXRlIEdyaWQgRGlzcGxheSAtPiBDaGVjayBpZiB3aW5uZXJcbiAgICAgICAgYXdhaXQgZGVsYXkoNTAwKTtcblxuICAgICAgICBCYXR0bGVzaGlwQUkuQUlBdHRhY2socGxheWVyKTtcbiAgICAgICAgdXBkYXRlR3JpZHMocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIHVwZGF0ZVNoaXBzKHBsYXllciwgY29tcHV0ZXIpO1xuICAgICAgICBTY29yZUJvYXJkLnVwZGF0ZVNjb3JlYm9hcmQocGxheWVyLCBjb21wdXRlcik7XG4gICAgICAgIGlmIChwbGF5ZXIuZ2FtZWJvYXJkLmlzR2FtZU92ZXIoKSkge1xuICAgICAgICAgICAgLy8gVE9ETyAtIGNyZWF0ZSBnYW1lIG92ZXIgc3R5bGluZyB0cmFuc2l0aW9uIGluIHdpbm5pbmcgcGxheWVyIGdyaWRcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZ2FtZWJvYXJkLmNcIikuY2xhc3NMaXN0LmFkZChcImxvY2tlZFwiKTtcbiAgICAgICAgICAgIGdhbWVPdmVyKFwiQ29tcHV0ZXJcIiwgY29tcHV0ZXIpO1xuICAgICAgICB9OyAvL1RPRE8gLSBIYW5kbGUgZ2FtZSBvdmVyXG5cbiAgICAgICAgLy8gUmV2ZXJ0IGRpc3BsYXkgdG8gUGxheWVyIEF0dGFjayAtPiBsb2NrIHBsYXllciBncmlkLCBzaG93IGNvbXB1dGVyIGdyaWQgZm9yIHBsYXllciBhdHRhY2tcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5nYW1lYm9hcmQucFwiKS5jbGFzc0xpc3QuYWRkKFwibG9ja2VkXCIpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmdhbWVib2FyZC5jXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrZWRcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheWVyQXR0YWNrKGNvbXB1dGVyLCBpbnB1dCkge1xuICAgICAgICBpZiAoIWNvbXB1dGVyLmdhbWVib2FyZC5hdHRhY2tzLmluY2x1ZGVzKGlucHV0KSkge1xuICAgICAgICAgICAgY29tcHV0ZXIuZ2FtZWJvYXJkLnJlY2VpdmVBdHRhY2soaW5wdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGRlbGF5XG4gICAgZnVuY3Rpb24gZGVsYXkobXMpIHsgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQocmVzLCBtcylcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSWYgZ2FtZW92ZXIsIHBvcCBtb2RhbCBhbmQgc2hvdyB3aW5uZXIgdW50aWwgcmVzdGFydFxuICAgIGFzeW5jIGZ1bmN0aW9uIGdhbWVPdmVyKHdpbm5lclRleHQpIHtcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5yZXN1bHRcIik7XG4gICAgICAgIGNvbnN0IHRleHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnJlc3VsdC10ZXh0XCIpO1xuICAgICAgICBjb25zdCByZXN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5LWFnYWluXCIpO1xuXG4gICAgICAgIGF3YWl0IGRlbGF5KDEwMDApO1xuXG4gICAgICAgIGRpYWxvZy5zaG93TW9kYWwoKTtcbiAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoXCJyZXN1bHQtZGlzcGxheWVkXCIpO1xuICAgICAgICB0ZXh0LnRleHRDb250ZW50ID0gYCR7d2lubmVyVGV4dH0gd2lucyFgXG5cbiAgICAgICAgcmVzdGFydC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgLy8gUmVzdGFydCBnYW1lXG4gICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKFwicmVzdWx0LWRpc3BsYXllZFwiKTtcbiAgICAgICAgICAgIGluaXRHYW1lKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXR1cCxcbiAgICAgICAgZGlzcGxheUdyaWRzLFxuICAgICAgICBpbml0R2FtZSxcbiAgICAgICAgdXBkYXRlUGxhY2VkU2hpcHNcbiAgICB9XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFVJOyIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9QXJzZW5hbCtTQzppdGFsLHdnaHRAMCw0MDA7MCw3MDA7MSw0MDA7MSw3MDAmZGlzcGxheT1zd2FwKTtcIl0pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIGAvKiBGb250ICsgbWV0YSAqL1xuXG5pbWcge1xuICAgIG1heC13aWR0aDogMTAwJTtcbn1cblxuYm9keSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIG1hcmdpbjogMDtcblxuICAgIGZvbnQtZmFtaWx5OiBcIkFyc2VuYWwgU0NcIiwgc2Fucy1zZXJpZjtcbiAgICBmb250LXdlaWdodDogNDAwO1xuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcbn1cblxuLyogSGVhZGVyICovXG4uaGVhZGVyIHtcbiAgICBoZWlnaHQ6IDEyMHB4O1xuICAgIFxuICAgIGZvbnQtc2l6ZTogNDJweDtcbiAgICBtYXJnaW4tdG9wOiAxNXB4O1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5oZWFkZXItZGVzYyB7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbn1cbi8qIFN0YXJ0L3Jlc3RhcnQgYnV0dG9uICovXG4vKiBDU1MgKi9cbi5oZWFkLWJ0biB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGNvbG9yOiAjMDAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZpbGw6ICMwMDA7XG4gIGZvbnQtZmFtaWx5OiBcIkFyc2VuYWwgU0NcIiwgc2Fucy1zZXJpZjtcbiAgZm9udC1zaXplOiAxOHB4O1xuICBmb250LXdlaWdodDogNDAwO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgbGV0dGVyLXNwYWNpbmc6IC0uOHB4O1xuICBsaW5lLWhlaWdodDogMjRweDtcbiAgbWluLXdpZHRoOiAxODBweDtcbiAgb3V0bGluZTogMDtcbiAgcGFkZGluZzogOHB4IDEwcHg7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XG5cbiAgbWFyZ2luLXRvcDogMjVweDtcbn1cblxuLmhlYWQtYnRuOmZvY3VzIHtcbiAgY29sb3I6ICMxNzFlMjk7XG59XG5cbi5oZWFkLWJ0bjpob3ZlciB7XG4gIGJvcmRlci1jb2xvcjogIzA2ZjtcbiAgY29sb3I6ICMwNmY7XG4gIGZpbGw6ICMwNmY7XG59XG5cbi5oZWFkLWJ0bjphY3RpdmUge1xuICBib3JkZXItY29sb3I6ICMwNmY7XG4gIGNvbG9yOiAjMDZmO1xuICBmaWxsOiAjMDZmO1xufVxuXG4ubWFpbiB7XG4gICAgZmxleDogMTtcblxuICAgIG1hcmdpbjogYXV0bztcbiAgICB3aWR0aDogODAlO1xuXG4gICAgZGlzcGxheTogZmxleDtcblxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5wbGF5ZXIsIC5jb21wdXRlciB7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIG1pbi13aWR0aDogNDQlO1xuXG4gICAgcGFkZGluZy10b3A6IDVweDtcbiAgICBwYWRkaW5nLWJvdHRvbTogNzVweDtcblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcblxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5nYW1lYm9hcmQtbGFiZWwge1xuICAgIG1hcmdpbjogMTBweDtcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbn1cblxuLyogR2FtZWJvYXJkIHN0eWxpbmcgKi9cbi5nYW1lYm9hcmQge1xuICAgIGhlaWdodDogNDIwcHg7XG4gICAgd2lkdGg6IDQyMHB4O1xuXG4gICAgLyogb3V0bGluZTogMXB4IHNvbGlkIGJsYWNrOyAqL1xuXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG5cbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcbn1cblxuLmxvY2tlZCxcbi5nYW1lYm9hcmQtbGFiZWw6aGFzKCsgLmxvY2tlZCkge1xuICAgIG9wYWNpdHk6IDAuNDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cblxuLyogR3JpZC11bml0cyBzdHlsaW5nIC0gYWxsIHN0YXRlcyAqL1xuLyogRW1wdHkgR3JpZCAtIGRlZmF1bHQgKi9cbi5ncmlkLXVuaXQge1xuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4O1xuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgbWFyZ2luOiAxLjVweDsgLyogY291cGxlZCB3aXRoIFVJLmRpc3BsYXlHcmlkcygpKi9cblxuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmdhbWVib2FyZC5jIHtcbiAgICBjdXJzb3I6IGNyb3NzaGFpcjtcbn1cblxuLmdyaWQtbWlzc2VkIHtcbiAgICBmb250LXNpemU6IDI0cHg7XG4gICAgb3V0bGluZTogcmdiKDIyMCwzNiwzMSkgc29saWQgMC41cHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMjAsMzYsMzEsIDAuMyk7XG59XG5cbi8qIFByaW9yaXR5IFN0YXRlIFN0eWxpbmcgLT4gQW55IDMgb2YgdGhlc2Ugd2lsbCBub3QgYmUgbXV0dWFsbHkgYXBwbGllZCBhdCBhbnkgcG9pbnQqL1xuLmdyaWQtaGlkZGVuIHtcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlICFpbXBvcnRhbnQ7ICAgIFxufVxuXG4uZ3JpZC1mb3VuZCB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIG91dGxpbmU6IHJnYigyMywxNTksMTAyKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjMsMTU5LDEwMiwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4uZ3JpZC1zdW5rIHtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoOTIsIDE1OCwgMTczLCAwLjEpICFpbXBvcnRhbnQ7XG59XG5cbi8qIEdyaWQtc2hpcCBpbmRpdmlkdWFsIHN0eWxpbmcqL1xuLnNoaXAtMSB7XG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDIwLDI1NSwgMC4zKTtcbn1cblxuLnNoaXAtMiB7XG4gICAgb3V0bGluZTogcmdiKDIwLDUwLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpO1xufVxuXG4uc2hpcC0zIHtcbiAgICBvdXRsaW5lOiByZ2IoNTEsMTAyLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsMTAyLDI1NSwgMC4zKTtcbn1cblxuLnNoaXAtNCB7XG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LDEzNiwyNTUsIDAuMyk7XG59XG5cbi5zaGlwLTUge1xuICAgIG91dGxpbmU6IHJnYigxMTksMTcwLDI1NSkgc29saWQgMXB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMyk7XG59XG5cbi8qIERyYWcgZHJvcCBwcmV2aWV3IHN0eWxpbmcgZm9yIGVhY2ggc2hpcCovXG4ucHJldmlldy1zaGlwLTEge1xuICAgIG91dGxpbmU6IHJnYigwLDIwLDI1NSkgc29saWQgMXB4ICFpbXBvcnRhbnQ7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDIwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4ucHJldmlldy1zaGlwLTIge1xuICAgIG91dGxpbmU6IHJnYigyMCw1MCwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpICFpbXBvcnRhbnQ7XG59XG5cbi5wcmV2aWV3LXNoaXAtMyB7XG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNTEsMTAyLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xufVxuXG4ucHJldmlldy1zaGlwLTQge1xuICAgIG91dGxpbmU6IHJnYig4NSwxMzYsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LDEzNiwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnByZXZpZXctc2hpcC01IHtcbiAgICBvdXRsaW5lOiByZ2IoMTE5LDE3MCwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMykgIWltcG9ydGFudDtcbn1cblxuLnNoaXAtZHJvcHBhYmxlIHtcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzMSwyNDUsMjQ0LDAuNik7XG59XG5cbi8qIFNjb3JlYm9hcmQgU3R5bGluZyAqL1xuXG4uc2NvcmVib2FyZC1sYWJlbCB7XG4gICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xufVxuXG4uc2NvcmVib2FyZCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblxuICAgIGdhcDogMTBweDtcbn1cblxuLnNjb3JlYm9hcmQgPiBkaXYge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZ2FwOiAxcHg7XG59XG5cbi5zY29yZWJvYXJkID4gZGl2LnNjb3JlLXN1bmsge1xuICAgIGRpc3BsYXk6IG5vbmU7XG59XG5cbi5ib3gge1xuICAgIG91dGxpbmU6IDBweCAhaW1wb3J0YW50O1xuICAgIHdpZHRoOiAxNXB4O1xuICAgIGhlaWdodDogMTVweDtcbn1cblxuXG4vKiByZXN1bHRzIG1vZGFsIHN0eWxpbmcgKi9cbmRpYWxvZzo6YmFja2Ryb3Age1xuICAgIG9wYWNpdHk6IDAuOTtcbn1cblxuLnJlc3VsdCB7XG4gICAgd2lkdGg6IDQwJTtcbiAgICBoZWlnaHQ6IDQwdmg7XG5cbiAgICBib3JkZXI6IDFweCBzb2xpZCBibGFjaztcbn1cblxuLyogcmVzdWx0IG1vZGFsIGZsZXggdG8gYmUgcnVuIG9ubHkgd2hlbiBkaXNwbGF5ZWQgKi9cbi5yZXN1bHQtZGlzcGxheWVkIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xufVxuXG4ucmVzdWx0LXRleHQge1xuICAgIG1hcmdpbi1ib3R0b206IDMwcHg7XG4gICAgZm9udC1zaXplOiA0MnB4O1xufVxuXG4jcGxheS1hZ2FpbiB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNGRkZGRkY7XG4gIGJvcmRlcjogMXB4IHNvbGlkICMyMjIyMjI7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGNvbG9yOiAjMjIyMjIyO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgZm9udC1mYW1pbHk6ICdBcnNlbmFsIFNDJywtYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCxSb2JvdG8sXCJIZWx2ZXRpY2EgTmV1ZVwiLHNhbnMtc2VyaWY7XG4gIGZvbnQtc2l6ZTogMTZweDtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gIG1hcmdpbjogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgcGFkZGluZzogMTNweCAyM3B4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcbiAgdHJhbnNpdGlvbjogYm94LXNoYWRvdyAuMnMsLW1zLXRyYW5zZm9ybSAuMXMsLXdlYmtpdC10cmFuc2Zvcm0gLjFzLHRyYW5zZm9ybSAuMXM7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICB3aWR0aDogYXV0bztcbn1cblxuI3BsYXktYWdhaW46YWN0aXZlIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogI0Y3RjdGNztcbiAgYm9yZGVyLWNvbG9yOiAjMDAwMDAwO1xuICB0cmFuc2Zvcm06IHNjYWxlKC45Nik7XG59XG5cbiNwbGF5LWFnYWluOmRpc2FibGVkIHtcbiAgYm9yZGVyLWNvbG9yOiAjREREREREO1xuICBjb2xvcjogI0RERERERDtcbiAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbiAgb3BhY2l0eTogMTtcbn1cblxuLmZvb3RlciB7XG4gICAgZm9udC1mYW1pbHk6IFwiQXJzZW5hbCBTQ1wiLCBzYW5zLXNlcmlmO1xuXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgY29sb3I6IGJsYWNrO1xuICAgIGhlaWdodDogMTAwcHg7XG5cbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG5cbiAgICBmb250LXNpemU6IDE2cHg7XG59XG5cbi5naXRodWItbG9nbyB7XG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XG4gICAgd2lkdGg6IDI0cHg7XG4gICAgaGVpZ2h0OiAyNHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmdpdGh1Yi1hIGltZ3tcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgdHJhbnNpdGlvbjogYWxsIDMwMG1zO1xufVxuXG4uZ2l0aHViLWEgaW1nOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZykgc2NhbGUoMS4xKTtcbn1cblxuLyogTWVkaWEgcXVlcnkgKi9cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMzAwcHgpIHtcbiAgICAubWFpbiB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgIH1cbn1cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAxMDAwcHgpIHtcbiAgICAuZ2FtZWJvYXJkIHtcbiAgICAgICAgd2lkdGg6IDM1MHB4O1xuICAgICAgICBoZWlnaHQ6IDM1MHB4O1xuICAgIH1cbiAgICAubWFpbiB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgIH1cbn1cblxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MDBweCkge1xuICAgIC5tYWluIHtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICB9XG4gICAgLmhlYWRlciB7XG4gICAgICAgIGhlaWdodDogMjAwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gICAgfVxuICAgIC5nYW1lYm9hcmQge1xuICAgICAgICB3aWR0aDogNDcwcHg7XG4gICAgICAgIGhlaWdodDogNDcwcHg7XG4gICAgfVxufVxuXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ4MHB4KSB7XG4gICAgLmdhbWVib2FyZCB7XG4gICAgICAgIHdpZHRoOiAzNTBweDtcbiAgICAgICAgaGVpZ2h0OiAzNTBweDtcbiAgICB9XG59YCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLGdCQUFnQjs7QUFHaEI7SUFDSSxlQUFlO0FBQ25COztBQUVBO0lBQ0ksYUFBYTtJQUNiLHNCQUFzQjtJQUN0QixTQUFTOztJQUVULHFDQUFxQztJQUNyQyxnQkFBZ0I7SUFDaEIsa0JBQWtCO0FBQ3RCOztBQUVBLFdBQVc7QUFDWDtJQUNJLGFBQWE7O0lBRWIsZUFBZTtJQUNmLGdCQUFnQjs7SUFFaEIsYUFBYTtJQUNiLHNCQUFzQjtJQUN0Qix1QkFBdUI7SUFDdkIsbUJBQW1CO0FBQ3ZCOztBQUVBO0lBQ0ksZUFBZTtJQUNmLGtCQUFrQjtBQUN0QjtBQUNBLHlCQUF5QjtBQUN6QixRQUFRO0FBQ1I7RUFDRSxtQkFBbUI7RUFDbkIsc0JBQXNCO0VBQ3RCLHNCQUFzQjtFQUN0QixzQkFBc0I7RUFDdEIsV0FBVztFQUNYLGVBQWU7RUFDZixhQUFhO0VBQ2IsVUFBVTtFQUNWLHFDQUFxQztFQUNyQyxlQUFlO0VBQ2YsZ0JBQWdCO0VBQ2hCLHVCQUF1QjtFQUN2QixxQkFBcUI7RUFDckIsaUJBQWlCO0VBQ2pCLGdCQUFnQjtFQUNoQixVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGtCQUFrQjtFQUNsQixxQkFBcUI7RUFDckIsbUJBQW1CO0VBQ25CLGlCQUFpQjtFQUNqQix5QkFBeUI7RUFDekIsMEJBQTBCOztFQUUxQixnQkFBZ0I7QUFDbEI7O0FBRUE7RUFDRSxjQUFjO0FBQ2hCOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLFdBQVc7RUFDWCxVQUFVO0FBQ1o7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsV0FBVztFQUNYLFVBQVU7QUFDWjs7QUFFQTtJQUNJLE9BQU87O0lBRVAsWUFBWTtJQUNaLFVBQVU7O0lBRVYsYUFBYTs7SUFFYixtQkFBbUI7SUFDbkIsdUJBQXVCO0FBQzNCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLGNBQWM7O0lBRWQsZ0JBQWdCO0lBQ2hCLG9CQUFv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SUFDYix1QkFBdUI7SUFDdkIsbUJBQW1COztJQUVuQixlQUFlO0FBQ25COztBQUVBO0lBQ0ksaUJBQWlCO0lBQ2pCLFdBQVc7SUFDWCxZQUFZO0lBQ1osYUFBYTtJQUNiLHVCQUF1QjtJQUN2QixtQkFBbUI7QUFDdkI7O0FBRUE7SUFDSSxZQUFZO0lBQ1oscUJBQXFCO0FBQ3pCOztBQUVBO0lBQ0ksVUFBVTtJQUNWLG9DQUFvQztBQUN4Qzs7QUFFQSxnQkFBZ0I7O0FBRWhCO0lBQ0k7UUFDSSxXQUFXO0lBQ2Y7QUFDSjs7QUFFQTtJQUNJO1FBQ0ksWUFBWTtRQUNaLGFBQWE7SUFDakI7SUFDQTtRQUNJLFdBQVc7SUFDZjtBQUNKOztBQUVBO0lBQ0k7UUFDSSxhQUFhO1FBQ2Isc0JBQXNCO0lBQzFCO0lBQ0E7UUFDSSxhQUFhO1FBQ2IsbUJBQW1CO0lBQ3ZCO0lBQ0E7UUFDSSxZQUFZO1FBQ1osYUFBYTtJQUNqQjtBQUNKOztBQUVBO0lBQ0k7UUFDSSxZQUFZO1FBQ1osYUFBYTtJQUNqQjtBQUNKXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi8qIEZvbnQgKyBtZXRhICovXFxuQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9QXJzZW5hbCtTQzppdGFsLHdnaHRAMCw0MDA7MCw3MDA7MSw0MDA7MSw3MDAmZGlzcGxheT1zd2FwJyk7XFxuXFxuaW1nIHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbn1cXG5cXG5ib2R5IHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgbWFyZ2luOiAwO1xcblxcbiAgICBmb250LWZhbWlseTogXFxcIkFyc2VuYWwgU0NcXFwiLCBzYW5zLXNlcmlmO1xcbiAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxufVxcblxcbi8qIEhlYWRlciAqL1xcbi5oZWFkZXIge1xcbiAgICBoZWlnaHQ6IDEyMHB4O1xcbiAgICBcXG4gICAgZm9udC1zaXplOiA0MnB4O1xcbiAgICBtYXJnaW4tdG9wOiAxNXB4O1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuLmhlYWRlci1kZXNjIHtcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XFxufVxcbi8qIFN0YXJ0L3Jlc3RhcnQgYnV0dG9uICovXFxuLyogQ1NTICovXFxuLmhlYWQtYnRuIHtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcbiAgYm9yZGVyOiAxcHggc29saWQgIzAwMDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBjb2xvcjogIzAwMDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmaWxsOiAjMDAwO1xcbiAgZm9udC1mYW1pbHk6IFxcXCJBcnNlbmFsIFNDXFxcIiwgc2Fucy1zZXJpZjtcXG4gIGZvbnQtc2l6ZTogMThweDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGxldHRlci1zcGFjaW5nOiAtLjhweDtcXG4gIGxpbmUtaGVpZ2h0OiAyNHB4O1xcbiAgbWluLXdpZHRoOiAxODBweDtcXG4gIG91dGxpbmU6IDA7XFxuICBwYWRkaW5nOiA4cHggMTBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIHRyYW5zaXRpb246IGFsbCAuM3M7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XFxuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcXG5cXG4gIG1hcmdpbi10b3A6IDI1cHg7XFxufVxcblxcbi5oZWFkLWJ0bjpmb2N1cyB7XFxuICBjb2xvcjogIzE3MWUyOTtcXG59XFxuXFxuLmhlYWQtYnRuOmhvdmVyIHtcXG4gIGJvcmRlci1jb2xvcjogIzA2ZjtcXG4gIGNvbG9yOiAjMDZmO1xcbiAgZmlsbDogIzA2ZjtcXG59XFxuXFxuLmhlYWQtYnRuOmFjdGl2ZSB7XFxuICBib3JkZXItY29sb3I6ICMwNmY7XFxuICBjb2xvcjogIzA2ZjtcXG4gIGZpbGw6ICMwNmY7XFxufVxcblxcbi5tYWluIHtcXG4gICAgZmxleDogMTtcXG5cXG4gICAgbWFyZ2luOiBhdXRvO1xcbiAgICB3aWR0aDogODAlO1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcblxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuLnBsYXllciwgLmNvbXB1dGVyIHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBtaW4td2lkdGg6IDQ0JTtcXG5cXG4gICAgcGFkZGluZy10b3A6IDVweDtcXG4gICAgcGFkZGluZy1ib3R0b206IDc1cHg7XFxuXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuXFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5nYW1lYm9hcmQtbGFiZWwge1xcbiAgICBtYXJnaW46IDEwcHg7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcbn1cXG5cXG4vKiBHYW1lYm9hcmQgc3R5bGluZyAqL1xcbi5nYW1lYm9hcmQge1xcbiAgICBoZWlnaHQ6IDQyMHB4O1xcbiAgICB3aWR0aDogNDIwcHg7XFxuXFxuICAgIC8qIG91dGxpbmU6IDFweCBzb2xpZCBibGFjazsgKi9cXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiB3cmFwO1xcblxcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcztcXG59XFxuXFxuLmxvY2tlZCxcXG4uZ2FtZWJvYXJkLWxhYmVsOmhhcygrIC5sb2NrZWQpIHtcXG4gICAgb3BhY2l0eTogMC40O1xcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcXG59XFxuXFxuLyogR3JpZC11bml0cyBzdHlsaW5nIC0gYWxsIHN0YXRlcyAqL1xcbi8qIEVtcHR5IEdyaWQgLSBkZWZhdWx0ICovXFxuLmdyaWQtdW5pdCB7XFxuICAgIG91dGxpbmU6IHJnYig5MiwgMTU4LCAxNzMpIHNvbGlkIDAuNXB4O1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgICBtYXJnaW46IDEuNXB4OyAvKiBjb3VwbGVkIHdpdGggVUkuZGlzcGxheUdyaWRzKCkqL1xcblxcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuLmdhbWVib2FyZC5jIHtcXG4gICAgY3Vyc29yOiBjcm9zc2hhaXI7XFxufVxcblxcbi5ncmlkLW1pc3NlZCB7XFxuICAgIGZvbnQtc2l6ZTogMjRweDtcXG4gICAgb3V0bGluZTogcmdiKDIyMCwzNiwzMSkgc29saWQgMC41cHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjIwLDM2LDMxLCAwLjMpO1xcbn1cXG5cXG4vKiBQcmlvcml0eSBTdGF0ZSBTdHlsaW5nIC0+IEFueSAzIG9mIHRoZXNlIHdpbGwgbm90IGJlIG11dHVhbGx5IGFwcGxpZWQgYXQgYW55IHBvaW50Ki9cXG4uZ3JpZC1oaWRkZW4ge1xcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZSAhaW1wb3J0YW50OyAgICBcXG59XFxuXFxuLmdyaWQtZm91bmQge1xcbiAgICBmb250LXNpemU6IDEycHg7XFxuICAgIG91dGxpbmU6IHJnYigyMywxNTksMTAyKSBzb2xpZCAwLjVweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzLDE1OSwxMDIsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLmdyaWQtc3VuayB7XFxuICAgIGZvbnQtc2l6ZTogMTJweDtcXG4gICAgb3V0bGluZTogcmdiKDkyLCAxNTgsIDE3Mykgc29saWQgMC41cHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDkyLCAxNTgsIDE3MywgMC4xKSAhaW1wb3J0YW50O1xcbn1cXG5cXG4vKiBHcmlkLXNoaXAgaW5kaXZpZHVhbCBzdHlsaW5nKi9cXG4uc2hpcC0xIHtcXG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwyMCwyNTUsIDAuMyk7XFxufVxcblxcbi5zaGlwLTIge1xcbiAgICBvdXRsaW5lOiByZ2IoMjAsNTAsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjAsNTAsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC0zIHtcXG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1MSwxMDIsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC00IHtcXG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg4NSwxMzYsMjU1LCAwLjMpO1xcbn1cXG5cXG4uc2hpcC01IHtcXG4gICAgb3V0bGluZTogcmdiKDExOSwxNzAsMjU1KSBzb2xpZCAxcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTE5LDE3MCwyNTUsIDAuMyk7XFxufVxcblxcbi8qIERyYWcgZHJvcCBwcmV2aWV3IHN0eWxpbmcgZm9yIGVhY2ggc2hpcCovXFxuLnByZXZpZXctc2hpcC0xIHtcXG4gICAgb3V0bGluZTogcmdiKDAsMjAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLDIwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xcbn1cXG5cXG4ucHJldmlldy1zaGlwLTIge1xcbiAgICBvdXRsaW5lOiByZ2IoMjAsNTAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMCw1MCwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC0zIHtcXG4gICAgb3V0bGluZTogcmdiKDUxLDEwMiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDUxLDEwMiwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC00IHtcXG4gICAgb3V0bGluZTogcmdiKDg1LDEzNiwyNTUpIHNvbGlkIDFweCAhaW1wb3J0YW50O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDg1LDEzNiwyNTUsIDAuMykgIWltcG9ydGFudDtcXG59XFxuXFxuLnByZXZpZXctc2hpcC01IHtcXG4gICAgb3V0bGluZTogcmdiKDExOSwxNzAsMjU1KSBzb2xpZCAxcHggIWltcG9ydGFudDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMTksMTcwLDI1NSwgMC4zKSAhaW1wb3J0YW50O1xcbn1cXG5cXG4uc2hpcC1kcm9wcGFibGUge1xcbiAgICBvdXRsaW5lOiByZ2IoOTIsIDE1OCwgMTczKSBzb2xpZCAwLjVweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzEsMjQ1LDI0NCwwLjYpO1xcbn1cXG5cXG4vKiBTY29yZWJvYXJkIFN0eWxpbmcgKi9cXG5cXG4uc2NvcmVib2FyZC1sYWJlbCB7XFxuICAgIG1hcmdpbi10b3A6IDIwcHg7XFxuICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XFxufVxcblxcbi5zY29yZWJvYXJkIHtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuXFxuICAgIGdhcDogMTBweDtcXG59XFxuXFxuLnNjb3JlYm9hcmQgPiBkaXYge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBnYXA6IDFweDtcXG59XFxuXFxuLnNjb3JlYm9hcmQgPiBkaXYuc2NvcmUtc3VuayB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5ib3gge1xcbiAgICBvdXRsaW5lOiAwcHggIWltcG9ydGFudDtcXG4gICAgd2lkdGg6IDE1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG59XFxuXFxuXFxuLyogcmVzdWx0cyBtb2RhbCBzdHlsaW5nICovXFxuZGlhbG9nOjpiYWNrZHJvcCB7XFxuICAgIG9wYWNpdHk6IDAuOTtcXG59XFxuXFxuLnJlc3VsdCB7XFxuICAgIHdpZHRoOiA0MCU7XFxuICAgIGhlaWdodDogNDB2aDtcXG5cXG4gICAgYm9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxufVxcblxcbi8qIHJlc3VsdCBtb2RhbCBmbGV4IHRvIGJlIHJ1biBvbmx5IHdoZW4gZGlzcGxheWVkICovXFxuLnJlc3VsdC1kaXNwbGF5ZWQge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcblxcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuLnJlc3VsdC10ZXh0IHtcXG4gICAgbWFyZ2luLWJvdHRvbTogMzBweDtcXG4gICAgZm9udC1zaXplOiA0MnB4O1xcbn1cXG5cXG4jcGxheS1hZ2FpbiB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRkZGRkZGO1xcbiAgYm9yZGVyOiAxcHggc29saWQgIzIyMjIyMjtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICBjb2xvcjogIzIyMjIyMjtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGZvbnQtZmFtaWx5OiAnQXJzZW5hbCBTQycsLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsUm9ib3RvLFxcXCJIZWx2ZXRpY2EgTmV1ZVxcXCIsc2Fucy1zZXJpZjtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIGZvbnQtd2VpZ2h0OiA2MDA7XFxuICBsaW5lLWhlaWdodDogMjBweDtcXG4gIG1hcmdpbjogMDtcXG4gIG91dGxpbmU6IG5vbmU7XFxuICBwYWRkaW5nOiAxM3B4IDIzcHg7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcXG4gIHRyYW5zaXRpb246IGJveC1zaGFkb3cgLjJzLC1tcy10cmFuc2Zvcm0gLjFzLC13ZWJraXQtdHJhbnNmb3JtIC4xcyx0cmFuc2Zvcm0gLjFzO1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xcbiAgd2lkdGg6IGF1dG87XFxufVxcblxcbiNwbGF5LWFnYWluOmFjdGl2ZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjRjdGN0Y3O1xcbiAgYm9yZGVyLWNvbG9yOiAjMDAwMDAwO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSguOTYpO1xcbn1cXG5cXG4jcGxheS1hZ2FpbjpkaXNhYmxlZCB7XFxuICBib3JkZXItY29sb3I6ICNEREREREQ7XFxuICBjb2xvcjogI0RERERERDtcXG4gIGN1cnNvcjogbm90LWFsbG93ZWQ7XFxuICBvcGFjaXR5OiAxO1xcbn1cXG5cXG4uZm9vdGVyIHtcXG4gICAgZm9udC1mYW1pbHk6IFxcXCJBcnNlbmFsIFNDXFxcIiwgc2Fucy1zZXJpZjtcXG5cXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxuICAgIGNvbG9yOiBibGFjaztcXG4gICAgaGVpZ2h0OiAxMDBweDtcXG5cXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG59XFxuXFxuLmdpdGh1Yi1sb2dvIHtcXG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7XFxuICAgIHdpZHRoOiAyNHB4O1xcbiAgICBoZWlnaHQ6IDI0cHg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG4uZ2l0aHViLWEgaW1ne1xcbiAgICBvcGFjaXR5OiAwLjU7XFxuICAgIHRyYW5zaXRpb246IGFsbCAzMDBtcztcXG59XFxuXFxuLmdpdGh1Yi1hIGltZzpob3ZlciB7XFxuICAgIG9wYWNpdHk6IDE7XFxuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZykgc2NhbGUoMS4xKTtcXG59XFxuXFxuLyogTWVkaWEgcXVlcnkgKi9cXG5cXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDEzMDBweCkge1xcbiAgICAubWFpbiB7XFxuICAgICAgICB3aWR0aDogMTAwJTtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDEwMDBweCkge1xcbiAgICAuZ2FtZWJvYXJkIHtcXG4gICAgICAgIHdpZHRoOiAzNTBweDtcXG4gICAgICAgIGhlaWdodDogMzUwcHg7XFxuICAgIH1cXG4gICAgLm1haW4ge1xcbiAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgIH1cXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA4MDBweCkge1xcbiAgICAubWFpbiB7XFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgfVxcbiAgICAuaGVhZGVyIHtcXG4gICAgICAgIGhlaWdodDogMjAwcHg7XFxuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xcbiAgICB9XFxuICAgIC5nYW1lYm9hcmQge1xcbiAgICAgICAgd2lkdGg6IDQ3MHB4O1xcbiAgICAgICAgaGVpZ2h0OiA0NzBweDtcXG4gICAgfVxcbn1cXG5cXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6IDQ4MHB4KSB7XFxuICAgIC5nYW1lYm9hcmQge1xcbiAgICAgICAgd2lkdGg6IDM1MHB4O1xcbiAgICAgICAgaGVpZ2h0OiAzNTBweDtcXG4gICAgfVxcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcbm9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBzY3JpcHRVcmw7XG5pZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5nLmltcG9ydFNjcmlwdHMpIHNjcmlwdFVybCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5sb2NhdGlvbiArIFwiXCI7XG52YXIgZG9jdW1lbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcuZG9jdW1lbnQ7XG5pZiAoIXNjcmlwdFVybCAmJiBkb2N1bWVudCkge1xuXHRpZiAoZG9jdW1lbnQuY3VycmVudFNjcmlwdClcblx0XHRzY3JpcHRVcmwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYztcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSB7XG5cdFx0XHR2YXIgaSA9IHNjcmlwdHMubGVuZ3RoIC0gMTtcblx0XHRcdHdoaWxlIChpID4gLTEgJiYgKCFzY3JpcHRVcmwgfHwgIS9eaHR0cChzPyk6Ly50ZXN0KHNjcmlwdFVybCkpKSBzY3JpcHRVcmwgPSBzY3JpcHRzW2ktLV0uc3JjO1xuXHRcdH1cblx0fVxufVxuLy8gV2hlbiBzdXBwb3J0aW5nIGJyb3dzZXJzIHdoZXJlIGFuIGF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgeW91IG11c3Qgc3BlY2lmeSBhbiBvdXRwdXQucHVibGljUGF0aCBtYW51YWxseSB2aWEgY29uZmlndXJhdGlvblxuLy8gb3IgcGFzcyBhbiBlbXB0eSBzdHJpbmcgKFwiXCIpIGFuZCBzZXQgdGhlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHZhcmlhYmxlIGZyb20geW91ciBjb2RlIHRvIHVzZSB5b3VyIG93biBsb2dpYy5cbmlmICghc2NyaXB0VXJsKSB0aHJvdyBuZXcgRXJyb3IoXCJBdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlclwiKTtcbnNjcmlwdFVybCA9IHNjcmlwdFVybC5yZXBsYWNlKC8jLiokLywgXCJcIikucmVwbGFjZSgvXFw/LiokLywgXCJcIikucmVwbGFjZSgvXFwvW15cXC9dKyQvLCBcIi9cIik7XG5fX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBzY3JpcHRVcmw7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCJpbXBvcnQgJy4vc3R5bGUvc3R5bGUuY3NzJztcbmltcG9ydCBVSSBmcm9tICcuL21vZHVsZXMvdWknXG5cblVJLnNldHVwKCk7XG5VSS5pbml0R2FtZSgpO1xuIl0sIm5hbWVzIjpbIlNoaXAiLCJHYW1lYm9hcmQiLCJjb25zdHJ1Y3RvciIsImdyaWRzIiwiQXJyYXkiLCJmaWxsIiwiYXR0YWNrcyIsInNoaXBzIiwiaXNWYWxpZFBsYWNlbWVudCIsInNoaXAiLCJjb29yZHMiLCJpc1ZhbGlkIiwiZm9yRWFjaCIsImlkeCIsImxlbmd0aCIsInBsYWNlU2hpcCIsInB1c2giLCJyZWNlaXZlQXR0YWNrIiwiY29vcmQiLCJpbmNsdWRlcyIsImhpdCIsImdldE1pc3NlcyIsIm1pc3NlcyIsImF0dGFjayIsImdldFJlbWFpbmluZyIsInJlbWFpbmluZyIsImkiLCJpc0dhbWVPdmVyIiwiZ2FtZW92ZXIiLCJzaGlwT2JqIiwiaXNTdW5rIiwiUGxheWVyIiwiZ2FtZWJvYXJkIiwiYXhpcyIsImFyZ3VtZW50cyIsInVuZGVmaW5lZCIsImhpdHMiLCJzZXRBeGlzIiwiZ2V0QXhpcyIsIkRyYWdEcm9wIiwiU2NvcmVCb2FyZCIsIkJhdHRsZXNoaXBBSSIsIkFJQXR0YWNrIiwicGxheWVyIiwiaGl0c05vdFN1bmsiLCJmaWx0ZXIiLCJ0YXJnZXQiLCJjb25zb2xlIiwibG9nIiwidGFyZ2V0SGl0cyIsIk5XU0UiLCJiYXNlIiwib2Zmc2V0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibmV4dCIsIm1pbiIsInJlbWFpbmluZ1NoaXBzIiwiY2hlY2tJZkZpdCIsInNoaXBMZW5ndGgiLCJXRSIsIm1heCIsIk5TIiwib3B0aW9ucyIsIlVJIiwiaW5pdCIsInJlc2V0RXZlbnRzIiwic2V0RHJhZ2dhYmxlQXJlYSIsImRyYWciLCJjbGljayIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImdyaWQiLCJvbmRyYWdzdGFydCIsImUiLCJvbmRyYWdlbnRlciIsInByZXZlbnREZWZhdWx0Iiwib25kcmFnZW5kIiwib25kcmFnb3ZlciIsIm9uY2xpY2siLCJzZXRBdHRyaWJ1dGUiLCJzdHlsZSIsInBsYXllclNoaXBzIiwiaXNEcm9wcGFibGUiLCJzZXREcm9wcGFibGVBcmVhIiwic2hpcE9mZnNldCIsImNsYXNzTGlzdCIsInJlbW92ZSIsInBsYXllckdyaWRzIiwiaGVhZCIsInBhcnNlSW50IiwiaWQiLCJzbGljZSIsImtleXMiLCJtYXAiLCJ4IiwiZXZlcnkiLCJhZGQiLCJnZXRFbGVtZW50QnlJZCIsImRhdGFUcmFuc2ZlciIsImVmZmVjdEFsbG93ZWQiLCJjbGFzc2VzIiwic2hpcElkeCIsImZpbmQiLCJ2YWx1ZSIsInN0YXJ0c1dpdGgiLCJzb3J0IiwiYSIsImIiLCJmaW5kSW5kZXgiLCJkcmFnRW50ZXIiLCJkcmFnRW5kIiwiZHJvcHBhYmxlIiwiZHJvcEVmZmVjdCIsInByZXZpZXciLCJxdWVyeVNlbGVjdG9yIiwiZHJhZ0Ryb3AiLCJwb3RlbnRpYWxDb29yZHMiLCJvbmRyb3AiLCJvbGRDb29yZHMiLCJyZXBsYWNlU2hpcCIsIm5ld0Nvb3JkcyIsIm5ld0F4aXMiLCJ1cGRhdGVQbGFjZWRTaGlwcyIsInNoYWtlIiwiYW5pbWF0ZSIsInRyYW5zZm9ybSIsInRlcm1pbmF0ZSIsImNyZWF0ZVNjb3JlYm9hcmQiLCJjb21wdXRlciIsInNjb3JlIiwiaW5uZXJIVE1MIiwic2NvcmVib2FyZCIsImNvbnRhaW5zIiwiY2hpbGRyZW4iLCJib3giLCJjcmVhdGVFbGVtZW50IiwiYXBwZW5kQ2hpbGQiLCJ1cGRhdGVTY29yZWJvYXJkIiwidG9TdHJpbmciLCJHaXQiLCJGYXYiLCJzZXR1cCIsInNyYyIsImRpc3BsYXlHcmlkcyIsImdhbWVib2FyZFAiLCJncmlkVW5pdCIsIndpZHRoIiwiaGVpZ2h0IiwiZ2FtZWJvYXJkQyIsImluaXRHYW1lIiwidGV4dENvbnRlbnQiLCJwbGFjZVJhbmRvbVNoaXBzIiwiaW5pdERpc3BsYXlTaGlwcyIsInBsYXllclNoaXBTZWxlY3QiLCJnYW1lTG9naWMiLCJyYW5kb21Db29yZGluYXRlcyIsInBvcyIsImFycmF5IiwiZmxlZXQiLCJqIiwidXBkYXRlR3JpZHMiLCJwbGF5ZXJBdHRhY2tzIiwiY29tcEF0dGFja3MiLCJ1cGRhdGVTaGlwcyIsInBsYXlSb3VuZCIsImlucHV0IiwicGxheWVyQXR0YWNrIiwiZ2FtZU92ZXIiLCJkZWxheSIsIm1zIiwiUHJvbWlzZSIsInJlcyIsInJlaiIsInNldFRpbWVvdXQiLCJ3aW5uZXJUZXh0IiwiZGlhbG9nIiwidGV4dCIsInJlc3RhcnQiLCJzaG93TW9kYWwiLCJjbG9zZSJdLCJzb3VyY2VSb290IjoiIn0=