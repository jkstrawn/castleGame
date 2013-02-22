function GuiScreen(game, x, y, sprite) {
    GUI.call(this, game, x, y, sprite);

	this.buttons = [];
    this.texts = [];
	this.divs = [];

	this.createLabel('ants', '0', 82, 50);
	this.createLabel('sugar', '0', 82, 90);

	this.buttons.push(game.addGUI(new ButtonBuilding(game, x+50, y+150, 'nursery', this, 1)));
}

GuiScreen.prototype = new GUI();
GuiScreen.prototype.constructor = GuiScreen;

GuiScreen.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);
}

GuiScreen.prototype.update = function(dt) {
	GUI.prototype.update.call(this, dt);
}

GuiScreen.prototype.createLabel = function(id, labelText, x, y) {
	var newLabelDiv = 
		"<div class='texts' id='label"+id+"' style='position:absolute; z-index:30;'>" +
		"<p>"+labelText+"</p>" +
		"</div>";
	$("#canvasContainer").append(newLabelDiv);

	var canvas = document.getElementById('surface');
	var label = document.getElementById('label'+id);
	label.style.left = (this.x+canvas.offsetLeft+x)+"px";
	label.style.top =  (this.y+canvas.offsetTop+y)+"px";
	this.divs.push(label);
}

GuiScreen.prototype.remove = function() {
	for(var i = 0; i < this.buttons.length; i++) {
		this.game.removeGUI(this.buttons[i]);
	}
	for(var i = 0; i < this.divs.length; i++) {
		document.getElementById('canvasContainer').removeChild(this.divs[i]);
	}
}