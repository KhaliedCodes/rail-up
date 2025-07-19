import { Scene } from 'phaser';
import { Ground } from '../objects/ground';
import { TileDataReader } from '../utils/TileDataReader';
import { CONSTANTS } from '../constants';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    mapTiles: Ground[][] = [];
    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00)
        const data = TileDataReader.readTileData(this.cache.text.get(CONSTANTS.TILE_DATA));
        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                switch (data[y][x]) {
                    case CONSTANTS.TERRAIN_RIGHT_INDEX: 
                        this.mapTiles[y][x] = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_INDEX:
                        this.mapTiles[y][x] = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT);
                        break;
                    case CONSTANTS.TERRAIN_CENTER_INDEX:
                        this.mapTiles[y][x] = this.createTile(x, y, CONSTANTS.TERRAIN_CENTER);
                        break;
                    case CONSTANTS.TERRAIN_RIGHT_EDGE_INDEX:
                        this.mapTiles[y][x] = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT_EDGE);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_EDGE_INDEX:
                        this.mapTiles[y][x] = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT_EDGE);
                        break;
                }
            }
        }
    }

    createTile(x: number, y: number, tileTexture: string, tintColor?: number) {
        const tileX = x * CONSTANTS.TERRAIN_TILE_SIZE + CONSTANTS.TERRAIN_TILE_SIZE / 2;
        const tileY = y * CONSTANTS.TERRAIN_TILE_SIZE + CONSTANTS.TERRAIN_TILE_SIZE / 2;
        const platformTile = new Ground(this, tileX, tileY, tileTexture);
        if (tintColor) {
            platformTile.setTint(tintColor);
        }
        this.physics.add.existing(platformTile);
        this.add.existing(platformTile);
        return platformTile;
    }
}
