import Phaser from 'phaser';

export class MainMenu extends Phaser.Scene {
    private floorTiles!: Phaser.GameObjects.TileSprite;
    private turretLeft!: Phaser.GameObjects.Image;
    private turretRight!: Phaser.GameObjects.Image;
    private planes: Phaser.GameObjects.Image[] = [];
    private planeSpawnTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super('MainMenu');
    }

    create() {
        const { width, height } = this.scale;

        // Depth ordering:
        // -3: Floor (lowest)
        // -2: (unused)
        // -1: (unused)
        //  0: Turrets (base level)
        //  1: Planes (above turrets)
        //  2: Title 
        //  3: (unused)
        //  4: Button backgrounds
        //  5: Button text (highest)

        // Floor background (lowest)
        this.floorTiles = this.add.tileSprite(0, 0, width, height, 'floorTile')
            .setOrigin(0)
            .setDepth(-3);

        // Add turrets first (depth 0)
        this.turretLeft = this.add.image(150, height / 2, 'turret')
            .setFlipX(false)  // Face right
            .setAngle(90)     // Rotated to face horizontally right
            .setDepth(0);     // Base level

        this.turretRight = this.add.image(width - 150, height / 2, 'turret')
            .setFlipX(true)   // Face left
            .setAngle(-90)    // Rotated to face horizontally left
            .setDepth(0);     // Base level

        // Add planes (depth 1 - above turrets)
        this.startPlaneSpawning();

        // Game title (above planes)
        const title = this.add.text(width / 2, height / 2 - 170, 'Rail Up', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ff7777',
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5)
         .setDepth(2);

        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.05 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Create styled buttons (highest levels)
        const createButton = (offsetY: number, label: string, onClick: () => void) => {
            const y = height / 2 + offsetY;

            const btn = this.add.rectangle(width / 2, y, 240, 50, 0x111111, 0.8)
                .setStrokeStyle(2, 0xff4444)
                .setInteractive({ useHandCursor: true })
                .setOrigin(0.5)
                .setDepth(4);  // Above most things

            const txt = this.add.text(width / 2, y, ` ${label}`, {
                fontSize: '18px',
                fontFamily: 'monospace',
                color: '#ffffff'
            }).setOrigin(0.5)
             .setDepth(5);  // Highest level

            // Pulsing button
            this.tweens.add({
                targets: btn,
                alpha: { from: 1, to: 0.85 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            // Hover effect
            btn.on('pointerover', () => {
                btn.setStrokeStyle(3, 0xff8888);
                this.tweens.add({
                targets: btn,
                x: btn.x + 2,
                duration: 60,
                yoyo: true,
                repeat: 2
                });
            });

            btn.on('pointerout', () => {
                btn.setStrokeStyle(2, 0xff4444);
            });

            btn.on('pointerup', () => {
                this.cameras.main.flash(100, 255, 0, 0);
                onClick();
            });
        };

        // Add buttons
        createButton(-60, 'Start Game', () => this.scene.start('Game'));
        createButton(0, 'Settings', () => this.scene.start('Settings'));
        createButton(60, 'Controls', () => this.scene.start('Controls'));
        createButton(120, 'Credits', () => this.scene.start('Credits'));
    }

    startPlaneSpawning() {
        const { width, height } = this.scale;

        // Spawn initial planes
        this.spawnPlane();
        this.spawnPlane();

        this.planeSpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnPlane,
            callbackScope: this,
            loop: true
        });
    }

    spawnPlane() {
        const { width, height } = this.scale;
        const direction = Phaser.Math.Between(0, 1) === 0 ? 'left' : 'right';
        const altitude = Phaser.Math.Between(height / 4, (3 * height) / 4);
        const speed = Phaser.Math.Between(150, 250);

        if (direction === 'left') {
            const plane = this.add.image(-100, altitude, 'plane')
                .setScale(0.5)
                .setFlipX(false)
                .setDepth(1);  // Above turrets (depth 0) but below buttons

            this.tweens.add({
                targets: plane,
                x: width + 100,
                duration: 5000 * (200 / speed),
                ease: 'Linear',
                onComplete: () => {
                    plane.destroy();
                    this.planes = this.planes.filter(p => p !== plane);
                }
            });

            this.planes.push(plane);
        } else {
            const plane = this.add.image(width + 100, altitude, 'plane')
                .setScale(0.5)
                .setFlipX(true)
                .setDepth(1);  // Above turrets (depth 0) but below buttons

            this.tweens.add({
                targets: plane,
                x: -100,
                duration: 5000 * (200 / speed),
                ease: 'Linear',
                onComplete: () => {
                    plane.destroy();
                    this.planes = this.planes.filter(p => p !== plane);
                }
            });

            this.planes.push(plane);
        }
    }


    update(time: number, delta: number): void {
        this.floorTiles.tilePositionX += 0.2;
    }

    shutdown() {
        if (this.planeSpawnTimer) this.planeSpawnTimer.destroy();
        this.planes.forEach(plane => plane.destroy());
        this.planes = [];
    }
}