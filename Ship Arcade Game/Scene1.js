class Scene1 extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }

    preload(){
        //this.load.image("background", "assets/images/background.png");

        this.load.spritesheet("space", "assets/spritesheets/space1_4-frames.png", {
            frameWidth: 256,
            frameHeight: 272,
            startFrame: 0,
            endFrame: 3,
        });
        
        this.load.spritesheet("ship", "assets/spritesheets/ship.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("ship2", "assets/spritesheets/ship2.png", {
            frameWidth: 32,
            frameHeight: 16
        });
        this.load.spritesheet("ship3", "assets/spritesheets/ship3.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("power-up", "assets/spritesheets/power-up.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("player", "assets/spritesheets/player.png", {
            frameWidth: 16,
            frameHeight: 24
        });
        this.load.spritesheet("player2", "assets/spritesheets/player2.png", {
            frameWidth: 16,
            frameHeight: 24
        });
        this.load.spritesheet("beam", "assets/spritesheets/beam.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Bitmap Font
        this.load.bitmapFont("pixelFont", "assets/font/font.png", "assets/font/font.xml");

        //Audio files
        this.load.audio("audio_beam", ["assets/sounds/beam.ogg", "assets/sounds/beam.mp3"]);
        this.load.audio("audio_explosion", ["assets/sounds/explosion.ogg", "assets/sounds/explosion.mp3"]);
        this.load.audio("audio_pickup", ["assets/sounds/pickup.ogg", "assets/sounds/pickup.mp3"]);
        this.load.audio("music", ["assets/sounds/sci-fi_platformer12.ogg", "assets/sounds/sci-fi_platformer12.mp3"]);
    }

    create() {
        //  A simple background for our game
        //this.bg = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.bg = this.add.tileSprite(0, 0, config.width, config.height, "space");
        this.bg.setOrigin(0,0);
        this.titleText = this.add.bitmapText(config.width/2 - 75, config.height/2, "pixelFont", "Press Enter!", 32);

        //this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        this.input.keyboard.once('keydown-ENTER', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
        });

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.time.delayedCall(1000, () => {
                this.scene.start('playGame');
            });
        });


        // Tween for blinking text
        this.titleText.textTween = this.tweens.add({
            targets:this.titleText,
            duration:1250, // time in ms
            repeat:-1, // infinite repeat
            yoyo:true, // reverses once forward completes (if forward is fading out, reverse is coming back)
            alpha:0,
        });

        // Animations
        this.anims.create({
            key: "space_anim",
            frames: this.anims.generateFrameNumbers("space"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "ship1_anim",
            frames: this.anims.generateFrameNumbers("ship"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "ship2_anim",
            frames: this.anims.generateFrameNumbers("ship2"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "ship3_anim",
            frames: this.anims.generateFrameNumbers("ship3"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });

        this.anims.create({
            key: "ship_explode",
            frames: this.anims.generateFrameNumbers("explosion2"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });

        this.anims.create({
            key: "red",
            frames: this.anims.generateFrameNumbers("power-up", {
                start: 0,
                end: 1
            }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "gray",
            frames: this.anims.generateFrameNumbers("power-up", {
                start: 2,
                end: 3
            }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "thrust",
            frames: this.anims.generateFrameNumbers("player"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "thrust2",
            frames: this.anims.generateFrameNumbers("player2"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "beam_anim",
            frames: this.anims.generateFrameNumbers("beam"),
            frameRate: 20,
            repeat: -1
        });

        this.bg.play("space_anim");
    }

    
    /*
    update(){
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)){
            this.scene.start("playGame");
        }
    }
    */
}