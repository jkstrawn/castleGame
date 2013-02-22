function EntityLiving(game, x, y, hp, map) {
	Entity.call(this, game, x, y, map);

	this.health = hp;
	this.map = map;
	this.maxHealth = hp;
	this.speed = 4.8;
	this.item = null;

	this.selected = false;
	this.moving = false;
	this.stopped = false;
	this.attack = false;
	this.attackFrame = 0;
	this.hover = false;
	this.angle = 0;
	this.path = null;
	this.pathIndex = 0;

	this.currentTile = null;
	this.destinationTile = null;
	this.nextTile = null;

	this.spriteBase = 'ant_black';
	//this.sprite = this.rotateAndCache(ASSET_MANAGER.getAsset('img/'+this.spriteBase+'.png'), this.angle);
}

EntityLiving.prototype = new Entity();
EntityLiving.prototype.constructor = EntityLiving;

EntityLiving.prototype.select = function() {
	this.spriteBase = 'ant_green';
	this.selected = true;
	this.sprite = ASSET_MANAGER.getAsset('img/'+this.spriteBase+'.png');
}

EntityLiving.prototype.deselect = function() {
	this.spriteBase = 'ant_black';
	this.selected = false;
	this.sprite = ASSET_MANAGER.getAsset('img/'+this.spriteBase+'.png');
	if(this.animation)
		this.animation.spriteSheet = ASSET_MANAGER.getAsset('img/'+this.spriteBase+'_walk.png');
}

EntityLiving.prototype.grabItem = function(itemToGrab) {
	itemToGrab.parentEntity = this;
	this.item = itemToGrab;
}

EntityLiving.prototype.dropItem = function() { //Not implemented yet
	this.item.parentEntity = null;
	this.currentTile.item = this.item;
	this.item = null;
}

EntityLiving.prototype.update = function(dt) {
	this.currentTile = this.map.getTileAtLocation(this.x, this.y);
	//this.currentTile.setToDraw();

	if(this.destinationTile && this.path && this.destinationTile != this.currentTile && !this.moving) {
	//Set the next tile that it will move to
		var x = this.path[this.pathIndex][0];
		var y = this.path[this.pathIndex][1];
		this.nextTile = this.map.getTileByIndex(x, y);
		this.pathIndex++;
	} else if(this.destinationTile && this.destinationTile == this.currentTile && !this.moving) {
	//the entity has reached its destination tile and no longer should be animated

		if(this.selected)
			this.map.checkIfOnEntrance(this, this.destinationTile);

		this.animation = null;
		this.stopped = true;
		this.destinationTile = null;
		this.nextTile = null;
	}

	if (this.item != null)
	{
		this.item.setXandY(this.x, this.y);
	}

	if(this.nextTile && (this.x != this.nextTile.x || this.y != this.nextTile.y)) {
	//Move to the next tile that has been set
		this.moving = true;
		//set the new animation if it doesnt have one
		if(!this.animation)
			this.animation = new Animation(ASSET_MANAGER.getAsset('img/'+this.spriteBase+'_walk.png'), this.w, this.h, 0.1, 0, 0, 1, 4);

		//how far it needs to travel to reach the next tile
		var xDistanceNeeded = this.nextTile.x - this.x;
		var yDistanceNeeded = this.nextTile.y - this.y;
		//Get the signs of the distances, either 1, -1, or 0
		var xSign = (xDistanceNeeded) ? xDistanceNeeded/Math.abs(xDistanceNeeded) : 0;
		var ySign = (yDistanceNeeded) ? yDistanceNeeded/Math.abs(yDistanceNeeded) : 0;
		//determine how far the entity CAN move based on the time elapsed and its speed
		var xToMove = (dt/50) * this.speed * xSign;
		var yToMove = (dt/50) * this.speed * ySign;
		//set toMove to the distance needed if its going to go past the tile
		xToMove = (xToMove*xSign > xDistanceNeeded*xSign) ? xDistanceNeeded : xToMove;
		yToMove = (yToMove*ySign > yDistanceNeeded*ySign) ? yDistanceNeeded : yToMove;

		//set the angle that the sprite will be rotated by
		this.angle = this.getAngle(xSign, ySign);

		//actually adjust the x and y of the entity to move it
		this.x += xToMove;
		this.y += yToMove;
		if(this.x == this.nextTile.x && this.y == this.nextTile.y) {
		//if the next tile has been reached then set the moving flag to false, so that the next tile will be loaded
			this.moving = false;
		}
	}
}

EntityLiving.prototype.getAngle = function(x, y) {
	if(x > 0) {
		if(y > 0)
			return .75;
		else if(y < 0)
			return .25;
		else
			return .5;
	} else if(x < 0) {
		if(y > 0)
			return 1.25;
		else if(y < 0)
			return 1.75;
		else
			return 1.5;
	} else if(y > 0)
			return 1;
	return 0;
}

EntityLiving.prototype.draw = function(ctx) {
	/*
	if(this.animation || this.stopped) {
	//only get a new sprite if its being animated or if it stopped and needs a still sprite
		this.sprite = this.rotateAndCache(ASSET_MANAGER.getAsset('img/'+this.spriteBase+'.png'), this.angle);
		this.stopped = false;
	}
	ctx.drawImage(this.sprite, this.x, this.y);
	*/
	this.rotateCanvas(ctx);

	var xRounded = (0.5 + this.x) | 0;
	var yRounded = (0.5 + this.y) | 0;

    if(this.animation) {
    //if the ant is being animated then draw a slice of its sprite sheet
    	this.animation.drawFrame(this.game.clockTick, ctx, xRounded, yRounded);
    } else {
    //otherwise draw it stand still
    	ctx.drawImage(this.sprite, xRounded, yRounded);    
    }

    ctx.restore();
}

EntityLiving.prototype.setTile = function(tile) {
	this.x = tile.x;
	this.y = tile.y;
	this.currentTile = tile;
}

EntityLiving.prototype.setDestinationTile = function(tile) {
	if(!tile.item || !tile.item.solid) {
		var _destTile = this.destinationTile;
		this.destinationTile = tile;
		var path = null;
		if(this.moving) {
			path = new AStar(game.map.tiles, this.nextTile, this.destinationTile, false);
		} else {
			path = new AStar(game.map.tiles, this.currentTile, this.destinationTile, false);
		}
		if(path.length) {
			this.path = path;
			this.pathIndex = 0;
			this.moving = false;
		} else
			this.destinationTile = _destTile;
	}
}