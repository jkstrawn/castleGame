function Button(game, x, y, type, parent, id) {
    GUI.call(this, game, x, y, 'img/button' + type + '.png');
    this.type = type;
	this.id = id;
	this.z = 1;
	this.parent = parent;
	this.spriteHover = ASSET_MANAGER.getAsset('img/button' + this.type + 'Hover.png');
}
Button.prototype = new GUI();
Button.prototype.constructor = Button;

Button.prototype.draw = function(ctx) {
	if(this.hover) {
		ctx.fillStyle = "#ff0";
		ctx.drawImage(this.spriteHover, this.x, this.y);
	} else {
		ctx.fillStyle = "#fff";
		ctx.drawImage(this.sprite, this.x, this.y);
	}
	ctx.font = "18px '"+"Courier New"+"'";
	ctx.fillText(this.type, this.x+10, this.y+20);
}