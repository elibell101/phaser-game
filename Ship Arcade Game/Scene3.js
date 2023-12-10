class Scene3 extends Phaser.Scene {
    constructor(){
        super("gameOver");
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, config.width, config.height, "space");
        this.bg.setOrigin(0,0);
        
        this.gameOverText = this.add.bitmapText(config.width/2 - 75, config.height/2, "pixelFont", "Game Over...", 32);

        // Tween for blinking text
        this.gameOverText.textTween = this.tweens.add({
            targets:this.gameOverText,
            duration:1250, // time in ms
            repeat:-1, // infinite repeat
            yoyo:true, // reverses once forward completes (if forward is fading out, reverse is coming back)
            alpha:0,
        });
    }
}