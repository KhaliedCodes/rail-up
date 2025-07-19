import { Scene } from 'phaser';
import { Player } from './Player';
import { CONSTANTS } from '../constants';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    speed: number = 400
    constructor(scene: Scene, x: number, y: number, texture: string) {
        super(scene,x,y,texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body?.setCircle(CONSTANTS.BULLET_TILE_SIZE/8,CONSTANTS.BULLET_TILE_SIZE/2-CONSTANTS.BULLET_TILE_SIZE/8,CONSTANTS.BULLET_TILE_SIZE/2-CONSTANTS.BULLET_TILE_SIZE/8);
        this.active = false;
        this.setVelocity(0,0);
        this.setVisible(false);
    }
    shoot(scene: Scene, owner: Player){
        this.setPosition(owner.player.x,owner.player.y);
        this.active = true;
        this.setVisible(true);
        this.setVelocityX(Math.cos(owner.player.rotation)*this.speed);
        this.setVelocityY(Math.sin(owner.player.rotation)*this.speed);
        scene.time.addEvent({
            delay: 1000,
            loop: false,
            callback: () => {
                this.hide();
            }
        });
    }
    hide(){
        this.setPosition(0,0);
        this.active = false;
        this.setVelocity(0,0);
        this.setVisible(false);
    }
}