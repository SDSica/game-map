const config = {
    type: Phaser.AUTO,
    width: 1120,
    height: 640,
    zoom:4,
    parent: 'game-container',
    pixelArt: true, // Crucial for your crisp pixel art
    physics: {
        default: 'arcade', // This MUST be here
        arcade: {
            gravity: { y: 0 },
            debug: false // Set to true to see hitboxes!
        }
    },
    scene: { preload, create, update 
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let spaceKey;
let isDialogOpen;

function preload() {
    // 1. Load the JSON exported from Tiled
    this.load.tilemapTiledJSON('map', 'map.json');

    // 2. Load all tileset images
    this.load.image('overworld', 'overworld.png');
    this.load.image('overworld3', 'overworld3.png');
    this.load.image('flora', 'flora.png');
    this.load.image('objects', 'objects.png');
    // ... add the rest here

    this.load.spritesheet('player', 'player.png', {
        frameWidth: 16,
        frameHeight: 16
    });

}

function create() {
    const map = this.make.tilemap({ key: 'map' });

    // 3. Link the JSON tilesets to the loaded images
    const tileset1 = map.addTilesetImage('overworld', 'overworld');
    const tileset3 = map.addTilesetImage('overworld3', 'overworld3');
    const tileset4 = map.addTilesetImage('flora', 'flora');
    const tileset5 = map.addTilesetImage('objects', 'objects');
    
    
    // 4. Create the layers
    
    const waterLayer = map.createLayer('Water', [tileset1], 0, 0);
    const groundsLayer = map.createLayer('Islands', [tileset1, tileset3], 0, 0);
    const objectLayer = map.createLayer('IslandEdges', [tileset1], 0, 0);
    const plantsLayer = map.createLayer('Plants', [tileset4], 0, 0);
    const rocksLayer = map.createLayer('Rocks', [tileset4], 0, 0);
    const buildingsLayer = map.createLayer('Buildings', [tileset3], 0, 0);
    const castleWallsLayer = map.createLayer('CastleWalls', [tileset3], 0, 0);
    const castleGateLayer = map.createLayer('CastleGate', [tileset3], 0, 0);
    const castleTowerLayer = map.createLayer('CastleTowers', [tileset3], 0, 0);
    const castleTowerTopsLayer = map.createLayer('CastleTowerTops', [tileset3], 0, 0);
    const boardsLayer = map.createLayer('Boards', [tileset3], 0, 0);
    const treesLayer = map.createLayer('Trees', [tileset4,tileset3], 0, 0);
    player = this.physics.add.sprite(100,100, 'player');
    player.body.setSize(12, 12);
    player.body.setOffset(2, 2);
    const foregroundObjectsLayer = map.createLayer('ForegroundObjects', [tileset1,tileset3,tileset4,tileset5], 0, 0);
    const collisionsLayer = map.createLayer('Collisions', [tileset1], 0, 0);

    collisionsLayer.setCollisionByProperty({collides: true});

    collisionsLayer.visible = !collisionsLayer.visible;

    this.physics.add.collider(player, collisionsLayer);

    
   // this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameras.main.startFollow(player, true, 0.1,0.1);

    cursors = this.input.keyboard.createCursorKeys();
    

    this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: 0
    });
    this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('player', { start: 13, end: 16 }),
        frameRate: 8,
        repeat: 0
    })
    this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 8,
        repeat: 0
    })
    this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('player', { start: 9, end: 12 }),
        frameRate: 8,
        repeat: 0
    });
    this.anims.create({
        key: 'interact',
        frames: [
            { key: 'player', frame: 26 },
            { key: 'player', frame: 27 },
            { key: 'player', frame: 26 },
        ],
        frameRate: 8,
        repeat: 0 // Play once
    });
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    console.log(this.textures.get('player').getFrameNames());

    this.dialogueBox = this.add.container(10, 130).setScrollFactor(0).setVisible(false).setDepth(100);
    
    const rect = this.add.graphics();
    rect.fillStyle(0x000000, 0.8); // Black with 80% opacity
    rect.fillRoundedRect(0, 0, 460, 40, 4); // x, y, width, height, radius
    rect.lineStyle(2, 0xffffff, 1); // White border
    rect.strokeRoundedRect(0, 0, 460, 40, 4);

// 3. Add the Text
    this.dialogueText = this.add.text(10, 10, '', {
    fontFamily: '"Press Start 2P"', // Match the name from Google Fonts exactly
    fontSize: '8px',                // Small size works best for low-res pixel art
    fill: '#ffffff',                // Color
    wordWrap: { width: 440 },       // Keeps text inside your box
    lineSpacing: 4                  // Adds a little breathing room between lines
    });
    this.dialogueBox.add([rect, this.dialogueText]);

    let isDialogOpen = false;

}
function update() {
    const speed = 80;
    player.setVelocity(0);
    
    if (player.anims.isPlaying && player.anims.currentAnim.key === 'interact') {
        player.setVelocity(0);
        return; 
    }

    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        player.play('interact');
        
        // Logic check: Are we near an object?
        //checkProximityToObjects(); 
    }
    //player.anims.stop();

    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.play('walk-left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.play('walk-right', true);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        player.play('walk-up', true);
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        player.play('walk-down', true);
    } 
    else if (spaceKey.isPlaying) {
        player.setVelocityY(speed);
        player.play('walk-down', true);

    player.body.velocity.normalize().scale(speed);
    
}
if (isDialogOpen) {
        player.setVelocity(0);
        if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
            this.dialogueBox.setVisible(false);
            isDialogOpen = false;
        }
        return; 
    }

    if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        // Example: Check if player is near a boat (this.boat)
        const dist = Phaser.Math.Distance.Between(player.x, player.y, this.boat.x, this.boat.y);
        
        if (dist < 40) {
            showText("The boat is ready to travel to the next island!");
        }
    }

}

