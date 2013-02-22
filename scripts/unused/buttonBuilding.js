function ButtonBuilding(game, x, y, type, parent, id) {
    Button.call(this, game, x, y, type, parent, id);

	this.dragging = false;
	this.guiToDrag = null;
}
ButtonBuilding.prototype = new Button();
ButtonBuilding.prototype.constructor = ButtonBuilding;

ButtonBuilding.prototype.update = function() {
	if(this.hover && this.clicked) {
	//if the mouse is over this ButtonBuilding at this moment
		console.log("clicked to build a building");
		this.guiToDrag = this.game.addGUI(new GuiBuilding(this.game, this.x, this.y, this));
	}
	if(this.guiToDrag)
		this.guiToDrag.update();
	Button.prototype.update.call(this);
}

ButtonBuilding.prototype.draw = function(ctxBG, ctxFG) {
	Button.prototype.draw.call(this, ctxBG, ctxFG);
}