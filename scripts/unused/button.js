function Button(game, x, y, type, parent, id) {
    GUI.call(this, game, x, y, 'img/button_' + type + '.png');
    this.type = type;
	this.id = id;
	this.z = 1;
	this.parent = parent;

	this.toDraw = true;
	//this.spriteHover = ASSET_MANAGER.getAsset('img/button_' + this.type + 'Hover.png');
}

Button.prototype = new GUI();
Button.prototype.constructor = Button;

Button.prototype.update = function() {
	GUI.prototype.update.call(this);
}

Button.prototype.draw = function(ctxBG, ctxFG) {
	GUI.prototype.draw.call(this, ctxBG);
	if(this.hover) {
		ctxFG.translate(0.5, 0.5);
		ctxFG.strokeRect(this.x, this.y, 31, 31);
		ctxFG.translate(-0.5, -0.5);
	}
	//ctx.font = "18px '"+"Courier New"+"'";
	//ctx.fillText(this.type, this.x+10, this.y+20);
}