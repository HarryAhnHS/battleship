# Battleship
PvC Battleship game using TDD

![Desktop Demo Gameplay](./src/assets/desktop-demo.png?raw=true)

Link to live: https://harryahnhs.github.io/battleship/

## Main Functionalities: 
1. Interactive drag and drop / rotate ships
2. Intelligent battleship agent for computer decision making 
3. Visual scoreboard updating at each round
4. Mobile responsiveness

## Intelligent Battleship Agent
The AIAttack function performs the following steps:

1. Identify Hits Not Sunk:

- It filters the player's gameboard to find all grid coordinates that have been attacked but the corresponding ships are not yet sunk.
- If there are no hits to act upon, it selects a random grid from the remaining untouched grids and attacks it.

2. Target Selection:
- If there are hits not sunk, it identifies the ship with the maximum hits that is not sunk. This ship becomes the target for the next attack.

3. Single Hit Handling:
- If the target ship has only one hit, the AI randomizes the next attack direction (North, West, South, East) from the hit coordinate.
- It checks if the target ship can fit in the chosen direction using the checkIfFit function, ensuring the ship would fit without violating game boundaries or attacking previously hit coordinates.

4. Multiple Hits Handling:
- If the target ship has two or more hits, the AI deduces the ship's orientation (horizontal or vertical).
- For horizontal ships, it randomizes the attack to the left or right of the existing hits.
- For vertical ships, it randomizes the attack to the top or bottom of the existing hits.
- It ensures the new attack does not cross boundaries or hit already attacked coordinates.

5. Attack Execution:
- Once a valid attack coordinate is found, the AI performs the attack using the receiveAttack function on the player's gameboard.

### Helper Function: checkIfFit
The checkIfFit function verifies if a ship of a given length can fit from a base coordinate in a specified offset direction. It performs the following checks:

- Generates potential coordinates for the ship.
- Validates if the coordinates are within bounds and not already attacked.
- Ensures consecutive coordinates form a valid placement for the ship.

