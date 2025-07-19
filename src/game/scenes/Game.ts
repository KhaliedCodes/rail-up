import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Ground } from '../objects/ground';
import { TileDataReader } from '../utils/TileDataReader';
import { CONSTANTS } from '../constants';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    player1: Player;
    player2: Player;
    cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    keyW?: Phaser.Input.Keyboard.Key;
    keyA?: Phaser.Input.Keyboard.Key;
    keyS?: Phaser.Input.Keyboard.Key;
    keyD?: Phaser.Input.Keyboard.Key;
    private pickupGroup: Phaser.Physics.Arcade.Group;
    
    private pickupTimer: Phaser.Time.TimerEvent;
    private pickupSpawnPoints: {x: number, y: number}[] = []; 
    midTiles: Ground[]= [];
    rightTiles: Ground[]= [];
    leftTiles: Ground[]= []
    constructor() {
        super({ key: 'Game' });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

const middleStart = this.scale.width / 3;
const middleEnd = this.scale.width * 2 / 3;
const middleX = Phaser.Math.Between(middleStart, middleEnd);

this.pickupSpawnPoints = [
    { x: middleX, y: 50 } 
];

        // Add null check for tile data
        const tileData = this.cache.text.get(CONSTANTS.TILE_DATA);
        if (!tileData) {
            console.error('Tile data not found in cache');
            return;
        }

        

        // Create player with proper type checking
        

        // Create pickup group with proper physics
        this.pickupGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            runChildUpdate: true,
        });

        // Improved collision detection
        
        // Add physics bounds
        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        // Timer to spawn pickups with better error handling
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {
                try {
                    this.spawnPickup();
                } catch (error) {
                    console.error('Error spawning pickup:', error);
                }
            },
            callbackScope: this
        });

        // Load the map with better error handling
        
        const data = TileDataReader.readTileData(this.cache.text.get(CONSTANTS.TILE_DATA));
        let tile : Ground;
        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                switch (data[y][x]) {
                    case CONSTANTS.TERRAIN_RIGHT_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT);
                        this.rightTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT);
                        this.leftTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_CENTER_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_CENTER);
                        this.midTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_RIGHT_EDGE_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT_EDGE);
                        this.midTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_EDGE_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT_EDGE);
                        this.midTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                }
            }
        } 
        this.rightTiles.forEach(tile =>{
            tile.setImmovable(true);
        })
        this.leftTiles.forEach(tile =>{
            tile.setImmovable(true);
        })
        this.midTiles.forEach(tile =>{
            tile.setImmovable(true)
        })
        
        this.cursor = this.input?.keyboard?.createCursorKeys();
        this.keyW = this.input?.keyboard?.addKey("W");
        this.keyA = this.input?.keyboard?.addKey("A");
        this.keyS = this.input?.keyboard?.addKey("S");
        this.keyD = this.input?.keyboard?.addKey("D");

        this.spawnPlayer();
        this.physics.add.overlap(
            this.player1.player,
            this.pickupGroup,
            (player, pickup) => {
                this.collectPickup(
                    player as Phaser.Physics.Arcade.Sprite,
                    pickup as Phaser.Physics.Arcade.Image
                );
            },
            undefined,
            this
        );
        this.physics.add.overlap(
            this.player2.player,
            this.pickupGroup,
            (player, pickup) => {
                this.collectPickup(
                    player as Phaser.Physics.Arcade.Sprite,
                    pickup as Phaser.Physics.Arcade.Image
                );
            },
            undefined,
            this
        );
        this.physics.add.collider(this.player1.player, this.leftTiles);
        this.physics.add.collider(this.player2.player, this.rightTiles);
        this.physics.add.overlap(this.player1.player, this.midTiles, () => {
            this.player1.isInTheMiddle = true;
        })
        this.physics.add.overlap(this.player1.player, this.rightTiles, () => {
            this.player1.isInTheMiddle = false;
        })
        this.physics.add.overlap(this.player2.player, this.midTiles, () => {
            this.player2.isInTheMiddle = true;
        })
        this.physics.add.overlap(this.player2.player, this.leftTiles, () => {
            this.player2.isInTheMiddle = false;
        })
    }

    update(time: number, delta: number): void {
        this.player1.movePlayer(this.cursor?.up, this.cursor?.down, this.cursor?.left, this.cursor?.right);
        this.player2.movePlayer(this.keyW, this.keyS, this.keyA, this.keyD);
    }

    

    private spawnPickup(): void {
    if (this.pickupGroup.getLength() >= 10) return;

    const padding = 50;
    const areaWidth = this.scale.width / 3;

    const minX = (this.scale.width / 2) - (areaWidth / 2) + padding;
    const maxX = (this.scale.width / 2) + (areaWidth / 2) - padding;

    const minY = 0 + padding;
    const maxY = this.scale.height - padding;

    let spawnX = 0;
    let spawnY = 0;
    let attempts = 0;
    let tooClose = true;

    while (tooClose && attempts < 10) {
        spawnX = Phaser.Math.Between(minX, maxX);
        spawnY = Phaser.Math.Between(minY, maxY);
        tooClose = this.pickupGroup.getChildren().some(p => {
            const pickup = p as Phaser.Physics.Arcade.Image;
            return pickup.active && Phaser.Math.Distance.Between(pickup.x, pickup.y, spawnX, spawnY) < 40;
        });
        attempts++;
    }

    if (tooClose) {
        console.warn('Could not find a free spawn point after 10 attempts.');
        return;
    }

    const pickup = this.pickupGroup.get(spawnX, spawnY, CONSTANTS.PICKUPS);
    if (!pickup) {
        console.warn('Failed to create pickup');
        return;
    }

    pickup.setActive(true);
pickup.setVisible(true);
pickup.enableBody(false, pickup.x, pickup.y, true, true); 
pickup.setScale(0.5);
pickup.setVelocity(0, 0);
pickup.setAngularVelocity(0);
pickup.setRotation(0);
pickup.body.setAllowGravity(false);

this.time.delayedCall(3000, () => {
    if (pickup.active) {
        pickup.disableBody(true, true);
    }
}, [], this);
}



    private collectPickup(player: Player, pickup: Phaser.Physics.Arcade.Image): void {
        // Only collect if we don't already have an active pickup
        if (player.pickupActive || !pickup.active) return;

        // Remove the pickup
        pickup.disableBody(true, true);
        
        // Set pickup as active
        player.pickupActive = true;
        
        
        // Reset any existing timer
        if (this.pickupTimer) {
            this.pickupTimer.destroy();
        }

        // Set timer to reset after 15 seconds
        this.pickupTimer = this.time.delayedCall(15000, () => {
            player.pickupActive = false; // Allow new pickups to be collected
        }, [], this);
    }
    spawnPlayer() {
        this.player1 = new Player(this, CONSTANTS.WINDOW_WIDTH - CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT / 2 - CONSTANTS.PLAYER_TILE_SIZE / 2 , CONSTANTS.PLAYER);
        this.player1.player.rotation = Math.PI;
        this.player1.player.tint = 0xff3333;

         // Spawn Player 2
        this.player2 = new Player(this, CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT / 2 - CONSTANTS.PLAYER_TILE_SIZE / 2 , CONSTANTS.PLAYER);
        this.player2.player.tint = 0x3333ff;
    }
    createTile(x: number, y: number, tileTexture: string, tintColor?: number) {
        const tileX = x * CONSTANTS.TERRAIN_TILE_SIZE + CONSTANTS.TERRAIN_TILE_SIZE / 2;
        const tileY = y * CONSTANTS.TERRAIN_TILE_SIZE + CONSTANTS.TERRAIN_TILE_SIZE / 2;
        
        const platformTile = new Ground(this, tileX, tileY, tileTexture);
        
        if (tintColor) {
            platformTile.setTint(tintColor);
        }
        
        this.physics.add.existing(platformTile);
        this.add.existing(platformTile);
        
        // Enable physics body
        if (platformTile.body) {
            (platformTile.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        }
        
        return platformTile;
    }
    
    
}