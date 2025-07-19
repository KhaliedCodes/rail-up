import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { CONSTANTS } from '../constants';

export class Game extends Scene
{
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

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        
        
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
        
        this.msg_text = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0.5);
        
        this.input.once('pointerdown', () => {
            
            this.scene.start('GameOver');
            
        });
        this.cursor = this.input?.keyboard?.createCursorKeys();
        this.keyW = this.input?.keyboard?.addKey("W");
        this.keyA = this.input?.keyboard?.addKey("A");
        this.keyS = this.input?.keyboard?.addKey("S");
        this.keyD = this.input?.keyboard?.addKey("D");

        this.spawnPlayer();
    }

    update(time: number, delta: number): void {
        this.player1.movePlayer(this.cursor?.up, this.cursor?.down, this.cursor?.left, this.cursor?.right);
        this.player2.movePlayer(this.keyW, this.keyS, this.keyA, this.keyD);
    }
    spawnPlayer() {
        this.player1 = new Player(this, CONSTANTS.WINDOW_WIDTH - CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT - CONSTANTS.TERRAIN_TILE_SIZE - CONSTANTS.PLAYER_TILE_SIZE / 2 , CONSTANTS.PLAYER);
        //this.player1.player.anims.play(CONSTANTS.PLAYER_IDLE_OUTLINE);
        //this.player1.player.flipX = true;
        this.player1.player.tint = 0xff8888; // Change color for player 1

         // Spawn Player 2
        this.player2 = new Player(this, CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT - CONSTANTS.TERRAIN_TILE_SIZE - CONSTANTS.PLAYER_TILE_SIZE / 2 , CONSTANTS.PLAYER);
        //this.player2.player.anims.play(CONSTANTS.PLAYER_IDLE);
        this.player2.player.tint = 0x8888ff; // Change color for player 2
    }
}
