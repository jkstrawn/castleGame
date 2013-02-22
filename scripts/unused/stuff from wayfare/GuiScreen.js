function GuiScreen(game, x, y, sprite) {
    GUI.call(this, game, x, y, sprite);
}

GuiScreen.prototype = new GUI();
GuiScreen.prototype.constructor = GuiScreen;

GuiScreen.prototype.draw = function(ctx) {
	GUI.prototype.draw.call(this, ctx);
}

