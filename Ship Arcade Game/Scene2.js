class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
        
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0,0);
        
        this.ship1 = this.add.sprite(config.width/2 - 50, config.height/2, "ship");
        this.ship2 = this.add.sprite(config.width/2, config.height/2, "ship2");
        this.ship3 = this.add.sprite(config.width/2 + 50, config.height/2, "ship3");

        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);
        


        // Plays ship animations
        this.ship1.play("ship1_anim");
        this.ship2.play("ship2_anim");
        this.ship3.play("ship3_anim");

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);


        // Power up animations
        

        this.physics.world.setBoundsCollision();

        // Physics group for power ups
        this.powerUps = this.physics.add.group();

        var maxObjects = 4;
        for (var i = 0; i <= gameSettings.maxPowerUps; ++i) {
            var powerUp = this.physics.add.sprite(16, 16, "power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, config.width, config.height);

            if (Math.random() > 0.5) {
                powerUp.play("red");
            } else {
                powerUp.play("gray");
            }
    
            powerUp.setVelocity(gameSettings.powerUpVel, gameSettings.powerUpVel);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1);
        }

        // Adds player and animation
        this.player = this.physics.add.sprite(config.width / 2 - 8, config.height - 64, "player");
        this.player.play("thrust");

        this.player2 = this.physics.add.sprite(config.width / 2, config.height - 64, "player");
        this.player2.play("thrust");
        // Adds keyboard input
        this.JIKL = this.input.keyboard.addKeys('J,I,K,L');
        this.AWSD = this.input.keyboard.addKeys('A,W,S,D');
        // Sets player world collision
        this.player.setCollideWorldBounds(true);
        this.player2.setCollideWorldBounds(true);


        // Player 1 & 2 shoot inputs
        this.Vkey = this.input.keyboard.addKey('V');
        this.Bkey = this.input.keyboard.addKey('B');
        // Creating projectiles group for beams
        this.projectiles = this.add.group();

        // Player shots collide with power ups
        this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerUp) {
            projectile.destroy();
        });


        // Player 1 physics overlap
        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);
        // Player 2 physics overlap
        this.physics.add.overlap(this.player2, this.powerUps, this.pickPowerUp, null, this);
        this.physics.add.overlap(this.player2, this.enemies, this.hurtPlayer2, null, this);

        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);



        var graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(0, 0);
        graphics.lineTo(config.width, 0);
        graphics.lineTo(config.width, 20);
        graphics.lineTo(0, 20);
        graphics.lineTo(0, 0);
        graphics.closePath();
        graphics.fillPath();

        // Score
        this.score = 0;

        // Score Label
        this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE", 16);

        // Sound objects
        this.beamSound = this.sound.add("audio_beam");
        this.explosionSound = this.sound.add("audio_explosion");
        this.pickupSound = this.sound.add("audio_pickup");

        // Music
        this.music = this.sound.add("music");
        var musicConfig = {
            mute: false,
            volume: 0.4,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        }
        this.music.play(musicConfig);
    }

    update() {
        this.moveShip(this.ship1, 1);
        this.moveShip(this.ship2, 2);
        this.moveShip(this.ship3, 3);

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();
        this.movePlayer2Manager();

        
        if (Phaser.Input.Keyboard.JustDown(this.Vkey)) {
            if(this.player.active){
                this.shootBeam();
            }
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.Bkey)) {
            if(this.player2.active){
                this.shootBeam2();
            }
        }

        // Update all beams
        for(var i = 0; i < this.projectiles.getChildren().length - 1; ++i) {
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }
    }

    zeroPad(number, size) {
        var stringNumber = String(number);
        while(stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

    hitEnemy(projectile, enemy) {
        var explosion = new Explosion(this, enemy.x, enemy.y);
        
        projectile.destroy();
        this.resetShipPos(enemy);
        this.score += 15;
        var scoreFormatted = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + scoreFormatted;

        this.explosionSound.play();
    }

    hurtPlayer(player, enemy){
        this.resetShipPos(enemy);

        if(this.player.alpha < 1) {
            return;
        }
        
        var explosion = new Explosion(this, player.x, player.y);

        player.disableBody(true, true);

        // Reset player with delay
        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        })
    }

    resetPlayer(){
        var x = config.width / 2 - 8;
        var y = config.height + 64;
        this.player.enableBody(true, x, y, true, true);

        this.player.alpha = 0.5;

        var tween = this.tweens.add({
            targets: this.player,
            y: config.height - 64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function(){
                this.player.alpha = 1;
            },
            callbackScope: this
        })
    }

    hurtPlayer2(player, enemy){
        this.resetShipPos(enemy);

        if(this.player2.alpha < 1) {
            return;
        }
        
        var explosion = new Explosion(this, player.x, player.y);

        player.disableBody(true, true);

        // Reset player with delay
        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer2,
            callbackScope: this,
            loop: false
        })
    }

    resetPlayer2(){
        var x = config.width / 2 - 8;
        var y = config.height + 64;
        this.player2.enableBody(true, x, y, true, true);

        this.player2.alpha = 0.5;

        var tween = this.tweens.add({
            targets: this.player2,
            y: config.height - 64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function(){
                this.player2.alpha = 1;
            },
            callbackScope: this
        })
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
        this.pickupSound.play();
    }

    moveShip(ship, speed) {
        ship.y += speed;
        if (ship.y > config.height) {
            this.resetShipPos(ship);
        }
    }

    resetShipPos(ship) {
        ship.y = 0;
        var randomX = Phaser.Math.Between(0, config.width);
        ship.x = randomX;
    }

    destroyShip(pointer, gameObject) {
        gameObject.setTexture("explosion");
        gameObject.play("explode");
    }

    movePlayerManager() {
        this.player.setVelocity(0);

        if(this.AWSD.A.isDown){
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if(this.AWSD.D.isDown){
            this.player.setVelocityX(gameSettings.playerSpeed);
        }

        if(this.AWSD.W.isDown){
            this.player.setVelocityY(-gameSettings.playerSpeed);
        } else if(this.AWSD.S.isDown){
            this.player.setVelocityY(gameSettings.playerSpeed);
        }
    }

    movePlayer2Manager() {
        this.player2.setVelocity(0);

        if(this.JIKL.J.isDown){
            this.player2.setVelocityX(-gameSettings.playerSpeed);
        } else if(this.JIKL.L.isDown){
            this.player2.setVelocityX(gameSettings.playerSpeed);
        }

        if(this.JIKL.I.isDown){
            this.player2.setVelocityY(-gameSettings.playerSpeed);
        } else if(this.JIKL.K.isDown){
            this.player2.setVelocityY(gameSettings.playerSpeed);
        }
    }

    shootBeam(){
        var beam = new Beam(this);
        this.beamSound.play();
    }

    shootBeam2(){
        var beam2 = new Beam2(this);
        this.beamSound.play();
    }
}