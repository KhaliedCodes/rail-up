import { Scene } from 'phaser';

export class GameOver extends Scene {
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private background!: Phaser.GameObjects.Rectangle;
  private gameoverText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('GameOver');
  }

  create() {
    const { width, height } = this.scale;
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor('#0d0f18');

    // 🔲 Semi-transparent animated background panel
    this.background = this.add.rectangle(width / 2, height / 2, 600, 300, 0x111111, 0.7)
      .setStrokeStyle(2, 0xff4444)
      .setOrigin(0.5);

    // 💥 Animated Game Over Title
    this.gameoverText = this.add.text(width / 2, height / 2 - 40, '💀 GAME OVER 💀', {
      fontSize: '48px',
      fontFamily: 'monospace',
      color: '#ff6666',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.gameoverText,
      scale: { from: 1, to: 1.05 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ✨ Subtitle with subtle flicker
    this.subtitleText = this.add.text(width / 2, height / 2 + 30, 'Click to Return to Main Menu', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.subtitleText,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // 🌌 Floating Particles
    const dotTex = this.add.graphics().fillStyle(0xffffff).fillCircle(2, 2, 2).generateTexture('dot', 4, 4).destroy();
    this.particles = this.add.particles(0, 0, 'dot', {
      speed: { min: 10, max: 40 },
      lifespan: 2000,
      quantity: 2,
      alpha: { start: 0.3, end: 0 },
      scale: { start: 0.3, end: 0 },
      tint: [0xff4444, 0xffffff],
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(0, 0, width, height),
        quantity: 20
      }
    });

    // 🎮 Return to menu
    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });
  }
}