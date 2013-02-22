function Particle(game, x, y, map, type) {
    Entity.call(this, game, x, y, map);

	var particleList = [];
	particleList.push(new ListItem('shine', 24, 25, 0.1));
	particleList.push(new ListItem('smoke_tan', 32, 32, 0.1));
	
	var temp = particleList[type];
    this.animation = new Animation(ASSET_MANAGER.getAsset('img/' + temp.path + '.png'), temp.width, temp.height, temp.duration);
    this.h = temp.height;
    this.w = temp.width;
	this.angle = Math.random() * 2;
}

function ListItem(path, width, height, duration) {
	this.path = path;
	this.width = width;
	this.height = height;
	this.duration = duration;
}

Particle.prototype = new Entity();
Particle.prototype.constructor = Particle;

Particle.prototype.update = function(dt) {
    if (this.animation.isDone()) {
        this.removeFromWorld = true;
    }
	this.y -= .5;
}

Particle.prototype.draw = function(ctx) {
	this.rotateCanvas(ctx);

	var xRounded = (0.5 + this.x) | 0;
	var yRounded = (0.5 + this.y) | 0;

    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 0);

    ctx.restore();
}