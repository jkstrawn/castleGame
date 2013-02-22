function Entity(game, x, y, map) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.map = map;

    this.angle = 0;
    this.z = 0;
    this.removeFromWorld = false;
    this.animation = null;
}

Entity.prototype.setXandY = function(x, y) {
	this.x = x;
	this.y = y;
}

Entity.prototype.select = function() {
	this.selected = true;
	this.spriteBase = 'ant_green';
	this.selected = true;
	this.sprite = ASSET_MANAGER.getAsset('img/'+this.spriteBase+'.png');
}

Entity.prototype.deselect = function() {
	this.selected = false;
	this.spriteBase = 'ant_black';
	this.selected = false;
	this.sprite = ASSET_MANAGER.getAsset('img/'+this.spriteBase+'.png');
	if(this.animation)
		this.animation.spriteSheet = ASSET_MANAGER.getAsset('img/'+this.spriteBase+'_walk.png');
}

Entity.prototype.grabItem = function(itemToGrab) {
	itemToGrab.parentEntity = this;
	this.item = itemToGrab;
}

Entity.prototype.dropItem = function() { //Not implemented yet
	this.item.parentEntity = null;
	this.currentTile.item = this.item;
	this.item = null;
}

Entity.prototype.update = function(dt) {

}

Entity.prototype.draw = function(ctx) {

}

Entity.prototype.rotateCanvas = function(ctx) {
	ctx.save();
	ctx.translate(this.x + this.w/2, this.y + this.h/2);
	ctx.rotate(this.angle*Math.PI);
	ctx.translate(-this.x - this.w/2, -this.y - this.h/2);
}

Entity.prototype.isInsideEntity = function(x, y) {
	if(x >= this.x && x < (this.x + this.sprite.width) && y >= this.y && y < (this.y + this.sprite.height)) {
		return true;
	}
	return false;
}
/*
Entity.prototype.rotateAndCache = function(image) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.translate(size/2, size/2);
    offscreenCtx.rotate(this.angle*Math.PI);
    if(this.animation) {
    //if the ant is being animated then draw a slice of its sprite sheet
    	this.animation.drawFrame(this.game.clockTick, offscreenCtx, -(image.width/2), -(image.height/2));
    } else {
    //otherwise draw it stand still
    	offscreenCtx.drawImage(image, -(image.width/2), -(image.height/2));    
    }

    return offscreenCanvas;
}
*/
Entity.prototype.getAngle = function(x, y) {
}

Entity.prototype.setTile = function(tile) {
}

Entity.prototype.setDestinationTile = function(tile) {
}

Entity.prototype.select = function() {
}

Entity.prototype.deselect = function() {
}

Entity.prototype.grabItem = function(itemToGrab) {
}

Entity.prototype.dropItem = function() {
}

//*****************************************************************************************************************************************************************
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
//*****************************************************************************************************************************************************************
function Player(game, x, y, name, sprite, hp, map, colony) {
    EntityLiving.call(this, game, x, y, hp, map);
	this.username = name;
	this.sprite = ASSET_MANAGER.getAsset('img/' + sprite + '.png');
	this.direction = 0;
	this.stopMoving = true;
	this.h = this.sprite.height;
	this.w = this.sprite.width;
	this.timeSinceUpdate = 0;
	
	this.colony = colony;
	this.totalTime = 0;
}
Player.prototype = new EntityLiving();
Player.prototype.constructor = Player;

Player.prototype.update = function(dt) {
	
	if (this !== game.selectedAnt) {
		if (!this.moving) {
			var dt = this.game.clockTick*1000;
			this.totalTime += dt;
		}
		
		if(this.totalTime > 2000) {
			// Do the 3-second idle sequence
			var _tile;
			var nearbyEnemy = false;
			// Check for enemies and attack if appropriate
			for (var _x = this.currentTile.xIndex - 1; _x <= this.currentTile.xIndex + 1; _x++) {
				if (_x == -1 || _x > 19) {
					continue;
				}
				for (var _y = this.currentTile.yIndex - 1; _y <= this.currentTile.yIndex + 1; _y++) {
					if (_y == -1 || _y > 19) {
						continue;
					}
					_tile = this.map.getTileByIndex(_x, _y)
					var enemy = _tile.getEnemyEntity(this.colony);
					if (typeof enemy !== "undefined") { 
						// If there's an anemy there, go there
						nearbyEnemy = true;
						this.setDestinationTile(_tile);
					}
				}
			}
			// Otherwise Go to a random tile
			if (!nearbyEnemy) {
				_tile = this.map.getTileAtLocation(Math.floor(Math.random()*625), Math.floor(Math.random()*625));

				if (!_tile.solid && (_tile.item == null || !_tile.item.solid)) {
					this.setDestinationTile(_tile);
				}

				this.totalTime = 0;
			}
		}
	}
	
	EntityLiving.prototype.update.call(this, dt);
}

Player.prototype.draw = function(ctx) {
	EntityLiving.prototype.draw.call(this, ctx);
}
//*****************************************************************************************************************************************************************
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
//*****************************************************************************************************************************************************************
function Egg(game, x, y, map, timeToHatch) {
    Entity.call(this, game, x, y, map);
    this.totalTime = timeToHatch;
    this.timeToHatch = this.totalTime;
    this.sprite = ASSET_MANAGER.getAsset('img/ant_egg.png');
}

Egg.prototype = new Entity();
Egg.prototype.constructor = Egg;

Egg.prototype.update = function(dt) {
	this.timeToHatch -= dt;
	if(this.timeToHatch <= 0) {
		this.removeFromWorld = true;
		this.game.addEntity(new Larva(this.game, this.x, this.y, this.map, this.totalTime*2));
	}
}

Egg.prototype.draw = function(ctx) {

	var xRounded = (0.5 + this.x) | 0;
	var yRounded = (0.5 + this.y) | 0;

    ctx.drawImage(this.sprite, xRounded, yRounded);   
}
//*****************************************************************************************************************************************************************
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
	this.z = 2;
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
//*****************************************************************************************************************************************************************
function Larva(game, x, y, map, timeToGrow) {
    Entity.call(this, game, x, y, map);
	
	this.timeToGrow = timeToGrow;

    this.animation = new Animation(ASSET_MANAGER.getAsset('img/larvae.png'), 32, 32, .2, 0, 0, 1);
    this.h = 32;
    this.w = 32;
}

Larva.prototype = new Entity();
Larva.prototype.constructor = Larva;

Larva.prototype.update = function(dt) {
	this.timeToGrow -= dt;
	if(this.timeToGrow <= 0) {
		this.removeFromWorld = true;
		this.game.addEntity(new Player(this.game, this.x, this.y, 'temp', 'ant_black', 10, this.map, 'black'));
	}
}

Larva.prototype.draw = function(ctx) {

	var xRounded = (0.5 + this.x) | 0;
	var yRounded = (0.5 + this.y) | 0;

	var rand = Math.random() > .8;
	var tick = (rand) ? this.game.clockTick*2 : 0;

    this.animation.drawFrame(tick, ctx, this.x, this.y, 0);
}
//*****************************************************************************************************************************************************************

//*****************************************************************************************************************************************************************

//*****************************************************************************************************************************************************************