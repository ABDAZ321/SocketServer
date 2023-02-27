// Import assets
const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constant');
const { makeid } = require('./utils');


//Initializes different states and rooms
const state = {};
const clientRooms = {};

//All functions when server connects to client
io.on('connection', client => {

  // On key down do handle key function
  client.on('keydown', handleKeydown);

  // New game function
  client.on('newGame', handleNewGame);

  // Join game function
  client.on('joinGame', handleJoinGame);


  //Joining game with [roomName] property
  function handleJoinGame(roomName) {
    //sets room with room name id from collection of rooms found in the server
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    //null reference catch
    if (room) {
      //gets the amount of players in room
      allUsers = room.sockets;
    }

    let numClients = 0;
    // Check if there are users
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    // If there are no users then return unknown code
    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } 
    // if there are more then 2 players then return warning prompt
    else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }


    //Once all requirments have been passed then set the clientroom id to the roomname id
    clientRooms[client.id] = roomName;

    // Joins that specific room
    client.join(roomName);
    client.number = 2;

    //Initializes game because there are two players now
    client.emit('init', 2);
    startGameInterval(roomName);
  }

  function handleNewGame() {
    // Generates id from util.js file
    let roomName = makeid(5);

    // Sets room id to the random generated id
    clientRooms[client.id] = roomName;

    // Sending to client that there is game code
    client.emit('gameCode', roomName);

    // Initializing this rooms state
    state[roomName] = initGame();

    // Joining room
    client.join(roomName);
    client.number = 1;

    //Initializing game but not starting because only one player
    client.emit('init', 1);
  }

  // When key pressed then this function runs  
  function handleKeydown(keyCode) {
    // Gets room in which this key was pressed
    const roomName = clientRooms[client.id];

    //If there is no room then return nothing
    if (!roomName) {
      return;
    }

    //Try parsing keycode into int value
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    //running update velocity function from game.js file
    if(state[roomName]){
    const vel = getUpdatedVelocity(keyCode, state[roomName].players[client.number - 1].vel);
    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }}
  }
});

// Server update
function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    // Sets winner 
    const winner = gameLoop(state[roomName]);
    
    //Emmiting winner and loser state
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  //Game over event broadcasted in room
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}


//Listening on port 3000
io.listen(process.env.PORT || 3000);