import { Scene } from 'phaser';
import { Player } from '../objects/Player';
import { Ground } from '../objects/ground';
import { TileDataReader } from '../utils/TileDataReader';
import { CONSTANTS } from '../constants';

export class Game extends Scene {
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
    midTiles: Ground[]= [];
    rightTiles: Ground[]= [];
    leftTiles: Ground[]= []
    constructor() {
        super('Game');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00)
        const data = TileDataReader.readTileData(this.cache.text.get(CONSTANTS.TILE_DATA));
        let tile : Ground;
        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                switch (data[y][x]) {
                    case CONSTANTS.TERRAIN_RIGHT_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT);
                        this.rightTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT);
                        this.leftTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_CENTER_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_CENTER);
                        this.midTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_RIGHT_EDGE_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_RIGHT_EDGE);
                        this.midTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                    case CONSTANTS.TERRAIN_LEFT_EDGE_INDEX:
                        tile = this.createTile(x, y, CONSTANTS.TERRAIN_LEFT_EDGE);
                        this.midTiles.push(tile);
                        tile.setImmovable(true);
                        break;
                }
            }
        }
        this.rightTiles.forEach(tile =>{
            tile.setImmovable(true);
        })
        this.leftTiles.forEach(tile =>{
            tile.setImmovable(true);
        })
        this.midTiles.forEach(tile =>{
            tile.setImmovable(true)
        })
        
        this.cursor = this.input?.keyboard?.createCursorKeys();
        this.keyW = this.input?.keyboard?.addKey("W");
        this.keyA = this.input?.keyboard?.addKey("A");
        this.keyS = this.input?.keyboard?.addKey("S");
        this.keyD = this.input?.keyboard?.addKey("D");

        this.spawnPlayer();

        this.physics.add.collider(this.player1.player, this.leftTiles);
        this.physics.add.collider(this.player2.player, this.rightTiles);
        this.physics.add.overlap(this.player1.player, this.midTiles, () => {
            this.player1.isInTheMiddle = true;
        })
        this.physics.add.overlap(this.player1.player, this.rightTiles, () => {
            this.player1.isInTheMiddle = false;
        })
        this.physics.add.overlap(this.player2.player, this.midTiles, () => {
            this.player2.isInTheMiddle = true;
        })
        this.physics.add.overlap(this.player2.player, this.leftTiles, () => {
            this.player2.isInTheMiddle = false;
        })
    }

    update(time: number, delta: number): void {
        this.player1.movePlayer(this.cursor?.up, this.cursor?.down, this.cursor?.left, this.cursor?.right);
        this.player2.movePlayer(this.keyW, this.keyS, this.keyA, this.keyD);
    }
    spawnPlayer() {
        this.player1 = new Player(this, CONSTANTS.WINDOW_WIDTH - CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT / 2 - CONSTANTS.PLAYER_TILE_SIZE / 2 , CONSTANTS.PLAYER);
        this.player1.player.rotation = Math.PI;
        this.player1.player.tint = 0xff3333;

         // Spawn Player 2
        this.player2 = new Player(this, CONSTANTS.TERRAIN_TILE_SIZE, CONSTANTS.WINDOW_HEIGHT / 2 - CONSTANTS.PLAYER_TILE_SIZE / 2 , CONSTANTS.PLAYER);
        this.player2.player.tint = 0x3333ff;
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
