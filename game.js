const { GRID_SIZE } = require('./constant');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

//Initializes game
//Creates game state variables and spawns food items
function initGame() {
  const state = createGameState()
  randomFood(state);
  return state;
}


//Game state function that initializes players, food, and grid space
function createGameState() {
  return {
    players: [{
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 1,
        y: 0,
      },
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
      ],
    }, {
      pos: {
        x: 18,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 20, y: 10},
        {x: 19, y: 10},
        {x: 18, y: 10},
      ],
    }],
    food: {},
    gridsize: GRID_SIZE,
  };
}

// This is the main game function loop that updates every frame [framerate is change in constant.js file]
function gameLoop(state) {
  //Null reference catch
  if (!state) {
    return;
  }

  //Initializes both players
  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  //Adds player one and twos pos by its current velocity
  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;


  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  //checks if player one or two are outside the grid space 
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    return 2;
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1;
  }

  //Checks if either player one or two has touched a food ietm
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    //adds snake block object if eats food
    playerOne.snake.push({ ...playerOne.pos });

    //resets position
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    //spawns another food item
    randomFood(state);
  }

  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
      //adds snake block object if eats food
    playerTwo.snake.push({ ...playerTwo.pos });

     //resets position
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    //spawns another food item
    randomFood(state);
  }


 //MOVE SNAKE FUNCTION below [for player one and two]
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
       //Checking if player one has collided with their snake body
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    //Moves snake grid respective to their velocity
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
       //Checking if  player two has collided with their snake body
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    //Moves snake grid respective to their velocity
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }


  //Checks if either palyer has collided with the other snake body
  for (let cell of playerTwo.snake) {
    if(playerOne.pos.x === cell.x && playerOne.pos.y === cell.y){
        return 2;
    }
  }

  for (let cell of playerOne.snake) {
    if(playerTwo.pos.x === cell.x && playerTwo.pos.y === cell.y){
        return 1;
    }
  }

  return false;
}

function randomFood(state) {
  //Chooses a rondom pos for spawning food
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  //Checks if the random pos of food collides with player one or two
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}

function getUpdatedVelocity(keyCode,vel) {
  //Gets keycode value from player input and sets that specifics velocity respective to the key they pressed
  switch (keyCode) {
    case 37: { // left
      if(vel.x == 0){
        return { x: -1, y: 0 };
      } 
      return;
    }
    case 38: { // down
      if(vel.y == 0){
      return { x: 0, y: -1 };
      }
      return;
    }
    case 39: { // right
      if(vel.x == 0){
        return { x: 1, y: 0 };
      }
      return;
    }
    case 40: { // up
      if(vel.y == 0){
        return { x: 0, y: 1 };
      }
      return;
    }
  }
}