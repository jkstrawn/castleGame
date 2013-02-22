function Item(game, x, y, name, sprite, solid, stackable, map) {
    this.game = game;
    this.x = x;
    this.y = y;
	this.map = map;
	this.name = name;
	this.spriteIndex = sprite;
	this.parentEntity = null;
	this.currentTile = map.getTileAtLocation(this.x, this.y);
	this.solid = solid;
	this.stackable = stackable;
	this.stackSize = 1;
}

Item.prototype.setXandY = function(x, y) {
	this.x = x;
	this.y = y;
}

Item.prototype.setParent = function(parent)
{
	this.parentEntity = parent;
}

Item.prototype.incrementStack = function()
{
	this.stackSize++;
}

Item.prototype.decrementStack = function()
{
	this.stackSize--;
}

Item.prototype.update = function(dt) {
	this.currentTile = this.game.map.getTileAtLocation(this.x, this.y);
}

Item.prototype.draw = function(ctx) {
	if(!this.parentEntity) {
		ctx.drawImage(this.map.sprites[this.spriteIndex], this.currentTile.x, this.currentTile.y);
	} else {
		ctx.drawImage(this.map.sprites[this.spriteIndex], this.parentEntity.x, this.parentEntity.y);
	}
}