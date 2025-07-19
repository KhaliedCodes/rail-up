import { Scene } from 'phaser';
import { Player } from './Player';
import { CONSTANTS } from '../constants';

export class Bullet {
    bullet: Phaser.Physics.Arcade.Sprite;
    speed: number = 400
    constructor(scene: Scene, x: number, y: number, texture: string, owner: Player) {
        this.bullet = scene.physics.add.sprite(x, y, texture);
        this.bullet.body?.setCircle(CONSTANTS.BULLET_TILE_SIZE/8,CONSTANTS.BULLET_TILE_SIZE/2-CONSTANTS.BULLET_TILE_SIZE/8,CONSTANTS.BULLET_TILE_SIZE/2-CONSTANTS.BULLET_TILE_SIZE/8);
        this.shoot(scene,owner);
    }
    shoot(scene: Scene, owner: Player){
        this.bullet.setPosition(owner.player.x,owner.player.y);
        this.bullet.active = true;
        this.bullet.setVisible(true);
        this.bullet.setVelocityX(Math.cos(owner.player.rotation)*this.speed);
        this.bullet.setVelocityY(Math.sin(owner.player.rotation)*this.speed);
        scene.time.addEvent({
            delay: 2000,
            loop: false,
            callback: () => {
                this.bullet.active = false;
                this.bullet.setVelocity(0,0);
                this.bullet.setVisible(false);
            }
        });
    }

}