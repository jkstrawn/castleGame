function Fire(game, x, y, sprite) {
    Entity.call(this, game, x, y, 1);
	this.sprite = ASSET_MANAGER.getAsset('img/' + sprite + '.png');
	this.h = 38;
	this.w = 32;
	this.game = game;
	this.time = 0;
	this.animation = new Animation(this.sprite, this.w, this.h, 0.2, 0, 0, 1, 3);
}
Fire.prototype = new Entity();
Fire.prototype.constructor = Fire;

Fire.prototype.update = function(dt){
	this.time += dt;
	if(this.time > 300) {
		this.time = 0;
		var x = this.x + Math.floor(Math.random()*25);
		var y = this.y - Math.floor(Math.random()*10);
		this.game.addEntity(new Particle(this.game, x, y, 0));
	}
}

Fire.prototype.draw = function(ctx){
	this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
}