class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0) // Fades in from the previous scene
        
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "space"); // Adds background to the page
        this.background.setOrigin(0,0);
        //this.background.play("space_anim");

        this.enemies = this.physics.add.group(); // Enemy physics group

        // Uses addEnemy function to create enemy ships, add them to enemy physics group, and play their respective animations
        this.ship1 = this.addEnemy("ship", "ship1_anim");
        this.ship2 = this.addEnemy("ship2", "ship2_anim");
        this.ship3 = this.addEnemy("ship3", "ship3_anim");

        //this.ship2.disableBody(true, true);
        //this.ship3.disableBody(true, true);
        

        // The setInteractive function makes an item clickable
        /*
        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);
        */        

        // Makes world have boundary collision
        this.physics.world.setBoundsCollision();

        // Physics group for power ups
        this.powerUps = this.physics.add.group();

        // Adds player and animation
        this.player1 = this.spawnPlayer("player", "thrust");
        this.player2 = this.spawnPlayer("player2", "thrust2");
        

        // Adds keyboard input
        this.JIKL = this.input.keyboard.addKeys('J,I,K,L');
        this.AWSD = this.input.keyboard.addKeys('A,W,S,D');
        // Sets player world collision
        this.player1.setCollideWorldBounds(true);
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
        this.physics.add.overlap(this.player1, this.powerUps, this.pickPowerUp, null, this); // for player to pick up power up
        this.physics.add.overlap(this.player1, this.enemies, this.hurtPlayer, null, this); // player collides with enemy
        // Player 2 physics overlap
        this.physics.add.overlap(this.player2, this.powerUps, this.pickPowerUp, null, this); // for player to pick up power up
        this.physics.add.overlap(this.player2, this.enemies, this.hurtPlayer2, null, this); // player collides with enemy

        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);


        // Score background graphic
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

        // Score Label (pos x, pos y, font, label, font size)
        this.score = 0;
        this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE", 16);
        
        // Kill count label (pos x, pos y, font, label, font size)
        this.killCount = 0;
        this.killCountLabel = this.add.bitmapText(165, 5, "pixelFont", "KILL COUNT:", 16);

        // Lives Label
        this.lives = 2;
        this.livesLabel = this.add.bitmapText(10, 25, "pixelFont", "LIVES: " + this.lives, 16);

        // Sound objects
        this.beamSound = this.sound.add("audio_beam");
        this.explosionSound = this.sound.add("audio_explosion");
        this.pickupSound = this.sound.add("audio_pickup");

        // Adds music (commented out because it's very loud)
        // this.music = this.sound.add("music");
        var musicConfig = ({
            mute: false,
            volume: 0.4,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: false,
            delay: 0
        });
    }

    spawnPowerUp() {
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
    }

    addEnemy(spriteName, anim) {
        var randomX = Phaser.Math.Between(0, config.width);
        var ship = this.add.sprite(randomX, config.height / 2, spriteName);
        this.enemies.add(ship);
        ship.play(anim);

        return ship;
    }

    spawnPlayer(spriteName, anim) {
        var randomX = Phaser.Math.Between(80, 160);
        var player = this.physics.add.sprite(randomX, config.height - 64, spriteName);
        player.play(anim);

        return player;
    }

    update() {
        this.moveShip(this.ship1, .3);
        this.moveShip(this.ship2, .5);
        this.moveShip(this.ship3, 1);
        //this.ship2.disableBody(true,true);
        //this.ship2.disableBody(true,true);

        this.background.tilePositionY -= 0.5;

        this.movePlayerManager();
        this.movePlayer2Manager();

        
        if (Phaser.Input.Keyboard.JustDown(this.Vkey)) {
            if(this.player1.active){
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
        
        /*
        if(this.killCount >= 2) {
            //this.ship2.enableBody(true, true);
            //this.moveShip(this.ship2, 2);
        }

        if (this.killCount >= 4) {
            //this.ship2.enableBody(true, true);
            //this.moveShip(this.ship3, 3);
        }
        */
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
        this.killCount += 1;
        var scoreFormatted = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + scoreFormatted;
        this.killCountLabel.text = "KILL COUNT: " + this.killCount;

        this.explosionSound.play();
    }

    hurtPlayer(player, enemy){
        this.resetShipPos(enemy);
        
        this.lives -= 1;
        this.livesLabel.text = "LIVES: " + this.lives;

        if(this.lives < 1) {
            this.scene.start('gameOver');
        }

        if(this.player1.alpha < 1) {
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
        this.player1.enableBody(true, x, y, true, true);

        this.player1.alpha = 0.5;

        var tween = this.tweens.add({
            targets: this.player1,
            y: config.height - 64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function(){
                this.player1.alpha = 1;
            },
            callbackScope: this
        })
    }

    hurtPlayer2(player, enemy){
        this.resetShipPos(enemy);

        this.lives -= 1;
        this.livesLabel.text = "LIVES: " + this.lives;

        if(this.lives < 1) {
            this.scene.start('gameOver');
        }

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

    moveShip(ship, offset) {
        ship.y += offset;
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
        this.player1.setVelocity(0);

        if(this.AWSD.A.isDown){
            this.player1.setVelocityX(-gameSettings.playerSpeed);
        } else if(this.AWSD.D.isDown){
            this.player1.setVelocityX(gameSettings.playerSpeed);
        }

        if(this.AWSD.W.isDown){
            this.player1.setVelocityY(-gameSettings.playerSpeed);
        } else if(this.AWSD.S.isDown){
            this.player1.setVelocityY(gameSettings.playerSpeed);
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