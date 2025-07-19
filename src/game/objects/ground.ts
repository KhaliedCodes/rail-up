import { Scene } from 'phaser';

export class Ground extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }


}