import Phaser from 'phaser';

export class Controls extends Phaser.Scene {
  constructor() {
    super('Controls');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0d0f18');

    this.add.text(width / 2, 60, '🎮 Controls', {
      fontSize: '40px',
      fontFamily: 'monospace',
      color: '#88f0ff',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Column Headers
    this.add.text(width * 0.25, 130, 'Player I', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width * 0.75, 130, 'Player II', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Control Mappings
    const controls = [
      { key1: 'W', action1: 'Move Forward', key2: '↑', action2: 'Move Forward' },
      { key1: 'A', action1: 'Move Left',    key2: '←', action2: 'Move Left' },
      { key1: 'S', action1: 'Move Backward',key2: '↓', action2: 'Move Backward' },
      { key1: 'D', action1: 'Move Right',   key2: '→', action2: 'Move Right' },
      { key1: 'E', action1: 'Throw',        key2: 'Ctrl', action2: 'Throw' },
    ];

    const startY = 180;
    const spacingY = 50;

    controls.forEach((c, i) => {
      const y = startY + i * spacingY;

      this.add.rectangle(width * 0.25 - 100, y, 40, 40, 0x222222)
        .setStrokeStyle(2, 0xff5555)
        .setOrigin(0.5);
      this.add.text(width * 0.25 - 100, y, c.key1, {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(width * 0.25 + 20, y, c.action1, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5);

      this.add.rectangle(width * 0.75 - 100, y, 40, 40, 0x222222)
        .setStrokeStyle(2, 0x55aaff)
        .setOrigin(0.5);
      this.add.text(width * 0.75 - 100, y, c.key2, {
        fontSize: '18px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(width * 0.75 + 20, y, c.action2, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#aaaaaa'
      }).setOrigin(0, 0.5);
    });

    // ⬅ Back Button
    const backBtn = this.add.rectangle(width / 2, height - 60, 200, 50, 0x111111, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add.text(width / 2, height - 60, '⬅ Back', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    backBtn.on('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }
}
