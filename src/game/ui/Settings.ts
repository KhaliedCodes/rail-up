import Phaser from 'phaser';

export class Settings extends Phaser.Scene {
  private music!: Phaser.Sound.BaseSound;
  private musicMuted = false;
  private musicVolume = 0.3;
  private sliderThumb!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Settings');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0d0f18');

    this.add.text(width / 2, 60, '🎧 Settings', {
      fontSize: '40px',
      fontFamily: 'monospace',
      color: '#ffaaaa',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Load saved volume and mute state
    const savedVolume = parseFloat(localStorage.getItem('estlem_music_volume') || '0.3');
    const savedMuted = localStorage.getItem('estlem_music_muted') === 'true';

    this.music = this.sound.get('bgm')!;
    this.musicVolume = savedVolume;
    this.musicMuted = savedMuted;
    this.music.setVolume(this.musicVolume);
    this.music.setMute(this.musicMuted);

    // 🎵 Label above mute + slider row
    this.add.text(width / 2, height / 2 - 80, '🎵 Music', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    const sliderWidth = 200;
    const sliderX = width / 2 - sliderWidth / 2 + 30;
    const sliderY = height / 2 - 40;

    // 🔊/🔇 Mute Toggle Icon
    const muteBtn = this.add.text(sliderX - 40, sliderY, this.musicMuted ? '🔇' : '🔊', {
      fontSize: '26px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    muteBtn.on('pointerup', () => {
      this.musicMuted = !this.musicMuted;
      this.music.setMute(this.musicMuted);
      muteBtn.setText(this.musicMuted ? '🔇' : '🔊');
      localStorage.setItem('estlem_music_muted', String(this.musicMuted));
    });

    // 🎚️ Volume Slider
    this.add.rectangle(sliderX, sliderY, sliderWidth, 10, 0x444444).setOrigin(0, 0.5);

    this.sliderThumb = this.add.rectangle(
      sliderX + this.musicVolume * sliderWidth,
      sliderY,
      12, 24,
      0xff4444
    ).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });

    this.input.setDraggable(this.sliderThumb);

    this.input.on('drag', (pointer, gameObject, dragX) => {
      const clampedX = Phaser.Math.Clamp(dragX, sliderX, sliderX + sliderWidth);
      this.sliderThumb.setX(clampedX);

      const newVolume = (clampedX - sliderX) / sliderWidth;
      this.musicVolume = newVolume;
      this.music.setVolume(newVolume);
      localStorage.setItem('estlem_music_volume', newVolume.toFixed(2));
    });

    // ⬅ Back Button
    const backBtn = this.add.rectangle(width / 2, height - 80, 200, 50, 0x111111, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5);

    this.add.text(width / 2, height - 80, '⬅ Back', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    backBtn.on('pointerup', () => {
      this.scene.start('MainMenu');
    });
  }
}
