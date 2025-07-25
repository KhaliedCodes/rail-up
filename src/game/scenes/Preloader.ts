import { Scene } from 'phaser';
import { CONSTANTS } from '../constants';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
        
        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);
        
        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {
            
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);
            
        });
    }
    
    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        
        this.load.image(CONSTANTS.PLAYER, CONSTANTS.PLAYER_TEXTURE_PATH);

        this.load.image('logo', 'logo.png');
        this.load.image(CONSTANTS.PICKUPS, CONSTANTS.PICKUPS_PATH);
        this.load.text(CONSTANTS.TILE_DATA, CONSTANTS.TILE_DATA_PATH);
        this.load.image(CONSTANTS.TERRAIN_RIGHT, CONSTANTS.TERRAIN_RIGHT_TEXTURE);
        this.load.image(CONSTANTS.TERRAIN_LEFT, CONSTANTS.TERRAIN_LEFT_TEXTURE);
        this.load.image(CONSTANTS.TERRAIN_CENTER, CONSTANTS.TERRAIN_CENTER_TEXTURE);
        this.load.image(CONSTANTS.TERRAIN_RIGHT_EDGE, CONSTANTS.TERRAIN_RIGHT_EDGE_TEXTURE);
        this.load.image(CONSTANTS.TERRAIN_LEFT_EDGE, CONSTANTS.TERRAIN_LEFT_EDGE_TEXTURE);
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
