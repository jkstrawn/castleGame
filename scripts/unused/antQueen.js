function AntQueen(game, x, y, name, sprite, hp, map, colony) {
    EntityLiving.call(this, game, x, y, hp, map);
	this.username = name;
	this.sprite = ASSET_MANAGER.getAsset('img/ant_black_big.png');
	this.direction = 0;
	this.stopMoving = true;
	this.h = this.sprite.height;
	this.w = this.sprite.width;
	this.timeSinceUpdate = 0;

	this.spriteBase = 'ant_black_big';
	
	this.colony = colony;
	this.totalTime = 0;	
}

AntQueen.prototype = new EntityLiving();
AntQueen.prototype.constructor = AntQueen;

AntQueen.prototype.update = function(dt) {
	EntityLiving.prototype.update.call(this, dt);
}

AntQueen.prototype.select = function() {
	this.selected = true;
}

AntQueen.prototype.deselect = function() {
	this.selected = false;
}

AntQueen.prototype.setDestinationTile = function(tile) {
	if(!tile.item || !tile.item.solid) {
		var _destTile = this.destinationTile;
		this.destinationTile = tile;
		var path = null;
		if(this.moving) {
			path = new AStar(game.map.tiles, this.nextTile, this.destinationTile, true);
		} else {
			path = new AStar(game.map.tiles, this.currentTile, this.destinationTile, true);
		}
		

		if(path.length) {
			this.path = path;
			this.pathIndex = 0;
			this.moving = false;
		} else
			this.destinationTile = _destTile;
	}
}