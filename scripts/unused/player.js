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
				_tile = this.game.map.getTileAtLocation(Math.floor(Math.random()*625), Math.floor(Math.random()*625));

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