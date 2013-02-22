function Colonies() {
    GameEngine.call(this);
}
Colonies.prototype = new GameEngine();
Colonies.prototype.constructor = Colonies;

Colonies.prototype.start = function() {

	this.addGUI(new GuiScreen(this, 640, 0, 'img/gui_main.png'));

	this.aboveGround = new Map(this, 1);
	this.belowGround = new Map(this, 2);
	this.belowGround.setEntrance(0, 0, this.belowGround.getTileByIndex(9,0), this.aboveGround);
	this.map = this.aboveGround;

	for(var y = 0; y <= 4; y++)
	for(var x = 8; x <= 11; x++)
		this.belowGround.tiles[x][y].setType(3);
	for(var y = 0; y <= 3; y++)
	for(var x = 9; x <= 10; x++)
		this.belowGround.tiles[x][y].setType(2);
	
	//add an ant
	var _player = new AntQueen(this, 96, 96, 'temp', 'ant_black', 10, this.map, 'black');
	this.selectEntity(_player);
	this.addEntity(_player);
	
    GameEngine.prototype.start.call(this);
}

Colonies.prototype.update = function() {
    
    GameEngine.prototype.update.call(this);
}

Colonies.prototype.draw = function() {
    GameEngine.prototype.draw.call(this);
}