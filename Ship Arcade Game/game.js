var gameSettings = {
    playerSpeed: 200,
    maxPowerUps: 2,
    powerUpVel: 50
}

var config = {
    width: 256,
    height: 272,
    scale: {
        // Fit to window
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: 0x000000,
    scene: [Scene1, Scene2, Scene3],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    }
}

var game = new Phaser.Game(config);
