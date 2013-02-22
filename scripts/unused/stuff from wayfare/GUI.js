function GUI(game, x, y, sprite) {
    this.game = game;
    this.x = x;
    this.y = y;
	this.sprite = ASSET_MANAGER.getAsset(sprite);
    this.toRemove = false;
	this.hover = false;
	this.clicked = false;
	this.mouseDown = false;
	this.mouseUp = false;
	this.z = 0;
}


GUI.prototype.setXandY = function(x, y) {
	this.x = x;
	this.y = y;
}

GUI.prototype.draw = function(ctx) {
    ctx.drawImage(this.sprite, this.x, this.y);
	/*
	if(this.hover) {
		ctx.strokeRect(this.x, this.y, this.sprite.width, this.sprite.height);
	}
	*/
}

GUI.prototype.isMouseInsideGUI = function(x, y, sprite) {
	if(!game.mouse) return;
	
	var mouseX = game.mouse.x;
	var mouseY = game.mouse.y;
	
	//if func is passed with parameters then use those, otherwise use the parameters of THIS gui
	var _x = (x) ? x : this.x;
	var _y = (y) ? y : this.y;
	var _sprite = (sprite) ? sprite : this.sprite;
	
	if(mouseX >= _x && mouseX <= (_x + _sprite.width) && mouseY >= _y && mouseY <= (_y + _sprite.height)) {
		return true;
	}
	return false;
}

GUI.prototype.update = function () {
}

GUI.prototype.mouseDragged = function (x, y) {
}

GUI.prototype.remove = function() {
}