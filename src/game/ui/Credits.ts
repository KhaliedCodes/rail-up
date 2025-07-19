import Phaser from 'phaser';

export class Credits extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0d0f18');

    // 🎬 Title
    this.add.text(width / 2, 80, '🎬 Credits', {
      fontSize: '42px',
      fontFamily: 'monospace',
      color: '#ffccaa',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    // 📝 Credits Text
    const creditsText = [
      '',
      '🔹 Rail Up Game Developers 🔹',
      '',
      '👨‍💻 Mohamed Magdy (Pofo X)',
      '🔗 https://pofo-x.itch.io/',
      '',
      '👨‍💻 Khalied Magdy (KhaliedItches)',
      '🔗 https://itch.io/profile/khalieditches',
      '',
      '👨‍💻 Omar Masoud (Tantawii)',
      '🔗 https://tantawii.itch.io/',
      '',
      '👨‍💻 Merna Tarek (MernaTarek)',
      '🔗 https://itch.io/profile/mernatarek',
      '',
      '',
      '🔹 Game Assets 🔹',
      '',
      '📦 Kenney Assets',
      '🔗 https://kenney.nl/assets/tower-defense-top-down',
      '',
      '🎵 Music by HitsLab',
      '🔗 https://pixabay.com/music/main-title-epic-war-background-music-333128/',
      '',
      '',
      '🙌 Thank you for playing Rail Up!',
      '',
      '← Tap anywhere to go back'
    ];

    const textObject = this.add.text(width / 2, height, creditsText.join('\n'), {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5, 0);

    // ⬆ Smooth scroll up
    this.tweens.add({
      targets: textObject,
      y: 140,
      duration: 18000,
      ease: 'Linear'
    });

    // ✨ VFX: Background particles
    const dotTex = this.add.graphics().fillStyle(0xffffff).fillCircle(2, 2, 2).generateTexture('credit_dot', 4, 4).destroy();
    this.add.particles(0, 0, 'credit_dot', {
      speedY: { min: 10, max: 30 },
      lifespan: 3000,
      alpha: { start: 0.4, end: 0 },
      scale: { start: 0.4, end: 0 },
      quantity: 2,
      blendMode: 'ADD',
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(0, 0, width, height),
        quantity: 20
      }
    });

    // 🔙 Return
    this.input.once('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }
}
