import { Boot } from './scenes/Boot';
import { GameOver } from './ui/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './ui/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { CONSTANTS } from './constants';
import { Credits } from './ui/Credits';
import { Controls } from './ui/Controls';
import { Settings } from './ui/Settings';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: CONSTANTS.WINDOW_WIDTH,
    height: CONSTANTS.WINDOW_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        Settings,
        Controls,
        Credits,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
