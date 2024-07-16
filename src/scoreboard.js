import Gameboard from "./gameboard";
import Ship from "./ship";
import Player from "./player";
import DragDrop from "./dragDrop";

const ScoreBoard = (() => {
    function createScoreboard(player) {
        document.querySelectorAll(".scoreboard").forEach((score) => {
            // Use score div ID as hashcode to gather data
            const shipIdx = parseInt(score.id.toString().slice(-1));

            for (let i = 0; i < player.gameboard.ships[shipIdx-1].ship.length; i++) {
                let box = document.createElement("div");
                box.classList.add("box");
                box.classList.add(`ship-${shipIdx}`);
                score.appendChild(box);
            }
        })
    }

    function updateScoreboard(player, computer) {
        document.querySelectorAll(".scoreboard").forEach((score) => {
            // Use score div ID as hashcode to gather data
            const playerCode = score.id.toString().charAt(0);
            const shipIdx = parseInt(score.id.toString().slice(-1));

            if (playerCode == "p") {
                if (player.gameboard.ships[shipIdx-1].ship.isSunk) score.classList.add("score-sunk");
            }
            else {
                if (computer.gameboard.ships[shipIdx-1].ship.isSunk) score.classList.add("score-sunk");
            }
        })
    }

    return {
        createScoreboard,
        updateScoreboard
    }
})();

export default ScoreBoard;

