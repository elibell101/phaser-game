class Beam extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        var x = scene.player1.x;
        var y = scene.player1.y;
        super(scene, x, y, "beam");
        scene.add.existing(this);

        this.play("beam_anim");
        scene.physics.world.enableBody(this);
        this.body.velocity.y = -250;

        scene.projectiles.add(this);
    }

    update() {
        if (this.y < 32) {
            this.destroy();
        }
    }
}