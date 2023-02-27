var express = require('express');//server needs express package
var app = express();//declare express
var server = require('http').Server(app);//declare server
var io = require('socket.io')(server);//declare sockets
var cors = require("cors")//cors for webhosting
var players = {};//players 
var availiblePlayers = {};//players waiting for multiplayer
var playerPointer = 0;//pointer to availible players array
var player1 = null
var player2 = null
var player1Frozen = false
var player2Frozen = false
var finishedPlayers = 0
var player1Time = 0
var player2Time = 0
var player1Score = 0
var player2Score = 0
var winner = null
var k = 1
var sceneChange = false
var scoreAdd = true

//cors code from webhost
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexof(origin) === -1) {
      const msg = "the CORS policy for this site does not allow access from the specified origin.";
      return callback(new Error(msg), false);
    }

    return callback(null, this);
  },
  credentials: true,
  optionSuccessStatus: 200,
  methods: "GET,PUT,POST,OPTIONS",
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');//index html to create webpage
});

io.on('connection', function (socket) {//when a user starts the game they will be added to players and given a socket id
  console.log('a user connected');
  players[socket.id] = {
    playerId: socket.id,
  };

  socket.on('disconnect', function () {//when a user disconnects their id will be searched for in the array
    idFound = false
    console.log('user disconnected');
    // for (t = 0; t < availiblePlayers.length; t++) {
      var t = 0
      while(t<playerPointer+1){
      if (idFound == false) {
        if (availiblePlayers[t] == socket.id) {// if found their position will be set to null and the pointer will decrement
          availiblePlayers[t] = null
          idFound = true
          playerPointer = playerPointer - 1
        }}
        else {
          availiblePlayers[t - 1] = availiblePlayers[t]
          availiblePlayers[t]=null//every other player after will be moved down 1 place
        }
        t+=1}
      console.log(playerPointer);
      console.log(availiblePlayers)
    console.log('user disconnected');
    if (player1 == socket.id) {
      player1 = null// if disconnecting player is player one or two with this method, other players screen is reloaded
      socket.to(player2).emit("playerLeft")
    }
    else if (socket.id == player2) {
      player2 = null
      socket.to(player1).emit("playerLeft")
    }


      console.log(availiblePlayers)
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('leave', socket.id);
  });

  socket.on("addplayer", () => {
    availiblePlayers[playerPointer] = socket.id//when a  user clicks on multiplayer they are added to the availible players object
    playerPointer = playerPointer + 1//pointer incremented
    console.log(availiblePlayers);
    console.log(playerPointer);
  });

  socket.on("removeplayer", () => {
    idFound = false
    console.log('user disconnected');//same as disconnect but wont happen during match so there is no reload
    // for (t = 0; t < availiblePlayers.length; t++) {
      var t = 0
      while(t<playerPointer+1){
      if (idFound == false) {
        if (availiblePlayers[t] == socket.id) {
          availiblePlayers[t] = null
          idFound = true
          playerPointer = playerPointer - 1
        }}
        else {
          availiblePlayers[t - 1] = availiblePlayers[t]
          availiblePlayers[t]=null
        }
        t+=1}
      console.log(playerPointer);
      console.log(availiblePlayers)
    console.log('user disconnected');
    if (player1 == socket.id) {
      player1 = null
    }
    else if (socket.id == player2) {
      player2 = null

    }
  });

  socket.on("checkPosition", () => {//allows players  1 and 2 to be set to incoming players

    if (player1 == null) {
      player1 = availiblePlayers[0]
      console.log("player1 is ", player1)

    }
    if (player2 == null) {
      player2 = availiblePlayers[1]
      console.log("player2 is", player2)

    }
  })

  socket.on("gamestart", () => {
    k=0
    finishedPlayers = 0
    if (player1 != null && player2 != null) {
      if (socket.id == player1 || socket.id == player2) {//emits to both players to start the game
        socket.emit("nextscene")
      }

    }
    else {
      // console.log("waiting for players")
    }
  })

  socket.on("updatePosition", (playerX, playerY) => {//applies incoming variables to new variables and resends them to players
    if (socket.id == player1) {
      playerTwoX = playerX
      playerTwoY = playerY
      socket.to(player2).emit("opponentPosition", playerTwoX, playerTwoY)
    }
    if (socket.id == player2) {
      playerTwoX = playerX
      playerTwoY = playerY
      socket.to(player1).emit("opponentPosition", playerTwoX, playerTwoY)
    }

  })

  socket.on("freeze", () => {//recieves signal when freeze is used and freezes opponent client
    if (socket.id == player1) {
      player2Frozen = true
    }
    else if (socket.id == player2) {
      player1Frozen = true
    }

    if (player2Frozen == true) {
      console.log("player2 frozen")
      player2Frozen = false
      socket.to(player2).emit("frozen")
    }
    if (player1Frozen == true) {
      console.log("player1 frozen")
      player1Frozen = false
      socket.to(player1).emit("frozen")

    }
  })
  socket.on("finished", (endTime,endScore)=>{//increments a counter for every finished player and applies time and scores to variables 
    if (socket.id==player1){
      console.log("player1Fin")
      player1Finished = true
      player1Score = endScore
      player1Time = endTime
      finishedPlayers = finishedPlayers + 1
    }
    else if(socket.id==player2){
      console.log("player2Fin")
      player2Finished = true
      player2Score = endScore
      player2Time = endTime
      finishedPlayers = finishedPlayers +1
    }
    socket.on("checkFinish",()=>{
      
    
      if (player1Time>player2Time){//checks which player has the highest time.
        while(scoreAdd == true){
        player1Score = player1Score + (player1Time-player2Time)*50//takes the lowest time from the highest, multiplies it by 50 and add it to the total score
        console.log(player1Score)
        console.log("fin")
      scoreAdd = false}

      }
      else if (player2Time>player1Time){
        while(scoreAdd == true){
        player2Score = player2Score + (player2Time-player1Time)*50
        console.log(player2Score)
        console.log("fin")
        scoreAdd = false
        }
      }if (finishedPlayers==2){
        sceneChange = false
        while(sceneChange == false){
        socket.emit("multiplayerEnd")//change players to multiplayer end
        sceneChange = true}
    }})
  })
  socket.on("playerscores",()=>{
    if(player1Score>player2Score){
      winner = "player1"//see who has higher score and declare them as winner
    }
    else if(player1Score<player2Score){
      winner = "player2"
    }
    player1Finished = false
      player2Finished = false
    socket.emit("winner",winner,player1Score,player2Score)//emit winner and scores
  })
});


server.listen(process.env.PORT || 8081, function () {//listens on localhost:8081
  console.log(`Listening on ${server.address().port}`);
});
//http://localhost:8081/
//'node src/server.js' in powershell to start server
// ctrl + c to stop server

//player clicks on multiplayer mode
//they get added to an array of availible players
//when 2 players are in the array they are removed and connected for a round of the game


    // if(availiblePlayers[0] != null){
    // while(player1 == null ){
    //     player1 = availiblePlayers[0]
    //     console.log("player1 selected")
    // }}
    // while(player2 == null){
    //   if(availiblePlayers[1] != null){
    //      player2 = availiblePlayers[1]
    //      console.log("player2 selected")
    // }}
    // console.log("game full")
    // gameFull == true