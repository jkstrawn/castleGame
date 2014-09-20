function Tile(map, xIndex, yIndex, type, aboveGround) {
	this.map = map;
	this.type = type;
	this.aboveGround = aboveGround;
	this.hover = false;
	this.xIndex = xIndex;
	this.yIndex = yIndex;
	this.x = xIndex*map.tileSize+map.x;
	this.y = yIndex*map.tileSize+map.y;
	this.occupied = false;
	this.entities = [];
}

Tile.prototype.setType = function(index) {
	if(index == 'sky')
		this.aboveGround = true;
	else
		this.aboveGround = false;
	this.type = index;
}

Tile.prototype.update = function() {
	this.entities = [];
	this.x = this.xIndex*this.map.tileSize+this.map.x;
	this.y = this.yIndex*this.map.tileSize+this.map.y;
}

Tile.prototype.draw = function(ctx) {
	ctx.drawImage(ASSET_MANAGER.getAsset('img/tile_'+this.type+'.png'), this.x, this.y);
}

//***********************************************************************
function Room(map, x, y, type) {
	this.map = map;
	this.x = x;
	this.y = y;
	this.type = type;
	this.costFood = 0;
	this.costTimber = 0;
	this.luxury = 0;
}

Room.prototype.update = function() {

}

Room.prototype.draw = function(ctx) {
	ctx.drawImage(ASSET_MANAGER.getAsset('img/room_'+this.type+'.png'), this.x*this.map.tileSize+this.map.x, this.y*this.map.tileSize+this.map.y);
}

//********************************************************************
function Map(game) {
	this.x = 10;
	this.y = 180;
	this.game = game;
	this.tiles = [];
	this.rooms = [];
	this.clicked = false;
	this.tileSize = 32;
	this.xSize = 15;
	this.ySize = 10;

	this.init();
}

Map.prototype.init = function() {
	//create the arrays for the tiles
	for(var x = 0; x < this.xSize; x++) {
		this.tiles[x] = [];
		for(var y = 0; y < this.ySize; y++) {
			this.tiles[x][y] = new Tile(this, x, y, 'sky', true);
		}
	}
	for(var x = 0; x < this.xSize; x++) {
		for(var y = 9; y < 10; y++) {
			this.tiles[x][y].setType('dirt');
		}
		this.tiles[x][8].setType('grass');
	}
	this.rooms.push(new Room(this, 5, 7, 'hall'));
}

Map.prototype.getTileAtLocation = function(x, y) {
	//if the x and y are within range of the map, then return the tile that is under the x & y
	if(x >= this.x && x < this.x+this.tileSize*this.xSize && y >= this.y && y < this.y+this.tileSize*this.ySize) {
		//since tiles are 32 large, then dividing the x & y by 32 will yeild the correct tile number
		var tileX = Math.floor((x-this.x)/this.tileSize);
		var tileY = Math.floor((y-this.y)/this.tileSize);
		return this.tiles[tileX][tileY];
	}
	return false;
}

Map.prototype.getTileByIndex = function(x, y) {
	if(x >= 0 && x < this.xSize && y >= 0 && y < this.ySize)
		return this.tiles[x][y];
	return false;
}

Map.prototype.update = function(x, y) {
	//if there is a tile at this location, then set hover to true
	var _tile = this.getTileAtLocation(x, y);
	if(_tile)
		_tile.hover = true;

	for(var x = 0; x < this.xSize; x++)
	for(var y = 0; y < this.ySize; y++) {
		this.tiles[x][y].update();
	}
}

Map.prototype.draw = function(ctx) {
	for(var x = 0; x < this.xSize; x++)
	for(var y = 0; y < this.ySize; y++) {
		var _tile = this.tiles[x][y];
		_tile.draw(ctx);
	}
	for(var i = 0; i < this.rooms.length; i++) {
		this.rooms[i].draw(ctx);
	}
}

Map.prototype.addRoom = function(tile, type) {
	this.rooms.push(new Room(this, tile.xIndex, tile.yIndex, type));
}