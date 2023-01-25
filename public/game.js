

class gameScene extends Phaser.Scene {
    constructor(){
        super('gamescene')
    }

     preload(){
        this.k=0
        this.velocity = 0
        this.endReached = false
        this.facingLeft=false
        this.facingRight=false
        //load stage and tileset
        this.load.image('tiles', 'assets/skyTileset.png');
        this.load.image('goalFlag','assets/goalFlag.png')
        this.load.tilemapTiledJSON('sky', 'assets/bouncy_shrooms.json');
        //loading assets into game
        this.load.spritesheet('player', 'assets/player.png',
        { frameWidth: 16, frameHeight: 16 }
            );

    };
     create(){
        this.socket = this.registry.get("socket",this.socket)// connecting every scene to the socket connection
        console.log('game scene loaded')
            // timer function (with help from @winner_joiner on stack overflow)
        this.seconds = 0;
        this.interval = setInterval(
        () => { 
            this.seconds = this.seconds + 1
            this.timerText.setText(this.seconds)
        },1000);
         //create assets within the game
        this.skyMap = this.make.tilemap({key: 'sky'});
        this.tileset = this.skyMap.addTilesetImage('skyShrooms','tiles');
        this.background = this.skyMap.createDynamicLayer('sky', this.tileset,);           
        this.platforms = this.skyMap.createDynamicLayer('platforms', this.tileset,);
        this.stems = this.skyMap.createDynamicLayer('stems', this.tileset,);
        this.platforms.setCollisionByExclusion([-1]);
    
        this.goal = this.physics.add.sprite(1200, 87, 'goalFlag')
        this.goal.setScale(0.1).setOffset(2270,2300)
        this.goal.body.allowGravity = false
        this.goal.setImmovable(true)

        this.physics.world.setBounds(0,0,1280,960)
        //loading the player sprite as a physics based sprite.
        //this.player = this.physics.add.sprite(50,850,"player");
        this.player = this.physics.add.sprite(1000,50,"player");
        this.player.setScale(1.75).setOffset(-4,-4)
        this.player.setCollideWorldBounds(true)
        this.physics.add.collider(this.player, this.platforms);
        

        
        this.timerText = this.add.text(this.player.x+50, this.player.y-50, { fontSize: '16px', fill: '#fff' });

        this.timerText.setText(0);
   
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
    };
     update(){
        
        //text always within player view
        console.log(this.goal.x,this.goal.y)
        console.log(this.player.x+' '+this.player.y)
        this.cameras.main.zoom = 1
       // this.timerText.x=this.player.x+50
        //this.timerText.y=this.player.y-50

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
            this.player.setVelocityX(-140)
            console.log("left")
            this.player.anims.play('left-walk', true)
        }
        else if (this.cursors.right.isDown || this.keyD.isDown){
            this.player.setVelocityX(140)
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
            this.player.setVelocityY(-180)
            console.log("up")
            
        }}
        if (this.velocity < 0){
            this.facingRight = true;
            this.facingLeft = false;
        }
        else if(this.velocity > 0){
            this.facingLeft = true;
            this.facingRight = false;
        };
    
        this.physics.add.collider(this.player, this.goal, endCollision,null,this);

        
    };
}

class timeTrialEnd extends Phaser.Scene{
    constructor(){
        super('timetrialend')
    }
    preload(){
        this.load.image('finished','assets/finishedBackground.png' )
        this.load.image('retryButton','assets/retryButton.png')
        this.load.image('mainMenuButton','assets/mainMenuButton.png')
    }
    
    create(){
        this.socket = this.registry.get("socket",this.socket)
        this.add.image(640,480,'finished')
        this.add.text(100, 500, { fontSize: '16px', fill: '#000' })
        .setText('You completed the stage in '+gameScene.seconds+' seconds!').setScale(3);
        console.log("loaded")
        
        const retryButton = this.add.image(100,800,'retryButton').setInteractive()
        const mainMenuButton = this.add.image(1180,800,'mainMenuButton').setInteractive()

        retryButton.on('pointerdown', () => {
        this.scene.launch('gamescene').stop()
        console.log('loaded')
    });

        mainMenuButton.on('pointerdown', () => {
            this.scene.launch('menu').stop()
        console.log('loaded')
    });
    }
}

class mainMenu extends Phaser.Scene{
    constructor(){
        super('menu')
    }
preload(){
    this.load.image('mainMenu','assets/mainMenu.png')
    this.load.image('timeTrialButton','assets/timeTrialButton.png')
    this.load.image('multiPlayerButton','assets/multiPlayerButton.png')
}

create(){
    this.socket = io.connect();
    this.registry.set("socket",this.socket)
    this.add.image(640,480,'mainMenu')
    const timeTrialButton = this.add.image(100,800,'timeTrialButton').setInteractive()
    const multiPlayerButton = this.add.image(1180,800,'multiPlayerButton').setInteractive()

    timeTrialButton.on('pointerdown', () => {
        this.scene.launch('gamescene').stop()
    });

    // multiPlayerButton.on('pointerdown', () => {
    //     game.scene.add('gameScene', gameScene, true, { x: 1280, y: 960 });
    //     game.scene.remove('timeTrialEnd');
    //     console.log('loaded')
    //});
}
    
}

class multiplayerRoom extends Phaser.Scene{
    constructor(){
        super('multiroom')
    }

    preload(){}
    create(){}
    update(){}
}
function endCollision(){
while (this.k == 0){
clearInterval(this.interval)
this.endReached = true
this.player.anims.stop()
this.scene.launch('timetrialend').stop()

this.k+=1
}}


var config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 1280,
    height: 960,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: true
        }
    },

        scene: [mainMenu, gameScene, timeTrialEnd]
    };


var game = new Phaser.Game(config);