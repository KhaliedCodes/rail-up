import { Scene } from 'phaser';
import { CONSTANTS } from '../constants';

export class Player {
    player: Phaser.Physics.Arcade.Sprite;
    speed: number = 160;
    rotationalSpeed: number = 0.05;
    isInTheMiddle: boolean = false;
    pickupActive: boolean = false;
    constructor(scene: Scene, x: number, y: number, texture: string) {
        this.player = scene.physics.add.sprite(x,y,texture);
        this.player.body?.setCircle(CONSTANTS.PLAYER_TILE_SIZE/8,CONSTANTS.PLAYER_TILE_SIZE/2-CONSTANTS.PLAYER_TILE_SIZE/8,CONSTANTS.PLAYER_TILE_SIZE/2-CONSTANTS.PLAYER_TILE_SIZE/8);
        this.player.setCollideWorldBounds(true);
    }
    movePlayer(keyup?: Phaser.Input.Keyboard.Key, keydown?: Phaser.Input.Keyboard.Key, keyleft?: Phaser.Input.Keyboard.Key, keyright?: Phaser.Input.Keyboard.Key) {
        if (keyleft?.isDown) {
            this.player.rotation -= this.rotationalSpeed;
        }
        else if (keyright?.isDown) {
            this.player.rotation += this.rotationalSpeed;
        }
        if (keyup?.isDown) {
            this.player.setVelocityX(Math.cos(this.player.rotation)*this.speed);
            this.player.setVelocityY(Math.sin(this.player.rotation)*this.speed);
        }
        else if (keydown?.isDown) {
            this.player.setVelocityX(-Math.cos(this.player.rotation)*this.speed);
            this.player.setVelocityY(-Math.sin(this.player.rotation)*this.speed);
        }else{
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }
    }
}