function GuiBuilding(game, x, y, parent) {
    GUI.call(this, game, x, y, 'img/rock.png');
    this.parent = parent;

    this.building =[[3,3,3,3,3,3],
    				[3,2,2,2,2,3],
    				[3,2,2,2,2,3],
    				[3,2,2,2,2,3],
    				[3,2,2,2,2,3],
    				[3,3,3,3,3,3]];
}

GuiBuilding.prototype = new GUI();
GuiBuilding.prototype.constructor = GuiBuilding;

GuiBuilding.prototype.draw = function(ctx) {
}

GuiBuilding.prototype.update = function(dt) {
	var _tile = this.game.getTileAtMouse();

	if(this.clicked && _tile) {
		this.game.map.setBuilding();
		this.toRemove = true;
		this.parent.guiToDrag = null;
	}
	if(_tile) {
		this.game.map.setBuldingOutlineState = {tile: _tile, building: this.building};
	}
	GUI.prototype.update.call(this, dt);
}

GuiBuilding.prototype.isMouseInsideGUI = function() {
	return true;
}