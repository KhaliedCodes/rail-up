import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Ground } from '../objects/ground';
import { TileDataReader } from '../utils/TileDataReader';
import { CONSTANTS } from '../constants';
import { Bullet } from '../objects/Bullet';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    player1: Player;
    player2: Player;
    cursor?: Phaser.Types.Input.Keyboard.CursorKeys;
    keyW?: Phaser.Input.Keyboard.Key;
    keyA?: Phaser.Input.Keyboard.Key;
    keyS?: Phaser.Input.Keyboard.Key;
    keyD?: Phaser.Input.Keyboard.Key;
    p1bulletsPool: Bullet[] = [];
    p2bulletsPool: Bullet[] = [];
    private pickupGroup: Phaser.Physics.Arcade.Group;
    private redTurret: Phaser.GameObjects.Image;
    private blueTurret: Phaser.GameObjects.Image;
    private redTarget: Phaser.GameObjects.Image;
    private blueTarget: Phaser.GameObjects.Image;
    private redChargeIndicators: Phaser.GameObjects.Image[] = [];
    private blueChargeIndicators: Phaser.GameObjects.Image[] = [];
    private attackAnimation?: Phaser.GameObjects.Image;
    private gameEnded: boolean = false;

    private pickupTimer: Phaser.Time.TimerEvent;
    private pickupSpawnPoints: { x: number, y: number }[] = [];
    private airplane: Phaser.Physics.Arcade.Image;
    midTiles: Ground[] = [];
    rightTiles: Ground[] = [];
    leftTiles: Ground[] = []
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
    delay: 4000, 
    loop: true,
    callback: () => {
        const airplaneY = Phaser.Math.Between(100, this.scale.height - 100);
        const airplane = this.physics.add.image(-100, airplaneY, CONSTANTS.PLANES);
        airplane.setVelocityX(200);
        airplane.setDepth(5);
        airplane.setImmovable(true);

        const dropX = this.scale.width / 2;
        let hasDropped = false;

        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!airplane.active || hasDropped) return;

                if (airplane.x >= dropX) {
                    hasDropped = true;

                    // أول pickup
                    const offset1 = Phaser.Math.Between(-40, 40);
                    this.spawnPickupFromAirplane(airplane.x + offset1, airplane.y + 30);

                    // بعد نصف ثانية، نعمل spawn للتاني
                    this.time.delayedCall(500, () => {
                        if (!airplane.active) return;
                        const offset2 = Phaser.Math.Between(-40, 40);
                        this.spawnPickupFromAirplane(airplane.x + offset2, airplane.y + 30);
                    });
                }
            }
        });

        // Destroy airplane after it's off screen
        this.time.delayedCall(10000, () => {
            if (airplane.active) {
                airplane.destroy();
            }
        });
    }
});



        // Load the map with better error handling

        const data = TileDataReader.readTileData(this.cache.text.get(CONSTANTS.TILE_DATA));
        let tile: Ground;
        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                switch (data[y][x]) {
                    case CONSTANTS.TERRAIN_RIGHT_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT);
                        this.rightTiles.push(tile);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT);
                        this.leftTiles.push(tile);
                        break;
                    case CONSTANTS.TERRAIN_CENTER_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_CENTER);
                        this.midTiles.push(tile);
                        break;
                    case CONSTANTS.TERRAIN_RIGHT_EDGE_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT_EDGE);
                        this.midTiles.push(tile);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_EDGE_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT_EDGE);
                        this.midTiles.push(tile);
                        break;
                }
            }
        }

        this.cursor = this.input?.keyboard?.createCursorKeys();
        this.keyW = this.input?.keyboard?.addKey("W");
        this.keyA = this.input?.keyboard?.addKey("A");
        this.keyS = this.input?.keyboard?.addKey("S");
        this.keyD = this.input?.keyboard?.addKey("D");

        this.spawnPlayer();

        this.redTurret = this.add.image(
            CONSTANTS.WINDOW_WIDTH - CONSTANTS.TERRAIN_TILE_SIZE * 2,
            CONSTANTS.WINDOW_HEIGHT / 2,
            'railgun_red'
        )
        .setDepth(1)
        .setAngle(-90) // Rotate 180 degrees to face left
        .setScale(1.2) // Increase size by 20%
        .setOrigin(0.5, 0.5); // Ensure rotation and scaling happens from center

        this.blueTurret = this.add.image(
            CONSTANTS.TERRAIN_TILE_SIZE * 2,
            CONSTANTS.WINDOW_HEIGHT / 2,
            'railgun_blue'
        )
        .setDepth(1)
        .setAngle(90) // Face right (explicitly set for clarity)
        .setScale(1.2) // Increase size by 20%
        .setOrigin(0.5, 0.5);

        // Add target X markers
        this.redTarget = this.add.image(
            CONSTANTS.WINDOW_WIDTH - CONSTANTS.TERRAIN_TILE_SIZE * 2,
            CONSTANTS.WINDOW_HEIGHT / 2 + 100,
            'target_x'
        ).setInteractive();

        this.blueTarget = this.add.image(
            CONSTANTS.TERRAIN_TILE_SIZE * 2,
            CONSTANTS.WINDOW_HEIGHT / 2 + 100,
            'target_x'
        ).setInteractive();

        // Create vertical charge indicators with more spacing
        for (let i = 0; i < 5; i++) {
            const redCharge = this.add.image(
                this.redTurret.x + 65,  // Fixed X position (left of turret)
                this.redTurret.y - 100 + (i * 50),  // Vertical spacing (30px apart)
                'charge_empty'
            );
            this.redChargeIndicators.push(redCharge);

            const blueCharge = this.add.image(
                this.blueTurret.x -65,  // Fixed X position (right of turret)
                this.blueTurret.y - 100 + (i * 50),  // Vertical spacing (30px apart)
                'charge_empty'
            );
            this.blueChargeIndicators.push(blueCharge);
        }

        // Enable physics for turrets
        this.physics.add.existing(this.redTurret, true); // true = static body
        this.physics.add.existing(this.blueTurret, true);

        // Add colliders to prevent players passing through
        this.physics.add.collider(this.player1.player, this.redTurret);
        this.physics.add.collider(this.player1.player, this.blueTurret);
        this.physics.add.collider(this.player2.player, this.redTurret);
        this.physics.add.collider(this.player2.player, this.blueTurret);

        // Add overlap checks for targets
        this.physics.add.overlap(this.player1.player, this.redTarget, () => {
            this.player1.isAtTurret = true;
            this.tryActivateTurret(this.player1);
        });

        this.physics.add.overlap(this.player2.player, this.blueTarget, () => {
            this.player2.isAtTurret = true;
            this.tryActivateTurret(this.player2);
        });

        this.physics.add.overlap(
            this.player1.player,
            this.pickupGroup,
            (player, pickup) => {
                this.collectPickup(
                    this.player1,
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
                    this.player2,
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

        for (let i=0; i<10;i++){
            const bullet1 = new Bullet(this,0,0,CONSTANTS.BULLET);
            this.p1bulletsPool.push(bullet1);
            const bullet2 = new Bullet(this,0,0,CONSTANTS.BULLET);
            this.p2bulletsPool.push(bullet2);
        }

        this.p1bulletsPool.forEach(bullet1 => {
            this.p2bulletsPool.forEach(bullet2 => {
                this.physics.add.overlap(bullet1, bullet2, () => {
                    bullet1.hide();
                    bullet2.hide();
                })
            })
        })

        this.p1bulletsPool.forEach(bullet => {
            this.physics.add.overlap(this.player2.player, bullet, () => {
            this.player2.player.setPosition(this.player2.spawnpos[0],this.player2.spawnpos[1]);
            bullet.hide();
        })
        })
        this.p2bulletsPool.forEach(bullet => {
            this.physics.add.overlap(this.player1.player, bullet, () => {
            this.player1.player.setPosition(this.player1.spawnpos[0],this.player1.spawnpos[1]);
            bullet.hide();
        })
        })
        this.input?.keyboard?.on('keydown-CTRL', () => {
            if (!this.player1.isInTheMiddle) return;
            if (!this.player1.canshoot) return;
            this.player1.shoot(this,this.p1bulletsPool);
        });
        this.input?.keyboard?.on('keydown-E', () => {
            if (!this.player2.isInTheMiddle) return;
            if (!this.player2.canshoot) return;
            this.player2.shoot(this,this.p2bulletsPool);
        });
    }

    update(time: number, delta: number): void {
        this.player1.movePlayer(this.cursor?.up, this.cursor?.down, this.cursor?.left, this.cursor?.right);
        this.player2.movePlayer(this.keyW, this.keyS, this.keyA, this.keyD);

        const p1AtTarget = Phaser.Math.Distance.Between(
            this.player1.player.x, this.player1.player.y,
            this.redTarget.x, this.redTarget.y
        ) < 50;

        const p2AtTarget = Phaser.Math.Distance.Between(
            this.player2.player.x, this.player2.player.y,
            this.blueTarget.x, this.blueTarget.y
        ) < 50;

        // Try to add charges if at target with collectible
        if (p1AtTarget && this.player1.isCarryingCollectible) {
            this.tryAddCharge(this.player1);
        }
        if (p2AtTarget && this.player2.isCarryingCollectible) {
            this.tryAddCharge(this.player2);
        }
    }



    private spawnPickupFromAirplane(x: number, y: number): void {
    const padding = 50;
    const areaWidth = this.scale.width / 3;
    const minX = (this.scale.width / 2) - (areaWidth / 2) + padding;
    const maxX = (this.scale.width / 2) + (areaWidth / 2) - padding;
    const spawnX = Phaser.Math.Between(minX, maxX);

    const pickup = this.pickupGroup.get(spawnX, y, CONSTANTS.PICKUPS);
    if (!pickup) return;

    pickup.setActive(true);
    pickup.setVisible(true);
    pickup.enableBody(true, spawnX, y, true, true);
    pickup.setScale(0.5);
    pickup.setVelocity(0); // مفيش حركة
    pickup.setAngularVelocity(0); // مفيش دوران
    pickup.body.setAllowGravity(false);

    this.time.delayedCall(5000, () => {
        if (pickup.active) pickup.disableBody(true, true);
    });
}



    private tryActivateTurret(player: Player) {
        if (player.charges >= player.maxCharges) {
            this.executeAttack(player);
        }
    }

    private tryAddCharge(player: Player) {
        // Only add charge if carrying collectible and at target
        if (!player.isCarryingCollectible) return;

        // Consume the collectible
        player.isCarryingCollectible = false;

        
        // Add charge
        player.charges = Math.min(player.charges + 1, player.maxCharges);
        this.updateChargeIndicators(player);

        // Check for win condition
        if (player.charges >= player.maxCharges) {
            this.executeAttack(player);
        }
    }

    private executeAttack(player: Player) {
        if (this.gameEnded) return;

        this.gameEnded = true;

        // Show attack animation
        const targetX = player === this.player1 ? 
            this.blueTurret.x : this.redTurret.x;

        this.attackAnimation = this.add.image(
            player === this.player1 ? this.redTurret.x : this.blueTurret.x,
            player === this.player1 ? this.redTurret.y : this.blueTurret.y,
            'railgun_attack'
        )
        .setDepth(10)
        .setTint(player === this.player1 ? 0xff3333 : 0x33ff33); // Tint based on player

        // Animate the attack
        this.tweens.add({
            targets: this.attackAnimation,
            x: targetX,
            duration: 500,
            ease: 'Power1',
            onComplete: () => {
                // Show win condition
                const winnerText = this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY,
                    player === this.player1 ? 'Red Player Wins!' : 'Blue Player Wins!',
                    { 
                        fontSize: '64px', 
                        color: player === this.player1 ? '#ff3333' : '#33ff33',
                        stroke: '#000000',
                        strokeThickness: 8
                    }
                ).setOrigin(0.5);

                // Restart game after delay
                this.time.delayedCall(3000, () => {
                    this.scene.restart();
                });
            }
        });
        const clickText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                'Click to return to Main Menu',
                {
                    fontSize: '32px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);

            // 🔙 Return to Main Menu on click
            this.input.once('pointerup', () => {
                this.scene.start('MainMenu');
            });

            // Still keep the automatic restart after delay as fallback
            this.time.delayedCall(10000, () => {
                this.scene.start('MainMenu');
            });
    }

    private collectPickup(player: Player, pickup: Phaser.Physics.Arcade.Image): void {
        // Only collect if not already carrying one
        if (player.isCarryingCollectible || !pickup.active) return;

        // Remove the pickup
        pickup.disableBody(true, true);

        // Mark player as carrying collectible
        player.isCarryingCollectible = true;
        
        // Visual feedback - maybe tint the player
        player.player.setTint(player === this.player1 ? 0xff1111 : 0x11ff11);
    }
    spawnPlayer() {
        this.player1 = new Player(this, CONSTANTS.WINDOW_WIDTH - CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT / 2, CONSTANTS.PLAYER);
        this.player1.player.rotation = Math.PI;
        this.player1.player.tint = 0xff3333;

        // Spawn Player 2
        this.player2 = new Player(this, CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT / 2 - CONSTANTS.PLAYER_TILE_SIZE / 2, CONSTANTS.PLAYER);
        this.player2.player.tint = 0x33ff33;
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
        platformTile.setImmovable(true);
        return platformTile;
    }

    private updateChargeIndicators(player: Player) {
        const indicators = player === this.player1 ? 
            this.redChargeIndicators : this.blueChargeIndicators;
            
        indicators.forEach((indicator, index) => {
            if (index < player.charges) {
                indicator.setTexture('charge_full');
            } else {
                indicator.setTexture('charge_empty');
            }
        });
    }
}