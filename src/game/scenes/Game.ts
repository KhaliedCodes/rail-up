import { Scene } from 'phaser';
import { Ground } from '../objects/ground';
import { TileDataReader } from '../utils/TileDataReader';
import { CONSTANTS } from '../constants';

export class Game extends Scene {
    private camera: Phaser.Cameras.Scene2D.Camera;
    private background: Phaser.GameObjects.Image;
    private msg_text: Phaser.GameObjects.Text;
    private pickupGroup: Phaser.Physics.Arcade.Group;
    private pickupActive: boolean = false;
    private player: Phaser.Physics.Arcade.Sprite;
    private playerOutline: Phaser.GameObjects.Graphics;
    private pickupTimer: Phaser.Time.TimerEvent;
    private mapTiles: Ground[] = [];
    private pickupSpawnPoints: {x: number, y: number}[] = []; // Window positions

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

        const data = TileDataReader.readTileData(tileData);

        // Create player with proper type checking
        this.player = this.physics.add.sprite(400, 500, 'player');
        if (!this.player) {
            console.error('Player sprite could not be created');
            return;
        }

        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.player.setDrag(100, 100);

        // Create player outline
        this.playerOutline = this.add.graphics();
        this.drawPlayerOutline(0xffffff); // White outline by default

        // Create pickup group with proper physics
        this.pickupGroup = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            runChildUpdate: true,
        });

        // Improved collision detection
        this.physics.add.overlap(
            this.player,
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
        try {
            for (let y = 0; y < data.length; y++) {
                for (let x = 0; x < data[y].length; x++) {
                    switch (data[y][x]) {
                        case CONSTANTS.TERRAIN_RIGHT_INDEX:
                            this.mapTiles.push(this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT));
                            break;
                        case CONSTANTS.TERRAIN_LEFT_INDEX:
                            this.mapTiles.push(this.createTile(x, y, CONSTANTS.TERRAIN_LEFT));
                            break;
                        case CONSTANTS.TERRAIN_CENTER_INDEX:
                            this.mapTiles.push(this.createTile(x, y, CONSTANTS.TERRAIN_CENTER));
                            break;
                        case CONSTANTS.TERRAIN_RIGHT_EDGE_INDEX:
                            this.mapTiles.push(this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT_EDGE));
                            break;
                        case CONSTANTS.TERRAIN_LEFT_EDGE_INDEX:
                            this.mapTiles.push(this.createTile(x, y, CONSTANTS.TERRAIN_LEFT_EDGE));
                            break;
                        default:
                            console.warn(`Unknown tile type at (${x}, ${y}): ${data[y][x]}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading map:', error);
        }
    }

    update() {
        // Update player outline position to follow player
        if (this.playerOutline) {
        this.drawPlayerOutline(this.pickupActive ? 0x00ff00 : 0xffffff);
    }
    }

    private drawPlayerOutline(color: number): void {
    if (!this.playerOutline || !this.player) return;
    
    this.playerOutline.clear();
    this.playerOutline.lineStyle(4, color, 1);
    this.playerOutline.strokeRect(
        this.player.x - this.player.displayWidth / 2,
        this.player.y - this.player.displayHeight / 2,
        this.player.displayWidth,
        this.player.displayHeight
    );
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



    private collectPickup(player: Phaser.Physics.Arcade.Sprite, pickup: Phaser.Physics.Arcade.Image): void {
        // Only collect if we don't already have an active pickup
        if (this.pickupActive || !pickup.active) return;

        // Remove the pickup
        pickup.disableBody(true, true);
        
        // Set pickup as active
        this.pickupActive = true;
        
        // Change outline color to green
        this.drawPlayerOutline(0x00ff00);
        
        // Reset any existing timer
        if (this.pickupTimer) {
            this.pickupTimer.destroy();
        }

        // Set timer to reset after 15 seconds
        this.pickupTimer = this.time.delayedCall(15000, () => {
            this.drawPlayerOutline(0xffffff); // Reset to white
            this.pickupActive = false; // Allow new pickups to be collected
        }, [], this);
    }

    private createTile(x: number, y: number, tileTexture: string, tintColor?: number): Ground {
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