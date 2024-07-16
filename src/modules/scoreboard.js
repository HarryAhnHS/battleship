const ScoreBoard = (() => {
    function createScoreboard(player, computer) {
        console.log("creating")
        document.querySelectorAll(".scoreboard > div").forEach((score) => {
            score.innerHTML = "";
            score.classList.remove("score-sunk");
        })
        document.querySelectorAll(".scoreboard").forEach((scoreboard) => {
            if (scoreboard.classList.contains('p')) {
                // Player's scoreboard
                [...scoreboard.children].forEach((score) => {
                    // Use score div ID as hashcode to gather data
                    const shipIdx = score.id.slice(-1);
                    for (let i = 0; i < player.gameboard.ships[shipIdx-1].ship.length; i++) {
                        let box = document.createElement("div");
                        box.classList.add("box");
                        box.classList.add(`ship-${shipIdx}`);
                        score.appendChild(box);
                    }
                })
            }
            else {
                // Computer scoreboard
                [...scoreboard.children].forEach((score) => {
                    // Use score div ID as hashcode to gather data
                    const shipIdx = score.id.slice(-1);
                    for (let i = 0; i < computer.gameboard.ships[shipIdx-1].ship.length; i++) {
                        let box = document.createElement("div");
                        box.classList.add("box");
                        box.classList.add(`ship-${shipIdx}`);
                        score.appendChild(box);
                    }
                })
            }
        })
    }

    function updateScoreboard(player, computer) {
        document.querySelectorAll(".scoreboard").forEach((scoreboard) => {
            if (scoreboard.classList.contains('p')) {
                // Player scoreboard
                [...scoreboard.children].forEach((score) => {
                    // Use score div ID as hashcode to gather data
                    const shipIdx = parseInt(score.id.toString().slice(-1));
                    if (player.gameboard.ships[shipIdx-1].ship.isSunk) score.classList.add("score-sunk");
                })
            }
            else  {
                // Computer scoreboard
                [...scoreboard.children].forEach((score) => {
                    // Use score div ID as hashcode to gather data
                    const shipIdx = parseInt(score.id.toString().slice(-1));
                    if (computer.gameboard.ships[shipIdx-1].ship.isSunk) score.classList.add("score-sunk");
                })
            }
        })
    }

    return {
        createScoreboard,
        updateScoreboard
    }
})();

export default ScoreBoard;