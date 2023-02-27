

class gameScene extends Phaser.Scene {// create time trial game scene
    constructor(){
        super('gamescene')//give the scene a key for referencing
    }

     preload(){
        //decraling variables for query
        this.k=0
        this.velocity = 0
        this.endReached = false
        this.facingLeft=false
        this.facingRight=false
        //load stage and tileset
        this.load.image('tiles', 'assets/skyTileset.png');
        this.load.tilemapTiledJSON('sky', 'assets/bouncy_shrooms.json');
        //loading assets into game
        this.load.image('goalFlag','assets/goalFlag.png')
        this.load.image('item','assets/itemBox.png')
        this.load.spritesheet('player', 'assets/player.png',
        { frameWidth: 16, frameHeight: 16 }
            );

    };
     create(){
        this.socket = this.registry.get("socket")// connecting every scene to the socket connection
        console.log('game scene loaded')
        //more variable declaration
        this.itemHeld = false 
        this.itemNum = 0
        this.speed = false
        this.highJump = false
            // timer function (with help from @winner_joiner on stack overflow)
        gameScene.seconds = 0;
        this.interval = setInterval(//set an interval that runs code every second
        () => { 
            gameScene.seconds = gameScene.seconds + 1//time spent in game is increased 
            this.timerText.setText(gameScene.seconds)//set onscreen text to the players time
        },1000);//1000 milliseconds
         //create assets within the game
         //starting with tilemap
        this.skyMap = this.make.tilemap({key: 'sky'});
        this.tileset = this.skyMap.addTilesetImage('skyShrooms','tiles');
        this.background = this.skyMap.createDynamicLayer('sky', this.tileset,);           
        this.platforms = this.skyMap.createDynamicLayer('platforms', this.tileset,);
        this.stems = this.skyMap.createDynamicLayer('stems', this.tileset,);
        this.platforms.setCollisionByExclusion([-1]);//setting all of the platforms layer to be a collidable object
        
        //next the goal flag
        this.goal = this.physics.add.sprite(1200, 87, 'goalFlag')
        this.goal.setScale(0.1)//.setOffset(2270,2300)//the hitbox isnt at the sprite so setOffset must be used
        this.goal.body.allowGravity = false // the flag wont move so gravity wont affect it
        this.goal.setImmovable(true)//the flag cant be moved by other physics objects

        this.physics.world.setBounds(0,0,1280,960)//set the bounds for every physics object.
        //loading the player sprite as a physics based sprite.
        this.player = this.physics.add.sprite(50,850,"player");
        //this.player = this.physics.add.sprite(1000,50,"player")
        ;
        this.player.setScale(1.75)//.setOffset(-4,-4)
        this.player.setCollideWorldBounds(true)//setting a collider with the set world bounds
        this.physics.add.collider(this.player, this.platforms);//setting a collider between the player sprite and the platform layer
        //creating a group of objects for ingame items to share interactions.
        this.items = this.physics.add.group() 
            this.item1 = this.items.create(640,850,"item").setScale(0.05,0.05)//.setOffset(4700,4800)
            this.item1.body.allowGravity = false
            this.item2 = this.items.create(1100,530,"item").setScale(0.05,0.05)//.setOffset(4700,4800)
            this.item2.body.allowGravity = false 
            this.item3 = this.items.create(100,565,"item").setScale(0.05,0.05)//.setOffset(4700,4800)
            this.item3.body.allowGravity = false
        
        //an overlap detection between the player and any of the ingame items
        this.physics.add.overlap(this.player, this.items, (player,item)=>{//if sprites overlap 
            if(this.itemHeld==false){//if the player doesnt currently have an item
            item.disableBody(true,true);//hide body and disable collisions
            console.log("item collected");
            this.itemNum = Math.floor(Math.random() * 2) + 1;//generates random number between 1 and 2(no freeze in single player)
            this.itemHeld = true //the player now has an item
            if(this.itemNum == 1){ //if the picked up item is speed
                this.itemText.setText("speed")
            }
            else if(this.itemNum == 2){//if the picked up item is high jump
                this.itemText.setText("high jump")
            }
        }
        } )

        
        this.timerText = this.add.text(/*this.player.x+50*/100, /*this.player.y-50*/100, { fontSize: '80px', fill: '#FFF' }); //add text into the game for the timer

        this.timerText.setText(0);

        this.itemText = this.add.text(100,100, { fontSize: '80px', fill: '#000' });//same for items picked up
        this.itemText.setText(0);
   
        //player animations
    
        this.anims.create({
            key: "left-idle",
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
            frameRate: 0,
            repeat: -1

        })
        this.anims.create({
            key: "right-idle",
            frames: this.anims.generateFrameNumbers('player', {start: 0, end: 0}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"left-walk",
            frames: this.anims.generateFrameNumbers('player', {start: 6, end: 9}),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key:"right-walk",
            frames: this.anims.generateFrameNumbers('player', {start: 2, end: 5}),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key:"right-jump",
            frames: this.anims.generateFrameNumbers('player', {start: 10, end: 10}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"right-fall",
            frames: this.anims.generateFrameNumbers('player', {start: 11, end: 11}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"left-jump",
            frames: this.anims.generateFrameNumbers('player', {start: 12, end: 12}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"left-fall",
            frames: this.anims.generateFrameNumbers('player', {start: 13, end: 13}),
            frameRate: 0,
            repeat: -1
        })
        

        //camera
        this.cameras.main.startFollow(this.player);//follows players
        this.cameras.main.setBounds(0,0,1280,960);//set camera bounds to world bounds
    };
     update(){
        
        //text always within player view
        //console.log(this.player.x+' '+this.player.y)
        //console.log(this.cameras.main.x,this.cameras.main.y)
        this.timerText.x=this.player.x+50
        this.timerText.y=this.player.y-50
        this.itemText.x=this.player.x
        this.itemText.y=this.player.y-80

        this.cameras.main.zoom = 1.75//set the camera to 1.75x zoom
        this.goal.x = 1200//constantly set the goal flags position(error: it was still moving from gravity)
        this.goal.y = 87
        //get variable for player velocity
        this.velocity=this.player.body.velocity.x;
        //creating arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();
        //creating key input
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        //player movement
        if (this.endReached == false){
            if (this.cursors.left.isDown || this.keyA.isDown){//left/a key is down
                if(this.speed == true){//if the speed power is in effect
                    this.player.setVelocityX(-280)//set speed to double normal
                }
                else{
                this.player.setVelocityX(-140)//set speed
            }
                console.log("left")
                this.player.anims.play('left-walk', true)//play walking animation
            }
            else if (this.cursors.right.isDown || this.keyD.isDown){//right/d key is down
                if(this.speed == true){
                    this.player.setVelocityX(280)//set speed in opposite direction
                }
                else{
                this.player.setVelocityX(140)
            }
                console.log("right")
                this.player.anims.play('right-walk', true)
            }
            else{
                this.player.setVelocityX(0)
                    if (this.facingLeft == true){
                        this.player.anims.play('right-idle',true);//play idle animation
                        }
                        else if (this.facingRight == true){
                        this.player.anims.play('left-idle',true);
                        };
            }
            if ((this.cursors.up.isDown || this.keyW.isDown) && this.player.body.onFloor()){//if up/w down
                if(this.highJump == true){//if high jump power is in effect
                    this.player.setVelocityY(-360)//set jump this.velocity
                }
                else{
                this.player.setVelocityY(-240)}
                console.log("up")
                }
    
            if ((this.cursors.down.isDown || this.keyS.isDown)&& this.itemHeld == true){//if down/s is down, and if the player has an item
                console.log("down")
    
                if(this.itemNum == 1){//if item is speed boost
                console.log("speed")
                this.itemHeld = false//player has no item
                this.itemNum = 0 
                this.itemText.setText(0)
                this.speed = true //speed is activated
                setTimeout(
                    () => { 
                        this.speed = false//speed is de-activated after 10 seconds
                    },10000
                   )}
                else if (this.itemNum == 2){//if item is jump boost
                console.log("jump")
                this.itemHeld = false//player has no item
                this.itemNum = 0
                this.itemText.setText(0)
                this.highJump = true//high jump is activated
                setTimeout(
                    () => { 
                        this.highJump = false//high jump is de-activated after 10 seconds
                    },10000
                   )}
                }}
        if (this.velocity < 0){//if player is movign right
            this.facingRight = true;
            this.facingLeft = false;
        }
        else if(this.velocity > 0){//if player is moving left
            this.facingLeft = true;
            this.facingRight = false;
        };
    
        this.physics.add.collider(this.player, this.goal, () => {// setting collider between the player and the goal flag
            while (this.k == 0){// this makes it only run once
                clearInterval(this.interval)//stop the timer inteval
                this.endReached = true//player reached the end of the stage
                this.player.anims.stop()
                this.player.x = 50//reset to starting position
                this.player.y = 850
                this.scene.launch('timetrialend').stop()// lauch the time trial end scene
                
                this.k+=1}
        } ,null,this);

        
    };
}

class timeTrialEnd extends Phaser.Scene{// create timeTrialEnd scene
    constructor(){
        super('timetrialend')//give the scene a key
    }
    preload(){
        //load assets
        this.load.image('finished','assets/finishedBackground.png' )
        this.load.image('retryButton','assets/retryButton.png')
        this.load.image('mainMenuButton','assets/mainMenuButton.png')
    }
    
    create(){
        this.socket = this.registry.get("socket")//connect scene to socket connection
        this.add.image(640,480,'finished')//add background image
        this.add.text(100, 500, { fontSize: '16px', fill: '#000' })
        .setText('You completed the stage in '+gameScene.seconds+' seconds!').setScale(3);
        console.log("loaded")// text to tell the player how fast they completed the stage
        //add buttons as images and make them interactable
        const retryButton = this.add.image(100,800,'retryButton').setInteractive()
        const mainMenuButton = this.add.image(1180,800,'mainMenuButton').setInteractive()

        retryButton.on('pointerdown', () => {
        this.scene.launch('gamescene').stop()// if the retry button is clicked, the time trial game scene is loaded again
    });

        mainMenuButton.on('pointerdown', () => {
            this.scene.launch('menu').stop()// if the menu button is clicked, the menu scene will be loaded
    });
    }
}

class mainMenu extends Phaser.Scene{// create main menu scene
    constructor(){
        super('menu')//give key to scene 
    }
preload(){
    //load assets into game
    this.load.image('mainMenu','assets/mainMenu.png')
    this.load.image('timeTrialButton','assets/timeTrialButton.png')
    this.load.image('multiPlayerButton','assets/multiPlayerButton.png')
    this.load.image('jumpControls','assets/jumpButton.png')
    this.load.image('leftControls','assets/leftButton.png')
    this.load.image('rightControls','assets/rightButton.png')
    this.load.image('itemControls','assets/itemButton.png')
}

create(){
    console.log("main menu loaded")
    this.socket = io.connect();// this is the first loaded scene so an initial socket connection must be created
    this.registry.set("socket",this.socket)//connect scene to socket
    //add background image
    this.add.image(640,480,'mainMenu')
    //games controlls on the side of the screen
    this.add.image(150,500,'jumpControls').setScale(0.5)
    this.add.image(150,650,'leftControls').setScale(0.5)
    this.add.image(50,500,'rightControls').setScale(0.5)
    this.add.image(50,650,'itemControls').setScale(0.5)
    //create buttons from loaded images
    const timeTrialButton = this.add.image(100,800,'timeTrialButton').setInteractive()
    const multiPlayerButton = this.add.image(1180,800,'multiPlayerButton').setInteractive()

    timeTrialButton.on('pointerdown', () => {
        this.scene.launch('gamescene').stop()//launch the time trial scene
    });



    multiPlayerButton.on('pointerdown', () => {
            //emit to the server to then add the emmiting socket ID into the availiblePlayers array
        this.socket.emit("addplayer")
        this.scene.launch('multiroom').stop()//launch the multiplayer room scene
        console.log('loaded')
    });
}
    
}

class multiplayerRoom extends Phaser.Scene{// create multiplayer room scene
    constructor(){
        super('multiroom')//give key 
    }

    preload(){
        //load images
        this.load.image('multiplayer','assets/multiplayer.png')
        this.load.image('mainMenuButton','assets/mainMenuButton.png')
    }
    create(){
        this.gameLoaded = false
        this.socket = this.registry.get("socket")//connect scene to sockets
        //add background image
        this.add.image(640,480,'multiplayer')
        //create button that emits to server to remove player and launch the menu scene for that player
        const mainMenuButton = this.add.image(1180,800,'mainMenuButton').setInteractive()
        mainMenuButton.on('pointerdown', () => {
            this.socket.emit("removeplayer")
            this.scene.launch('menu').stop()
            
        });
        this.socket.emit("checkPosition")//constantly check the players position in the array

        // when the server sends a signal, the player will be sent to the multiplayer game scene
        this.socket.on("nextscene", () => {
            
            while(this.gameLoaded == false){//only runs once
            this.scene.launch("multigame").stop()
            this.gameLoaded = true
            }
        })

    }
    update(){
        this.socket.emit("gamestart")//emit a gamestart signal to the server
    
    }
}

class multiplayerGame extends Phaser.Scene{//create multiplayer game scene
    constructor(){
        super('multigame')//give scene key
    }
    preload(){
        //query variables
        this.k=0
        this.velocity = 0
        this.endReached = false
        this.facingLeft=false
        this.facingRight=false
        //load stage and tileset
        this.load.image('tiles', 'assets/skyTileset.png');
        //loading assets into game
        this.load.image('goalFlag','assets/goalFlag.png')
        this.load.tilemapTiledJSON('sky', 'assets/bouncy_shrooms.json');
        this.load.image('coin','assets/coin.png')
        this.load.image('item','assets/itemBox.png')
        this.load.spritesheet('player', 'assets/player.png',
        { frameWidth: 16, frameHeight: 16 }
            );
    }

    create(){
        
        this.itemHeld = false 
        this.itemNum = 0
        this.speed = false
        this.highJump = false
        this.freeze = false
        this.socket = this.registry.get("socket")// connecting every scene to the socket connection
        console.log('game scene loaded')
        multiplayerGame.seconds = 0;
        multiplayerGame.score = 0;
        this.interval = setInterval(
        () => { 
            console.log(multiplayerGame.seconds)
            multiplayerGame.seconds = multiplayerGame.seconds + 1
            this.timerText.setText(multiplayerGame.seconds)//timer interval like time trial
        },1000);
         //create assets within the game
        this.skyMap = this.make.tilemap({key: 'sky'});
        this.tileset = this.skyMap.addTilesetImage('skyShrooms','tiles');
        this.background = this.skyMap.createDynamicLayer('sky', this.tileset,);           
        this.platforms = this.skyMap.createDynamicLayer('platforms', this.tileset,);
        this.stems = this.skyMap.createDynamicLayer('stems', this.tileset,);
        this.platforms.setCollisionByExclusion([-1]);
    
        this.goal = this.physics.add.sprite(1200, 87, 'goalFlag')
        this.goal.setScale(0.1)//.setOffset(2270,2300)
        this.goal.body.allowGravity = false
        this.goal.setImmovable(true)

        this.physics.world.setBounds(0,0,1280,960)
        //loading the player sprite as a physics based sprite.
        this.player = this.physics.add.sprite(50,850,"player").setScrollFactor(1 , 1)
        this.playerTwo = this.add.sprite(50,850,"player").setTint(0xF0F000).setScale(1.75)//playerTwo sprite for the opponent to be seen on screen
        //this.player = this.physics.add.sprite(1000,50,"player").setScrollFactor(1 , 1)
        ;
        this.player.setScale(1.75)//.setOffset(-4,-4)
        this.player.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.platforms);
        //coin group for in game collectibles
        this.coins = this.physics.add.group() 
        for (this.p=0; this.p<40; this.p++){//repeat 40 times
            this.curCoin = this.coins.create(Phaser.Math.Between(0, 1280) ,Phaser.Math.Between(0, 960)
            ,"coin")//create coins with random positions in the game
            this.curCoin.setScale(0.05,0.05)//.setOffset(4500,5000)
            this.curCoin.body.allowGravity = false //make them unnaffected by gravity
        };
        
        this.physics.add.overlap(this.player, this.coins, (player,coin)=>{//overlap with coins to increase players score by 100
            coin.disableBody(true,true);
            console.log("coin collected")
            multiplayerGame.score = multiplayerGame.score+100
            this.scoreText.setText(multiplayerGame.score)
        } )

        this.items = this.physics.add.group() 
        for (this.q=0; this.q<5; this.q++){
            this.curItem = this.items.create(Phaser.Math.Between(0, 1280) ,Phaser.Math.Between(0, 960),
            "item")
            this.curItem.setScale(0.05,0.05)//.setOffset(4700,4800)
            this.curItem.body.allowGravity = false
        };
        
        this.physics.add.overlap(this.player, this.items, (player,item)=>{//if sprites overlap
            if(this.itemHeld==false){
            item.disableBody(true,true);//hide body and disable collisions
            console.log("item collected");
            this.itemNum = Math.floor(Math.random() * 3) + 1;//generates random number between 1 and 3
            this.itemHeld = true
            if(this.itemNum == 1){
                this.itemText.setText("speed")
            }
            else if(this.itemNum == 2){
                this.itemText.setText("high jump")
            }
            else{
                this.itemText.setText("freeze")//freeze exclsive to multiplayer
            }
        }
        } )
        
        this.timerText = this.add.text(/*this.player.x+50*/100, /*this.player.y-50*/100, { fontSize: '80px', fill: '#000' });
        this.timerText.setText(0);
        this.scoreText = this.add.text(100, 100, { fontSize: '80px', fill: '#000' });//score text to appear in the players view
        this.scoreText.setText(0);
        this.itemText = this.add.text(100,100, { fontSize: '80px', fill: '#000' });
        this.itemText.setText(0);
   
        //player animations
    
        this.anims.create({
            key: "left-idle",
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 1 }),
            frameRate: 0,
            repeat: -1

        })
        this.anims.create({
            key: "right-idle",
            frames: this.anims.generateFrameNumbers('player', {start: 0, end: 0}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"left-walk",
            frames: this.anims.generateFrameNumbers('player', {start: 6, end: 9}),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key:"right-walk",
            frames: this.anims.generateFrameNumbers('player', {start: 2, end: 5}),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key:"right-jump",
            frames: this.anims.generateFrameNumbers('player', {start: 10, end: 10}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"right-fall",
            frames: this.anims.generateFrameNumbers('player', {start: 11, end: 11}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"left-jump",
            frames: this.anims.generateFrameNumbers('player', {start: 12, end: 12}),
            frameRate: 0,
            repeat: -1
        })
        this.anims.create({
            key:"left-fall",
            frames: this.anims.generateFrameNumbers('player', {start: 13, end: 13}),
            frameRate: 0,
            repeat: -1
        })
        

        //camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0,0,1280,960);

        this.socket.on("frozen", ()=>{//when another player uses the freeze ability
            //opponent will stop moving and turn blue for 5 seconds
            console.log("frozen")
            this.player.setTint(0x0000FF)
            this.input.keyboard.enabled = false
            this.player.setVelocityX(0)
            setTimeout(
                () => { 
                    this.input.keyboard.enabled = true 
                    this.player.setTint(0xFFFFFF)
                },5000
               ) 
        })
        this.socket.on("playerLeft", ()=>{//when a player leaves, their opponents window will be reloaded, disconnecting and reconnecting them
            window.location.reload();
    })
        this.socket.on("multiplayerEnd", ()=>{// when both players finish launch the multiplayer end scene

            this.scene.launch('multiplayerend').stop()
            
            console.log("end")
        }
        
        )
    };

    update(){
        this.socket.emit("checkFinish")//check if both players have finsihed
        var playerX=0
        var playerY=0
        var endTime = 0
        var endScore = 0
        if(this.speed==true){
        console.log("true")}
        playerX = this.player.x //set player position to variables for passing to the server
        playerY = this.player.y
        // console.log(playerX, playerY)
        this.socket.emit("updatePosition",playerX,playerY)//pass position to the server
        this.socket.on("opponentPosition", (playerTwoX, playerTwoY)=>{
            this.playerTwo.x = playerTwoX
            this.playerTwo.y = playerTwoY//get opponents position from the server
            //console.log(this.playerTwo.x,this.playerTwo.y)
        })
        //text always within player view
        this.timerText.x=this.player.x+50
        this.timerText.y=this.player.y-50
        this.scoreText.x=this.player.x-50
        this.scoreText.y=this.player.y-50
        this.itemText.x=this.player.x
        this.itemText.y=this.player.y-80

        this.cameras.main.zoom = 1.75
        this.goal.x = 1200
        this.goal.y = 87
        //get variable for player velocity
        this.velocity=this.player.body.velocity.x;
        //creating arrow key input
        this.cursors = this.input.keyboard.createCursorKeys();
        //creating key input
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        //player movement
        if (this.endReached == false){
        if (this.cursors.left.isDown || this.keyA.isDown){
            if(this.speed == true){
                this.player.setVelocityX(-280)
            }
            else{
            this.player.setVelocityX(-140)
        }
            console.log("left")
            this.player.anims.play('left-walk', true)
        }
        else if (this.cursors.right.isDown || this.keyD.isDown){
            if(this.speed == true){
                this.player.setVelocityX(280)
            }
            else{
            this.player.setVelocityX(140)
        }
            console.log("right")
            this.player.anims.play('right-walk', true)
        }
        else{
            this.player.setVelocityX(0)
                if (this.facingLeft == true){
                    this.player.anims.play('right-idle',true);
                    }
                    else if (this.facingRight == true){
                    this.player.anims.play('left-idle',true);
                    };
        }
        if ((this.cursors.up.isDown || this.keyW.isDown) && this.player.body.onFloor()){
            if(this.highJump == true){
                this.player.setVelocityY(-360)
            }
            else{
            this.player.setVelocityY(-240)}
            console.log("up")
            }

        if ((this.cursors.down.isDown || this.keyS.isDown)&& this.itemHeld == true){
            console.log("down")

            if(this.itemNum == 1){
            console.log("speed")
            this.itemHeld = false
            this.itemNum = 0
            this.itemText.setText(0)
            this.speed = true
            setTimeout(
                () => { 
                    this.speed = false//speed boost like timetrial
                },10000
               )}
            else if (this.itemNum == 2){
            console.log("jump")
            this.itemHeld = false
            this.itemNum = 0
            this.itemText.setText(0)
            this.highJump = true
            setTimeout(
                () => { 
                    this.highJump = false//jump boost like time trial
                },10000
               )}
            else if (this.itemNum == 3){
                console.log("freeze")//freeze opponent for 5 seconds
                this.itemHeld = false//player has no item
                this.itemNum = 0
                this.itemText.setText(0)
                this.socket.emit("freeze")
            }}
        
            
        }
        if (this.velocity < 0){
            this.facingRight = true;
            this.facingLeft = false;
        }
        else if(this.velocity > 0){
            this.facingLeft = true;
            this.facingRight = false;
        };
    
        this.physics.add.collider(this.player, this.goal, () => {
            while (this.k == 0){
                console.log("finished")
                endTime = multiplayerGame.seconds
                endScore = multiplayerGame.score
                this.socket.emit("finished",endTime,endScore)//send time and score to server
                
                this.endReached = true
                this.player.anims.stop()
                clearInterval(this.interval)
                
                this.k+=1}
        } ,null,this);

        
    };
}

class multiplayerEnd extends Phaser.Scene{//create multiplayer end scene
    constructor(){
        super('multiplayerend')//give scene a key
    }
    preload(){//load images
        this.load.image('finished','assets/finishedBackground.png' )
        this.load.image('mainMenuButton','assets/mainMenuButton.png')
    }
    create(){
        console.log("multiplayer end")
        this.socket = this.registry.get("socket")//connect scene to sockets
        this.socket.emit("removeplayer")//remove player from array
        this.add.image(640,480,'finished')//add background image
        this.victorText = this.add.text(100, 500, { fontSize: '16px', fill: '#000' }).setScale(3)
        this.socket.emit("playerscores")
        this.socket.on("winner",(winner,player1Score,player2Score)=>{//displays winning player and player scores
            if (winner=="player1"){
                this.victorText.setText("#1 player1 "+player1Score+"points"+"\n"+"player2 "+player2Score+"points")
            }
            else if (winner=="player2"){
                this.victorText.setText("#1 player2 "+player2Score+"points"+"\n"+"player1 "+player1Score+"points")
            }
        })
        
        const mainMenuButton = this.add.image(1180,800,'mainMenuButton').setInteractive()//creates a button to send players back to main menu

        mainMenuButton.on('pointerdown', () => {
            this.scene.launch('menu').stop()
    });
    }
}

var config = {//phaser confguration
    type: Phaser.AUTO,
    pixelArt: true,
    width: 1280,
    height: 960,
    physics: {
        default: 'arcade',//physics engine
        arcade: {
            gravity: { y: 340 },//gravity value
            debug: true
        }
    },
//scenes
        scene: [mainMenu, gameScene, timeTrialEnd, multiplayerRoom, multiplayerGame, multiplayerEnd]
    };

//creating the game instance
var game = new Phaser.Game(config);