var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cors = require("cors")
var players = {};
var availiblePlayers = {};
var playerPointer = 0;
var player1 = null
var player2 = null
var player1X = 0
var player1Y = 0
var player2X = 0
var player2Y = 0
var player1Frozen = false
var player2Frozen = false



const corsOptions = {
  origin: function(origin, callback){
    if(!origin){
      return callback(null, true);
    }

    if (allowedOrigins.indexof(origin) === -1){
      const msg = "the CORS policy for this site does not allow access from the specified origin.";
      return callback(new Error(msg), false);
    }

    return callback(null,this);
  },
  credentials:true,
  optionSuccessStatus: 200,
  methods: "GET,PUT,POST,OPTIONS",
  allowedHeaders:'Content-Type,Authorization'
};

app.use(cors(corsOptions));

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  players[socket.id] = {
    playerId: socket.id,};

  socket.on('disconnect', function () {
    console.log('user disconnected');
    // if(player1 == socket.id){
    //   player1 = null
    //   if(player2 != null){
    //     player1 = player2
    //     console.log("player2 is now player one")
    //     player2 = null
    //   }
    // }
    // else if(socket.id==player2){
    //   player2 = null
    // }
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('leave', socket.id);
  });

  socket.on("addplayer", () => {
    availiblePlayers[playerPointer]=socket.id
    playerPointer = playerPointer+1
    console.log(availiblePlayers);
    console.log(playerPointer);
  });

  socket.on("removeplayer", () => {
    if(socket.id==player1){
      player1 = null
      console.log("player1 disconnected")
      if(player2 != null){
        player1 = player2
        console.log("player2 is now player one")
        player2 = null
      }
    }
    else if(socket.id==player2){
      player2 = null
      console.log("player2 disconnected")
    }
    idFound = false
    for (z = 0; z<availiblePlayers.length ; z++){
      if (idFound == false){
        if (availiblePlayers[z]==socket.id){
          availiblePlayers[z]=null
          idFound = true
        }
      }
      else{
        availiblePlayers[z-1]=availiblePlayers[z]
      }
    }
    playerPointer = playerPointer -1
    console.log(playerPointer);
    console.log(availiblePlayers);
  });

  socket.on("checkPosition", () => {

      if(player1 == null){
          player1 = availiblePlayers[0]
          console.log("player1 is ", player1)
      
      }
        if(player2 == null){
          player2 = availiblePlayers[1]
          console.log("player2 is", player2)
        
      }
})

socket.on("gamestart", ()=>{
  if(player1 != null && player2 != null){
    if(socket.id == player1 || socket.id == player2){
      socket.emit("nextscene")
    }   
  
  }
  else{
    console.log("waiting for players")
  }
})

socket.on("updatePosition", ()=>{
  // if(socket.id == player1){
  //   player1X = playerX
  //   player1Y = playerY
  //   socket.emit("p2Position", player2X, player2Y)
  // }
  // if(socket.id == player2){
  //   player2X = playerX
  //   player2Y = playerY
  //   socket.emit("p1Position", player1X, player1Y)
  // }

})

socket.on("freeze", ()=>{
  if(socket.id == player1){
    player2Frozen = true}
  else if(socket.id == player2){
    player1Frozen = true}
  
  if(player2Frozen == true){
    console.log("player2 frozen")
    player2Frozen = false
    socket.to(player2).emit("frozen")
  }
  if(player1Frozen == true){
    console.log("player1 frozen")
    player1Frozen = false
    socket.to(player1).emit("frozen")
    
  }
})
});


server.listen(process.env.PORT || 8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
//http://localhost:8081/
//'node server.js' in powershell to start server
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